import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './i18n';
import './analytics';
import UserFeedback from './components/standalone/UserFeedback';

// Инициализация приложения React
const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Функция для монтирования компонента
window.mountUserFeedback = function(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    const root = createRoot(container);
    root.render(<UserFeedback />);
  }
};

// Автоматический монтаж компонента при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  const container = document.getElementById('user-feedback-root');
  if (container) {
    const root = createRoot(container);
    root.render(<UserFeedback />);
  }
}); 