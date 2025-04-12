// Оптимизированная версия модального окна авторизации
console.log('Начало загрузки скрипта auth-modal-standalone.js');

import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/auth-modal.css';

// Объявляем переменную для хранения состояния загрузки
window.authModalStatus = {
  isLoading: false,
  error: null,
  startTime: Date.now()
};

// Подготавливаем индикатор загрузки
const Loader = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100%',
    flexDirection: 'column',
    color: 'white',
    fontFamily: 'Arial, sans-serif'
  }}>
    <div style={{ marginBottom: '15px' }}>Загрузка модального окна...</div>
    <div style={{
      width: '30px', 
      height: '30px', 
      border: '3px solid rgba(255,255,255,0.3)', 
      borderTop: '3px solid white', 
      borderRadius: '50%', 
      animation: 'spin 1.5s linear infinite'
    }}></div>
    <div style={{ marginTop: '15px', fontSize: '12px' }}>
      {Math.floor((Date.now() - window.authModalStatus.startTime) / 1000)} сек.
    </div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Компонент для отображения ошибок
const ErrorFallback = ({ error }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: 'white',
    background: 'rgba(231, 76, 60, 0.9)',
    padding: '20px',
    borderRadius: '5px',
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif'
  }}>
    <h2 style={{ marginBottom: '10px' }}>Ошибка загрузки модального окна</h2>
    <p>{error.message || 'Неизвестная ошибка'}</p>
    <button
      onClick={() => window.location.reload()}
      style={{
        marginTop: '15px',
        padding: '8px 16px',
        background: 'white',
        color: '#e74c3c',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      Перезагрузить
    </button>
  </div>
);

// Ленивая загрузка компонента AuthModal
console.log('Настройка ленивой загрузки AuthModal...');
const AuthModal = lazy(() => {
  console.log('Начинаем загрузку AuthModal компонента...');
  window.authModalStatus.isLoading = true;
  
  return import('./components/common/AuthModal')
    .then(module => {
      console.log('AuthModal загружен успешно');
      window.authModalStatus.isLoading = false;
      return module;
    })
    .catch(error => {
      console.error('Ошибка загрузки AuthModal:', error);
      window.authModalStatus.isLoading = false;
      window.authModalStatus.error = error;
      throw error;
    });
});

// Функция для монтирования модального окна
export function mountAuthModal() {
  console.log('Монтирование модального окна...');
  
  if (window.authModalStatus.isLoading) {
    console.log('AuthModal уже загружается...');
    return;
  }
  
  window.authModalStatus.startTime = Date.now();
  
  try {
    // Находим или создаем контейнер для модального окна
    let authModalContainer = document.getElementById('authModalContainer');
    
    if (!authModalContainer) {
      console.log('Создаем контейнер для модального окна...');
      authModalContainer = document.createElement('div');
      authModalContainer.id = 'authModalContainer';
      document.body.appendChild(authModalContainer);
    }
    
    // Рендерим модальное окно
    console.log('Рендерим модальное окно...');
    const root = createRoot(authModalContainer);
    
    root.render(
      <React.StrictMode>
        <Suspense fallback={<Loader />}>
          {window.authModalStatus.error ? (
            <ErrorFallback error={window.authModalStatus.error} />
          ) : (
            <AuthModal />
          )}
        </Suspense>
      </React.StrictMode>
    );
    
    // Экспортируем API для взаимодействия с модальным окном
    window.authModal = {
      open: () => {
        console.log('Открываем модальное окно...');
        const event = new CustomEvent('auth-modal-open');
        document.dispatchEvent(event);
      },
      close: () => {
        console.log('Закрываем модальное окно...');
        const event = new CustomEvent('auth-modal-close');
        document.dispatchEvent(event);
      },
      showLogin: () => {
        console.log('Показываем форму входа...');
        const event = new CustomEvent('auth-modal-show-login');
        document.dispatchEvent(event);
      },
      showSignup: () => {
        console.log('Показываем форму регистрации...');
        const event = new CustomEvent('auth-modal-show-signup');
        document.dispatchEvent(event);
      }
    };
    
    console.log('Модальное окно успешно настроено');
    return window.authModal;
  } catch (error) {
    console.error('Ошибка при монтировании модального окна:', error);
    window.authModalStatus.error = error;
    
    // В случае ошибки показываем сообщение в контейнере
    const authModalContainer = document.getElementById('authModalContainer');
    if (authModalContainer) {
      authModalContainer.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: white;
          background: rgba(231, 76, 60, 0.9);
          padding: 20px;
          border-radius: 5px;
          text-align: center;
          font-family: Arial, sans-serif
        ">
          <h2 style="margin-bottom: 10px">Ошибка загрузки модального окна</h2>
          <p>${error.message || 'Неизвестная ошибка'}</p>
          <button
            onclick="window.location.reload()"
            style="
              margin-top: 15px;
              padding: 8px 16px;
              background: white;
              color: #e74c3c;
              border: none;
              border-radius: 4px;
              cursor: pointer
            "
          >
            Перезагрузить
          </button>
        </div>
      `;
    }
  }
}

// Инициализация модального окна при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM загружен, инициализируем модальное окно с задержкой...');
  setTimeout(mountAuthModal, 1000); // Задержка для приоритета основного контента
}); 