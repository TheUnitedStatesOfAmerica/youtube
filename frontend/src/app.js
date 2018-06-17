import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import 'normalize.css/normalize.css';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { history, persistor } from './store';

import Application from './pages/Application';

import './styling/main.scss';


function render() {
  ReactDOM.render(
    <AppContainer>
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <ConnectedRouter history={history}>
            <Application />
          </ConnectedRouter>
        </PersistGate>
      </Provider>
    </AppContainer>,
    document.getElementById('app'), // eslint-disable-line
  );
}

render();
if (module.hot) {
  module.hot.accept('./pages/Application.js', render);
}
