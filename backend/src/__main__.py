from dotenv import load_dotenv

load_dotenv('./.env')

import asyncio
from collections import namedtuple
from json import JSONDecodeError
import json
import string
import random
import os
from typing import List, Mapping, Optional, Union

import constants
import endpoints
import utils

from aiohttp.web import Application as AiohttpApp, Request, Response, WebSocketResponse
from aiohttp import WSMsgType as WebSocketMessageType, web
import aiohttp

Message = namedtuple(
    'Message',
    'msg_id msg_content channel_id channel_name channel_avatar_url',
)

class ApplicationSettings:
    client_id: str
    client_secret: str
    hype_interval: int
    host: str
    port: int
    redirect_uri: str
    viewer_interval: int
    yt_key: str

    def __init__(self):
        self.client_id = str(os.environ['CLIENT_ID'])
        self.client_secret = str(os.environ['CLIENT_SECRET'])
        self.redirect_uri = str(os.environ['REDIRECT_URI'])
        self.host = str(os.environ['HOST'])
        self.port = int(os.environ['PORT'])
        self.hype_interval = int(os.environ['HYPE_INTERVAL'])
        self.viewer_interval = int(os.environ['VIEWER_INTERVAL'])
        self.yt_key = str(os.environ['YT_KEY'])

class Client:
    access_token: Optional[str]
    actual_received: bool
    channel_id: Optional[str]
    closed: bool
    count_current: Optional[int]
    count_last: Optional[int]
    livestream_id = None
    remote: str
    tasks: Mapping[str, any]
    ws: WebSocketResponse

    def __init__(self, ws: WebSocketResponse, remote: str):
        self.access_token = None
        self.actual_received = False
        self.channel_id = None
        self.closed = False
        self.count_current = None
        self.count_last = None
        self.livestream_id = None
        self.remote = remote
        self.tasks = {}
        self.ws = ws

class Application:
    app: AiohttpApp = None
    clients: Mapping[str, Client] = {}
    messages: Mapping[str, List[Message]]
    settings: ApplicationSettings = None

    def __init__(self, settings: ApplicationSettings, loop):
        self.messages = {}
        self.settings = settings

        self.app = AiohttpApp(loop=loop, debug=True)
        self.app.router.add_get('/auth/check', self.auth_check)
        self.app.router.add_get('/auth/exchange', self.auth_exchange)
        self.app.router.add_post('/auth/logout', self.auth_logout)
        self.app.router.add_get('/auth/redirect', self.auth_redirect)
        self.app.router.add_get('/', self.index)
        self.app.router.add_get('/channels', self.get_channels)
        self.app.router.add_post('/send_message', self.send_message)
        self.app.router.add_get('/ws', self.websocket_server)
        self.app.router.add_get('/channels/{channel_id}/messages', self.get_channel_messages)

    def run(self) -> None:
        aiohttp.web.run_app(
            self.app,
            host=self.settings.host,
            port=self.settings.port,
        )

    def add_client(self, remote: str, ws: WebSocketResponse) -> Client:
        try:
            client = self.clients[remote]

            if client.ws is not None:
                client.ws.close()
                client.ws = None

            client.ws = ws
            client.channel_id = None
            client.closed = False
            client.livestream_id = None
            client.tasks = {}
        except KeyError:
            client = Client(ws, remote)
            self.clients[remote] = client

        return client

    async def auth_check(self, req: Request) -> Response:
        try:
            client = self.clients[req.remote]

            async with aiohttp.ClientSession() as session:
                get_req = session.get(endpoints.oauth2_check(client.access_token))

                async with get_req as resp:
                    body = await resp.json()

                    if body['aud'] == self.settings.client_id:
                        return utils.resp({
                            'logged_in': True,
                        })
        except KeyError:
            pass

        return utils.resp({
            'logged_in': False,
            'success': True,
        })

    async def auth_exchange(self, req: Request) -> Response:
        try:
            code = req.rel_url.query['code']
        except KeyError:
            return utils.bad_req('No code')

        async with aiohttp.ClientSession() as session:
            post_req = session.post(endpoints.oauth2_token(), data={
                'code': code,
                'client_id': self.settings.client_id,
                'client_secret': self.settings.client_secret,
                'redirect_uri': self.settings.redirect_uri,
                'grant_type': constants.oauth2_grant_type,
            })

            async with post_req as resp:
                data: Mapping[str, any] = await resp.json()

                if req.remote not in self.clients:
                    self.add_client(req.remote, None)

                try:
                    access_token = data['access_token']
                    self.clients[req.remote].access_token = access_token
                except KeyError:
                    return utils.resp('Code already exchanged', False)

            get_req = session.get(endpoints.my_channel(), headers={
                'Authorization': f'Bearer {access_token}',
            })

            async with get_req as resp:
                data: Mapping[str, any] = await resp.json()

        print('Authenticated')

        return utils.resp(data)

    async def auth_logout(self, req: Request) -> Response:
        try:
            token = self.clients[req.remote].access_token

            self.clients[req.remote].access_token = None

            async with aiohttp.ClientSession() as session:
                get_req = session.get(endpoints.oauth2_revoke(token))

                async with get_req as _:
                    print('Revoked access token')

                    pass
        except KeyError:
            pass

        return utils.resp({
            'logged_out': True,
        })

    async def auth_redirect(self, req: Request) -> Response:
        return aiohttp.web.HTTPFound(endpoints.oauth2_redirect(
            self.settings.client_id,
            self.settings.redirect_uri,
        ))

    async def get_channels(self, req: Request) -> Response:
        async with aiohttp.ClientSession() as session:
            get_req = session.get(endpoints.channels(self.settings.yt_key))

            async with get_req as resp:
                return utils.resp(await resp.json())

    async def get_channel_messages(self, req: Request) -> Response:
        channel_id = req.match_info['channel_id']

        try:
            return utils.resp(self.messages[channel_id])
        except KeyError:
            return utils.not_found({
                'message': 'Channel id not found',
                'success': False,
            })

    async def send_message(self, req: Request) -> Response:
        try:
            data: Mapping[str, any] = json.loads(await req.text())
        except KeyError:
            return utils.bad_req('Invalid JSON sent')

        if 'content' not in data:
            return utils.bad_req('No content sent')

        try:
            client: Client = self.clients[req.remote]
        except KeyError:
            return utils.bad_req('Unknown client')

        if not client or client.livestream_id is None:
            return utils.bad_req('You are not watching a channel')

        if client.access_token is None:
            return utils.bad_req('You are not authenticated')

        msg: Mapping[str, object] = {
            'snippet': {
                'liveChatId': client.livestream_id,
                'textMessageDetails': {
                    'messageText': data['content']
                },
                'type': 'textMessageEvent',
            },
        }

        async with aiohttp.ClientSession() as session:
            post_req = session.post(endpoints.messages(), json=msg, headers={
                'Authorization': f'Bearer {client.access_token}',
            })

            async with post_req as resp:
                return utils.resp(await resp.json())

    async def broadcast_hype(self) -> None:
        while True:
            print('Sending hype to clients')

            for client in self.clients.values():
                # Check if the client is connected to a channel
                if client.channel_id is None:
                    continue

                if client.closed:
                    continue

                # Check that we can calculate hype
                if client.count_current is None or client.count_last is None:
                    client.count_current = 0
                    client.count_last = client.count_current

                    continue

                try:
                    hype = round((client.count_current / client.count_last) * 100)
                except ZeroDivisionError:
                    hype = 0

                client.count_last = client.count_current
                client.count_current = 0

                print('hype', hype)

                await client.ws.send_json({
                    'data': {
                        'hype': hype,
                    },
                    'type': constants.hype,
                })

            await asyncio.sleep(self.settings.hype_interval)

    async def broadcast_viewer_counts(self) -> None:
        async with aiohttp.ClientSession() as session:
            while True:
                print('Sending viewer counts')

                for client in self.clients.values():
                    if client.channel_id is None or client.closed:
                        continue

                    # liveStreamingDetails.concurrentViewers
                    req = session.get(endpoints.channel(
                        client.channel_id,
                        self.settings.yt_key,
                    ))

                    async with req as resp:
                        body: Mapping[str, Union[str, object]] = await resp.json()

                        if body['pageInfo']['totalResults'] == 0:
                            return utils.bad_req('No video found')

                        try:
                            viewers = int(body['items'][0]['liveStreamingDetails']['concurrentViewers'])
                        except (KeyError, ValueError):
                            await client.ws.send_json({
                                'type': constants.stream_over,
                            })

                            return

                        if client.closed:
                            continue

                        await client.ws.send_json({
                            'data': {
                                'viewers': viewers,
                            },
                            'type': constants.viewers,
                        })

                        if not client.actual_received:
                            client.actual_received = True

                            await client.ws.send_json({
                                'data': {
                                    'actual_start_time': body['items'][0]['liveStreamingDetails']['actualStartTime'],
                                },
                                'type': constants.actual_start_time,
                            })

                        print('Viewer count', int(body['items'][0]['liveStreamingDetails']['concurrentViewers']))

                await asyncio.sleep(self.settings.viewer_interval)

    async def poll_messages(self, client: Client, channel_id: str) -> None:
        client.count_current = 0

        async with aiohttp.ClientSession() as session:
            resp = await session.get(endpoints.channel(channel_id, self.settings.yt_key))
            body: Mapping[str, object] = await resp.json()

            try:
                livestream_id: str = body['items'][0]['liveStreamingDetails']['activeLiveChatId']

                client.livestream_id = livestream_id
            except (IndexError, KeyError):
                print(f'Client\'s channel has no live chat: {channel_id}')

                await client.ws.send_json({
                    'data': {
                        'channel_id': channel_id,
                    },
                    'type': constants.no_live_chat,
                })

                return

            print('Polling messages for livestream id:', livestream_id)

            next_token: str = ''

            while True:
                if client.closed:
                    break

                req = session.get(endpoints.messages_live(
                    livestream_id,
                    next_token,
                    self.settings.yt_key,
                ))

                async with req as resp:
                    data: Mapping[str, any] = await resp.json()

                    client.count_current += len(data['items'])

                    print(f'Sending {len(data["items"])} messages to client')

                    msgs = []

                    for item in data['items']:
                        channel_id = item['authorDetails']['channelId']
                        msg = {
                            'msg_id': item['id'],
                            'msg_content': item['snippet']['displayMessage'],
                            'msg_created_at': item['snippet']['publishedAt'],
                            'channel_id': channel_id,
                            'channel_name': item['authorDetails']['displayName'],
                            'channel_avatar_url': item['authorDetails']['profileImageUrl']
                        }

                        msgs.append(msg)

                        try:
                            self.messages[channel_id].append(msg)

                            if len(self.messages[channel_id]) > 100:
                                self.messages[channel_id] = self.messages[channel_id][-100:]
                        except KeyError:
                            self.messages[channel_id] = [msg]

                    if len(msgs) > 0:
                        await client.ws.send_json({
                            'data': msgs,
                            'type': constants.messages_batch,
                        })

                    next_token = data['nextPageToken']

                    print('Sleeping for', int(data['pollingIntervalMillis']) / 1000)

                    await asyncio.sleep(int(data['pollingIntervalMillis']) / 1000)

    async def index(self, req: Request) -> Response:
        return utils.resp('index')

    async def websocket_server(self, req: Request) -> WebSocketResponse:
        print('Handling websocket client')

        ws_client: WebSocketResponse = WebSocketResponse()
        await ws_client.prepare(req)

        client: Client = self.add_client(req.remote, ws_client)

        async for msg in client.ws:
            if msg.type == WebSocketMessageType.TEXT:
                await self.handle_msg(client, req.remote, msg)

        print('closing')

        self.messages.clear()

        ws_client.close()
        # error, try restarting to see

        client.ws = None
        client.closed = True

        print('Websocket client closed')

        return ws_client

    async def handle_msg(self, client, remote, msg) -> None:
        try:
            msg: str = json.loads(msg.data)
        except JSONDecodeError as e:
            await client.ws.send_json({
                'data': str(e),
                'type': constants.error,
            })

            await client.ws.close()

            return

        try:
            kind: str = msg['type']
        except KeyError:
            await client.ws.send_str({
                'data': 'No type received',
                'type': constants.error,
            })

            await client.ws.close()

            return

        print('Got message type', kind)

        if kind == constants.watch:
            channel_id: str = msg['data']['channel_id']
            client.channel_id = channel_id
            client.actual_received = False

            client.tasks['poller'] = client.ws._loop.create_task(self.poll_messages(client, channel_id))

            await client.ws.send_json({
                'data': {
                    'channel_id': channel_id,
                },
                'type': constants.watching,
            })

            print(f'Client {remote} now watching channel id {channel_id}')
        elif kind == constants.stop_watching:
            print('Client stopped watching', remote)
            client.channel_id = None

            self.messages.clear()

            if client.tasks['poller'] is not None:
                client.tasks['poller'].cancel()
                client.tasks['poller'] = None

def main():
    loop = asyncio.get_event_loop()
    app = Application(ApplicationSettings(), loop)

    loop.create_task(app.broadcast_hype())
    loop.create_task(app.broadcast_viewer_counts())

    app.run()

if __name__ == '__main__':
    main()
