import { VIDEOS_FETCH_REQUESTED, VIDEOS_FETCH_SUCCEED, VIDEOS_FETCH_FAILED, VIEWER_FETCH_REQUESTED, VIEWER_FETCH_SUCCEED, VIDEOS_RESET_META } from '../constants/videos';

export const fetchSucceed = results => ({ type: VIDEOS_FETCH_SUCCEED, results });
export const fetchFailed = error => ({ type: VIDEOS_FETCH_FAILED, error });
export const fetchVideos = () => ({ type: VIDEOS_FETCH_REQUESTED });
export const fetchViewerMessages = viewer => ({ type: VIEWER_FETCH_REQUESTED, viewer });
export const fetchedViewerMessages = messages => ({ type: VIEWER_FETCH_SUCCEED, messages });
export const resetVideoMeta = () => ({ type: VIDEOS_RESET_META });
