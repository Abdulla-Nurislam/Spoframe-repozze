# Spoframe

Веб-приложение для управления цифровыми рамками с интеграцией Spotify.

## Деплой на Vercel

Для успешного деплоя на Vercel необходимо:

1. Создать проект на Vercel и связать его с репозиторием GitHub
2. Настроить следующие переменные окружения в настройках проекта на Vercel:
   - `POSTGRES_URL` - URL-адрес PostgreSQL базы данных (можно использовать встроенную Vercel PostgreSQL)
   - `JWT_SECRET` - секретный ключ для JWT токенов
   - `NODE_ENV` - должен быть установлен как `production`
   - `DB_MODE` - должен быть установлен как `cloud`

### Важные замечания:

- В production режиме приложение всегда использует PostgreSQL, а не SQLite
- Убедитесь, что БД PostgreSQL правильно настроена и доступна
- Для локальной разработки можно использовать SQLite, но для продакшен только PostgreSQL

## Локальная разработка

1. Клонируйте репозиторий: `git clone https://github.com/Abdulla-Nurislam/Spoframe-repozze.git`
2. Установите зависимости: `npm install`
3. Создайте файл `.env` на основе `.env.example`
4. Запустите приложение в режиме разработки: `npm run dev`

## Технологии

- Frontend: React
- Backend: Express.js
- База данных: PostgreSQL (production) / SQLite (development)
- Авторизация: JWT
- Деплой: Vercel

## Prerequisites

- Node.js 16.x or higher
- MongoDB Atlas account or local MongoDB installation
- Gmail account (for email notifications)
- Stripe account (for payments)

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/spoframe.git
cd spoframe
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
- `JWT_SECRET`: A secure random string for JWT token generation
- `EMAIL_USER`: Your Gmail address
- `EMAIL_PASS`: Your Gmail app-specific password (generate from Google Account settings)
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `MONGODB_URI`: Your MongoDB connection string
- `NODE_ENV`: Set to "development" or "production"
- `PORT`: (Optional) Server port number, defaults to 3000

## MongoDB Setup

1. Create a MongoDB Atlas account or use a local MongoDB installation
2. Create a new cluster and database
3. Get your connection string and add it to `MONGODB_URI` in `.env`

## Development

Run the development server:
```bash
npm run dev
```

## Production

Build and start the production server:
```bash
npm run build
npm start
```

## Deployment

The application is configured for deployment on Vercel:

```bash
vercel --prod
```

Make sure to add all environment variables in your Vercel project settings.

## Features

- User authentication with JWT
- Email notifications
- Payment processing with Stripe
- MongoDB database integration
- Responsive design
- Multi-language support

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Используемые технологии

### Frontend
- JavaScript/HTML5/CSS3
- SASS
- TailwindCSS
- Анимационные библиотеки:
  - GSAP
  - Three.js
  - AOS
  - Locomotive Scroll
  - Anime.js
  - Motion One
  - ScrollReveal
  - Lottie
  - Particles.js
  - Typed.js
  - Vanilla-tilt
  - Swiper
  - Smooth Scrollbar

### Backend
- Node.js + Express.js
- MongoDB (mongoose)
- JWT + Bcrypt
- SQLite3
- Nodemailer

## 🌟 Особенности

- Современный и отзывчивый дизайн
- Плавные анимации и переходы
- Интеграция со Spotify
- Безопасная аутентификация
- Адаптивный интерфейс
- Оптимизированная производительность

## 🔧 Конфигурация

Создайте файл `.env` в корневой директории и добавьте необходимые переменные окружения:

```env
PORT=3000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=68d1ac565ef48ec4621d2a5591897decbe12ca9340df859fd7508276e21cb90d398eca662b0cb1ffe92769fe2f917416ba0fc9a7e526516e1bf458e83417e472
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
EMAIL_USER=abdullanurislam97@gmail.com
EMAIL_PASS=<djwf mkfr xnlm mpzy>
STRIPE_PUBLISHABLE_KEY=pk_test_51R2bm0FT1A0xla4vrx3FphBgX8uvf4GM5kVOizgxCKPXxK9vN8ViSVbUPXGMqUEtQNxb4mDnFfrNfdVYSVHLTzlX00DAbucsz0
STRIPE_SECRET_KEY=sk_test_51R2bm0FT1A0xla4vi0TZmrdTAdrClx9pWB9gG662phHxHvwiOfR6OAP0HdXbNGixhD7ZVvEU1CtgZ1TqRRGYab3a00ppXFNozY
```

## 🤝 Мониторинг и доступность 24/7

Проект развернут на платформе Vercel, которая обеспечивает:
- Автоматический мониторинг
- Высокую доступность
- Автоматическое масштабирование
- SSL-сертификаты
- CDN для быстрой доставки контента

## 🏗️ Техническая сложность проекта

### Архитектурные решения

- **Оптимизированная HTML/JS архитектура** - проект использует современный JavaScript с оптимизированной загрузкой ресурсов
- **Многоуровневая система безопасности** - включает защиту от XSS-атак, CSRF, инъекций SQL, безопасную аутентификацию
- **Progressive Web App (PWA)** - использование Service Workers, работа в офлайн-режиме, эффективная загрузка ресурсов

### Дизайн-паттерны

В проекте активно используются различные паттерны проектирования:

- **Singleton** — для управления глобальной конфигурацией
- **Factory Method** — для создания объектов
- **Observer** — для реализации системы событий
- **Strategy** — для различных стратегий аутентификации
- **Chain of Responsibility** — для обработки форм
- **Facade** — для работы с внешними сервисами

### Сложные технические компоненты

- **Система маршрутизации** - оптимизированная для статических страниц
- **Механизм обработки медиа** - оптимизация изображений, поддержка современных форматов
- **Многоуровневое кэширование** - эффективное использование браузерного кэша

## 📱 Поддерживаемые платформы

- Desktop (Windows, macOS, Linux)
- Mobile (iOS, Android)
- Tablets
- Modern Web Browsers (Chrome, Firefox, Safari, Edge)

## 🤝 Вклад в проект

Мы приветствуем ваш вклад в развитие проекта! Пожалуйста, ознакомьтесь с нашими правилами для контрибьюторов перед отправкой pull request.

## 📄 Лицензия

ISC License

## 👥 Авторы

- Abdulla Nurislam - *Начальная работа* - [GitHub](https://github.com/Abdulla-Nurislam)

## 📞 Контакты

Если у вас есть вопросы или предложения, пожалуйста, создайте issue в репозитории проекта.

## Интеграция React и HTML

В проекте реализована гибридная архитектура с использованием как обычных HTML-страниц, так и React-компонентов. Это позволяет постепенно переходить от статических HTML-страниц к динамическим React-компонентам, сохраняя при этом функциональность и внешний вид оригинальных страниц.

### Ключевые особенности интеграции:

1. **Гибридный подход**: HTML-страницы могут использовать React-компоненты, а React-приложение может отображаться в HTML.
2. **Модульная структура**: Каждый компонент (например, модальное окно авторизации) может быть использован как в React, так и в обычном HTML.
3. **Сохранение UX**: Пользовательский опыт сохраняется независимо от технологии рендеринга.

### Как это работает:

- Webpack собирает несколько точек входа: основное React-приложение и отдельные компоненты для изолированного использования
- JavaScript файлы проверяют наличие React и соответствующим образом адаптируют свое поведение
- CSS файлы используются как React-компонентами, так и обычными HTML-страницами

## Запуск проекта

### Режим разработки

1. Установите зависимости:
```bash
npm install
```

2. Запустите сервер разработки:
```bash
npm run dev
```

Сервер будет доступен по адресу: `http://localhost:3000`

### Сборка для продакшн

1. Соберите проект:
```bash
npm run build
```

2. Результат сборки будет доступен в директории `dist/`

## Примечания по разработке

- При модификации React-компонентов необходимо перезапустить сервер разработки
- Изменения в HTML-файлах не требуют перезапуска сервера
- При добавлении новых React-компонентов для использования в HTML, необходимо добавить их в конфигурацию webpack
