import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import './styles/index.css';
import { useAuthStore } from './store/authStore';
import { useCartStore } from './store/cartStore';

useAuthStore.getState().loadFromStorage();
useCartStore.getState().loadFromStorage();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
