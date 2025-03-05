document.addEventListener('DOMContentLoaded', function() {
    const dots = document.querySelectorAll('.dot');
    const slides = document.querySelectorAll('.hero-slide');

        console.log('DOM загружен');
        
        const authButtons = document.querySelectorAll('[data-auth="open"]');
        console.log('Найдено кнопок:', authButtons.length);
        
        authButtons.forEach(button => {
            console.log('Добавляем обработчик для кнопки:', button);
            button.addEventListener('click', () => {
                console.log('Клик по кнопке');
                const modal = document.getElementById('authModal');
                console.log('Модальное окно:', modal);
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });

    // Функция для переключения слайдов
    function switchSlide(slideIndex) {
        // Убираем активный класс со всех слайдов и точек
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        // Добавляем активный класс нужному слайду и точке
        slides[slideIndex].classList.add('active');
        dots[slideIndex].classList.add('active');
    }
    
    // Обработчик клика по точкам
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            switchSlide(index);
        });
    });
    
    // Автоматическое переключение слайдов
    let currentSlide = 0;
    setInterval(() => {
        currentSlide = (currentSlide + 1) % slides.length;
        switchSlide(currentSlide);
    }, 5000); // Переключение каждые 5 секунд

    // Открытие модального окна при клике на кнопку регистрации
    const signupButton = document.querySelector('.btn-signup');
    const modal = document.getElementById('signupModal');
    const closeButton = document.querySelector('.close');

    if (signupButton) {
        signupButton.addEventListener('click', () => {
            modal.classList.add('active');
        });
    }

    if (closeButton) {
        closeButton.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    // Закрытие модального окна при клике вне его
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.remove('active');
        }
    });

    // Функция для проверки силы пароля
    function checkPasswordStrength(password) {
        let strength = 0;
        const feedback = [];

        if (password.length >= 8) {
            strength += 1;
        } else {
            feedback.push('Минимум 8 символов');
        }

        if (password.match(/[a-z]/)) {
            strength += 1;
        } else {
            feedback.push('Добавьте строчные буквы');
        }

        if (password.match(/[A-Z]/)) {
            strength += 1;
        } else {
            feedback.push('Добавьте заглавные буквы');
        }

        if (password.match(/[0-9]/)) {
            strength += 1;
        } else {
            feedback.push('Добавьте цифры');
        }

        return { strength, feedback };
    }

    // Функция для отображения силы пароля
    function updatePasswordStrength(password, strengthElement, feedbackElement) {
        const { strength, feedback } = checkPasswordStrength(password);
        
        // Очищаем предыдущие классы
        strengthElement.className = 'password-strength';
        
        // Добавляем соответствующий класс
        if (strength === 0) strengthElement.classList.add('very-weak');
        else if (strength === 1) strengthElement.classList.add('weak');
        else if (strength === 2) strengthElement.classList.add('medium');
        else if (strength === 3) strengthElement.classList.add('strong');
        else strengthElement.classList.add('very-strong');

        // Обновляем текст
        const strengthTexts = ['Очень слабый', 'Слабый', 'Средний', 'Сильный', 'Очень сильный'];
        strengthElement.textContent = strengthTexts[strength];

        // Обновляем подсказки
        feedbackElement.innerHTML = feedback.length > 0 ? 
            feedback.map(f => `<div class="feedback-item">• ${f}</div>`).join('') : 
            '<div class="feedback-item success">Отличный пароль!</div>';
    }

    // Обработка формы регистрации
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        const passwordInput = document.getElementById('password');
        const emailInput = document.getElementById('email');
        const nameInput = document.getElementById('name');
        const strengthElement = document.createElement('div');
        const feedbackElement = document.createElement('div');
        
        strengthElement.className = 'password-strength';
        feedbackElement.className = 'password-feedback';
        
        // Вставляем элементы после поля пароля
        passwordInput.parentNode.insertBefore(strengthElement, passwordInput.nextSibling);
        passwordInput.parentNode.insertBefore(feedbackElement, strengthElement.nextSibling);

        // Валидация email в реальном времени
        emailInput.addEventListener('input', function() {
            const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value);
            this.classList.toggle('valid', isValid);
            this.classList.toggle('invalid', !isValid && this.value.length > 0);
        });

        // Валидация имени в реальном времени
        nameInput.addEventListener('input', function() {
            const isValid = this.value.length >= 2;
            this.classList.toggle('valid', isValid);
            this.classList.toggle('invalid', !isValid && this.value.length > 0);
        });

        // Валидация пароля в реальном времени
        passwordInput.addEventListener('input', function() {
            updatePasswordStrength(this.value, strengthElement, feedbackElement);
        });

        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const messageDiv = signupForm.querySelector('.form-message');
            messageDiv.style.display = 'block';

            // Получаем значения полей
            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value;

            // Проверяем заполнение полей
            if (!name || !email || !password) {
                messageDiv.className = 'form-message error';
                messageDiv.textContent = 'Пожалуйста, заполните все поля';
                return;
            }

            // Проверяем валидность email
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                messageDiv.className = 'form-message error';
                messageDiv.textContent = 'Пожалуйста, введите корректный email';
                return;
            }

            // Проверяем длину имени
            if (name.length < 2) {
                messageDiv.className = 'form-message error';
                messageDiv.textContent = 'Имя должно содержать минимум 2 символа';
                return;
            }

            // Проверяем силу пароля
            const { strength } = checkPasswordStrength(password);
            if (strength < 3) {
                messageDiv.className = 'form-message error';
                messageDiv.textContent = 'Пароль недостаточно надежный';
                return;
            }

            try {
                messageDiv.className = 'form-message info';
                messageDiv.textContent = 'Отправка данных...';
                
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    messageDiv.className = 'form-message success';
                    messageDiv.textContent = 'Регистрация успешна! Выполняется вход...';
                    signupForm.reset();
                    
                    setTimeout(() => {
                        modal.classList.remove('active');
                        messageDiv.style.display = 'none';
                    }, 3000);
                } else {
                    messageDiv.className = 'form-message error';
                    messageDiv.textContent = data.error || 'Ошибка при регистрации';
                }
            } catch (error) {
                console.error('Ошибка при отправке данных:', error);
                messageDiv.className = 'form-message error';
                messageDiv.textContent = 'Ошибка подключения к серверу';
            }
        });
    }

    // Переключение между формами
    const switchToLogin = document.querySelector('.switch-to-login');
    const switchToSignup = document.querySelector('.switch-to-signup');
    const signupFormContainer = document.querySelector('.signup-form');
    const loginFormContainer = document.querySelector('.login-form');

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

    const orderNowBtn = document.getElementById('orderNowBtn');
    if (orderNowBtn) {
        orderNowBtn.addEventListener('click', function() {
            window.location.href = 'Product Catalog.html';
        });
    }

    const subscribeForm = document.getElementById('subscribeForm');
    
    if (subscribeForm) {
        subscribeForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = this.email.value;
            const messageDiv = this.querySelector('.form-message');
            
            try {
                const response = await fetch('/api/subscription/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email })
                });
                
                const data = await response.json();
                
                messageDiv.style.display = 'block';
                messageDiv.style.color = response.ok ? 'green' : 'red';
                messageDiv.textContent = data.message;
                
                if (response.ok) {
                    this.reset();
                }
            } catch (error) {
                messageDiv.style.display = 'block';
                messageDiv.style.color = 'red';
                messageDiv.textContent = 'Произошла ошибка при подписке';
            }
        });
    }

    // Единое объявление для кнопок прокрутки
    const scrollToTopBtn = document.getElementById('scrollToTop');
    const scrollToBottomBtn = document.getElementById('scrollToBottom');
    
    // Добавляем плавную прокрутку для всей страницы
    document.documentElement.style.scrollBehavior = 'smooth';

    function checkScroll() {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.classList.add('visible');
            scrollToBottomBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
            scrollToBottomBtn.classList.remove('visible');
        }
    }

    // Обработчики событий прокрутки
    window.addEventListener('scroll', checkScroll);
    window.addEventListener('load', checkScroll);

    // Обработчики клика
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    scrollToBottomBtn.addEventListener('click', () => {
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth'
        });
    });

    // Находим все кнопки фильтров
    const filterBtns = document.querySelectorAll('.filter-btn');
    // Находим все карточки продуктов
    const products = document.querySelectorAll('.product-card');

    // Добавляем обработчик для каждой кнопки
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Убираем активный класс со всех кнопок
            filterBtns.forEach(b => b.classList.remove('active'));
            // Добавляем активный класс нажатой кнопке
            btn.classList.add('active');

            // Получаем значение фильтра
            const filterValue = btn.getAttribute('data-filter');

            // Фильтруем продукты
            products.forEach(product => {
                if (filterValue === 'all') {
                    product.style.display = 'block';
                } else {
                    if (product.getAttribute('data-style') === filterValue) {
                        product.style.display = 'block';
                    } else {
                        product.style.display = 'none';
                    }
                }
            });
        });
    });

    // Обработка формы входа
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        const loginEmailInput = document.getElementById('loginEmail');
        const loginPasswordInput = document.getElementById('loginPassword');

        // Валидация email в реальном времени
        loginEmailInput.addEventListener('input', function() {
            const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value);
            this.classList.toggle('valid', isValid);
            this.classList.toggle('invalid', !isValid && this.value.length > 0);
        });

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const messageDiv = loginForm.querySelector('.form-message');
            messageDiv.style.display = 'block';

            const email = loginEmailInput.value.trim();
            const password = loginPasswordInput.value;

            if (!email || !password) {
                messageDiv.className = 'form-message error';
                messageDiv.textContent = 'Пожалуйста, заполните все поля';
                return;
            }

            try {
                messageDiv.className = 'form-message info';
                messageDiv.textContent = 'Выполняется вход...';
                
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    messageDiv.className = 'form-message success';
                    messageDiv.textContent = 'Вход выполнен успешно!';
                    loginForm.reset();
                    setTimeout(() => {
                        modal.classList.remove('active');
                        messageDiv.style.display = 'none';
                        // Здесь можно добавить редирект или другие действия после успешного входа
                    }, 2000);
                } else {
                    messageDiv.className = 'form-message error';
                    messageDiv.textContent = data.error || 'Неверный email или пароль';
                }
            } catch (error) {
                console.error('Ошибка при отправке данных:', error);
                messageDiv.className = 'form-message error';
                messageDiv.textContent = 'Ошибка подключения к серверу';
            }
        });
    }

    // Система достижений для регистрации
    const achievements = {
        emailVerified: {
            id: 'email-verified',
            title: 'Почтовый мастер',
            description: 'Введен корректный email адрес',
            points: 10
        },
        strongPassword: {
            id: 'strong-password',
            title: 'Хранитель безопасности',
            description: 'Создан надежный пароль',
            points: 20
        },
        nameEntered: {
            id: 'name-entered',
            title: 'Личность установлена',
            description: 'Указано имя пользователя',
            points: 5
        }
    };

    let userScore = 0;
    let unlockedAchievements = new Set();

    function updateProgress() {
        const progressBar = document.querySelector('.signup-progress-bar');
        const totalPoints = Object.values(achievements).reduce((sum, a) => sum + a.points, 0);
        const progress = (userScore / totalPoints) * 100;
        progressBar.style.width = `${progress}%`;
    }

    function unlockAchievement(achievementId) {
        if (unlockedAchievements.has(achievementId)) return;

        const achievement = achievements[achievementId];
        userScore += achievement.points;
        unlockedAchievements.add(achievementId);

        // Создаем и показываем уведомление о достижении
        const notification = document.createElement('div');
        notification.className = 'achievement';
        notification.innerHTML = `
            <div class="achievement-icon">🏆</div>
            <div class="achievement-text">
                <strong>${achievement.title}</strong><br>
                ${achievement.description}
                <span class="points">+${achievement.points} очков</span>
            </div>
        `;

        document.querySelector('.modal-content').appendChild(notification);
        setTimeout(() => notification.classList.add('unlocked'), 100);
        setTimeout(() => notification.remove(), 3000);

        updateProgress();
    }

    // Обновляем обработчики событий для формы регистрации
    if (signupForm) {
        // Добавляем прогресс-бар
        const progressBar = document.createElement('div');
        progressBar.className = 'signup-progress';
        progressBar.innerHTML = '<div class="signup-progress-bar"></div>';
        signupForm.insertBefore(progressBar, signupForm.firstChild);

        // Проверка email
        emailInput.addEventListener('input', function() {
            const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value);
            this.classList.toggle('valid', isValid);
            this.classList.toggle('invalid', !isValid && this.value.length > 0);
            
            if (isValid) {
                unlockAchievement('emailVerified');
            }
        });

        // Проверка имени
        nameInput.addEventListener('input', function() {
            const isValid = this.value.length >= 2;
            this.classList.toggle('valid', isValid);
            this.classList.toggle('invalid', !isValid && this.value.length > 0);
            
            if (isValid) {
                unlockAchievement('nameEntered');
            }
        });

        // Улучшенная проверка пароля
        passwordInput.addEventListener('input', function() {
            const { strength } = checkPasswordStrength(this.value);
            const meter = document.querySelector('.password-meter-bar');
            meter.style.width = `${(strength / 4) * 100}%`;
            
            if (strength >= 3) {
                unlockAchievement('strongPassword');
            }
        });

        // Добавляем индикатор силы пароля
        const passwordMeter = document.createElement('div');
        passwordMeter.className = 'password-meter';
        passwordMeter.innerHTML = '<div class="password-meter-bar"></div>';
        passwordInput.parentNode.insertBefore(passwordMeter, passwordInput.nextSibling);

        // Анимация появления полей
        const formGroups = signupForm.querySelectorAll('.form-group');
        formGroups.forEach((group, index) => {
            setTimeout(() => group.classList.add('active'), index * 200);
        });
    }

    // Добавляем обработчик для кнопки покупки
    const buyButton = document.querySelector('.btn-buy-now');
    
    if (buyButton && !buyButton.hasAttribute('onclick')) {
        buyButton.addEventListener('click', () => {
            window.location.href = 'development-page.html';
        });
    }

    // Функция показа уведомления
    function showDevelopmentNotification() {
        const notification = document.createElement('div');
        notification.className = 'development-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    <i class="fas fa-tools" style="color: #5865F2"></i>
                </div>
                <div class="notification-text">
                    <h3>В разработке</h3>
                    <p>Страница оформления заказа находится в разработке. Попробуйте позже!</p>
                </div>
                <button class="notification-close">&times;</button>
            </div>
        `;
        document.body.appendChild(notification);

        // Добавляем анимацию появления
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Закрытие по кнопке
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });

        // Автоматическое закрытие через 5 секунд
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, 5000);
    }

    function handleBuyClick() {
        const devPage = document.getElementById('developmentPage');
        if (devPage) {
            devPage.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            alert('Страница оформления заказа находится в разработке');
        }
    }

    document.addEventListener('click', (event) => {
        if (event.target.matches('.btn-buy-now')) {
            const devPage = document.getElementById('developmentPage');
            if (devPage) {
                devPage.classList.add('active');
                document.body.style.overflow = 'hidden';
            } else {
                alert('Страница оформления заказа находится в разработке');
            }
        }
    });

    const observer = new MutationObserver((mutations) => {
        const buyButton = document.querySelector('.btn-buy-now');
        if (buyButton && !buyButton.hasListener) {
            buyButton.hasListener = true;
            buyButton.addEventListener('click', () => {
                const devPage = document.getElementById('developmentPage');
                if (devPage) {
                    devPage.classList.add('active');
                    document.body.style.overflow = 'hidden';
                } else {
                    alert('Страница оформления заказа находится в разработке');
                }
            });
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    class BuyButton extends HTMLButtonElement {
        connectedCallback() {
            this.addEventListener('click', () => {
                const devPage = document.getElementById('developmentPage');
                if (devPage) {
                    devPage.classList.add('active');
                    document.body.style.overflow = 'hidden';
                } else {
                    alert('Страница оформления заказа находится в разработке');
                }
            });
        }
    }

    customElements.define('buy-button', BuyButton, { extends: 'button' });

    // Фильтрация товаров
    console.log('DOM загружен, инициализация фильтров...');

    const styleCheckboxes = document.querySelectorAll('.filter-group:first-child input[type="checkbox"]');
    const functionCheckboxes = document.querySelectorAll('.filter-group:last-child input[type="checkbox"]');

    console.log('Найдено товаров:', products.length);

    function updateFilters() {
        console.log('Обновление фильтров...');

        const selectedStyles = Array.from(styleCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        const selectedFunctions = Array.from(functionCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        console.log('Выбранные стили:', selectedStyles);
        console.log('Выбранные функции:', selectedFunctions);

        products.forEach(product => {
            const productStyles = product.getAttribute('data-style')?.split(',') || [];
            const productFunctions = product.getAttribute('data-function')?.split(',') || [];

            console.log('Проверка продукта:', product);
            console.log('Стили продукта:', productStyles);
            console.log('Функции продукта:', productFunctions);

            const matchesStyle = selectedStyles.length === 0 || 
                selectedStyles.some(style => productStyles.includes(style));
            const matchesFunction = selectedFunctions.length === 0 || 
                selectedFunctions.some(func => productFunctions.includes(func));

            product.style.display = (matchesStyle && matchesFunction) ? '' : 'none';
        });
    }

    // Добавляем обработчики событий для чекбоксов
    styleCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateFilters);
    });

    functionCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateFilters);
    });
}); 