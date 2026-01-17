import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import { NatsFlow } from './components/NatsFlow';
import { scenarios } from './components/NatsFlow/scenarios';

import './index.css';
import './loader';

// Expose React, ReactDOM, and NatsFlow to the window for the loader
// eslint-disable-next-line @typescript-eslint/no-explicit-any
window.React = React;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).ReactDOM = ReactDOM;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).NatsFlow = { NatsFlow, scenarios };

// Dispatch the custom event to notify the loader that components are ready
window.dispatchEvent(new Event('natsflow-loaded'));

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
