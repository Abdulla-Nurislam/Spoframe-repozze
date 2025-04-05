/**
 * Оптимизированный модуль для управления слайдером
 * Использует requestAnimationFrame и дебаунсинг для повышения производительности
 */
class Slider {
    constructor(options) {
        this.slideSelector = options.slideSelector || '.hero-slide';
        this.dotSelector = options.dotSelector || '.dot';
        this.interval = options.interval || 4000; // Уменьшенный интервал для ускорения
        this.currentSlide = 0;
        this.slides = document.querySelectorAll(this.slideSelector);
        this.dots = document.querySelectorAll(this.dotSelector);
        this.slideCount = this.slides.length;
        this.isPlaying = true;
        this.timerId = null;
        this.touchStartX = 0;
        this.touchEndX = 0;

        this.init();
    }

    init() {
        // Инициализация слайдера
        if (this.slideCount > 0) {
            // Добавляем обработчики для точек навигации
            this.dots.forEach((dot, index) => {
                dot.addEventListener('click', () => this.switchSlide(index));
            });

            // Добавляем обработчики для свайпа на мобильных устройствах
            document.addEventListener('touchstart', this.handleTouchStart.bind(this), false);
            document.addEventListener('touchend', this.handleTouchEnd.bind(this), false);

            // Приостанавливаем слайдшоу при наведении мыши
            const heroSection = document.querySelector('.hero');
            if (heroSection) {
                heroSection.addEventListener('mouseenter', this.stopSlideshow.bind(this));
                heroSection.addEventListener('mouseleave', this.startSlideshow.bind(this));
            }

            // Запускаем автоматическое переключение слайдов
            this.startSlideshow();
        }
    }

    /**
     * Переключение на конкретный слайд
     * @param {number} slideIndex - Индекс слайда
     */
    switchSlide(slideIndex) {
        // Останавливаем текущий таймер
        this.stopSlideshow();

        // Убираем активный класс у всех слайдов и точек
        this.slides.forEach(slide => slide.classList.remove('active'));
        this.dots.forEach(dot => dot.classList.remove('active'));

        // Добавляем активный класс текущему слайду и точке
        this.currentSlide = slideIndex;
        this.slides[this.currentSlide].classList.add('active');
        this.dots[this.currentSlide].classList.add('active');

        // Перезапускаем слайдшоу, если оно было активно
        if (this.isPlaying) {
            this.startSlideshow();
        }
    }

    /**
     * Переход к следующему слайду
     */
    nextSlide() {
        this.switchSlide((this.currentSlide + 1) % this.slideCount);
    }

    /**
     * Переход к предыдущему слайду
     */
    prevSlide() {
        this.switchSlide((this.currentSlide - 1 + this.slideCount) % this.slideCount);
    }

    /**
     * Запуск автоматического переключения слайдов
     */
    startSlideshow() {
        if (this.timerId) clearTimeout(this.timerId);
        this.isPlaying = true;
        this.timerId = setTimeout(() => {
            requestAnimationFrame(() => {
                this.nextSlide();
            });
        }, this.interval);
    }

    /**
     * Остановка автоматического переключения слайдов
     */
    stopSlideshow() {
        if (this.timerId) clearTimeout(this.timerId);
        this.isPlaying = false;
    }

    /**
     * Обработчик начала касания (для поддержки свайпов)
     */
    handleTouchStart(event) {
        this.touchStartX = event.changedTouches[0].screenX;
    }

    /**
     * Обработчик окончания касания (для поддержки свайпов)
     */
    handleTouchEnd(event) {
        this.touchEndX = event.changedTouches[0].screenX;
        this.handleSwipe();
    }

    /**
     * Обработка свайпа
     */
    handleSwipe() {
        const SWIPE_THRESHOLD = 50; // Минимальное расстояние для срабатывания свайпа
        
        if (this.touchEndX < this.touchStartX - SWIPE_THRESHOLD) {
            // Свайп влево - следующий слайд
            this.nextSlide();
        } else if (this.touchEndX > this.touchStartX + SWIPE_THRESHOLD) {
            // Свайп вправо - предыдущий слайд
            this.prevSlide();
        }
    }
}

/**
 * Функция debounce для оптимизации частых вызовов функций
 * @param {Function} func - Функция для вызова
 * @param {number} wait - Время задержки в мс
 * @param {boolean} immediate - Вызывать функцию немедленно
 * @return {Function} - Дебаунсированная функция
 */
function debounce(func, wait, immediate) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

/**
 * Функция throttle для ограничения частоты вызовов функций
 * @param {Function} func - Функция для вызова
 * @param {number} limit - Минимальный интервал между вызовами
 * @return {Function} - Throttled функция
 */
function throttle(func, limit) {
    let lastCall = 0;
    return function() {
        const now = Date.now();
        if (now - lastCall >= limit) {
            lastCall = now;
            func.apply(this, arguments);
        }
    };
}

// Инициализация при загрузке документа
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация слайдера
    const heroSlider = new Slider({
        slideSelector: '.hero-slide',
        dotSelector: '.dot',
        interval: 4000 // 4 секунды между слайдами
    });

    // Оптимизированный обработчик прокрутки с использованием throttle
    const handleScroll = throttle(function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollToTopBtn = document.getElementById('scrollToTop');
        const scrollToBottomBtn = document.getElementById('scrollToBottom');
        
        if (scrollToTopBtn) {
            if (scrollTop > 200) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        }
        
        if (scrollToBottomBtn) {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrolledToBottom = scrollTop + windowHeight > documentHeight - 200;
            
            if (scrolledToBottom) {
                scrollToBottomBtn.classList.remove('visible');
            } else {
                scrollToBottomBtn.classList.add('visible');
            }
        }
    }, 100); // Ограничиваем до 10 вызовов в секунду

    // Добавляем обработчик прокрутки
    window.addEventListener('scroll', handleScroll);
    
    // Вызываем обработчик сразу для начальной настройки
    handleScroll();

    // Обработчики для кнопок прокрутки
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
                top: document.documentElement.scrollHeight,
                behavior: 'smooth'
            });
        });
    }

    // Инициализация мобильного меню
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

    // Обработчик формы обратной связи с валидацией
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Валидация формы
            if (!validateContactForm(contactForm)) {
                return;
            }
            
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
                    showFormError(contactForm, 'Произошла ошибка при отправке сообщения. Пожалуйста, попробуйте еще раз.');
                }
            } catch (error) {
                console.error('Ошибка:', error);
                showFormError(contactForm, 'Произошла ошибка при отправке сообщения. Пожалуйста, попробуйте еще раз.');
            }
        });
    }

    /**
     * Проверка валидности формы обратной связи
     * @param {HTMLFormElement} form - Форма для валидации
     * @return {boolean} - Результат валидации
     */
    function validateContactForm(form) {
        const nameInput = form.querySelector('#name');
        const emailInput = form.querySelector('#email');
        const subjectInput = form.querySelector('#subject');
        const messageInput = form.querySelector('#message');
        let isValid = true;
        
        // Удаляем все существующие сообщения об ошибках
        form.querySelectorAll('.error-message').forEach(el => el.remove());
        
        // Валидация имени
        if (!nameInput.value.trim()) {
            showInputError(nameInput, 'Пожалуйста, введите ваше имя');
            isValid = false;
        }
        
        // Валидация email
        if (!validateEmail(emailInput.value)) {
            showInputError(emailInput, 'Пожалуйста, введите корректный email');
            isValid = false;
        }
        
        // Валидация темы
        if (!subjectInput.value.trim()) {
            showInputError(subjectInput, 'Пожалуйста, введите тему сообщения');
            isValid = false;
        }
        
        // Валидация сообщения
        if (!messageInput.value.trim()) {
            showInputError(messageInput, 'Пожалуйста, введите текст сообщения');
            isValid = false;
        }
        
        return isValid;
    }

    /**
     * Проверка валидности email
     * @param {string} email - Email для проверки
     * @return {boolean} - Результат проверки
     */
    function validateEmail(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(String(email).toLowerCase());
    }

    /**
     * Отображение ошибки для поля ввода
     * @param {HTMLElement} input - Поле ввода
     * @param {string} message - Сообщение об ошибке
     */
    function showInputError(input, message) {
        // Создаем элемент для сообщения об ошибке
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        errorElement.style.color = '#e53e3e';
        errorElement.style.fontSize = '12px';
        errorElement.style.marginTop = '4px';
        
        // Вставляем сообщение после поля ввода
        input.parentNode.appendChild(errorElement);
        
        // Добавляем стили для поля с ошибкой
        input.style.borderColor = '#e53e3e';
        
        // Добавляем обработчик для очистки ошибки при вводе
        input.addEventListener('input', function() {
            input.style.borderColor = '';
            const errorMsg = input.parentNode.querySelector('.error-message');
            if (errorMsg) errorMsg.remove();
        }, { once: true });
    }

    /**
     * Отображение общей ошибки формы
     * @param {HTMLElement} form - Форма
     * @param {string} message - Сообщение об ошибке
     */
    function showFormError(form, message) {
        // Создаем элемент для сообщения об ошибке
        const errorElement = document.createElement('div');
        errorElement.className = 'form-error';
        errorElement.textContent = message;
        errorElement.style.color = '#e53e3e';
        errorElement.style.fontSize = '14px';
        errorElement.style.marginTop = '10px';
        errorElement.style.padding = '10px';
        errorElement.style.backgroundColor = '#fff5f5';
        errorElement.style.borderRadius = '4px';
        errorElement.style.textAlign = 'center';
        
        // Вставляем сообщение в начало формы
        form.prepend(errorElement);
        
        // Автоматически скрываем сообщение через 5 секунд
        setTimeout(() => {
            if (errorElement.parentNode) {
                errorElement.remove();
            }
        }, 5000);
    }

    // Обработчик переключения языка
    const languageSelect = document.getElementById('languageSelect');
    
    if (languageSelect) {
        // Устанавливаем текущий язык из куки
        const currentLang = getCookie('locale') || 'ru';
        languageSelect.value = currentLang;
        
        // Обработчик изменения языка
        languageSelect.addEventListener('change', function() {
            const selectedLang = this.value;
            
            // Отправляем запрос на сервер для изменения языка
            fetch(`/api/language/${selectedLang}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Перезагружаем страницу для применения нового языка
                        window.location.reload();
                    }
                })
                .catch(error => {
                    console.error('Ошибка при смене языка:', error);
                });
        });
    }

    /**
     * Получение значения куки
     * @param {string} name - Имя куки
     * @return {string|null} - Значение куки или null
     */
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }
}); 