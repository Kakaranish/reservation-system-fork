import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import HttpsRedirect from 'react-https-redirect';
import axios from 'axios';
import App from './App';
import configureStore from './store';

const { store, persistor } = configureStore();

const isProduction = process.env.NODE_ENV === 'production';
axios.defaults.withCredentials = true;
if (isProduction) axios.defaults.baseURL = 'https://res-system-backend.azurewebsites.net';
else axios.defaults.baseURL = 'http://localhost:8000';

ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <HttpsRedirect disabled={!isProduction}>
        <App />
      </HttpsRedirect>
    </PersistGate>
  </Provider>,
  document.getElementById('root')
);