document.addEventListener('DOMContentLoaded', function() {
    const languageSelect = document.getElementById('languageSelect');
    
    if (languageSelect) {
        // Установка начального языка
        const currentLang = localStorage.getItem('language') || 'ru';
        languageSelect.value = currentLang;
        
        // Проверяем и исправляем отображение логотипа
        fixLogoDisplay();
        
        // Применяем начальные переводы
        applyTranslations(currentLang);
        
        languageSelect.addEventListener('change', function() {
            const selectedLang = this.value;
            localStorage.setItem('language', selectedLang);
            
            // Применяем новые переводы
            applyTranslations(selectedLang);
        });
    }
});

// Функция для исправления отображения логотипа
function fixLogoDisplay() {
    const logo = document.querySelector('.logo');
    if (logo) {
        // Проверяем если текущий src логотипа корректный
        if (!logo.complete || logo.naturalWidth === 0 || logo.getAttribute('src') === '' || logo.getAttribute('src') === null) {
            logo.setAttribute('src', '/SF.png');
        }
        
        // Убеждаемся, что применены правильные стили
        logo.style.maxHeight = '30px';
        logo.style.maxWidth = '100%';
        logo.style.display = 'block';
    }
}

// Объект с переводами
const translations = {
    ru: {
        // Навигация
        'nav-home': 'Главная',
        'nav-catalog': 'Каталог',
        'nav-details': 'Подробности',
        'nav-about': 'О продукте',
        
        // Кнопки
        'signup-btn': 'Регистрация',
        'signin-btn': 'Войти',
        'send-message': 'Отправить сообщение',
        'buy-now': 'Купить',
        'order-now': 'ЗАКАЗАТЬ СЕЙЧАС',
        'view-details': 'Подробнее',
        'buy-now-modal': 'Купить сейчас',
        
        // Заголовки секций
        'contact-title': 'Связаться с нами',
        'contact-subtitle': 'Есть вопросы? Мы с радостью на них ответим!',
        'faq-title': 'Часто задаваемые вопросы',
        'faq-subtitle': 'Изучите различные варианты покупки и найдите ответы на распространенные вопросы',
        'features-title': 'Особенности',
        'features-subtitle': 'Откройте для себя уникальные возможности Spoframe',
        'product-overview': 'Обзор продукта',
        
        // Форма контакта
        'your-name': 'Ваше имя',
        'name-placeholder': 'Введите ваше имя',
        'email': 'Email',
        'email-placeholder': 'Введите ваш email',
        'subject': 'Тема',
        'subject-placeholder': 'Тема сообщения',
        'message': 'Сообщение',
        'message-placeholder': 'Введите ваше сообщение',
        
        // Форма авторизации
        'login-email': 'EMAIL',
        'login-password': 'PASSWORD',
        'forgot-password': 'Забыли пароль?',
        'login-button': 'Войти',
        'no-account': 'Нет аккаунта?',
        'register-link': 'Зарегистрироваться',
        'register-header': 'Зарегистрируйтесь моментально',
        'register-subheader': 'и начните наслаждаться музыкой прямо сейчас',
        'register-name': 'КАК ТЕБЯ ЗОВУТ?',
        'register-name-placeholder': 'Введи имя профиля',
        'register-email': 'ТВОЙ EMAIL',
        'register-email-placeholder': 'name@domain.com',
        'register-password': 'ПРИДУМАЙ ПАРОЛЬ',
        'register-password-placeholder': 'Минимум 8 символов',
        'password-requirements': 'Пароль должен содержать минимум 8 символов',
        'register-button': 'Зарегистрироваться',
        'have-account': 'Уже есть аккаунт?',
        'login-link': 'Войти',
        
        // Продуктовая страница
        'product-name': 'Стильная Современная Рамка',
        'product-price': '14 990 ₸',
        'product-description': 'Элегантная и современная рамка, идеально подходящая для современных интерьеров, созданная с точностью и изяществом.',
        
        // Названия продуктов
        'wood-frame-title': 'Деревянная Рамка',
        'wood-frame-desc': 'Элегантная деревянная рамка, идеальная для гостиной.',
        'wood-frame-modal-desc': 'Элегантная деревянная рамка, созданная из высококачественного массива дерева. Идеально подходит для гостиной и создает теплую, уютную атмосферу в любом помещении.',
        
        'black-frame-title': 'Черная Металлическая Рамка',
        'black-frame-desc': 'Стильная черная рамка для современного интерьера.',
        'black-frame-modal-desc': 'Стильная черная металлическая рамка с современным дизайном. Идеальное решение для минималистичных интерьеров и офисных пространств. Матовое покрытие придает изделию элегантный вид.',
        
        'rustic-frame-title': 'Рустикальная Рамка',
        'rustic-frame-desc': 'Рустикальный шарм, отлично подходит для загородного стиля.',
        'rustic-frame-modal-desc': 'Рустикальная рамка с характерным винтажным шармом. Идеально подходит для загородных домов и интерьеров в стиле кантри. Каждая рамка имеет уникальный рисунок древесины.',
        
        'silver-frame-title': 'Серебряная Рамка',
        'silver-frame-desc': 'Современная серебряная рамка, добавляет элегантности любому интерьеру.',
        'silver-frame-modal-desc': 'Элегантная серебряная рамка с роскошным дизайном. Идеально подходит для классических интерьеров и торжественных помещений. Высококачественное серебряное покрытие придает изысканный вид.',
        
        // Особенности продуктов
        'feature-wood-1': 'Натуральное дерево высшего качества',
        'feature-wood-2': 'Ручная работа',
        'feature-wood-3': 'Защитное покрытие',
        
        'feature-black-1': 'Прочный металлический корпус',
        'feature-black-2': 'Матовое покрытие',
        'feature-black-3': 'Современный дизайн',
        
        'feature-rustic-1': 'Состаренная древесина',
        'feature-rustic-2': 'Уникальный дизайн',
        'feature-rustic-3': 'Экологичные материалы',
        
        'feature-silver-1': 'Премиальное покрытие',
        'feature-silver-2': 'Классический дизайн',
        'feature-silver-3': 'Долговечное покрытие',
        
        // FAQ
        'faq-sizes': 'Какие размеры доступны?',
        'faq-sizes-answer': 'Мы предлагаем размеры от маленького до XXL. Пожалуйста, обратитесь к таблице размеров для конкретных измерений.',
        'faq-colors': 'Как выбрать цвет?',
        'faq-colors-answer': 'Вы можете выбрать из доступных цветовых вариантов в разделе настройки продукта.',
        'faq-shipping': 'Какие варианты доставки?',
        'faq-shipping-answer': 'Мы предлагаем стандартную и экспресс-доставку в большинство регионов.',
        'faq-returns': 'Могу ли я вернуть товар?',
        'faq-returns-answer': 'Да, мы предлагаем 30-дневную политику возврата для неиспользованных товаров.',
        'faq-tracking': 'Как отследить мой заказ?',
        'faq-tracking-answer': 'Вы можете отследить свой заказ, используя номер отслеживания, предоставленный в письме с подтверждением.',
        
        // Главная страница
        'trailer-label': 'Рамки',
        'about-spoframe': 'О Spoframe',
        'explore-more': 'Подробнее',
        
        // О продукте
        'about-intro': 'Инновационное решение для отображения ваших любимых музыкальных моментов',
        'main-features': 'Основные особенности',
        'design': 'Дизайн',
        'sizes-formats': 'Размеры и форматы',
        'package': 'Комплектация',
        'specs': 'Характеристики',
        
        // Каталог
        'style': 'Стиль',
        'modern': 'Современный',
        'traditional': 'Традиционный',
        'rustic': 'Рустикальный',
        'functionality': 'Функционал',
        'decorative': 'Декоративный',
        'collection': 'Коллекционный',
        'coming-soon': 'Скоро в продаже',
        
        // Футер
        'copyright': '© 2025 Spoframe',
        
        // Страница ожидания
        'dev-title': 'Страница в разработке',
        'dev-description': 'Мы усердно работаем над созданием удобной системы оплаты и оформления заказов',
        'back-button': 'Вернуться назад'
    },
    en: {
        // Навигация
        'nav-home': 'Home',
        'nav-catalog': 'Catalog',
        'nav-details': 'Details',
        'nav-about': 'About Product',
        
        // Кнопки
        'signup-btn': 'Sign Up',
        'signin-btn': 'Sign In',
        'send-message': 'Send Message',
        'buy-now': 'Buy Now',
        'order-now': 'ORDER NOW',
        'view-details': 'View Details',
        'buy-now-modal': 'Buy Now',
        
        // Заголовки секций
        'contact-title': 'Contact Us',
        'contact-subtitle': 'Have questions? We\'ll be happy to answer them!',
        'faq-title': 'Frequently Asked Questions',
        'faq-subtitle': 'Explore different purchase options and find answers to common questions',
        'features-title': 'Features',
        'features-subtitle': 'Discover the unique features of Spoframe',
        'product-overview': 'Product Overview',
        
        // Форма контакта
        'your-name': 'Your Name',
        'name-placeholder': 'Enter your name',
        'email': 'Email',
        'email-placeholder': 'Enter your email',
        'subject': 'Subject',
        'subject-placeholder': 'Message subject',
        'message': 'Message',
        'message-placeholder': 'Enter your message',
        
        // Форма авторизации
        'login-email': 'EMAIL',
        'login-password': 'PASSWORD',
        'forgot-password': 'Forgot password?',
        'login-button': 'Sign In',
        'no-account': 'Don\'t have an account?',
        'register-link': 'Sign Up',
        'register-header': 'Sign Up Instantly',
        'register-subheader': 'and start enjoying music right now',
        'register-name': 'WHAT\'S YOUR NAME?',
        'register-name-placeholder': 'Enter your profile name',
        'register-email': 'YOUR EMAIL',
        'register-email-placeholder': 'name@domain.com',
        'register-password': 'CREATE PASSWORD',
        'register-password-placeholder': 'Minimum 8 characters',
        'password-requirements': 'Password must be at least 8 characters long',
        'register-button': 'Sign Up',
        'have-account': 'Already have an account?',
        'login-link': 'Sign In',
        
        // Продуктовая страница
        'product-name': 'Stylish Modern Frame',
        'product-price': '14,990 ₸',
        'product-description': 'Elegant and modern frame, perfect for contemporary interiors, crafted with precision and elegance.',
        
        // Названия продуктов
        'wood-frame-title': 'Wooden Frame',
        'wood-frame-desc': 'Elegant wooden frame, perfect for living rooms.',
        'wood-frame-modal-desc': 'Elegant wooden frame made from high-quality solid wood. Perfect for living rooms and creates a warm, cozy atmosphere in any space.',
        
        'black-frame-title': 'Black Metal Frame',
        'black-frame-desc': 'Stylish black frame for modern interiors.',
        'black-frame-modal-desc': 'Stylish black metal frame with a modern design. The perfect solution for minimalist interiors and office spaces. The matte finish gives the product an elegant look.',
        
        'rustic-frame-title': 'Rustic Frame',
        'rustic-frame-desc': 'Rustic charm, perfect for country style.',
        'rustic-frame-modal-desc': 'Rustic frame with a characteristic vintage charm. Perfect for country houses and country-style interiors. Each frame has a unique wood pattern.',
        
        'silver-frame-title': 'Silver Frame',
        'silver-frame-desc': 'Modern silver frame, adds elegance to any interior.',
        'silver-frame-modal-desc': 'Elegant silver frame with a luxurious design. Perfect for classic interiors and formal spaces. High-quality silver coating gives it a sophisticated look.',
        
        // Особенности продуктов
        'feature-wood-1': 'Premium quality natural wood',
        'feature-wood-2': 'Handcrafted',
        'feature-wood-3': 'Protective coating',
        
        'feature-black-1': 'Durable metal frame',
        'feature-black-2': 'Matte finish',
        'feature-black-3': 'Modern design',
        
        'feature-rustic-1': 'Aged wood',
        'feature-rustic-2': 'Unique design',
        'feature-rustic-3': 'Eco-friendly materials',
        
        'feature-silver-1': 'Premium coating',
        'feature-silver-2': 'Classic design',
        'feature-silver-3': 'Durable finish',
        
        // FAQ
        'faq-sizes': 'What sizes are available?',
        'faq-sizes-answer': 'We offer sizes from small to XXL. Please refer to the size chart for specific measurements.',
        'faq-colors': 'How to choose a color?',
        'faq-colors-answer': 'You can select from available color options in the product configuration section.',
        'faq-shipping': 'What are the shipping options?',
        'faq-shipping-answer': 'We offer standard and express shipping to most regions.',
        'faq-returns': 'Can I return the product?',
        'faq-returns-answer': 'Yes, we offer a 30-day return policy for unused items.',
        'faq-tracking': 'How do I track my order?',
        'faq-tracking-answer': 'You can track your order using the tracking number provided in the confirmation email.',
        
        // Главная страница
        'trailer-label': 'Frames',
        'about-spoframe': 'About Spoframe',
        'explore-more': 'Learn More',
        
        // О продукте
        'about-intro': 'An innovative solution for displaying your favorite musical moments',
        'main-features': 'Main Features',
        'design': 'Design',
        'sizes-formats': 'Sizes and Formats',
        'package': 'Package Contents',
        'specs': 'Specifications',
        
        // Каталог
        'style': 'Style',
        'modern': 'Modern',
        'traditional': 'Traditional',
        'rustic': 'Rustic',
        'functionality': 'Functionality',
        'decorative': 'Decorative',
        'collection': 'Collection',
        'coming-soon': 'Coming Soon',
        
        // Футер
        'copyright': '© 2025 Spoframe',
        
        // Страница ожидания
        'dev-title': 'Page Under Development',
        'dev-description': 'We are working hard to create a convenient payment and ordering system',
        'back-button': 'Go Back'
    }
};

// Дополнительная функция для проверки, все ли переводы применены корректно
function checkTranslationsConsistency(lang) {
    console.log('Проверка корректности переводов для языка:', lang);
    
    // Слушатель изображений для логотипа
    const allImages = document.querySelectorAll('img');
    allImages.forEach(img => {
        if (img.classList.contains('logo')) {
            img.addEventListener('error', function() {
                console.log('Ошибка загрузки логотипа, пробуем исправить');
                fixLogoDisplay();
            });
        }
    });
    
    // Добавляем отложенную проверку для переводов всех элементов
    setTimeout(() => {
        // Проверка для каталога
        if (window.location.pathname.includes('Catalog') || window.location.pathname.includes('catalog')) {
            const productTitles = document.querySelectorAll('.product-title');
            productTitles.forEach(title => {
                // Проверяем, что заголовок не содержит смешанных языков
                if ((lang === 'ru' && /[a-zA-Z]/.test(title.textContent) && !/Frame/.test(title.textContent)) || 
                    (lang === 'en' && /[а-яА-Я]/.test(title.textContent))) {
                    console.log('Обнаружен некорректный перевод заголовка:', title.textContent);
                    // Повторно применяем перевод для этого элемента
                    translateProductCatalog(lang);
                }
            });
        }
        
        // Дополнительная проверка для кнопок
        const buttons = document.querySelectorAll('button, .btn-view-details');
        buttons.forEach(button => {
            const buttonText = button.textContent.trim();
            // Проверяем смешение языков в кнопках
            if ((lang === 'ru' && /Buy|View|Details|Sign/.test(buttonText)) || 
                (lang === 'en' && /Купить|Подробнее|Войти|Регистрация/.test(buttonText))) {
                console.log('Обнаружен некорректный перевод кнопки:', buttonText);
                // Повторно применяем соответствующие переводы
                translateNavigation(lang);
                if (window.location.pathname.includes('Detail')) {
                    translateProductDetail(lang);
                } else if (window.location.pathname.includes('Catalog')) {
                    translateProductCatalog(lang);
                } else if (window.location.pathname === '/' || window.location.pathname.includes('Landing')) {
                    translateLandingPage(lang);
                }
            }
        });
    }, 500);
}

function applyTranslations(lang) {
    // Определяем, на какой странице мы находимся
    const currentPath = window.location.pathname;
    const isLandingPage = currentPath === '/' || currentPath.includes('Landing');
    const isProductDetail = currentPath.includes('Product Detail') || currentPath.includes('product');
    const isProductCatalog = currentPath.includes('Catalog') || currentPath.includes('catalog');
    const isAboutProduct = currentPath.includes('About') || currentPath.includes('about');
    
    // Общие элементы для всех страниц
    translateNavigation(lang);
    translateFooter(lang);
    translateAuthModals(lang);
    
    // Специфичные для страниц элементы
    if (isLandingPage) {
        translateLandingPage(lang);
    }
    
    if (isProductDetail) {
        translateProductDetail(lang);
    }
    
    if (isProductCatalog) {
        translateProductCatalog(lang);
    }
    
    if (isAboutProduct) {
        translateAboutProduct(lang);
    }
    
    // Дополнительная проверка, что все переводы применены корректно
    checkTranslationsConsistency(lang);
}

function translateNavigation(lang) {
    const homeLink = document.querySelector('.nav-links li:nth-child(1) a');
    const catalogLink = document.querySelector('.nav-links li:nth-child(2) a');
    const detailsLink = document.querySelector('.nav-links li:nth-child(3) a');
    const signupBtn = document.querySelector('.btn-signup');
    
    if (homeLink) homeLink.textContent = translations[lang]['nav-home'];
    if (catalogLink) catalogLink.textContent = translations[lang]['nav-catalog'];
    if (detailsLink) detailsLink.textContent = translations[lang]['nav-details'];
    if (signupBtn) signupBtn.textContent = translations[lang]['signup-btn'];
    
    // Проверяем и исправляем отображение логотипа каждый раз при переключении языка
    fixLogoDisplay();
}

function translateFooter(lang) {
    // Футер
    const footerLinks = document.querySelectorAll('.quick-links a');
    const copyright = document.querySelector('.copyright');
    
    if (footerLinks.length > 0) {
        if (footerLinks[0]) footerLinks[0].textContent = translations[lang]['nav-catalog']; 
        if (footerLinks[1]) footerLinks[1].textContent = translations[lang]['nav-details'];
        if (footerLinks[2]) footerLinks[2].textContent = translations[lang]['nav-about'];
    }
    
    if (copyright) copyright.textContent = translations[lang]['copyright'];
}

function translateAuthModals(lang) {
    // Модальные окна авторизации
    const loginEmailLabel = document.querySelector('.login-form .form-group:nth-child(1) label');
    const loginPasswordLabel = document.querySelector('.login-form .form-group:nth-child(2) label');
    const forgotPasswordLink = document.querySelector('.forgot-password');
    const loginButton = document.querySelector('.auth-submit');
    const noAccountText = document.querySelector('.login-form .auth-footer p');
    const registerLink = document.querySelector('.switch-to-signup');
    
    if (loginEmailLabel) loginEmailLabel.textContent = translations[lang]['login-email'];
    if (loginPasswordLabel) loginPasswordLabel.textContent = translations[lang]['login-password'];
    if (forgotPasswordLink) forgotPasswordLink.textContent = translations[lang]['forgot-password'];
    if (loginButton) loginButton.textContent = translations[lang]['login-button'];
    
    if (noAccountText && registerLink) {
        noAccountText.innerHTML = translations[lang]['no-account'] + ' <a href="#" class="switch-to-signup">' + translations[lang]['register-link'] + '</a>';
    }
    
    // Форма регистрации
    const registerHeader = document.querySelector('.signup-header h2');
    const registerSubheader = document.querySelector('.signup-header p');
    const registerNameLabel = document.querySelector('.signup-form .form-group:nth-child(1) label');
    const registerEmailLabel = document.querySelector('.signup-form .form-group:nth-child(2) label');
    const registerPasswordLabel = document.querySelector('.signup-form .form-group:nth-child(3) label');
    const passwordRequirements = document.querySelector('.password-requirements');
    const registerButton = document.querySelector('.signup-submit');
    const haveAccountText = document.querySelector('.signup-form .auth-footer p');
    const loginLink = document.querySelector('.switch-to-login');
    
    if (registerHeader) registerHeader.textContent = translations[lang]['register-header'];
    if (registerSubheader) registerSubheader.textContent = translations[lang]['register-subheader'];
    if (registerNameLabel) registerNameLabel.textContent = translations[lang]['register-name'];
    if (registerEmailLabel) registerEmailLabel.textContent = translations[lang]['register-email'];
    if (registerPasswordLabel) registerPasswordLabel.textContent = translations[lang]['register-password'];
    if (passwordRequirements) passwordRequirements.textContent = translations[lang]['password-requirements'];
    if (registerButton) registerButton.textContent = translations[lang]['register-button'];
    
    if (haveAccountText && loginLink) {
        haveAccountText.innerHTML = translations[lang]['have-account'] + ' <a href="#" class="switch-to-login">' + translations[lang]['login-link'] + '</a>';
    }
    
    // Placeholder для полей ввода
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        if (input.type === 'email' && input.placeholder.includes('email')) {
            input.placeholder = translations[lang]['email-placeholder'];
        }
    });
}

function translateProductDetail(lang) {
    // Страница деталей продукта
    
    // Заголовки секций
    const productOverview = document.querySelector('.product-info-section h1');
    const productName = document.querySelector('.product-name');
    const productPrice = document.querySelector('.product-price');
    const productDescription = document.querySelector('.product-description');
    const buyButton = document.querySelector('.btn-buy-now');
    
    if (productOverview) productOverview.textContent = translations[lang]['product-overview'];
    if (productName) productName.textContent = translations[lang]['product-name'];
    if (productPrice) productPrice.textContent = translations[lang]['product-price'];
    if (productDescription) productDescription.textContent = translations[lang]['product-description'];
    if (buyButton) buyButton.textContent = translations[lang]['buy-now'];
    
    // FAQ секция
    const faqTitle = document.querySelector('.faq-section h2');
    const faqDescription = document.querySelector('.faq-description');
    
    if (faqTitle) faqTitle.textContent = translations[lang]['faq-title'];
    if (faqDescription) faqDescription.textContent = translations[lang]['faq-subtitle'];
    
    // FAQ вопросы
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length > 0) {
        const faqQuestions = [
            'faq-sizes', 'faq-colors', 'faq-shipping', 'faq-returns', 'faq-tracking'
        ];
        const faqAnswers = [
            'faq-sizes-answer', 'faq-colors-answer', 'faq-shipping-answer', 'faq-returns-answer', 'faq-tracking-answer'
        ];
        
        faqItems.forEach((item, index) => {
            if (index < faqQuestions.length) {
                const summary = item.querySelector('summary');
                const answer = item.querySelector('p');
                
                if (summary) summary.textContent = translations[lang][faqQuestions[index]];
                if (answer) answer.textContent = translations[lang][faqAnswers[index]];
            }
        });
    }
    
    // Секция обратной связи
    const contactTitle = document.querySelector('.section-title');
    const contactSubtitle = document.querySelector('.section-subtitle');
    
    if (contactTitle) contactTitle.textContent = translations[lang]['contact-title'];
    if (contactSubtitle) contactSubtitle.textContent = translations[lang]['contact-subtitle'];
    
    // Форма обратной связи
    const nameLabel = document.querySelector('label[for="name"]');
    const emailLabel = document.querySelector('label[for="email"]');
    const subjectLabel = document.querySelector('label[for="subject"]');
    const messageLabel = document.querySelector('label[for="message"]');
    
    if (nameLabel) nameLabel.textContent = translations[lang]['your-name'];
    if (emailLabel) emailLabel.textContent = translations[lang]['email'];
    if (subjectLabel) subjectLabel.textContent = translations[lang]['subject'];
    if (messageLabel) messageLabel.textContent = translations[lang]['message'];
    
    // Плейсхолдеры
    const nameInput = document.querySelector('#name');
    const emailInput = document.querySelector('#email');
    const subjectInput = document.querySelector('#subject');
    const messageInput = document.querySelector('#message');
    
    if (nameInput) nameInput.placeholder = translations[lang]['name-placeholder'];
    if (emailInput) emailInput.placeholder = translations[lang]['email-placeholder'];
    if (subjectInput) subjectInput.placeholder = translations[lang]['subject-placeholder'];
    if (messageInput) messageInput.placeholder = translations[lang]['message-placeholder'];
    
    // Кнопка отправки
    const submitButton = document.querySelector('.btn-submit');
    if (submitButton) submitButton.textContent = translations[lang]['send-message'];
    
    // Страница разработки
    const devTitle = document.querySelector('.development-content h2');
    const devDescription = document.querySelector('.development-content p');
    const backButton = document.querySelector('.close-dev-page');
    
    if (devTitle) devTitle.textContent = translations[lang]['dev-title'];
    if (devDescription) devDescription.textContent = translations[lang]['dev-description'];
    if (backButton) backButton.textContent = translations[lang]['back-button'];
}

function translateLandingPage(lang) {
    // Главная страница
    const trailerLabel = document.querySelector('.trailer-label');
    const orderNowBtn = document.querySelector('#orderNowBtn');
    
    if (trailerLabel) trailerLabel.textContent = translations[lang]['trailer-label'];
    if (orderNowBtn) orderNowBtn.textContent = translations[lang]['order-now'];
    
    // Секция особенностей
    const featuresTitle = document.querySelector('.features .section-title');
    const featuresSubtitle = document.querySelector('.features .section-subtitle');
    const exploreButton = document.querySelector('.btn-explore-features');
    
    if (featuresTitle) featuresTitle.textContent = translations[lang]['features-title'];
    if (featuresSubtitle) featuresSubtitle.textContent = translations[lang]['features-subtitle'];
    if (exploreButton) exploreButton.textContent = translations[lang]['explore-more'];
}

function translateProductCatalog(lang) {
    // Переводим заголовки фильтров
    const filterHeaders = document.querySelectorAll('.filter-group h3');
    if (filterHeaders.length > 0) {
        for (let header of filterHeaders) {
            if (header.textContent.includes('Стиль') || header.textContent.includes('Style')) {
                header.textContent = translations[lang]['style'];
            } else if (header.textContent.includes('Функционал') || header.textContent.includes('Functionality')) {
                header.textContent = translations[lang]['functionality'];
            }
        }
    }
    
    // Переводим опции фильтров
    const filterLabels = document.querySelectorAll('.checkbox-wrapper label');
    if (filterLabels.length > 0) {
        for (let label of filterLabels) {
            if (label.textContent.includes('Современный') || label.textContent.includes('Modern')) {
                label.textContent = translations[lang]['modern'];
            } else if (label.textContent.includes('Традиционный') || label.textContent.includes('Traditional')) {
                label.textContent = translations[lang]['traditional'];
            } else if (label.textContent.includes('Рустикальный') || label.textContent.includes('Rustic')) {
                label.textContent = translations[lang]['rustic'];
            } else if (label.textContent.includes('Декоративный') || label.textContent.includes('Decorative')) {
                label.textContent = translations[lang]['decorative'];
            } else if (label.textContent.includes('Коллекционный') || label.textContent.includes('Collection')) {
                label.textContent = translations[lang]['collection'];
            }
        }
    }
    
    // Переводим карточки продуктов
    const productCards = document.querySelectorAll('.product-card');
    if (productCards.length > 0) {
        for (let card of productCards) {
            const title = card.querySelector('.product-title');
            const description = card.querySelector('.product-description');
            const button = card.querySelector('.btn-view-details');
            
            if (card.classList.contains('coming-soon-card')) {
                const comingSoonDiv = card.querySelector('.coming-soon');
                if (comingSoonDiv) {
                    comingSoonDiv.textContent = translations[lang]['coming-soon'];
                }
                continue;
            }
            
            if (title) {
                if (title.textContent.includes('Деревянная') || title.textContent.includes('Wooden')) {
                    title.textContent = translations[lang]['wood-frame-title'];
                } else if (title.textContent.includes('Черная') || title.textContent.includes('Black')) {
                    title.textContent = translations[lang]['black-frame-title'];
                } else if (title.textContent.includes('Рустикальная') || title.textContent.includes('Rustic')) {
                    title.textContent = translations[lang]['rustic-frame-title'];
                } else if (title.textContent.includes('Серебряная') || title.textContent.includes('Silver')) {
                    title.textContent = translations[lang]['silver-frame-title'];
                }
            }
            
            if (description) {
                if (card.dataset.modalTarget === 'modal-wood-frame') {
                    description.textContent = translations[lang]['wood-frame-desc'];
                } else if (card.dataset.modalTarget === 'modal-black-frame') {
                    description.textContent = translations[lang]['black-frame-desc'];
                } else if (card.dataset.modalTarget === 'modal-rustic-frame') {
                    description.textContent = translations[lang]['rustic-frame-desc'];
                } else if (card.dataset.modalTarget === 'modal-silver-frame') {
                    description.textContent = translations[lang]['silver-frame-desc'];
                }
            }
            
            if (button) {
                button.textContent = translations[lang]['view-details'];
            }
        }
    }
    
    // Переводим модальные окна продуктов
    const productModals = document.querySelectorAll('.product-modal');
    if (productModals.length > 0) {
        for (let modal of productModals) {
            const modalTitle = modal.querySelector('.product-modal__title');
            const modalDescription = modal.querySelector('.product-modal__description');
            const buyButton = modal.querySelector('.product-modal__buy');
            const features = modal.querySelectorAll('.feature-item span');
            
            if (modalTitle) {
                if (modal.id === 'modal-wood-frame') {
                    modalTitle.textContent = translations[lang]['wood-frame-title'];
                } else if (modal.id === 'modal-black-frame') {
                    modalTitle.textContent = translations[lang]['black-frame-title'];
                } else if (modal.id === 'modal-rustic-frame') {
                    modalTitle.textContent = translations[lang]['rustic-frame-title'];
                } else if (modal.id === 'modal-silver-frame') {
                    modalTitle.textContent = translations[lang]['silver-frame-title'];
                }
            }
            
            if (modalDescription) {
                if (modal.id === 'modal-wood-frame') {
                    modalDescription.textContent = translations[lang]['wood-frame-modal-desc'];
                } else if (modal.id === 'modal-black-frame') {
                    modalDescription.textContent = translations[lang]['black-frame-modal-desc'];
                } else if (modal.id === 'modal-rustic-frame') {
                    modalDescription.textContent = translations[lang]['rustic-frame-modal-desc'];
                } else if (modal.id === 'modal-silver-frame') {
                    modalDescription.textContent = translations[lang]['silver-frame-modal-desc'];
                }
            }
            
            if (buyButton) {
                buyButton.textContent = translations[lang]['buy-now-modal'];
            }
            
            if (features && features.length > 0) {
                for (let i = 0; i < features.length; i++) {
                    if (modal.id === 'modal-wood-frame') {
                        features[i].textContent = translations[lang][`feature-wood-${i+1}`];
                    } else if (modal.id === 'modal-black-frame') {
                        features[i].textContent = translations[lang][`feature-black-${i+1}`];
                    } else if (modal.id === 'modal-rustic-frame') {
                        features[i].textContent = translations[lang][`feature-rustic-${i+1}`];
                    } else if (modal.id === 'modal-silver-frame') {
                        features[i].textContent = translations[lang][`feature-silver-${i+1}`];
                    }
                }
            }
        }
    }
}

function translateAboutProduct(lang) {
    // Страница о продукте
    const aboutTitle = document.querySelector('.product-intro h1');
    const aboutIntro = document.querySelector('.intro-text');
    
    if (aboutTitle) aboutTitle.textContent = translations[lang]['about-spoframe'];
    if (aboutIntro) aboutIntro.textContent = translations[lang]['about-intro'];
    
    // Основные особенности
    const featuresTitle = document.querySelector('.doc-section h2');
    const designTitle = document.querySelector('.feature:nth-child(1) h3');
    const sizeTitle = document.querySelector('.feature:nth-child(2) h3');
    const packageTitle = document.querySelector('.feature:nth-child(3) h3');
    
    if (featuresTitle) featuresTitle.textContent = translations[lang]['main-features'];
    if (designTitle) designTitle.textContent = translations[lang]['design'];
    if (sizeTitle) sizeTitle.textContent = translations[lang]['sizes-formats'];
    if (packageTitle) packageTitle.textContent = translations[lang]['package'];
    
    // Характеристики
    const specsTitle = document.querySelector('.specs h2');
    
    if (specsTitle) specsTitle.textContent = translations[lang]['specs'];
}