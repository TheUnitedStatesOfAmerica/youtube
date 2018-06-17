import { CHAT_FETCH_REQUESTED, CHAT_MESSAGES_RECEIVED, CHAT_SEND_MESSAGE } from '../constants/chat';

export const fetchChatMessages = channelId => ({ type: CHAT_FETCH_REQUESTED, channelId });
export const receivedMessages = messages => ({ type: CHAT_MESSAGES_RECEIVED, messages });
export const sendChatMessage = message => ({ type: CHAT_SEND_MESSAGE, message });
