import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import App from './App';
import { MotionConfig } from "framer-motion";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <MotionConfig reducedMotion="always">
      <App />
    </MotionConfig>
  </React.StrictMode>
);