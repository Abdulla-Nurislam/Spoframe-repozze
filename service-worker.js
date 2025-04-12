const CACHE_NAME = 'spoframe-cache-v3';
const STATIC_CACHE = 'static-cache-v3';
const DYNAMIC_CACHE = 'dynamic-cache-v3';

// Расширенный список статических ресурсов
const STATIC_ASSETS = [
    // Основные страницы
    '/',
    '/Landing Page.html',
    '/Product Catalog.html',
    '/Product Detail.html',
    '/About Product.html',
    '/error-page.html',
    '/404.html',
    '/500.html',

    // CSS файлы
    '/susp.css',
    '/auth-modal.css',
    '/scroll-buttons.css',
    '/user-feedback.css',

    // JavaScript файлы
    '/main.js',
    '/auth-modal.js',
    '/scroll-buttons.js',
    '/language-switcher.js',
    '/product-modals.js',
    '/filters.js',
    '/user-feedback-native.js',

    // Изображения (основные)
    '/images/modern-frame.jpeg',
    '/images/silver-frame.png',
    '/images/black-frame.png',
    '/images/wood-frame.png',
    '/images/frame.jpg',
    '/SF.png',
    '/User_icon.jpg',

    // Локализация
    '/locales/en.json',
    '/locales/ru.json',

    // Шрифты (если есть)
    '/fonts/main-font.woff2',
    '/fonts/main-font.woff'
];

// Ресурсы для предварительного кэширования
const PRECACHE_ASSETS = [
    '/Landing Page.html',
    '/Product Catalog.html',
    '/susp.css',
    '/main.js',
    '/images/modern-frame.jpeg'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        Promise.all([
            // Кэширование статических ресурсов
            caches.open(STATIC_CACHE).then((cache) => {
                console.log('Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            }),
            // Предварительное кэширование
            caches.open(CACHE_NAME).then((cache) => {
                console.log('Precaching important assets');
                return cache.addAll(PRECACHE_ASSETS);
            })
        ])
    );
});

// Активация и очистка старых кэшей
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => {
                        return name.startsWith('spoframe-') &&
                               name !== CACHE_NAME &&
                               name !== STATIC_CACHE &&
                               name !== DYNAMIC_CACHE;
                    })
                    .map((name) => caches.delete(name))
            );
        })
    );
    return self.clients.claim();
});

// Стратегия кэширования
self.addEventListener('fetch', (event) => {
    // Стратегия для API запросов
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Кэшируем только успешные ответы
                    if (response.ok) {
                        const responseToCache = response.clone();
                        caches.open(DYNAMIC_CACHE)
                            .then(cache => cache.put(event.request, responseToCache));
                    }
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Стратегия для изображений (с lazy loading)
    if (event.request.destination === 'image') {
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    return response || fetch(event.request)
                        .then(fetchResponse => {
                            const responseToCache = fetchResponse.clone();
                            caches.open(DYNAMIC_CACHE)
                                .then(cache => cache.put(event.request, responseToCache));
                            return fetchResponse;
                        });
                })
        );
        return;
    }

    // Стандартная стратегия для остальных ресурсов
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request)
                    .then(fetchResponse => {
                        // Не кэшируем ответы с ошибками
                        if (!fetchResponse || fetchResponse.status !== 200) {
                            return fetchResponse;
                        }
                        const responseToCache = fetchResponse.clone();
                        caches.open(DYNAMIC_CACHE)
                            .then(cache => cache.put(event.request, responseToCache));
                        return fetchResponse;
                    });
            })
    );
});

// Периодическое обновление кэша
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'spoframe-sync') {
        event.waitUntil(
            caches.open(CACHE_NAME).then(cache => {
                return cache.addAll(PRECACHE_ASSETS);
            })
        );
    }
});