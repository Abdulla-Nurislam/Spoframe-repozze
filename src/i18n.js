/**
 * Модуль для интернационализации приложения
 * Поддерживает русский и английский языки
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Тексты на разных языках
const resources = {
  ru: {
    translation: {
      common: {
        loading: 'Загрузка...',
        close: 'Закрыть',
        error: 'Ошибка'
      },
      nav: {
        home: 'Главная',
        catalog: 'Каталог',
        about: 'О продукте',
        login: 'Войти'
      },
      footer: {
        description: 'Spoframe - цифровые рамки с интеграцией Spotify для отображения вашей музыки и фотографий.',
        navigation: 'Навигация',
        legal: 'Информация',
        terms: 'Условия использования',
        privacy: 'Политика конфиденциальности',
        refund: 'Условия возврата',
        contact: 'Контакты',
        address: 'Москва, ул. Пушкина, 10',
        rights: 'Все права защищены',
        quickLinks: 'Быстрые ссылки',
        language: 'Язык',
        about: 'О нас',
        learnMore: 'Узнать больше',
        copyright: '© 2025 Все права защищены'
      },
      auth: {
        login: 'Вход',
        register: 'Регистрация',
        email: 'Email',
        password: 'Пароль',
        confirmPassword: 'Подтвердите пароль',
        username: 'Имя пользователя',
        emailPlaceholder: 'Введите ваш email',
        passwordPlaceholder: 'Введите пароль',
        confirmPasswordPlaceholder: 'Повторите пароль',
        usernamePlaceholder: 'Введите имя пользователя',
        loginButton: 'Войти',
        registerButton: 'Зарегистрироваться',
        noAccount: 'Еще нет аккаунта? ',
        hasAccount: 'Уже есть аккаунт? ',
        loginLink: 'Войти',
        registerLink: 'Зарегистрироваться',
        loginSuccess: 'Вход выполнен успешно!',
        registerSuccess: 'Регистрация успешна!',
        errors: {
          fillFields: 'Пожалуйста, заполните все обязательные поля',
          passwordsMismatch: 'Пароли не совпадают',
          generic: 'Произошла ошибка, попробуйте позже'
        }
      },
      home: {
        frames: 'Рамки',
        orderNow: 'ЗАКАЗАТЬ СЕЙЧАС',
        features: 'Особенности',
        featuresSubtitle: 'Откройте для себя уникальные возможности Spoframe',
        more: 'Подробнее',
        design: {
          title: 'Стильный Дизайн',
          category: 'Дизайн',
          description: 'Элегантные рамки, которые дополняют любой интерьер, добавляя нотку изысканности вашему пространству.'
        },
        integration: {
          title: 'Интеграция со Spotify',
          category: 'Интеграция',
          description: 'Легко подключайтесь к Spotify для отображения обложек альбомов, плейлистов и многого другого прямо на вашей рамке.'
        },
        display: {
          title: 'Настраиваемость Дисплея',
          category: 'Доступность',
          description: 'Доступны режимы слайд-шоу и статичного изображения. Настраивайте источники контента, частоту смены кадров и яркость дисплея под свои предпочтения.'
        }
      },
      landing: {
        frames: 'Рамки',
        orderNow: 'ЗАКАЗАТЬ СЕЙЧАС',
        features: 'Особенности',
        featuresSubtitle: 'Откройте для себя уникальные возможности Spoframe',
        learnMore: 'Подробнее',
        contactUs: 'Связаться с нами',
        contactSubtitle: 'Есть вопросы? Мы с радостью на них ответим!',
        yourName: 'Ваше имя',
        enterName: 'Введите ваше имя',
        enterEmail: 'Введите ваш email',
        subject: 'Тема',
        enterSubject: 'Тема сообщения',
        message: 'Сообщение',
        enterMessage: 'Введите ваше сообщение',
        sendMessage: 'Отправить сообщение',
        stylishDesign: 'Стильный Дизайн',
        design: 'Дизайн',
        designDescription: 'Элегантные рамки, которые дополняют любой интерьер, добавляя нотку изысканности вашему пространству.',
        spotifyIntegration: 'Интеграция со Spotify',
        integration: 'Интеграция',
        integrationDescription: 'Легко подключайтесь к Spotify для отображения обложек альбомов, плейлистов и многого другого прямо на вашей рамке.',
        customDisplay: 'Настраиваемость Дисплея',
        accessibility: 'Доступность',
        accessibilityDescription: 'Доступны режимы слайд-шоу и статичного изображения. Настраивайте источники контента, частоту смены кадров и яркость дисплея под свои предпочтения.'
      },
      contact: {
        title: 'Связаться с нами',
        subtitle: 'Есть вопросы? Мы с радостью на них ответим!',
        name: 'Ваше имя',
        email: 'Email',
        subject: 'Тема',
        message: 'Сообщение',
        namePlaceholder: 'Введите ваше имя',
        emailPlaceholder: 'Введите ваш email',
        subjectPlaceholder: 'Тема сообщения',
        messagePlaceholder: 'Введите ваше сообщение',
        send: 'Отправить сообщение',
        thankYou: 'Спасибо за ваше сообщение!',
        willContactSoon: 'Мы свяжемся с вами в ближайшее время.'
      },
      catalog: {
        title: 'Каталог рамок',
        details: 'Подробнее',
        buy: 'Купить сейчас',
        comingSoon: 'Скоро в продаже',
        filters: {
          style: 'Стиль',
          modern: 'Современный',
          traditional: 'Традиционный',
          rustic: 'Рустикальный',
          function: 'Функционал',
          decorative: 'Декоративный',
          collection: 'Коллекционный'
        }
      },
      product: {
        overview: 'Обзор продукта',
        buy: 'Купить',
        notFound: 'Продукт не найден',
        testimonials: {
          title: 'Отзывы наших покупателей'
        },
        faq: {
          title: 'Часто задаваемые вопросы',
          description: 'Изучите различные варианты покупки и найдите ответы на распространенные вопросы.'
        }
      },
      development: {
        title: 'Страница в разработке',
        message: 'Мы усердно работаем над созданием удобной системы оплаты и оформления заказов',
        back: 'Вернуться назад'
      },
      profile: {
        title: 'Профиль',
        personalInfo: 'Личная информация',
        username: 'Имя пользователя',
        email: 'Email',
        editProfile: 'Редактировать профиль',
        orders: {
          title: 'История заказов',
          id: 'ID заказа',
          date: 'Дата',
          status: 'Статус',
          amount: 'Сумма',
          noOrders: 'У вас пока нет заказов'
        }
      },
      notFound: {
        title: 'Страница не найдена',
        message: 'Извините, запрашиваемая страница не существует.',
        backHome: 'Вернуться на главную'
      },
      about: {
        title: 'О продукте',
        subtitle: 'Узнайте больше о цифровых рамках Spoframe и их возможностях',
        features: {
          title: 'Ключевые особенности',
          description: 'Наши рамки предлагают уникальные возможности для визуализации вашей музыкальной истории',
          item1: 'Интеграция со Spotify',
          item2: 'Высококачественный дисплей',
          item3: 'Удаленное управление через приложение'
        },
        technology: {
          title: 'Технологии',
          description: 'В наших устройствах используются самые современные технологии для обеспечения наилучшего опыта.'
        },
        usage: {
          title: 'Как использовать',
          description: 'Подключите рамку к Wi-Fi, авторизуйтесь в Spotify и начните наслаждаться визуализацией вашей музыки.'
        },
        welcome: 'Добро пожаловать в Spoframe'
      }
    }
  },
  en: {
    translation: {
      common: {
        loading: 'Loading...',
        close: 'Close',
        error: 'Error'
      },
      nav: {
        home: 'Home',
        catalog: 'Catalog',
        about: 'About',
        login: 'Login'
      },
      footer: {
        description: 'Spoframe - digital frames with Spotify integration to display your music and photos.',
        navigation: 'Navigation',
        legal: 'Legal',
        terms: 'Terms of Service',
        privacy: 'Privacy Policy',
        refund: 'Refund Policy',
        contact: 'Contact Us',
        address: 'Moscow, Pushkin St, 10',
        rights: 'All rights reserved',
        quickLinks: 'Quick Links',
        language: 'Language',
        about: 'About Us',
        learnMore: 'Learn More',
        copyright: '© 2025 All rights reserved'
      },
      auth: {
        login: 'Login',
        register: 'Register',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        username: 'Username',
        emailPlaceholder: 'Enter your email',
        passwordPlaceholder: 'Enter password',
        confirmPasswordPlaceholder: 'Repeat password',
        usernamePlaceholder: 'Enter username',
        loginButton: 'Login',
        registerButton: 'Register',
        noAccount: 'Don\'t have an account? ',
        hasAccount: 'Already have an account? ',
        loginLink: 'Login',
        registerLink: 'Register',
        loginSuccess: 'Login successful!',
        registerSuccess: 'Registration successful!',
        errors: {
          fillFields: 'Please fill in all required fields',
          passwordsMismatch: 'Passwords do not match',
          generic: 'An error occurred, please try again later'
        }
      },
      home: {
        frames: 'Frames',
        orderNow: 'ORDER NOW',
        features: 'Features',
        featuresSubtitle: 'Discover unique Spoframe capabilities',
        more: 'Learn More',
        design: {
          title: 'Stylish Design',
          category: 'Design',
          description: 'Elegant frames that complement any interior, adding a touch of sophistication to your space.'
        },
        integration: {
          title: 'Spotify Integration',
          category: 'Integration',
          description: 'Easily connect to Spotify to display album covers, playlists, and more right on your frame.'
        },
        display: {
          title: 'Customizable Display',
          category: 'Accessibility',
          description: 'Slideshow and static image modes available. Customize content sources, frame rate, and display brightness to your preferences.'
        }
      },
      landing: {
        frames: 'Frames',
        orderNow: 'ORDER NOW',
        features: 'Features',
        featuresSubtitle: 'Discover unique Spoframe capabilities',
        learnMore: 'Learn More',
        contactUs: 'Contact Us',
        contactSubtitle: 'Have questions? We\'d be happy to answer!',
        yourName: 'Your Name',
        enterName: 'Enter your name',
        enterEmail: 'Enter your email',
        subject: 'Subject',
        enterSubject: 'Enter subject',
        message: 'Message',
        enterMessage: 'Enter your message',
        sendMessage: 'Send Message',
        stylishDesign: 'Stylish Design',
        design: 'Design',
        designDescription: 'Elegant frames that complement any interior, adding a touch of sophistication to your space.',
        spotifyIntegration: 'Spotify Integration',
        integration: 'Integration',
        integrationDescription: 'Easily connect to Spotify to display album covers, playlists, and more right on your frame.',
        customDisplay: 'Customizable Display',
        accessibility: 'Accessibility',
        accessibilityDescription: 'Slideshow and static image modes available. Customize content sources, frame rate, and display brightness to your preferences.'
      },
      contact: {
        title: 'Contact Us',
        subtitle: 'Have questions? We\'d be happy to answer!',
        name: 'Your Name',
        email: 'Email',
        subject: 'Subject',
        message: 'Message',
        namePlaceholder: 'Enter your name',
        emailPlaceholder: 'Enter your email',
        subjectPlaceholder: 'Message subject',
        messagePlaceholder: 'Enter your message',
        send: 'Send Message',
        thankYou: 'Thank you for your message!',
        willContactSoon: 'We will contact you soon.'
      },
      catalog: {
        title: 'Frame Catalog',
        details: 'View Details',
        buy: 'Buy Now',
        comingSoon: 'Coming Soon',
        filters: {
          style: 'Style',
          modern: 'Modern',
          traditional: 'Traditional',
          rustic: 'Rustic',
          function: 'Function',
          decorative: 'Decorative',
          collection: 'Collection'
        }
      },
      product: {
        overview: 'Product Overview',
        buy: 'Buy',
        notFound: 'Product not found',
        testimonials: {
          title: 'Customer Reviews'
        },
        faq: {
          title: 'Frequently Asked Questions',
          description: 'Explore various purchasing options and find answers to common questions.'
        }
      },
      development: {
        title: 'Page Under Development',
        message: 'We are working hard to create a convenient payment and ordering system',
        back: 'Go Back'
      },
      profile: {
        title: 'Profile',
        personalInfo: 'Personal Information',
        username: 'Username',
        email: 'Email',
        editProfile: 'Edit Profile',
        orders: {
          title: 'Order History',
          id: 'Order ID',
          date: 'Date',
          status: 'Status',
          amount: 'Amount',
          noOrders: 'You don\'t have any orders yet'
        }
      },
      notFound: {
        title: 'Page Not Found',
        message: 'Sorry, the page you are looking for does not exist.',
        backHome: 'Back to Home'
      },
      about: {
        title: 'About the Product',
        subtitle: 'Learn more about Spoframe digital frames and their capabilities',
        features: {
          title: 'Key Features',
          description: 'Our frames offer unique capabilities for visualizing your music history',
          item1: 'Spotify Integration',
          item2: 'High-quality display',
          item3: 'Remote control via app'
        },
        technology: {
          title: 'Technology',
          description: 'Our devices use the most advanced technologies to provide the best experience.'
        },
        usage: {
          title: 'How to Use',
          description: 'Connect the frame to Wi-Fi, authenticate with Spotify, and start enjoying the visualization of your music.'
        },
        welcome: 'Welcome to Spoframe'
      }
    }
  }
};

// Настройка i18n
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    fallbackLng: 'ru',
    supportedLngs: ['ru', 'en', 'es', 'fr', 'de'],
    ns: ['translation'],
    defaultNS: 'translation',
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: true,
    },
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator'],
      caches: ['localStorage', 'cookie'],
    },
    resources
  }).then(() => {
    console.log('i18next initialized successfully');
    console.log('Current language:', i18n.language);
    console.log('Available languages:', i18n.languages);
  }).catch((error) => {
    console.error('Error initializing i18next:', error);
  });

// Добавляем обработчик изменения языка
i18n.on('languageChanged', (lng) => {
  console.log('Language changed to:', lng);
  document.documentElement.lang = lng;
});

export default i18n;

// Вспомогательная функция для получения перевода в компонентах
i18n.getTranslation = function(locale, key, options = {}) {
    const oldLocale = i18n.getLocale();
    i18n.setLocale(locale);
    const translation = i18n.__(key, options);
    i18n.setLocale(oldLocale);
    return translation;
};

// Функция для получения всех переводов для клиентской части
i18n.getAllTranslations = function(locale) {
    const oldLocale = i18n.getLocale();
    i18n.setLocale(locale);
    
    const translations = {
        navigation: i18n.__('navigation'),
        auth: i18n.__('auth'),
        hero: i18n.__('hero'),
        features: i18n.__('features'),
        contact: i18n.__('contact'),
        footer: i18n.__('footer'),
        errors: i18n.__('errors')
    };
    
    i18n.setLocale(oldLocale);
    return translations;
}; 