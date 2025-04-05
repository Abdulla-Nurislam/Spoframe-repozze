// Инициализация Google Analytics
export const initGoogleAnalytics = (measurementId) => {
  // Код инициализации GA4
};

// Инициализация Яндекс.Метрики
export const initYandexMetrika = (counterId) => {
  // Код инициализации Яндекс.Метрики
};

// Отслеживание просмотра страницы
export const trackPageView = (path) => {
  // Отправка события в GA4
  if (window.gtag) {
    window.gtag('config', process.env.REACT_APP_GA_MEASUREMENT_ID, {
      page_path: path
    });
  }

  // Отправка события в Яндекс.Метрику
  if (window.ym) {
    window.ym(process.env.REACT_APP_YM_COUNTER_ID, 'hit', path);
  }
};

// Отслеживание пользовательских событий
export const trackEvent = (category, action, label = null, value = null) => {
  // Отправка события в GA4
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    });
  }

  // Отправка события в Яндекс.Метрику
  if (window.ym) {
    window.ym(process.env.REACT_APP_YM_COUNTER_ID, 'reachGoal', action, {
      category: category,
      label: label,
      value: value
    });
  }
};

export default {
  initGoogleAnalytics,
  initYandexMetrika,
  trackPageView,
  trackEvent
}; 