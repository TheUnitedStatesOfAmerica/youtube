import { takeEvery } from 'redux-saga';

import { startFetching, stopWatching, sendMessage } from './sagas/chatSocket';
import { CHAT_FETCH_REQUESTED, CHAT_SEND_MESSAGE } from './constants/chat';

export default function* saga() {
  yield takeEvery(CHAT_FETCH_REQUESTED, startFetching.bind(this));
  yield takeEvery(CHAT_SEND_MESSAGE, sendMessage.bind(this));
  yield takeEvery('@@router/LOCATION_CHANGE', stopWatching.bind(this)); // hacky?
}
