import { takeEvery } from 'redux-saga';

import { fetchVideos, fetchViewerMessages } from './sagas/videos';
import { VIDEOS_FETCH_REQUESTED, VIEWER_FETCH_REQUESTED } from './constants/videos';

export default function* saga() {
  yield takeEvery(VIDEOS_FETCH_REQUESTED, fetchVideos.bind(this));
  yield takeEvery(VIEWER_FETCH_REQUESTED, fetchViewerMessages.bind(this));
}
