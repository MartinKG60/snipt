import React from 'react';
import ReactDOM from 'react-dom/client';
import CaptureApp from './CaptureApp.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('capture-root')).render(
  <React.StrictMode>
    <CaptureApp />
  </React.StrictMode>,
);
