import swal from 'sweetalert2';
import { call, take, put } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import { CHAT_MESSAGES_RECEIVED, CHAT_IS_ACTIVE, VIEWERS_RECEIVED, HYPE_RECEIVED } from '../constants/chat';
import { RECEIVE_START_TIME } from '../../videos/constants/videos';

let ws; // set ws here because otherwise we're creating multiple connections

function handleSocket(status, action) {
  return eventChannel((emitter) => {
    ws = new WebSocket('wss://localhost:10001/ws'); // eslint-disable-line
    ws.onopen = () => {
      try {
        const data = JSON.stringify({ data: { channel_id: action.channelId }, type: status });
        console.log('starting to watch'); // eslint-disable-line
        ws.send(data);
      } catch (e) {
        console.error('could not open WS connection: ', e); // eslint-disable-line
      }
    };
    ws.onerror = e => console.warn('ws error', e.data); // eslint-disable-line
    ws.onclose = e => console.error('is close'); // eslint-disable-line
    ws.onmessage = (e) => { // eslint-disable-line
      try {
        const body = JSON.parse(e.data);
        if (body.type === 'ACTUAL_START_TIME') return emitter({ type: RECEIVE_START_TIME, data: body.data });
        if (body.type === 'NO_LIVE_CHAT') return emitter({ type: CHAT_IS_ACTIVE, active: false });
        if (body.type === 'MESSAGES_BATCH') return emitter({ type: CHAT_MESSAGES_RECEIVED, messages: body.data });
        if (body.type === 'VIEWERS') return emitter({ type: VIEWERS_RECEIVED, data: body.data });
        if (body.type === 'HYPE') return emitter({ type: HYPE_RECEIVED, data: body.data });
      } catch (err) {
        console.error('could not parse JSON: ', err); // eslint-disable-line
      }
    };

    return () => {
      console.warn('websocket connection closed'); // eslint-disable-line
      ws.close();
    };
  });
}

export function* stopWatching(action) {
  if (ws && action.payload.pathname === '/') yield ws.send({ type: 'STOP_WATCHING' });
}

export function* startFetching(action) {
  try {
    const channel = yield call(handleSocket, 'WATCH', action);
    while (true) {
      const action = yield take(channel); // eslint-disable-line
      yield put(action);
    }
  } catch (e) {
    console.error('unable to fetch: ', e); // eslint-disable-line
  }
}

export function* stopFetching() {
  const channel = yield call(handleSocket);
  yield channel.close();
}

export function* sendMessage(action) {
  try {
    yield fetch('http://localhost:10001/send_message', { // eslint-disable-line
      method: 'POST',
      body: JSON.stringify({ content: action.message }),
    });
  } catch (e) {
    console.error(e); // eslint-disable-line
    swal({ text: 'could not send message!', type: 'error' });
  }
}
