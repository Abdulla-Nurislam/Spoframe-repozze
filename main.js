// Регистрация Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker зарегистрирован успешно:', registration.scope);
      })
      .catch(error => {
        console.error('Ошибка при регистрации ServiceWorker:', error);
      });
  });
}

document.addEventListener('DOMContentLoaded', function() {
    const dots = document.querySelectorAll('.dot');
    const slides = document.querySelectorAll('.hero-slide');
    
    // Проверяем наличие элементов баннера
    if (dots.length === 0 || slides.length === 0) {
        console.log('Элементы баннера не найдены');
        return;
    }

    let currentSlide = 0;
    let slideInterval;
    let isTransitioning = false;

    console.log('DOM загружен, слайдов найдено:', slides.length);
    console.log('Точек навигации найдено:', dots.length);
        
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
        if (isTransitioning) return;
        isTransitioning = true;

        // Убираем активный класс с текущего слайда и точки
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');

        // Обновляем индекс текущего слайда
        currentSlide = slideIndex;

        // Добавляем активный класс новому слайду и точке
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');

        // Сбрасываем флаг через время анимации
        setTimeout(() => {
            isTransitioning = false;
        }, 500); // Время должно совпадать с CSS transition
    }

    // Функция для следующего слайда
    function nextSlide() {
        let nextIndex = (currentSlide + 1) % slides.length;
        switchSlide(nextIndex);
    }

    // Функция для предыдущего слайда
    function prevSlide() {
        let prevIndex = (currentSlide - 1 + slides.length) % slides.length;
        switchSlide(prevIndex);
    }

    // Запускаем автоматическое переключение
    function startSlideshow() {
        if (slideInterval) clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 5000);
    }

    // Останавливаем автоматическое переключение
    function stopSlideshow() {
        if (slideInterval) {
            clearInterval(slideInterval);
            slideInterval = null;
        }
    }

    // Обработчики событий для точек навигации
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            if (currentSlide === index || isTransitioning) return;
            stopSlideshow();
            switchSlide(index);
            startSlideshow();
        });
    });

    // Добавляем обработчики для клавиш влево/вправо
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            stopSlideshow();
            prevSlide();
            startSlideshow();
        } else if (e.key === 'ArrowRight') {
            stopSlideshow();
            nextSlide();
            startSlideshow();
        }
    });

    // Запускаем слайдшоу
    startSlideshow();

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

    // Обработчик формы обратной связи
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };
            
            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    contactForm.style.display = 'none';
                    formSuccess.style.display = 'block';
                    
                    // Сбросить форму через 5 секунд
                    setTimeout(() => {
                        contactForm.reset();
                        contactForm.style.display = 'block';
                        formSuccess.style.display = 'none';
                    }, 5000);
                } else {
                    alert('Произошла ошибка при отправке сообщения. Пожалуйста, попробуйте еще раз.');
                }
            } catch (error) {
                console.error('Ошибка:', error);
                alert('Произошла ошибка при отправке сообщения. Пожалуйста, попробуйте еще раз.');
            }
        });
    }

    // Мобильное меню
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            
            // Обновляем атрибуты доступности
            const isExpanded = navLinks.classList.contains('active');
            mobileMenuToggle.setAttribute('aria-expanded', isExpanded);
            
            // Изменяем иконку
            const icon = mobileMenuToggle.querySelector('i');
            if (isExpanded) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
                mobileMenuToggle.setAttribute('aria-label', 'Закрыть меню');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                mobileMenuToggle.setAttribute('aria-label', 'Открыть меню');
            }
        });
        
        // Закрываем меню при клике на ссылку
        const navItems = navLinks.querySelectorAll('a');
        navItems.forEach(item => {
            item.addEventListener('click', function() {
                navLinks.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                const icon = mobileMenuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                mobileMenuToggle.setAttribute('aria-label', 'Открыть меню');
            });
        });
    }

    // Функции для отслеживания событий
    function trackEvent(category, action, label = null) {
        // Google Analytics
        if (typeof gtag === 'function') {
            gtag('event', action, {
                'event_category': category,
                'event_label': label
            });
        }
        
        // Яндекс.Метрика
        if (typeof ym === 'function') {
            ym(XXXXXXXX, 'reachGoal', `${category}_${action}`, { label: label });
        }
        
        console.log(`Event tracked: ${category} - ${action} - ${label}`);
    }

    // Отслеживание событий при загрузке страницы
    document.addEventListener('DOMContentLoaded', function() {
        // Отслеживание клика по кнопке "Заказать сейчас"
        const orderNowBtn = document.getElementById('orderNowBtn');
        if (orderNowBtn) {
            orderNowBtn.addEventListener('click', function() {
                trackEvent('button', 'click', 'order_now');
            });
        }
        
        // Отслеживание отправки формы обратной связи
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', function() {
                trackEvent('form', 'submit', 'contact');
            });
        }
        
        // Отслеживание регистрации
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', function() {
                trackEvent('form', 'submit', 'signup');
            });
        }
        
        // Отслеживание входа
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', function() {
                trackEvent('form', 'submit', 'login');
            });
        }
        
        // Отслеживание просмотра секций (с помощью Intersection Observer)
        const sections = document.querySelectorAll('section');
        
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id || entry.target.className;
                    trackEvent('section', 'view', sectionId);
                }
            });
        }, { threshold: 0.5 });
        
        sections.forEach(section => {
            sectionObserver.observe(section);
        });
    });

    // Расширенное отслеживание событий
    function setupAdvancedTracking() {
        // Отслеживание времени на странице
        let startTime = new Date();
        let pageTitle = document.title;
        
        window.addEventListener('beforeunload', function() {
            let endTime = new Date();
            let timeSpent = Math.round((endTime - startTime) / 1000);
            trackEvent('engagement', 'time_on_page', `${pageTitle}: ${timeSpent}s`);
        });
        
        // Отслеживание прокрутки страницы
        let scrollDepthMarks = [25, 50, 75, 100];
        let scrollDepthMarksReached = new Set();
        
        window.addEventListener('scroll', function() {
            let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            let scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            let scrollPercentage = Math.round((scrollTop / scrollHeight) * 100);
            
            scrollDepthMarks.forEach(function(mark) {
                if (scrollPercentage >= mark && !scrollDepthMarksReached.has(mark)) {
                    scrollDepthMarksReached.add(mark);
                    trackEvent('scroll', 'depth_reached', `${mark}%`);
                }
            });
        });
        
        // Отслеживание внешних ссылок
        document.querySelectorAll('a[href^="http"]').forEach(function(link) {
            link.addEventListener('click', function(e) {
                let href = this.getAttribute('href');
                if (!href.includes(window.location.hostname)) {
                    trackEvent('outbound', 'click', href);
                }
            });
        });
        
        // Отслеживание загрузки файлов
        document.querySelectorAll('a[href$=".pdf"], a[href$=".doc"], a[href$=".docx"], a[href$=".xls"], a[href$=".xlsx"], a[href$=".zip"]').forEach(function(link) {
            link.addEventListener('click', function(e) {
                let href = this.getAttribute('href');
                let fileType = href.split('.').pop();
                trackEvent('download', fileType, href);
            });
        });
        
        // Отслеживание ошибок JavaScript
        window.addEventListener('error', function(e) {
            trackEvent('error', 'javascript', `${e.message} at ${e.filename}:${e.lineno}`);
        });
    }

    // Запуск расширенного отслеживания
    setupAdvancedTracking();

    // Обработка переключения языков
    const languageSelect = document.getElementById('languageSelect');
    
    if (languageSelect) {
        // Установка текущего значения из куки, если есть
        const currentLang = getCookie('locale') || 'ru';
        languageSelect.value = currentLang;
        
        // Обработка изменения языка
        languageSelect.addEventListener('change', function() {
            const selectedLang = this.value;
            window.location.href = `/api/language/${selectedLang}`;
        });
    }
    
    // Инициализация кнопок прокрутки
    initScrollButtons();
    
    // Инициализация модальных окон
    initModals();
});

// Получение значения куки по имени
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Инициализация кнопок прокрутки
function initScrollButtons() {
    const scrollToTopBtn = document.getElementById('scrollToTop');
    const scrollToBottomBtn = document.getElementById('scrollToBottom');
    
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    if (scrollToBottomBtn) {
        scrollToBottomBtn.addEventListener('click', function() {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
        });
    }
}

// Инициализация модальных окон
function initModals() {
    // Для product-modal
    const productBtns = document.querySelectorAll('.btn-view-details');
    const productModals = document.querySelectorAll('.product-modal');
    const productCloseButtons = document.querySelectorAll('.product-modal__close');
    
    // Открытие модального окна продукта
    productBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const card = this.closest('.product-card');
            const targetModalId = card.dataset.modalTarget;
            const modal = document.getElementById(targetModalId);
            if (modal) {
                modal.style.display = 'block';
            }
        });
    });
    
    // Закрытие модального окна продукта
    productCloseButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.product-modal');
            modal.style.display = 'none';
        });
    });
    
    // Закрытие модального окна при клике вне его
    productModals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    });
} 