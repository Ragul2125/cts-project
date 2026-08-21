import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker for PWA offline capabilities
if ('serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onNeedRefresh() {
      console.log('CarePath AI: New version available. Refreshing...');
    },
    onOfflineReady() {
      console.log('CarePath AI: App ready for offline triage and viewing.');
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
