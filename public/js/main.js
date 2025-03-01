document.addEventListener('DOMContentLoaded', function() {
    // Модальное окно регистрации
    const modal = document.getElementById('signupModal');
    const signupBtn = document.querySelector('.btn-signup');
    const closeBtn = document.querySelector('.close');
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    const signupContainer = document.querySelector('.signup-form');
    const loginContainer = document.querySelector('.login-form');

    if (!modal || !signupBtn || !closeBtn) {
        console.error('Не найдены необходимые элементы');
        return;
    }

    function resetForms() {
        signupForm.reset();
        loginForm.reset();
        document.querySelectorAll('.form-message').forEach(msg => {
            msg.style.display = 'none';
            msg.textContent = '';
        });
    }

    // Функция открытия модального окна
    function openModal() {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(() => {
            modal.classList.add('active');
            document.body.classList.add('modal-open');
            // По умолчанию показываем форму регистрации
            signupContainer.style.display = 'block';
            loginContainer.style.display = 'none';
        });
    }

    // Функция закрытия модального окна
    function closeModal() {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
        // Сброс форм при закрытии
        signupForm.reset();
        loginForm.reset();
    }

    // Открыть модальное окно только при клике на кнопку регистрации
    signupBtn.addEventListener('click', openModal);

    // Закрыть модальное окно при клике на крестик
    closeBtn.addEventListener('click', closeModal);

    // Закрыть при клике вне окна
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Предотвращаем закрытие при клике на контент
    modal.querySelector('.modal-content').addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Переключение между формами
    document.querySelector('.switch-to-login').addEventListener('click', (e) => {
            e.preventDefault();
        signupContainer.style.display = 'none';
        loginContainer.style.display = 'block';
        });

    document.querySelector('.switch-to-signup').addEventListener('click', (e) => {
        e.preventDefault();
        loginContainer.style.display = 'none';
        signupContainer.style.display = 'block';
    });

    // Обработка формы регистрации
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formMessage = signupForm.querySelector('.form-message');
        
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: document.getElementById('name').value,
                    email: document.getElementById('email').value,
                    password: document.getElementById('password').value
                })
            });

            const data = await response.json();

            if (response.ok) {
                formMessage.style.display = 'block';
                formMessage.style.color = 'green';
                formMessage.textContent = 'Регистрация успешна! Проверьте вашу почту.';
                setTimeout(() => {
                    closeModal();
                    window.location.href = '/profile'; // Перенаправление на профиль
                }, 2000);
            } else {
                formMessage.style.display = 'block';
                formMessage.style.color = 'red';
                formMessage.textContent = data.message || 'Ошибка при регистрации';
            }
        } catch (error) {
            formMessage.style.display = 'block';
            formMessage.style.color = 'red';
            formMessage.textContent = 'Произошла ошибка при подключении к серверу';
        }
    });

    // Обработка формы входа
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formMessage = loginForm.querySelector('.form-message');
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: document.getElementById('login-email').value,
                    password: document.getElementById('login-password').value
                })
            });

            const data = await response.json();

            if (response.ok) {
                formMessage.style.display = 'block';
                formMessage.style.color = 'green';
                formMessage.textContent = 'Вход выполнен успешно!';
                setTimeout(() => {
                    closeModal();
                    window.location.href = '/profile'; // Перенаправление на профиль
                }, 1000);
            } else {
                formMessage.style.display = 'block';
                formMessage.style.color = 'red';
                formMessage.textContent = data.message || 'Неверный email или пароль';
            }
        } catch (error) {
            formMessage.style.display = 'block';
            formMessage.style.color = 'red';
            formMessage.textContent = 'Произошла ошибка при подключении к серверу';
        }
    });

    // Обработка формы подписки на рассылку
    const subscribeForm = document.getElementById('subscribeForm');
    
    subscribeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailInput = subscribeForm.querySelector('input[type="email"]');
        const email = emailInput.value;

        if (!email) {
            alert('Пожалуйста, введите email');
            return;
        }

        // Проверка формата email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Пожалуйста, введите корректный email');
            return;
        }

        // Показываем сообщение об успешной подписке
        alert(`Спасибо за подписку! Мы отправили письмо на ${email}`);
        
        // Очищаем поле ввода
        emailInput.value = '';
    });

    const banner = document.querySelector('.grok-banner');
    const follower = document.querySelector('.cursor-follower');
    const heroText = document.querySelector('.grok-text');
    
    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;

    banner.addEventListener('mousemove', (e) => {
        const rect = banner.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });

    function animate() {
        // Плавное движение светового эффекта
        const dx = mouseX - currentX;
        const dy = mouseY - currentY;
        
        currentX += dx * 0.1;
        currentY += dy * 0.1;
        
        follower.style.left = `${currentX}px`;
        follower.style.top = `${currentY}px`;
        
        // Эффект параллакса для текста
        const moveX = (currentX - banner.offsetWidth/2) * 0.02;
        const moveY = (currentY - banner.offsetHeight/2) * 0.02;
        heroText.style.transform = `translate(${moveX}px, ${moveY}px)`;
        
        requestAnimationFrame(animate);
    }

    animate();

    banner.addEventListener('mouseleave', () => {
        follower.style.opacity = '0';
    });

    banner.addEventListener('mouseenter', () => {
        follower.style.opacity = '1';
    });

    // Предотвращаем скролл при открытом модальном окне
    modal.addEventListener('wheel', (e) => {
        e.preventDefault();
    });
}); 