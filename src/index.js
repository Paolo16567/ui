import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import AppMobile from './AppMobile';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

root.render(
  <React.StrictMode>
    {isMobile ? <AppMobile /> : <App />}
  </React.StrictMode>
);

reportWebVitals();
