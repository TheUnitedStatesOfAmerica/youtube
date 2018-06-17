import { call, put } from 'redux-saga/effects';

import Swal from 'sweetalert2';

import { fetchSucceed, fetchFailed, fetchedViewerMessages } from '../actions/videos';

async function api() {
  const res = await fetch('http://localhost:10001/channels'); // eslint-disable-line
  return res.json();
}


export function* fetchVideos() {
  try {
    const results = yield call(api, 'livestreams');
    if (results.error) {
      yield put(fetchFailed(results.error.message));
    } else {
      yield put(fetchSucceed(results));
    }
  } catch (e) {
    yield put(fetchFailed(e.message));
  }
}

export function* fetchViewerMessages(action) {
  try {
    const results = yield fetch(`http://localhost:10001/channels/${action.viewer}/messages`); // eslint-disable-line
    const data = yield results.json();
    if (data.success) yield put(fetchedViewerMessages(data.message));
    else Swal({ text: 'Could not fetch new messages', type: 'error' });
  } catch (e) {
    console.error(e); // eslint-disable-line
  }
}
