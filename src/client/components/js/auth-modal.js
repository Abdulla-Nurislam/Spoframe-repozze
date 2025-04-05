document.addEventListener('DOMContentLoaded', () => {
    const authModal = document.getElementById('authModal');
    const closeBtn = authModal.querySelector('.close');
    const loginForm = document.getElementById('loginForm');
    const signupBtn = document.querySelector('.switch-to-signup');
    const loginContainer = document.querySelector('.login-form');
    const signupContainer = document.querySelector('.signup-form');
    const openAuthBtn = document.querySelector('[data-auth="open"]');

    // Открытие модального окна
    openAuthBtn.addEventListener('click', () => {
        authModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    // Закрытие модального окна
    closeBtn.addEventListener('click', () => {
        authModal.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Закрытие по клику вне модального окна
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) {
            authModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Переключение между формами входа и регистрации
    signupBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginContainer.style.display = 'none';
        signupContainer.style.display = 'block';
    });

    // Обработка отправки формы входа
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(loginForm);
        const data = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                // Успешный вход
                window.location.reload();
            } else {
                // Показать ошибку
                alert(result.error || 'Ошибка при входе');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при попытке входа');
        }
    });
}); 