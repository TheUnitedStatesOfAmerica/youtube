import { spawn, takeEvery } from 'redux-saga/effects';
import { saga as videosSaga } from './modules/videos';
import { saga as chatSaga } from './modules/chat';
import { LOGIN_STARTED, LOGOUT_STARTED } from './constants/menu';
import { getAuthenticationState, isAuth, redirectedFromGoogle, logout } from './sagas/auth';

export default function* root() {
  yield spawn(redirectedFromGoogle);
  yield spawn(isAuth);
  yield takeEvery(LOGIN_STARTED, getAuthenticationState.bind(this));
  yield takeEvery(LOGOUT_STARTED, logout.bind(this));
  yield spawn(videosSaga);
  yield spawn(chatSaga);
}
