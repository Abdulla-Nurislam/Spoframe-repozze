document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('authModal');
    const openButtons = document.querySelectorAll('[data-auth="open"]');
    const closeBtn = document.querySelector('.close');
    const scrollButtons = document.querySelector('.scroll-buttons');
    const loginFormContainer = document.querySelector('.login-form');
    const signupFormContainer = document.querySelector('.signup-form');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const switchToLogin = document.querySelector('.switch-to-login');
    const switchToSignup = document.querySelector('.switch-to-signup');

    // Функция для показа кастомного модального окна
    function showCustomAlert(message, buttonText = 'Закрыть', callback) {
        // Создаем затемненный фон
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.zIndex = '999';

        const alertDiv = document.createElement('div');
        alertDiv.style.position = 'fixed';
        alertDiv.style.top = '50%';
        alertDiv.style.left = '50%';
        alertDiv.style.transform = 'translate(-50%, -50%) scale(0.9)';
        alertDiv.style.backgroundColor = '#2B2D31';
        alertDiv.style.padding = '30px';
        alertDiv.style.borderRadius = '12px';
        alertDiv.style.zIndex = '1000';
        alertDiv.style.textAlign = 'center';
        alertDiv.style.color = '#FFFFFF';
        alertDiv.style.minWidth = '320px';
        alertDiv.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
        alertDiv.style.opacity = '0';
        alertDiv.style.transition = 'all 0.3s ease';

        // Иконка успеха
        const iconDiv = document.createElement('div');
        iconDiv.innerHTML = `
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="24" r="24" fill="#5865F2"/>
                <path d="M34.6 16.2L21.3 29.5L13.4 21.6L11 24L21.3 34.3L37 18.6L34.6 16.2Z" fill="white"/>
            </svg>
        `;
        iconDiv.style.marginBottom = '20px';

        const messageP = document.createElement('p');
        messageP.textContent = message;
        messageP.style.marginBottom = '25px';
        messageP.style.fontSize = '18px';
        messageP.style.lineHeight = '1.4';
        messageP.style.color = '#FFFFFF';

        const confirmButton = document.createElement('button');
        confirmButton.textContent = buttonText;
        confirmButton.style.backgroundColor = '#5865F2';
        confirmButton.style.color = 'white';
        confirmButton.style.border = 'none';
        confirmButton.style.padding = '12px 24px';
        confirmButton.style.borderRadius = '6px';
        confirmButton.style.cursor = 'pointer';
        confirmButton.style.fontSize = '16px';
        confirmButton.style.fontWeight = '500';
        confirmButton.style.transition = 'background-color 0.2s ease';

        confirmButton.onmouseover = () => {
            confirmButton.style.backgroundColor = '#4752C4';
        };
        
        confirmButton.onmouseout = () => {
            confirmButton.style.backgroundColor = '#5865F2';
        };

        confirmButton.onclick = () => {
            alertDiv.style.transform = 'translate(-50%, -50%) scale(0.9)';
            alertDiv.style.opacity = '0';
            overlay.style.opacity = '0';
            
            setTimeout(() => {
                document.body.removeChild(overlay);
                if (callback) callback();
            }, 300);
        };

        alertDiv.appendChild(iconDiv);
        alertDiv.appendChild(messageP);
        alertDiv.appendChild(confirmButton);
        overlay.appendChild(alertDiv);
        document.body.appendChild(overlay);

        // Анимация появления
        setTimeout(() => {
            alertDiv.style.transform = 'translate(-50%, -50%) scale(1)';
            alertDiv.style.opacity = '1';
        }, 10);
    }

    // Открытие модального окна
    openButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            modal.style.display = 'flex';
            loginFormContainer.style.display = 'block';
            signupFormContainer.style.display = 'none';
            document.body.style.overflow = 'hidden';
            if (scrollButtons) {
                scrollButtons.style.display = 'none';
            }
        });
    });

    // Закрытие модального окна
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        if (scrollButtons) {
            scrollButtons.style.display = 'flex';
        }
        // Очищаем формы при закрытии
        loginForm.reset();
        signupForm.reset();
    });

    // Закрытие при клике вне модального окна
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            if (scrollButtons) {
                scrollButtons.style.display = 'flex';
            }
            // Очищаем формы при закрытии
            loginForm.reset();
            signupForm.reset();
        }
    });

    // Переключение между формами
    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            signupFormContainer.style.display = 'none';
            loginFormContainer.style.display = 'block';
        });
    }

    if (switchToSignup) {
        switchToSignup.addEventListener('click', (e) => {
            e.preventDefault();
            loginFormContainer.style.display = 'none';
            signupFormContainer.style.display = 'block';
        });
    }

    // Обработка формы регистрации
    let isSubmitting = false; // Флаг для отслеживания отправки формы

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (isSubmitting) return;
        
        isSubmitting = true;
        
        const formData = {
            name: signupForm.querySelector('input[name="name"]').value,
            email: signupForm.querySelector('input[name="email"]').value,
            password: signupForm.querySelector('input[name="password"]').value
        };

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
                signupForm.reset();
                showCustomAlert('Регистрация успешна!', 'Подтвердить', () => {
                    // Здесь можно добавить дополнительные действия после закрытия
                });
            } else {
                showCustomAlert('Идёт проверка данных...', 'Продолжить');
            }
        } catch (error) {
            console.error('Error:', error);
            showCustomAlert('Идёт проверка данных...', 'Продолжить');
        } finally {
            isSubmitting = false;
        }
    });

    // Обработка формы входа
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            email: loginForm.querySelector('input[name="email"]').value,
            password: loginForm.querySelector('input[name="password"]').value
        };

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
                loginForm.reset();
                window.location.href = '/admin';
            } else {
                showCustomAlert(data.error || 'Ошибка при входе');
            }
        } catch (error) {
            console.error('Error:', error);
            showCustomAlert('Ошибка при подключении к серверу');
        }
    });
});

document.querySelector('.open-auth-modal').addEventListener('click', () => {
    document.getElementById('authModal').classList.add('active');
}); 