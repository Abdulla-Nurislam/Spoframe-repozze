// Переменные для модального окна
let modal, closeBtn, switchToSignupLinks, switchToLoginLinks, loginForm, signupForm;

// Проверка, доступен ли React
const isReactAvailable = typeof React !== 'undefined' && typeof ReactDOM !== 'undefined';

// Инициализация модального окна при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем наличие React bundle
    if (isReactAvailable || window.mountAuthModal) {
        loadReactAuthModal();
        return;
    }
    
    // Иначе используем HTML версию
    initHTMLModal();
});

// Функция для инициализации HTML-версии модального окна
function initHTMLModal() {
    // Получаем элементы DOM
    modal = document.getElementById('authModal');
    if (!modal) return; // Выходим, если модального окна нет на странице
    
    closeBtn = modal.querySelector('.close');
    switchToSignupLinks = modal.querySelectorAll('.switch-to-signup');
    switchToLoginLinks = modal.querySelectorAll('.switch-to-login');
    loginForm = modal.querySelector('.login-form');
    signupForm = modal.querySelector('.signup-form');
    
    // Получаем все кнопки, которые открывают модальное окно
    const authButtons = document.querySelectorAll('[data-auth="open"]');
    
    // Добавляем обработчики для открытия модального окна
    authButtons.forEach(button => {
        button.addEventListener('click', openModal);
    });
    
    // Добавляем обработчик для закрытия модального окна
    closeBtn.addEventListener('click', closeModal);
    
    // Закрытие при клике вне модального окна
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });
    
    // Переключение между формами входа и регистрации
    switchToSignupLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showSignupForm();
        });
    });
    
    switchToLoginLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showLoginForm();
        });
    });
    
    // Обработка отправки формы входа
    const loginFormElement = loginForm.querySelector('form');
    if (loginFormElement) {
        loginFormElement.addEventListener('submit', function(e) {
            e.preventDefault();
            // Здесь будет код для обработки входа
            console.log('Форма входа отправлена!');
        });
    }
    
    // Обработка отправки формы регистрации
    const signupFormElement = signupForm.querySelector('form');
    if (signupFormElement) {
        signupFormElement.addEventListener('submit', function(e) {
            e.preventDefault();
            // Здесь будет код для обработки регистрации
            console.log('Форма регистрации отправлена!');
        });
    }
}

// Функция для загрузки React-компонента модального окна
function loadReactAuthModal() {
    // Проверяем, есть ли уже скрипт на странице
    const script = document.querySelector('script[src*="authModal.bundle.js"]');
    
    if (!script) {
        // Если скрипта нет, добавляем его
        const newScript = document.createElement('script');
        newScript.src = '/authModal.bundle.js';
        newScript.onload = function() {
            if (window.mountAuthModal) {
                window.mountAuthModal();
            }
        };
        document.body.appendChild(newScript);
    } else if (window.mountAuthModal) {
        // Если скрипт уже есть и функция доступна, вызываем её
        window.mountAuthModal();
    }
    
    // Получаем все кнопки, которые открывают модальное окно
    const authButtons = document.querySelectorAll('[data-auth="open"]');
    
    // Добавляем обработчики для открытия модального окна
    authButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (window.authModal && window.authModal.open) {
                window.authModal.open();
            }
        });
    });
}

// Функция для открытия модального окна
function openModal() {
    if (window.authModal && window.authModal.open) {
        // Используем React-версию, если она доступна
        window.authModal.open();
    } else if (modal) {
        // Иначе используем HTML-версию
        modal.style.display = 'flex';
    }
}

// Функция для закрытия модального окна
function closeModal() {
    if (window.authModal && window.authModal.close) {
        // Используем React-версию, если она доступна
        window.authModal.close();
    } else if (modal) {
        // Иначе используем HTML-версию
        modal.style.display = 'none';
    }
}

// Функция для показа формы регистрации
function showSignupForm() {
    if (window.authModal && window.authModal.showSignup) {
        // Используем React-версию, если она доступна
        window.authModal.showSignup();
    } else if (loginForm && signupForm) {
        // Иначе используем HTML-версию
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    }
}

// Функция для показа формы входа
function showLoginForm() {
    if (window.authModal && window.authModal.showLogin) {
        // Используем React-версию, если она доступна
        window.authModal.showLogin();
    } else if (loginForm && signupForm) {
        // Иначе используем HTML-версию
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
    }
}

// Экспортируем функции для глобального использования
window.authModal = window.authModal || {
    open: openModal,
    close: closeModal,
    showLogin: showLoginForm,
    showSignup: showSignupForm
};

document.querySelector('.open-auth-modal').addEventListener('click', () => {
    document.getElementById('authModal').classList.add('active');
}); 