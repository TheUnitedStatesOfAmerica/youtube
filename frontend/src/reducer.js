import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { videoReducer } from './modules/videos';
import { chatReducer } from './modules/chat';
import authReducer from './reducers/auth';

export default combineReducers({
  router: routerReducer,
  videos: videoReducer,
  auth: authReducer,
  chat: chatReducer,
});
