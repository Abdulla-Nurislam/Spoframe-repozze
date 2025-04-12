// Объект с переводами
const translations = {
    ru: {
        // Навигация
        'nav-home': 'Главная',
        'nav-catalog': 'Каталог',
        'nav-details': 'Подробности',
        'nav-about': 'О продукте',
        
        // Карточки особенностей
        'feature-design-title': 'Стильный Дизайн',
        'feature-design-category': 'Дизайн',
        'feature-design-desc': 'Элегантные рамки, которые дополняют любой интерьер, добавляя нотку изысканности вашему пространству.',
        
        'feature-spotify-title': 'Интеграция со Spotify',
        'feature-spotify-category': 'Интеграция',
        'feature-spotify-desc': 'Легко подключайтесь к Spotify для отображения обложек альбомов, плейлистов и многого другого прямо на вашей рамке.',
        
        'feature-display-title': 'Настраиваемость Дисплея',
        'feature-display-category': 'Доступность',
        'feature-display-desc': 'Доступны режимы слайд-шоу и статичного изображения. Настраивайте источники контента, частоту смены кадров и яркость дисплея под свои предпочтения.',
        
        // Кнопки
        'signup-btn': 'Регистрация',
        'signin-btn': 'Войти',
        'send-message': 'Отправить сообщение',
        'buy-now': 'Купить',
        'add-to-cart': 'Добавить в корзину',
        'view-details': 'Подробнее',
        'buy-now-modal': 'Купить сейчас',
        
        // Заголовки секций
        'contact-title': 'Связаться с нами',
        'contact-subtitle': 'Есть вопросы? Мы будем рады на них ответить!',
        'faq-title': 'Часто задаваемые вопросы',
        'faq-subtitle': 'Изучите различные варианты покупки и найдите ответы на распространенные вопросы',
        'features-title': 'Особенности',
        'features-subtitle': 'Откройте для себя уникальные возможности Spoframe',
        'explore-more': 'Подробнее',
        'order-now': 'Заказать сейчас',
        
        // Футер
        'footer-catalog': 'Каталог',
        'footer-details': 'Подробности',
        'footer-about': 'О продукте'
    },
    
    en: {
        // Навигация
        'nav-home': 'Home',
        'nav-catalog': 'Catalog',
        'nav-details': 'Details',
        'nav-about': 'About Product',
        
        // Карточки особенностей
        'feature-design-title': 'Stylish Design',
        'feature-design-category': 'Design',
        'feature-design-desc': 'Elegant frames that complement any interior, adding a touch of sophistication to your space.',
        
        'feature-spotify-title': 'Spotify Integration',
        'feature-spotify-category': 'Integration',
        'feature-spotify-desc': 'Easily connect to Spotify to display album covers, playlists, and much more directly on your frame.',
        
        'feature-display-title': 'Display Customization',
        'feature-display-category': 'Accessibility',
        'feature-display-desc': 'Available in slideshow and static image modes. Customize content sources, frame rate, and display brightness according to your preferences.',
        
        // Кнопки
        'signup-btn': 'Sign Up',
        'signin-btn': 'Sign In',
        'send-message': 'Send Message',
        'buy-now': 'Buy Now',
        'add-to-cart': 'Add to Cart',
        'view-details': 'View Details',
        'buy-now-modal': 'Buy Now',
        
        // Заголовки секций
        'contact-title': 'Contact Us',
        'contact-subtitle': 'Have questions? We\'ll be happy to answer them!',
        'faq-title': 'Frequently Asked Questions',
        'faq-subtitle': 'Explore different purchase options and find answers to common questions',
        'features-title': 'Features',
        'features-subtitle': 'Discover the unique capabilities of Spoframe',
        'explore-more': 'Learn More',
        'order-now': 'Order Now',
        
        // Футер
        'footer-catalog': 'Catalog',
        'footer-details': 'Details',
        'footer-about': 'About Product'
    }
};

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

// Функция для применения переводов
function applyTranslations(language) {
    console.log('Applying translations for language:', language);
    
    if (!translations[language]) {
        console.error('Translations not found for language:', language);
        return;
    }
    
    // Находим все элементы с атрибутом data-lang
    const elements = document.querySelectorAll('[data-lang]');
    console.log('Found elements with data-lang:', elements.length);
    
    // Применяем переводы к каждому элементу
    elements.forEach(element => {
        const key = element.getAttribute('data-lang');
        if (translations[language][key]) {
            element.textContent = translations[language][key];
            console.log('Translated element:', key, 'to:', translations[language][key]);
        } else {
            console.warn('Translation missing for key:', key, 'in language:', language);
        }
    });

    // Также меняем все тексты в специфических элементах, как кнопки, заголовки и т.д.
    // Это для обратной совместимости с существующим кодом
    applySpecificTranslations(language);
}

// Функция для применения переводов к специфическим элементам
function applySpecificTranslations(language) {
    // Заголовки секций
    const featuresTitle = document.querySelector('.features h2');
    if (featuresTitle) {
        featuresTitle.textContent = translations[language]['features-title'] || featuresTitle.textContent;
    }
    
    const featuresSubtitle = document.querySelector('.features p.section-subtitle');
    if (featuresSubtitle) {
        featuresSubtitle.textContent = translations[language]['features-subtitle'] || featuresSubtitle.textContent;
    }
    
    // Кнопки
    const exploreBtn = document.querySelector('.btn-explore-features');
    if (exploreBtn) {
        exploreBtn.textContent = translations[language]['explore-more'] || exploreBtn.textContent;
    }
    
    const orderNowBtn = document.querySelector('#orderNowBtn');
    if (orderNowBtn) {
        orderNowBtn.textContent = translations[language]['order-now'] || orderNowBtn.textContent;
    }
}

// Инициализация переводов при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded - initializing language switcher');
    
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
    } else {
        console.warn('Language selector not found');
        // Всё равно применяем переводы, используя сохраненный язык или русский по умолчанию
        const currentLang = localStorage.getItem('language') || 'ru';
        applyTranslations(currentLang);
    }
});
