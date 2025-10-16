import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import App from './App';

import AOS from 'aos';
import 'aos/dist/aos.css'; // Import the AOS CSS file

AOS.init({
  duration: 800, 
  easing: 'ease-in-out', 
  once: true, 
  mirror: false, 
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);