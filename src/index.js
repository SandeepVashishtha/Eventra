import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import App from './App';
import { MotionConfig } from "framer-motion";
import { ThemeProvider } from './context/ThemeContext';
import GlobalErrorBoundary from './components/common/ErrorBoundary';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <MotionConfig reducedMotion="always">
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </MotionConfig>
    </GlobalErrorBoundary>
  </React.StrictMode>
);
