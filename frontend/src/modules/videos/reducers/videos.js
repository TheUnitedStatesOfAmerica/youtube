import { combineReducers } from 'redux';

import { VIDEOS_FETCH_SUCCEED, VIDEOS_FETCH_REQUESTED, VIDEOS_FETCH_FAILED, VIEWER_FETCH_SUCCEED, VIDEOS_RESET_META, RECEIVE_START_TIME } from '../constants/videos';
import { VIEWERS_RECEIVED, HYPE_RECEIVED } from '../../chat/constants/chat';

const defaultMeta = {
  viewers: 0,
  hype: 0,
};

function resultReducer(state = [], action) {
  switch (action.type) {
    case VIDEOS_FETCH_SUCCEED: return action.results;
    default: return state;
  }
}

function errorReducer(state = null, action) {
  switch (action.type) {
    case VIDEOS_FETCH_REQUESTED: return null;
    case VIDEOS_FETCH_FAILED: return action.error;
    default: return state;
  }
}

function loadingReducer(state = false, action) {
  switch (action.type) {
    case VIDEOS_FETCH_REQUESTED: return true;
    case VIDEOS_FETCH_SUCCEED: return false;
    case VIDEOS_FETCH_FAILED: return false;
    default: return state;
  }
}

function metaReducer(state = defaultMeta, action) {
  switch (action.type) {
    case RECEIVE_START_TIME: return { ...state, start_time: action.data.actual_start_time };
    case VIEWERS_RECEIVED: return { ...state, viewers: action.data.viewers };
    case HYPE_RECEIVED: return { ...state, hype: action.data.hype };
    case VIEWER_FETCH_SUCCEED: return { ...state, viewer_messages: action.messages };
    case VIDEOS_RESET_META: return defaultMeta;
    default: return state;
  }
}

export default combineReducers({
  results: resultReducer,
  error: errorReducer,
  loading: loadingReducer,
  meta: metaReducer,
});

