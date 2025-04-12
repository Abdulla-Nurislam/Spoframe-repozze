// Инициализация Google Analytics
export const initGoogleAnalytics = () => {
  if (typeof window !== 'undefined') {
    // Добавляем скрипт Google Analytics
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.REACT_APP_GA_TRACKING_ID || 'G-EXAMPLE'}`;
    document.head.appendChild(script);

    // Инициализируем Google Analytics
    window.dataLayer = window.dataLayer || [];
    // Безопасная функция для аргументов
    function gtag() {
      const args = Array.prototype.slice.call(arguments);
      window.dataLayer.push(args);
    }
    gtag('js', new Date());
    gtag('config', process.env.REACT_APP_GA_TRACKING_ID || 'G-EXAMPLE');

    // Экспортируем функцию для отслеживания событий
    window.trackEvent = (category, action, label, value) => {
      if (window.gtag) {
        window.gtag('event', action, {
          event_category: category,
          event_label: label,
          value: value
        });
      }
    };
  }
};

// Инициализация Яндекс.Метрики
export const initYandexMetrika = () => {
  if (typeof window !== 'undefined') {
    // Добавляем скрипт Яндекс.Метрики
    (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();
    for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
    k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
    (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

    ym(process.env.REACT_APP_YM_TRACKING_ID || '12345678', "init", {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: true
    });

    // Экспортируем функцию для отслеживания целей
    window.trackYandexGoal = (target, params) => {
      if (window.ym) {
        window.ym(process.env.REACT_APP_YM_TRACKING_ID || '12345678', 'reachGoal', target, params);
      }
    };
  }
};

// Функция для отслеживания просмотра страницы
export const trackPageView = (path) => {
  if (typeof window !== 'undefined') {
    // Google Analytics
    if (window.gtag) {
      window.gtag('config', process.env.REACT_APP_GA_TRACKING_ID || 'G-EXAMPLE', {
        page_path: path
      });
    }

    // Яндекс.Метрика
    if (window.ym) {
      window.ym(process.env.REACT_APP_YM_TRACKING_ID || '12345678', 'hit', path);
    }
  }
};

// Инициализируем аналитику только на клиенте
export const initAnalytics = () => {
  if (typeof window !== 'undefined') {
    initGoogleAnalytics();
    initYandexMetrika();
  }
};

// Экспортируем объект с функциями для использования в компонентах
const analytics = {
  trackEvent: (category, action, label, value) => {
    if (typeof window !== 'undefined' && window.trackEvent) {
      window.trackEvent(category, action, label, value);
    }
  },
  trackYandexGoal: (target, params) => {
    if (typeof window !== 'undefined' && window.trackYandexGoal) {
      window.trackYandexGoal(target, params);
    }
  },
  trackPageView,
  init: initAnalytics
};

export default analytics; 