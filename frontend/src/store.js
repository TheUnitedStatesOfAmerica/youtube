import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import rootSaga from './sagas.js';
import reducer from './reducer.js';
import createHistory from 'history/createBrowserHistory';
import { routerMiddleware } from 'react-router-redux';

// Load React-Intl
import enLocale from 'react-intl/locale-data/en';
import deLocale from 'react-intl/locale-data/de';
import { addLocaleData } from 'react-intl';

addLocaleData(enLocale);
addLocaleData(deLocale);

// Set up the redux store, including the react router middleware, persist and saga
const persist = { key: 'root', storage, blacklist: ['chat'] };
export const history = createHistory();
const routingMiddleware = routerMiddleware(history);
const sagaMiddleware = createSagaMiddleware();
const composer = (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose);
const persistedReducer = persistReducer(persist, reducer);
const store = createStore(
  persistedReducer,
  {},
  composer(applyMiddleware(routingMiddleware, sagaMiddleware)),
);
export const persistor = persistStore(store);


// Start running the main saga
sagaMiddleware.run(rootSaga);

export default store;
