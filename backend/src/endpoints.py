def channel(channel_id: str, yt_key: str) -> str:
    return f'https://www.googleapis.com/youtube/v3/videos?id={channel_id}&part=liveStreamingDetails&key={yt_key}'

def channels(yt_key: str) -> str:
    return f'https://www.googleapis.com/youtube/v3/search?order=viewCount&type=video&eventType=live&regionCode=US&relevanceLanguage=en&part=snippet&videoCategoryId=20&maxResults=20&key={yt_key}'

def my_channel() -> str:
    return 'https://www.googleapis.com/youtube/v3/channels?mine=true&part=snippet%2CcontentOwnerDetails'

def messages() -> str:
    return 'https://www.googleapis.com/youtube/v3/liveChat/messages?part=snippet'

def messages_live(livestream_id: str, next_token: str, yt_key: str) -> str:
    return f'https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId={livestream_id}&part=snippet%2CauthorDetails&pageToken={next_token}&key={yt_key}'

def oauth2_check(access_token: str) -> str:
    return f'https://www.googleapis.com/oauth2/v3/tokeninfo?access_token={access_token}'

def oauth2_redirect(client_id: str, redirect_uri: str) -> str:
    return f'https://accounts.google.com/o/oauth2/v2/auth?client_id={client_id}&response_type=code&redirect_uri={redirect_uri}&scope=https://www.googleapis.com/auth/youtube'

def oauth2_revoke(access_token: str) -> str:
    return f'https://accounts.google.com/o/oauth2/revoke?token={access_token}'

def oauth2_token() -> str:
    return 'https://www.googleapis.com/oauth2/v4/token'
