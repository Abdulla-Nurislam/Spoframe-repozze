// Улучшенный скрипт для обработки всех форм авторизации
document.addEventListener('DOMContentLoaded', function() {
    console.log('Auth forms script initialized');
    
    // Инициализация модального окна авторизации
    initAuthModal();
    
    // Инициализация формы сброса пароля
    initResetPasswordForm();
});

// Функция для инициализации модального окна авторизации
function initAuthModal() {
    // Получаем элементы DOM для модального окна
    const modal = document.getElementById('authModal');
    if (!modal) return; // Выходим, если модального окна нет на странице
    
    const closeBtn = modal.querySelector('.close');
    const switchToSignupLinks = document.querySelectorAll('.switch-to-signup');
    const switchToLoginLinks = document.querySelectorAll('.switch-to-login');
    const loginForm = modal.querySelector('.login-form');
    const signupForm = modal.querySelector('.signup-form');
    const forgotPasswordLink = modal.querySelector('.forgot-password');
    
    // Получаем все кнопки, которые открывают модальное окно
    const authButtons = document.querySelectorAll('[data-auth="open"]');
    
    // Добавляем обработчики для открытия модального окна
    authButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            openModal();
        });
    });
    
    // Добавляем обработчик для закрытия модального окна
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
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
    
    // Обработка клика по ссылке "Забыли пароль?"
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/reset-password.html';
        });
    }
    
    // Обработка отправки формы входа
    const loginFormElement = loginForm ? loginForm.querySelector('form') : null;
    if (loginFormElement) {
        loginFormElement.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Получаем данные из формы
            const email = this.querySelector('input[type="email"]').value;
            const password = this.querySelector('input[type="password"]').value;
            
            // Проверка данных
            if (!email || !password) {
                showFormError(this, 'Пожалуйста, заполните все поля');
                return;
            }
            
            // Эмуляция успешной авторизации - в реальном проекте здесь будет запрос к API
            simulateSuccessfulAuth(this);
        });
    }
    
    // Обработка отправки формы регистрации
    const signupFormElement = signupForm ? signupForm.querySelector('form') : null;
    if (signupFormElement) {
        signupFormElement.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Получаем данные из формы
            const name = this.querySelector('input[type="text"]').value;
            const email = this.querySelector('input[type="email"]').value;
            const password = this.querySelector('input[type="password"]').value;
            
            // Проверка данных
            if (!name || !email || !password) {
                showFormError(this, 'Пожалуйста, заполните все поля');
                return;
            }
            
            if (password.length < 8) {
                showFormError(this, 'Пароль должен содержать минимум 8 символов');
                return;
            }
            
            // Эмуляция успешной регистрации - в реальном проекте здесь будет запрос к API
            simulateSuccessfulAuth(this);
        });
    }
    
    // Функция для отображения ошибки в форме
    function showFormError(form, message) {
        // Проверяем, есть ли уже элемент с ошибкой
        let errorElement = form.querySelector('.form-error');
        
        if (!errorElement) {
            // Создаем элемент для отображения ошибки
            errorElement = document.createElement('div');
            errorElement.className = 'form-error';
            
            // Добавляем стили для элемента ошибки
            errorElement.style.color = 'var(--error, #ff3b30)';
            errorElement.style.fontSize = '0.85rem';
            errorElement.style.marginTop = '0.5rem';
            errorElement.style.padding = '0.5rem';
            errorElement.style.borderRadius = '4px';
            errorElement.style.backgroundColor = 'rgba(255, 59, 48, 0.1)';
            
            // Находим кнопку отправки формы и вставляем ошибку перед ней
            const submitButton = form.querySelector('button[type="submit"]');
            form.insertBefore(errorElement, submitButton);
        }
        
        // Обновляем текст ошибки
        errorElement.textContent = message;
        
        // Анимация встряхивания для привлечения внимания
        errorElement.animate(
            [
                { transform: 'translateX(-5px)' },
                { transform: 'translateX(5px)' },
                { transform: 'translateX(-5px)' },
                { transform: 'translateX(5px)' },
                { transform: 'translateX(0)' }
            ],
            { duration: 300, easing: 'ease-in-out' }
        );
    }
    
    // Функция для эмуляции успешной авторизации
    function simulateSuccessfulAuth(form) {
        // Показываем прогресс
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Обработка...';
        submitButton.disabled = true;
        
        // Эмулируем задержку запроса
        setTimeout(() => {
            // Имитируем успешный ответ
            submitButton.innerHTML = '<i class="fas fa-check"></i> Успешно!';
            submitButton.style.backgroundColor = 'var(--success, #28a745)';
            
            // Закрываем модальное окно через небольшую задержку
            setTimeout(() => {
                closeModal();
                
                // Обновляем состояние UI после успешной авторизации
                updateAuthState(true);
                
                // Восстанавливаем кнопку
                submitButton.textContent = originalText;
                submitButton.disabled = false;
                submitButton.style.backgroundColor = '';
            }, 1000);
        }, 1500);
    }
    
    // Функция для открытия модального окна
    function openModal() {
        modal.style.display = 'flex';
        // Эффект появления
        modal.style.opacity = '0';
        setTimeout(() => { modal.style.opacity = '1'; }, 10);
    }
    
    // Функция для закрытия модального окна
    function closeModal() {
        // Эффект исчезновения
        modal.style.opacity = '0';
        setTimeout(() => { modal.style.display = 'none'; }, 300);
    }
    
    // Функция для показа формы регистрации
    function showSignupForm() {
        if (loginForm && signupForm) {
            loginForm.style.display = 'none';
            signupForm.style.display = 'block';
        }
    }
    
    // Функция для показа формы входа
    function showLoginForm() {
        if (loginForm && signupForm) {
            signupForm.style.display = 'none';
            loginForm.style.display = 'block';
        }
    }
    
    // Функция для обновления состояния UI при авторизации
    function updateAuthState(isAuthenticated) {
        const authButtons = document.querySelectorAll('[data-auth="open"]');
        const userProfileElements = document.querySelectorAll('[data-auth="profile"]');
        
        if (isAuthenticated) {
            // Скрываем кнопки авторизации
            authButtons.forEach(button => {
                button.style.display = 'none';
            });
            
            // Показываем элементы профиля
            userProfileElements.forEach(element => {
                element.style.display = 'flex';
            });
            
            // Сохраняем состояние в localStorage
            localStorage.setItem('isAuthenticated', 'true');
        } else {
            // Показываем кнопки авторизации
            authButtons.forEach(button => {
                button.style.display = 'flex';
            });
            
            // Скрываем элементы профиля
            userProfileElements.forEach(element => {
                element.style.display = 'none';
            });
            
            // Очищаем состояние в localStorage
            localStorage.removeItem('isAuthenticated');
        }
    }
    
    // Проверяем состояние авторизации при загрузке страницы
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (isAuthenticated) {
        updateAuthState(true);
    }
    
    // Экспортируем функции в глобальную область видимости
    window.authForms = window.authForms || {
        openModal: openModal,
        closeModal: closeModal,
        showLoginForm: showLoginForm,
        showSignupForm: showSignupForm,
        logout: function() {
            updateAuthState(false);
        }
    };
}

// Функция для инициализации формы сброса пароля
function initResetPasswordForm() {
    const resetForm = document.getElementById('resetForm');
    const successMessage = document.getElementById('successMessage');
    const authModalOpenLinks = document.querySelectorAll('.auth-modal-open');
    
    // Обработка ссылок на открытие модального окна
    authModalOpenLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Если мы на странице сброса пароля, возвращаемся назад и открываем модальное окно
            window.location.href = '/';
            
            // Задержка, чтобы дать время загрузиться главной странице
            setTimeout(() => {
                if (window.authForms && window.authForms.openModal) {
                    window.authForms.openModal();
                }
            }, 100);
        });
    });
    
    // Обработка отправки формы сброса пароля
    if (resetForm) {
        resetForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Получаем email из формы
            const email = this.querySelector('input[type="email"]').value;
            
            if (!email) {
                // Проверка на заполненность поля
                showResetFormError('Пожалуйста, введите ваш email');
                return;
            }
            
            // Показываем прогресс
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
            submitButton.disabled = true;
            
            // Эмулируем задержку запроса
            setTimeout(() => {
                // Скрываем форму
                resetForm.style.display = 'none';
                
                // Показываем сообщение об успехе
                if (successMessage) {
                    successMessage.style.display = 'block';
                }
                
                // Восстанавливаем кнопку на случай, если пользователь захочет повторить
                submitButton.textContent = originalText;
                submitButton.disabled = false;
                
                // Через 5 секунд возвращаем пользователя на главную страницу
                setTimeout(() => {
                    window.location.href = '/';
                }, 5000);
            }, 1500);
        });
    }
    
    // Функция для отображения ошибки в форме сброса пароля
    function showResetFormError(message) {
        // Проверяем, есть ли уже элемент с ошибкой
        let errorElement = resetForm.querySelector('.form-error');
        
        if (!errorElement) {
            // Создаем элемент для отображения ошибки
            errorElement = document.createElement('div');
            errorElement.className = 'form-error';
            
            // Добавляем стили для элемента ошибки
            errorElement.style.color = 'var(--error, #ff3b30)';
            errorElement.style.fontSize = '0.85rem';
            errorElement.style.marginTop = '0.5rem';
            errorElement.style.padding = '0.5rem';
            errorElement.style.borderRadius = '4px';
            errorElement.style.backgroundColor = 'rgba(255, 59, 48, 0.1)';
            
            // Находим кнопку отправки формы и вставляем ошибку перед ней
            const submitButton = resetForm.querySelector('button[type="submit"]');
            resetForm.insertBefore(errorElement, submitButton);
        }
        
        // Обновляем текст ошибки
        errorElement.textContent = message;
        
        // Анимация встряхивания для привлечения внимания
        errorElement.animate(
            [
                { transform: 'translateX(-5px)' },
                { transform: 'translateX(5px)' },
                { transform: 'translateX(-5px)' },
                { transform: 'translateX(5px)' },
                { transform: 'translateX(0)' }
            ],
            { duration: 300, easing: 'ease-in-out' }
        );
    }
}
