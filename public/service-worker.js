const CACHE_NAME = 'spoframe-cache-v2';
const STATIC_ASSETS = [
  '/',
  '/Landing Page.html',
  '/Product Catalog.html',
  '/Product Detail.html',
  '/About Product.html',
  '/catalog',
  '/catalog/',
  '/product',
  '/product/',
  '/about',
  '/about/',
  '/development-page',
  '/development-page/',
  '/susp.css',
  '/main.js',
  '/auth-modal.js',
  '/auth-modal.css',
  '/scroll-buttons.css',
  '/scroll-buttons.js',
  '/language-switcher.js',
  '/images/modern-frame.jpeg',
  '/images/silver-frame.png',
  '/images/black-frame.png',
  '/images/wood-frame.png',
  '/images/frame.jpg',
  '/SF.png',
  '/silver-frame.png',
  '/black-frame.png',
  '/wood-frame.png',
  '/frame.jpg'
];

// Установка Service Worker и кэширование статических ресурсов
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
  );
});

// Активация Service Worker и удаление старых кэшей
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  // Немедленно активируем сервис-воркер без ожидания обновления страницы
  return self.clients.claim();
});

// Стратегия кэширования: сначала кэш, потом сеть
self.addEventListener('fetch', (event) => {
  // Обрабатываем маршруты для страниц каталога, продукта и т.д.
  const catalogRegex = /^https?:\/\/[^\/]+\/catalog\/?$/;
  const productRegex = /^https?:\/\/[^\/]+\/product\/?$/;
  const aboutRegex = /^https?:\/\/[^\/]+\/about\/?$/;
  const developmentRegex = /^https?:\/\/[^\/]+\/development-page\/?$/;
  
  // Если запрос соответствует одному из наших маршрутов
  if (catalogRegex.test(event.request.url) || 
      productRegex.test(event.request.url) || 
      aboutRegex.test(event.request.url) || 
      developmentRegex.test(event.request.url)) {
    // Стандартная стратегия кэширования для маршрутов
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request);
        })
    );
    return;
  }
  
  // Для остальных запросов используем обычную стратегию
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return response;
          });
      })
  );
}); 