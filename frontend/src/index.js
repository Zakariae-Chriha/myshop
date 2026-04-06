import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css';
import './i18n/index';
import App from './App';

// Wake up Render backend on page load (free tier sleeps after inactivity)
fetch((process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api', ''))
  .catch(() => {});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);