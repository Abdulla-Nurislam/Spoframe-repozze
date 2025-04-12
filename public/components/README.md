# Компоненты Spoframe

Этот каталог содержит компоненты веб-сайта, которые можно использовать на всех страницах. Компоненты представлены в традиционном HTML/CSS/JS формате.

## Структура проекта

- `pages/` - каталог со страницами сайта
  - `main/` - основные страницы (главная, каталог, информация о продукте)
  - `auth/` - страницы аутентификации
  - `error/` - страницы ошибок
  - `admin/` - административные страницы
- `public/components/` - каталог с компонентами

## Список компонентов

1. **Навигационная панель** (`navbar.html`)
2. **Футер** (`footer.html`)
3. **Карточка продукта** (`productCard.html`)

## Как использовать

### 1. Добавьте контейнеры на страницу

В HTML-коде вашей страницы добавьте контейнеры для компонентов:

```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Название страницы - Spoframe</title>
    <link rel="stylesheet" href="/components/style.css">
    <!-- Другие стили -->
</head>
<body>
    <!-- Контейнер для навигационной панели -->
    <div id="navbar-container"></div>
    
    <!-- Содержимое страницы -->
    <main>
        <!-- Ваш контент -->
        
        <!-- Пример использования карточек продуктов -->
        <div class="catalog-grid" id="products-container"></div>
    </main>
    
    <!-- Контейнер для футера -->
    <div id="footer-container"></div>
    
    <!-- Подключение скриптов -->
    <script src="/components/components.js"></script>
    <!-- Другие скрипты -->
</body>
</html>
```

### 2. Создание карточек продуктов

Для динамического создания карточек продуктов:

```javascript
// Пример данных продуктов
const products = [
    {
        id: 1,
        title: "Чёрная рамка Spoframe",
        description: "Элегантная чёрная рамка для вашего интерьера",
        price: 3990,
        image: "/black-frame.png"
    },
    {
        id: 2,
        title: "Серебряная рамка Spoframe",
        description: "Стильная серебряная рамка для современного интерьера",
        price: 4490,
        image: "/silver-frame.png"
    }
];

// Создание карточек продуктов
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('products-container');
    
    if (container) {
        products.forEach(product => {
            createProductCard(product, 'products-container');
        });
    }
});
```

## Настройка

### Цветовая схема

Компоненты используют CSS-переменные для стилизации. Вы можете изменить цвета, добавив следующие переменные в ваш корневой CSS:

```css
:root {
    --primary: #7c3aed;
    --primary-hover: #6029c1;
    --nav-bg: #1a1a1a;
    --footer-bg: #1a1a1a;
    --text-nav: #ffffff;
    --text-footer: #ffffff;
    --text-footer-header: #ffffff;
    --text-footer-link: #a6a6a6;
    --text-footer-copyright: #666;
    --text-main: #333333;
    --text-secondary: #666666;
    --card-bg: #ffffff;
}
```

## Важно

- Убедитесь, что файл `components.js` загружается после определения контейнеров.
- Для правильной работы компонентов, файлы должны быть доступны по указанным путям.
- При изменении DOM (например, после загрузки AJAX контента), возможно потребуется повторно вызвать функции инициализации компонентов. 