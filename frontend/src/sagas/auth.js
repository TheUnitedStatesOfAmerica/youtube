import { call, put, select } from 'redux-saga/effects';
import { push } from 'react-router-redux';

import { savePreviousUrl, loggedIn, notLoggedIn, userUpdate } from '../actions/auth';

const CLIENT_ID = '';
const REDIRECT_URI = 'http://localhost:3000/callback';
const SCOPE = 'https://www.googleapis.com/auth/youtube';

export function* getAuthenticationState() {
  try {
    const previousPath = yield select(state => state.router.location);
    yield put(savePreviousUrl(previousPath));
    yield redirect();
  } catch (e) {
    console.error(e);
  }
}

export function* logout() {
  try {
    const res = yield fetch('http://localhost:10001/auth/logout', { method: 'POST' });
    const body = yield res.json();
    if (body.message.logged_out) yield put(notLoggedIn());
  } catch (e) {
    console.error(e);
  }
}

export function* redirectedFromGoogle() {
  if (window.location.pathname === '/callback') {
    console.log(window.location.search);
    for (const param of window.location.search.split('&')) { // eslint-disable-line
      const split = param.split('=');

      const [name, value] = split;

      if (name.replace('?', '') !== 'code') {
        continue; // eslint-disable-line
      }

      yield* authExchange(value.replace('#', '')); // eslint-disable-line
    }
  }
}

export function* isAuth() {
  try {
    const res = yield fetch('http://localhost:10001/auth/check');
    const body = yield res.json();
    if (body.message.logged_in) yield put(loggedIn());
    else put(notLoggedIn());
  } catch (e) {
    console.error(e);
    yield put(notLoggedIn());
  }
}

export function redirect() {
  window.location = 'http://localhost:10001/auth/redirect';
}

function* authExchange(code) {
  try {
    const res = yield fetch(`http://localhost:10001/auth/exchange?code=${code}`);
    const body = yield res.json();
    if (body.success) {
      yield* isAuth();
      console.log(body);
      yield put(userUpdate(body));
    }
    yield put(push(yield select(state => state.auth.previousUrl)));
  } catch (e) {
    console.error(e);
  }
}
