document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('authModal');
    const openButtons = document.querySelectorAll('[data-auth="open"]');
    const closeBtn = document.querySelector('.close');
    const scrollButtons = document.querySelector('.scroll-buttons');
    
    // Переключение между формами
    const switchToLogin = document.querySelector('.switch-to-login');
    const switchToSignup = document.querySelector('.switch-to-signup');
    const signupForm = document.querySelector('.signup-form');
    const loginForm = document.querySelector('.login-form');

    // Открытие модального окна
    openButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            modal.style.display = 'flex';
            // Показываем форму регистрации по умолчанию
            loginForm.style.display = 'none';
            signupForm.style.display = 'block';
            document.body.style.overflow = 'hidden';
            if (scrollButtons) {
                scrollButtons.style.display = 'none';
            }
        });
    });

    // Закрытие модального окна
    closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        modal.style.display = 'none';
        document.body.style.overflow = '';
        if (scrollButtons) {
            scrollButtons.style.display = 'flex';
        }
    });

    // Предотвращаем закрытие по клику на контент
    const modalContent = modal.querySelector('.auth-modal__content');
    if (modalContent) {
        modalContent.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // Переключатель видимости пароля
    const passwordToggle = document.querySelector('.password-toggle');
    const passwordInput = document.querySelector('.password-input input');

    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
        });
    }

    // Переключение на форму входа
    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            signupForm.style.display = 'none';
            loginForm.style.display = 'block';
        });
    }

    // Переключение на форму регистрации
    if (switchToSignup) {
        switchToSignup.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.style.display = 'none';
            signupForm.style.display = 'block';
        });
    }

    // Обработка формы регистрации
    const signupFormContainer = document.getElementById('signupForm');
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.style.color = '#ff4444';
    errorMessage.style.marginTop = '10px';
    errorMessage.style.textAlign = 'center';
    
    if (signupFormContainer) {
        signupFormContainer.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Очищаем предыдущие сообщения об ошибках
            errorMessage.textContent = '';
            const closeButton = document.querySelector('.close');
            
            const formData = {
                name: signupFormContainer.querySelector('input[type="text"]').value,
                email: signupFormContainer.querySelector('input[type="email"]').value,
                password: signupFormContainer.querySelector('input[type="password"]').value
            };

            try {
                const response = await fetch('http://localhost:3001/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (response.ok) {
                    // Успешная регистрация
                    alert('Регистрация успешна!');
                    modal.style.display = 'none';
                    document.body.style.overflow = '';
                    signupFormContainer.reset();
                } else {
                    // Показываем ошибку
                    errorMessage.textContent = data.error || 'Ошибка при регистрации';
                    if (!signupFormContainer.contains(errorMessage)) {
                        signupFormContainer.appendChild(errorMessage);
                    }
                }
            } catch (error) {
                console.error('Error:', error);
                errorMessage.textContent = 'Ошибка подключения к серверу';
                if (!signupFormContainer.contains(errorMessage)) {
                    signupFormContainer.appendChild(errorMessage);
                }
            }
        });
    }

    // Очищаем сообщение об ошибке при закрытии модального окна
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            errorMessage.textContent = '';
            if (signupFormContainer) {
                signupFormContainer.reset();
            }
        });
    }
});

document.querySelector('.open-auth-modal').addEventListener('click', () => {
    document.getElementById('authModal').classList.add('active');
}); 