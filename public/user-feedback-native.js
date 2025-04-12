/**
 * user-feedback-native.js
 * Нативная JavaScript реализация компонента обратной связи
 * без использования React
 */

// Данные для FAQ
const faqs = [
  {
    id: 1,
    question: 'Как подключить SpoFrame к моему аккаунту Spotify?',
    answer: 'Для подключения SpoFrame к Spotify, следуйте инструкции, которая идет в комплекте с устройством. В общих чертах: включите устройство, подключитесь к Wi-Fi, затем откройте приложение SpoFrame на смартфоне и следуйте инструкциям для авторизации вашего аккаунта Spotify.'
  },
  {
    id: 2,
    question: 'Могу ли я использовать SpoFrame с другими музыкальными сервисами, кроме Spotify?',
    answer: 'В настоящее время SpoFrame оптимизирован для работы со Spotify. Мы работаем над интеграцией с другими сервисами, такими как Apple Music и TIDAL, которые будут доступны в будущих обновлениях.'
  },
  {
    id: 3,
    question: 'Какой срок службы у SpoFrame?',
    answer: 'Срок службы устройства составляет не менее 5 лет при правильном использовании. Мы предоставляем гарантию 2 года на все модели SpoFrame.'
  },
  {
    id: 4,
    question: 'Можно ли использовать SpoFrame без подключения к интернету?',
    answer: 'SpoFrame требует подключения к интернету для получения данных о текущем воспроизведении из Spotify. Однако, в режиме офлайн рамка может отображать ранее загруженные обложки альбомов и информацию о треках из кеша.'
  },
  {
    id: 5,
    question: 'Какие способы оплаты вы принимаете?',
    answer: 'Мы принимаем оплату картами Visa, MasterCard, МИР, а также через системы Apple Pay, Google Pay и Samsung Pay. Кроме того, вы можете оплатить заказ через Сбербанк Онлайн или Тинькофф.'
  },
  {
    id: 6,
    question: 'Как долго осуществляется доставка?',
    answer: 'Доставка по Москве и Санкт-Петербургу занимает 1-2 рабочих дня. Доставка в другие города России — 3-7 рабочих дней в зависимости от региона. Международная доставка занимает 7-14 дней.'
  },
  {
    id: 7,
    question: 'Есть ли у вас программа лояльности?',
    answer: 'Да, у нас есть программа лояльности. За каждую покупку вы получаете бонусные баллы, которые можно использовать для скидки на следующие покупки. Также мы предлагаем специальные акции для постоянных клиентов.'
  }
];

// Примеры отзывов пользователей
const reviews = [
  {
    id: 1,
    name: 'Алексей',
    rating: 5,
    date: '15.03.2025',
    text: 'Отличная рамка! Интеграция со Spotify работает безупречно, дизайн минималистичный и стильный. Очень доволен покупкой!'
  },
  {
    id: 2,
    name: 'Мария',
    rating: 4,
    date: '10.03.2025',
    text: 'Хороший продукт, но хотелось бы больше вариантов цветов. В целом, качество изготовления на высоте.'
  },
  {
    id: 3,
    name: 'Дмитрий',
    rating: 5,
    date: '05.03.2025',
    text: 'Подарил жене на 8 марта, она в восторге! Особенно понравилась функция отображения текущего трека из Spotify.'
  },
  {
    id: 4,
    name: 'Елена',
    rating: 5,
    date: '01.03.2025',
    text: 'Прекрасное устройство! Очень стильно смотрится в интерьере, качество сборки отличное. Рекомендую всем любителям музыки.'
  },
  {
    id: 5,
    name: 'Игорь',
    rating: 4,
    date: '25.02.2025',
    text: 'Хорошее соотношение цены и качества. Интеграция со Spotify работает отлично, но хотелось бы поддержку других сервисов.'
  }
];

// Инициализация всех компонентов при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  initFeedbackForm();
  initFAQ();
  initReviews();
  initRatingSelector();
  initSupportChat();
  initNewsletterForm();
  initBuyButtons();
  initNavigation();
  initAnalytics();
});

// Инициализация формы обратной связи
function initFeedbackForm() {
  const feedbackForm = document.getElementById('feedback-form');
  const formStatus = document.getElementById('form-status');
  
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Сбор данных формы
      const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        subject: document.getElementById('subject').value,
        priority: document.getElementById('priority').value,
        message: document.getElementById('message').value
      };
      
      // Валидация данных формы
      if (!validateEmail(formData.email)) {
        formStatus.textContent = 'Пожалуйста, введите корректный email';
        formStatus.className = 'error-message';
        formStatus.style.display = 'block';
        return;
      }
      
      // Имитация отправки на сервер
      formStatus.textContent = 'Отправка...';
      formStatus.className = 'info-message';
      formStatus.style.display = 'block';
      
      // Имитация задержки сервера
      setTimeout(function() {
        console.log('Отправка обратной связи:', formData);
        
        // Очистка формы
        feedbackForm.reset();
        
        // Отображение успешного статуса
        formStatus.textContent = 'Сообщение успешно отправлено!';
        formStatus.className = 'success-message';
        
        // Скрытие статуса через 5 секунд
        setTimeout(function() {
          formStatus.style.display = 'none';
        }, 5000);
      }, 1000);
    });
  }
}

// Валидация email
function validateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

// Инициализация FAQ
function initFAQ() {
  const faqContainer = document.getElementById('faq-container');
  
  if (faqContainer) {
    // Очистка контейнера
    faqContainer.innerHTML = '';
    
    // Добавление FAQ элементов
    faqs.forEach(faq => {
      const faqItem = document.createElement('div');
      faqItem.className = 'faq-item';
      
      const question = document.createElement('div');
      question.className = 'faq-question';
      question.textContent = faq.question;
      
      const answer = document.createElement('div');
      answer.className = 'faq-answer';
      answer.textContent = faq.answer;
      answer.style.display = 'none';
      
      // Обработчик клика для раскрытия/скрытия ответа
      question.addEventListener('click', function() {
        const isOpen = answer.style.display !== 'none';
        answer.style.display = isOpen ? 'none' : 'block';
        question.classList.toggle('active', !isOpen);
      });
      
      faqItem.appendChild(question);
      faqItem.appendChild(answer);
      faqContainer.appendChild(faqItem);
    });
  }
}

// Инициализация отзывов
function initReviews() {
  const reviewsContainer = document.getElementById('reviews-container');
  
  if (reviewsContainer) {
    // Очистка контейнера
    reviewsContainer.innerHTML = '';
    
    // Добавление отзывов
    reviews.forEach(review => {
      const reviewItem = document.createElement('div');
      reviewItem.className = 'review-item';
      
      const reviewHeader = document.createElement('div');
      reviewHeader.className = 'review-header';
      
      const reviewName = document.createElement('span');
      reviewName.className = 'review-name';
      reviewName.textContent = review.name;
      
      const reviewDate = document.createElement('span');
      reviewDate.className = 'review-date';
      reviewDate.textContent = review.date;
      
      const reviewRating = document.createElement('div');
      reviewRating.className = 'review-rating';
      reviewRating.innerHTML = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
      
      const reviewText = document.createElement('div');
      reviewText.className = 'review-text';
      reviewText.textContent = review.text;
      
      reviewHeader.appendChild(reviewName);
      reviewHeader.appendChild(reviewDate);
      
      reviewItem.appendChild(reviewHeader);
      reviewItem.appendChild(reviewRating);
      reviewItem.appendChild(reviewText);
      
      reviewsContainer.appendChild(reviewItem);
    });
  }
  
  // Инициализация формы отзывов
  const reviewForm = document.getElementById('review-form');
  
  if (reviewForm) {
    reviewForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const reviewData = {
        name: document.getElementById('review-name').value,
        rating: parseInt(document.getElementById('review-rating').value) || 5,
        text: document.getElementById('review-text').value,
        date: new Date().toLocaleDateString('ru-RU')
      };
      
      console.log('Новый отзыв:', reviewData);
      
      // Добавление нового отзыва в начало списка
      const reviewItem = document.createElement('div');
      reviewItem.className = 'review-item new-review';
      
      const reviewHeader = document.createElement('div');
      reviewHeader.className = 'review-header';
      
      const reviewName = document.createElement('span');
      reviewName.className = 'review-name';
      reviewName.textContent = reviewData.name;
      
      const reviewDate = document.createElement('span');
      reviewDate.className = 'review-date';
      reviewDate.textContent = reviewData.date;
      
      const reviewRating = document.createElement('div');
      reviewRating.className = 'review-rating';
      reviewRating.innerHTML = '★'.repeat(reviewData.rating) + '☆'.repeat(5 - reviewData.rating);
      
      const reviewText = document.createElement('div');
      reviewText.className = 'review-text';
      reviewText.textContent = reviewData.text;
      
      reviewHeader.appendChild(reviewName);
      reviewHeader.appendChild(reviewDate);
      
      reviewItem.appendChild(reviewHeader);
      reviewItem.appendChild(reviewRating);
      reviewItem.appendChild(reviewText);
      
      // Добавление в начало списка
      reviewsContainer.insertBefore(reviewItem, reviewsContainer.firstChild);
      
      // Очистка формы
      reviewForm.reset();
      document.getElementById('review-rating').value = '0';
      
      // Сброс выбора звезд
      const stars = document.querySelectorAll('.star');
      stars.forEach(star => star.classList.remove('active'));
      
      // Показать уведомление о успешной отправке
      const notification = document.createElement('div');
      notification.className = 'success-message';
      notification.textContent = 'Спасибо за ваш отзыв!';
      reviewForm.appendChild(notification);
      
      // Удаление уведомления через 3 секунды
      setTimeout(() => {
        notification.remove();
      }, 3000);
    });
  }
}

// Инициализация селектора рейтинга (звезды)
function initRatingSelector() {
  const ratingSelector = document.getElementById('rating-selector');
  const ratingInput = document.getElementById('review-rating');
  
  if (ratingSelector && ratingInput) {
    const stars = ratingSelector.querySelectorAll('.star');
    
    stars.forEach(star => {
      star.addEventListener('click', function() {
        const value = parseInt(this.getAttribute('data-value'));
        ratingInput.value = value;
        
        // Обновление активных звезд
        stars.forEach(s => {
          const starValue = parseInt(s.getAttribute('data-value'));
          s.classList.toggle('active', starValue <= value);
        });
      });
      
      // Эффект при наведении
      star.addEventListener('mouseover', function() {
        const value = parseInt(this.getAttribute('data-value'));
        
        stars.forEach(s => {
          const starValue = parseInt(s.getAttribute('data-value'));
          s.classList.toggle('hover', starValue <= value);
        });
      });
      
      star.addEventListener('mouseout', function() {
        stars.forEach(s => s.classList.remove('hover'));
      });
    });
  }
}

// Инициализация чата поддержки
function initSupportChat() {
  const chatToggle = document.getElementById('chat-toggle');
  const chatContainer = document.getElementById('chat-container');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');
  
  if (chatToggle && chatContainer) {
    // Переключение видимости чата
    chatToggle.addEventListener('click', function() {
      const isVisible = chatContainer.style.display !== 'none';
      chatContainer.style.display = isVisible ? 'none' : 'flex';
      
      // Если открываем чат, добавляем приветственное сообщение
      if (!isVisible && chatMessages.children.length === 0) {
        addChatMessage('Здравствуйте! Чем я могу вам помочь?', 'support');
      }
    });
  }
  
  if (chatForm && chatInput && chatMessages) {
    // Обработка отправки сообщения
    chatForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const messageText = chatInput.value.trim();
      if (!messageText) return;
      
      // Добавление сообщения пользователя
      addChatMessage(messageText, 'user');
      chatInput.value = '';
      
      // Имитация ответа поддержки
      setTimeout(function() {
        let response = 'Спасибо за ваше сообщение! Наш специалист ответит вам в ближайшее время.';
        
        // Простые ответы на типичные вопросы
        if (messageText.toLowerCase().includes('доставк')) {
          response = 'Доставка осуществляется в течение 3-5 рабочих дней по всей России. Для международной доставки срок составляет 7-14 дней.';
        } else if (messageText.toLowerCase().includes('оплат')) {
          response = 'Мы принимаем оплату картами Visa, MasterCard, МИР, а также через системы Apple Pay, Google Pay и Samsung Pay.';
        } else if (messageText.toLowerCase().includes('возврат')) {
          response = 'Вы можете вернуть товар в течение 14 дней с момента получения, если он не был в использовании и сохранены все комплектующие и упаковка.';
        } else if (messageText.toLowerCase().includes('купить') || messageText.toLowerCase().includes('заказать')) {
          response = 'Вы можете оформить заказ на нашем сайте, выбрав подходящую модель SpoFrame. В настоящее время доступны модели Black Edition и Silver Edition.';
        } else if (messageText.toLowerCase().includes('скидк') || messageText.toLowerCase().includes('акци')) {
          response = 'Сейчас у нас действует акция: при покупке двух устройств SpoFrame вы получаете скидку 10%. Также у нас есть программа лояльности для постоянных клиентов.';
        }
        
        addChatMessage(response, 'support');
      }, 1000);
    });
  }
  
  // Функция добавления сообщения в чат
  function addChatMessage(text, sender) {
    const message = document.createElement('div');
    message.className = `message ${sender}`;
    message.textContent = text;
    
    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

// Инициализация формы подписки на новости
function initNewsletterForm() {
  const newsletterForm = document.getElementById('newsletter-form');
  const newsletterStatus = document.getElementById('newsletter-status');
  
  if (newsletterForm && newsletterStatus) {
    newsletterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const email = document.getElementById('newsletter-email').value;
      
      // Валидация email
      if (!validateEmail(email)) {
        newsletterStatus.textContent = 'Пожалуйста, введите корректный email';
        newsletterStatus.className = 'error-message';
        newsletterStatus.style.display = 'block';
        return;
      }
      
      // Имитация отправки на сервер
      newsletterStatus.textContent = 'Отправка...';
      newsletterStatus.className = 'info-message';
      newsletterStatus.style.display = 'block';
      
      // Имитация задержки сервера
      setTimeout(function() {
        console.log('Подписка на новости:', email);
        
        // Очистка формы
        newsletterForm.reset();
        
        // Отображение успешного статуса
        newsletterStatus.textContent = 'Вы успешно подписались на новости!';
        newsletterStatus.className = 'success-message';
        
        // Скрытие статуса через 5 секунд
        setTimeout(function() {// При ошибке запроса к API
        fetch('/api/data')
          .then(response => {
            if (!response.ok) {
              handleError(response.status, 'Ошибка API', 'Не удалось получить данные');
              return;
            }
            // Обработка успешного ответа
          })
          .catch(error => {
            handleError(520, 'Ошибка сети', error.message);
          });// Вызовите эту функцию для тестирования
          simulateError('timeout'); // Симуляция ошибки тайм-аута (код 524)
          newsletterStatus.style.display = 'none';
        }, 5000);
      }, 1000);
    });
  }
}

// Инициализация кнопок "Купить"
function initBuyButtons() {
  const buyButtons = document.querySelectorAll('.buy-now-button, .cta-button, .buy-button');
  
  buyButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      // Здесь можно добавить логику перед переходом на страницу оформления заказа
      console.log('Клик по кнопке "Купить"');
      
      // Отслеживание события для аналитики
      trackEvent('button_click', {
        button_type: 'buy',
        button_text: button.textContent,
        page: window.location.pathname
      });
    });
  });
}

// Инициализация навигации
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-links a');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      // Отслеживание навигации для аналитики
      trackEvent('navigation', {
        link_text: link.textContent,
        link_url: link.getAttribute('href'),
        from_page: window.location.pathname
      });
    });
  });
}

// Инициализация аналитики
function initAnalytics() {
  // Отслеживание загрузки страницы
  trackEvent('page_view', {
    page: window.location.pathname,
    referrer: document.referrer
  });
  
  // Отслеживание времени на странице
  let startTime = new Date();
  window.addEventListener('beforeunload', function() {
    const timeSpent = Math.round((new Date() - startTime) / 1000);
    trackEvent('page_exit', {
      page: window.location.pathname,
      time_spent: timeSpent
    });
  });
}

// Функция для отслеживания событий (имитация отправки в аналитику)
function trackEvent(eventName, eventData) {
  console.log(`Аналитика: ${eventName}`, eventData);
  // В реальном проекте здесь был бы код отправки данных в Google Analytics, Яндекс.Метрику и т.д.
}

// Функция для валидации email
function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

// Функция для обработки ошибок и перенаправления на страницу ошибки
function handleError(errorCode, errorMessage, errorDetails) {
  // Логирование ошибки в консоль
  console.error(`Ошибка ${errorCode}: ${errorMessage}`);
  
  // Создание URL для страницы ошибки с параметрами
  const errorUrl = new URL('error-page.html', window.location.origin);
  errorUrl.searchParams.append('code', errorCode);
  errorUrl.searchParams.append('message', errorMessage);
  
  if (errorDetails) {
    errorUrl.searchParams.append('details', errorDetails);
  }
  
  // Перенаправление на страницу ошибки
  window.location.href = errorUrl.toString();
}

// Пример использования функции обработки ошибок
function simulateError(type) {
  switch(type) {
    case 'timeout':
      handleError(524, 'Превышено время ожидания', 'Сервер не ответил в течение отведенного времени. Пожалуйста, проверьте ваше соединение или попробуйте позже.');
      break;
    case 'server':
      handleError(500, 'Внутренняя ошибка сервера', 'На сервере произошла непредвиденная ошибка. Наша команда уже работает над её устранением.');
      break;
    case 'not_found':
      handleError(404, 'Страница не найдена', 'Запрашиваемая страница не существует или была перемещена.');
      break;
    case 'access_denied':
      handleError(403, 'Доступ запрещен', 'У вас нет прав доступа к запрашиваемому ресурсу.');
      break;
    default:
      handleError(520, 'Неизвестная ошибка', 'Произошла неизвестная ошибка. Пожалуйста, попробуйте позже.');
  }
}

// Глобальный обработчик необработанных ошибок
window.addEventListener('error', function(event) {
  handleError(
    500, 
    'Произошла ошибка JavaScript', 
    `Необработанная ошибка: ${event.message} в ${event.filename} (строка ${event.lineno}, колонка ${event.colno})`
  );
  // Предотвращаем стандартное поведение браузера
  event.preventDefault();
});

// Глобальный обработчик ошибок fetch запросов
window.addEventListener('unhandledrejection', function(event) {
  if (event.reason && event.reason.name === 'FetchError') {
    handleError(
      520, 
      'Ошибка сетевого запроса', 
      'Не удалось выполнить запрос к серверу. Пожалуйста, проверьте ваше соединение.'
    );
  } else {
    handleError(
      500, 
      'Необработанная ошибка Promise', 
      event.reason ? event.reason.toString() : 'Неизвестная ошибка Promise'
    );
  }
  // Предотвращаем стандартное поведение браузера
  event.preventDefault();
});