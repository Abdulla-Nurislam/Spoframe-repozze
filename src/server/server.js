const express = require('express');
const path = require('path');
const i18next = require('i18next');
const i18nextMiddleware = require('i18next-http-middleware');
const Backend = require('i18next-fs-backend');

// Инициализация i18next
i18next
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    backend: {
      loadPath: path.join(__dirname, '../../src/locales/{{lng}}/{{ns}}.json'),
    },
    fallbackLng: 'ru',
    preload: ['en', 'ru'],
    supportedLngs: ['en', 'ru']
  });

const app = express();
const PORT = 8080;

// Базовые middleware
app.use(express.json());
app.use(i18nextMiddleware.handle(i18next));

// Проверка здоровья API
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: req.t('health.ok') });
});

// Статические файлы
app.use(express.static(path.join(__dirname, '../../dist')));

// Все остальные маршруты
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../views/index.html'));
});

// Запуск сервера
app.listen(PORT, '127.0.0.1', () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});