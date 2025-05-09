document.addEventListener('DOMContentLoaded', function() {
    // Элементы форм
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');
    
    // Формы
    const loginFormElement = document.getElementById('loginForm');
    const registerFormElement = document.getElementById('registerForm');
    
    // Проверяем URL параметры для определения режима
    function getParameterByName(name, url = window.location.href) {
        name = name.replace(/[\[\]]/g, '\\$&');
        const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
        const results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }
    
    // Определяем нужный режим на основе параметров URL
    if (loginForm && registerForm) {
        const mode = getParameterByName('mode');
        if (mode === 'register') {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
        } else {
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
        }
    }
    
    // Сообщения об ошибках и успехе
    const loginEmailError = document.getElementById('login-email-error');
    const loginPasswordError = document.getElementById('login-password-error');
    const loginGeneralError = document.getElementById('login-general-error');
    const loginSuccessMessage = document.getElementById('login-success-message');
    
    const registerUsernameError = document.getElementById('register-username-error');
    const registerEmailError = document.getElementById('register-email-error');
    const registerPasswordError = document.getElementById('register-password-error');
    const registerConfirmPasswordError = document.getElementById('register-confirm-password-error');
    const registerGeneralError = document.getElementById('register-general-error');
    const registerSuccessMessage = document.getElementById('register-success-message');
    
    // Переключение между формами
    if (switchToRegister) {
        switchToRegister.addEventListener('click', function(e) {
            e.preventDefault();
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
        });
    }
    
    if (switchToLogin) {
        switchToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            registerForm.style.display = 'none';
            loginForm.style.display = 'block';
        });
    }
    
    // Валидация email
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Валидация пароля
    function validatePassword(password) {
        // Пароль должен быть не менее 8 символов и содержать как минимум одну цифру и одну букву
        const hasMinLength = password.length >= 8;
        const hasNumber = /\d/.test(password);
        const hasLetter = /[a-zA-Z]/.test(password);
        
        if (!hasMinLength) {
            return { valid: false, message: 'Пароль должен содержать не менее 8 символов' };
        }
        
        if (!hasNumber) {
            return { valid: false, message: 'Пароль должен содержать хотя бы одну цифру' };
        }
        
        if (!hasLetter) {
            return { valid: false, message: 'Пароль должен содержать хотя бы одну букву' };
        }
        
        return { valid: true };
    }
    
    // Обработка формы входа
    if (loginFormElement) {
        loginFormElement.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Сброс предыдущих сообщений об ошибках
            loginEmailError.style.display = 'none';
            loginPasswordError.style.display = 'none';
            loginGeneralError.style.display = 'none';
            loginSuccessMessage.style.display = 'none';
            
            // Получение данных формы
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;
            const rememberMe = document.getElementById('remember-me').checked;
            
            // Валидация email
            if (!validateEmail(email)) {
                loginEmailError.textContent = 'Пожалуйста, введите корректный email';
                loginEmailError.style.display = 'block';
                return;
            }
            
            // Проверка есть ли пользователь в localStorage
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.email === email);
            
            if (!user) {
                loginGeneralError.textContent = 'Пользователь с таким email не найден';
                loginGeneralError.style.display = 'block';
                return;
            }
            
            // Проверка пароля
            if (user.password !== password) {
                loginPasswordError.textContent = 'Неверный пароль';
                loginPasswordError.style.display = 'block';
                return;
            }
            
            // Успешный вход
            const userData = {
                username: user.username,
                email: user.email,
                isAuthenticated: true
            };
            
            // Сохранение в localStorage
            if (rememberMe) {
                localStorage.setItem('currentUser', JSON.stringify(userData));
            } else {
                sessionStorage.setItem('currentUser', JSON.stringify(userData));
            }
            
            // Показ сообщения об успехе
            loginSuccessMessage.textContent = 'Вход выполнен успешно! Перенаправление...';
            loginSuccessMessage.style.display = 'block';
            
            // Перенаправление на главную страницу
            setTimeout(function() {
                window.location.href = '/';
            }, 1500);
        });
    }
    
    // Обработка формы регистрации
    if (registerFormElement) {
        registerFormElement.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Сброс предыдущих сообщений об ошибках
            registerUsernameError.style.display = 'none';
            registerEmailError.style.display = 'none';
            registerPasswordError.style.display = 'none';
            registerConfirmPasswordError.style.display = 'none';
            registerGeneralError.style.display = 'none';
            registerSuccessMessage.style.display = 'none';
            
            // Получение данных формы
            const username = document.getElementById('register-username').value.trim();
            const email = document.getElementById('register-email').value.trim();
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            
            // Валидация имени пользователя
            if (username.length < 3) {
                registerUsernameError.textContent = 'Имя пользователя должно содержать не менее 3 символов';
                registerUsernameError.style.display = 'block';
                return;
            }
            
            // Валидация email
            if (!validateEmail(email)) {
                registerEmailError.textContent = 'Пожалуйста, введите корректный email';
                registerEmailError.style.display = 'block';
                return;
            }
            
            // Валидация пароля
            const passwordValidation = validatePassword(password);
            if (!passwordValidation.valid) {
                registerPasswordError.textContent = passwordValidation.message;
                registerPasswordError.style.display = 'block';
                return;
            }
            
            // Проверка совпадения паролей
            if (password !== confirmPassword) {
                registerConfirmPasswordError.textContent = 'Пароли не совпадают';
                registerConfirmPasswordError.style.display = 'block';
                return;
            }
            
            // Проверка существования пользователя
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const userExists = users.some(u => u.email === email);
            
            if (userExists) {
                registerEmailError.textContent = 'Пользователь с таким email уже существует';
                registerEmailError.style.display = 'block';
                return;
            }
            
            // Создание нового пользователя
            const newUser = {
                username,
                email,
                password,
                createdAt: new Date().toISOString()
            };
            
            // Сохранение пользователя
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            // Автоматический вход
            const userData = {
                username: newUser.username,
                email: newUser.email,
                isAuthenticated: true
            };
            
            localStorage.setItem('currentUser', JSON.stringify(userData));
            
            // Показ сообщения об успехе
            registerSuccessMessage.textContent = 'Регистрация прошла успешно! Перенаправление...';
            registerSuccessMessage.style.display = 'block';
            
            // Перенаправление на главную страницу
            setTimeout(function() {
                window.location.href = '/';
            }, 1500);
        });
    }
    
    // Проверка авторизации при загрузке страницы
    function checkAuth() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser')) || JSON.parse(sessionStorage.getItem('currentUser'));
        
        if (currentUser && currentUser.isAuthenticated) {
            // Для страницы входа/регистрации - перенаправление на главную
            if (window.location.pathname === '/login.html') {
                window.location.href = '/';
            }
            
            // Обновление UI для авторизованного пользователя
            updateAuthUI(true, currentUser);
        } else {
            // Обновление UI для неавторизованного пользователя
            updateAuthUI(false);
        }
    }
    
    // Обновление UI в зависимости от статуса авторизации
    function updateAuthUI(isAuthenticated, user) {
        // Находим кнопки авторизации
        const loginBtn = document.querySelector('.login-btn');
        const registerBtn = document.querySelector('.register-btn');
        const logoutBtn = document.getElementById('logoutBtn');
        const profileBtn = document.getElementById('profileBtn');
        
        if (!loginBtn || !registerBtn) return;
        
        if (isAuthenticated && user) {
            // Скрываем кнопки входа и регистрации
            loginBtn.style.display = 'none';
            registerBtn.style.display = 'none';
            
            // Показываем кнопки выхода и профиля
            if (logoutBtn) {
                logoutBtn.style.display = 'inline-block';
                logoutBtn.addEventListener('click', logout);
            }
            
            if (profileBtn) {
                profileBtn.style.display = 'inline-block';
                // Добавляем имя пользователя к тексту кнопки
                const originalText = profileBtn.getAttribute('data-original-text') || profileBtn.textContent;
                if (!profileBtn.getAttribute('data-original-text')) {
                    profileBtn.setAttribute('data-original-text', originalText);
                }
                profileBtn.textContent = originalText;
            }
            
        } else {
            // Показываем кнопки входа и регистрации
            loginBtn.style.display = 'inline-block';
            registerBtn.style.display = 'inline-block';
            
            // Скрываем кнопки выхода и профиля
            if (logoutBtn) {
                logoutBtn.style.display = 'none';
            }
            
            if (profileBtn) {
                profileBtn.style.display = 'none';
                // Восстанавливаем оригинальный текст
                const originalText = profileBtn.getAttribute('data-original-text');
                if (originalText) {
                    profileBtn.textContent = originalText;
                }
            }
        }
    }
    
    // Функция выхода из аккаунта
    function logout(event) {
        if (event) {
            event.preventDefault();
        }
        
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');
        
        // Обновление UI
        updateAuthUI(false);
        
        // Показ уведомления
        showNotification('Вы успешно вышли из аккаунта', 'success');
        
        // Перенаправление на главную
        if (window.location.pathname !== '/') {
            window.location.href = '/';
        }
    }
    
    // Функция для показа уведомлений
    function showNotification(message, type) {
        // Создаем элемент уведомления, если его нет
        let notification = document.getElementById('auth-notification');
        
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'auth-notification';
            notification.style.position = 'fixed';
            notification.style.top = '20px';
            notification.style.right = '20px';
            notification.style.padding = '12px 20px';
            notification.style.borderRadius = '4px';
            notification.style.zIndex = '1000';
            notification.style.maxWidth = '300px';
            notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            document.body.appendChild(notification);
        }
        
        // Устанавливаем стиль в зависимости от типа
        if (type === 'success') {
            notification.style.backgroundColor = '#10B981';
            notification.style.color = 'white';
        } else {
            notification.style.backgroundColor = '#EF4444';
            notification.style.color = 'white';
        }
        
        // Устанавливаем текст уведомления
        notification.textContent = message;
        
        // Показываем уведомление
        notification.style.display = 'block';
        
        // Скрываем через 3 секунды
        setTimeout(function() {
            notification.style.display = 'none';
        }, 3000);
    }
    
    // Экспортируем функции для глобального использования
    window.authSystem = {
        logout: logout,
        checkAuth: checkAuth,
        updateAuthUI: updateAuthUI
    };
    
    // Проверяем авторизацию при загрузке страницы
    checkAuth();
});
