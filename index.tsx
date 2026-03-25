
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import DebugErrorBoundary from './components/DebugErrorBoundary';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// Global Error Listeners for non-React errors
window.addEventListener('error', (event) => {
  console.error("Global Error:", event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error("Unhandled Rejection:", event.reason);
});

root.render(
  <React.StrictMode>
    <DebugErrorBoundary>
      <App />
    </DebugErrorBoundary>
  </React.StrictMode>
);
