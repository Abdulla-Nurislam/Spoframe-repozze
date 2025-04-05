# Документация API Spoframe

## Общая информация

Базовый URL: `https://spoframe.com/api`

Все запросы к API, кроме авторизации и регистрации, требуют JWT-токен в заголовке `Authorization` в формате `Bearer <token>`.

## Аутентификация

### Регистрация

**Запрос:**
```
POST /auth/register
Content-Type: application/json

{
  "name": "Имя пользователя",
  "email": "user@example.com",
  "password": "password123"
}
```

**Ответ:**
```json
{
  "message": "Регистрация успешна!"
}
```

### Вход

**Запрос:**
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Ответ:**
```json
{
  "message": "Вход выполнен успешно",
  "user": {
    "id": 1,
    "username": "Имя пользователя",
    "email": "user@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Выход

**Запрос:**
```
POST /auth/logout
Authorization: Bearer <token>
```

**Ответ:**
```json
{
  "message": "Выход выполнен успешно"
}
```

## Профиль пользователя

### Получение профиля

**Запрос:**
```
GET /profile
Authorization: Bearer <token>
```

**Ответ:**
```json
{
  "user": {
    "id": 1,
    "username": "Имя пользователя",
    "email": "user@example.com",
    "registration_date": "2023-01-01T12:00:00.000Z"
  }
}
```

### Обновление профиля

**Запрос:**
```
PUT /profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "Новое имя",
  "email": "new.email@example.com",
  "currentPassword": "password123",
  "newPassword": "newpassword123"
}
```

**Ответ:**
```json
{
  "message": "Профиль успешно обновлен"
}
```

## Обратная связь

### Отправка сообщения

**Запрос:**
```
POST /contact
Content-Type: application/json

{
  "name": "Имя отправителя",
  "email": "sender@example.com",
  "subject": "Тема сообщения",
  "message": "Текст сообщения"
}
```

**Ответ:**
```json
{
  "success": true,
  "message": "Сообщение успешно отправлено!"
}
```

## Платежи

### Создание сессии оплаты

**Запрос:**
```
POST /create-checkout-session
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "frame-classic",
  "quantity": 1
}
```

**Ответ:**
```json
{
  "id": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

### Получение истории заказов

**Запрос:**
```
GET /orders
Authorization: Bearer <token>
```

**Ответ:**
```json
{
  "orders": [
    {
      "id": 1,
      "user_id": 1,
      "product_id": "frame-classic",
      "amount": 399900,
      "status": "completed",
      "payment_id": "cs_test_...",
      "created_at": "2023-01-01T12:00:00.000Z"
    }
  ]
}
```

## Локализация

### Смена языка

**Запрос:**
```
GET /language/en
```

**Ответ:**
```json
{
  "success": true,
  "language": "en"
}
```

## Мониторинг

### Проверка работоспособности

**Запрос:**
```
GET /health
```

**Ответ:**
```json
{
  "status": "ok",
  "message": "Сервер работает нормально",
  "version": "1.0.0",
  "timestamp": "2023-01-01T12:00:00.000Z"
}
```

## Коды ошибок

- `400` - Неверный запрос (проверьте параметры)
- `401` - Не авторизован (требуется вход)
- `403` - Доступ запрещен (недостаточно прав)
- `404` - Ресурс не найден
- `429` - Слишком много запросов (превышен лимит)
- `500` - Внутренняя ошибка сервера 