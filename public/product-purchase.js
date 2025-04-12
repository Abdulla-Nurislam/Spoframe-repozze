// Скрипт для обработки покупки продуктов
document.addEventListener('DOMContentLoaded', function() {
    console.log("Скрипт для покупки загружен");
    
    // Находим все кнопки "Купить сейчас" в модальных окнах
    const buyButtons = document.querySelectorAll('.product-modal__buy');
    console.log("Найдено кнопок покупки:", buyButtons.length);
    
    // Функция для работы с параметрами URL вместо localStorage
    function getUrlParams() {
        const params = {};
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        
        for (const [key, value] of urlParams.entries()) {
            params[key] = value;
        }
        return params;
    }
    
    // Генерация случайного номера заказа
    function generateOrderNumber() {
        return '#' + Math.floor(100000 + Math.random() * 900000);
    }
    
    // Добавляем обработчик события для каждой кнопки
    buyButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            console.log("Кнопка Купить сейчас нажата");
            e.preventDefault(); // Предотвращаем стандартное поведение
            
            // Получаем родительский блок информации о товаре
            const productInfo = this.closest('.product-modal__info');
            
            // Получаем данные о товаре
            const productTitle = productInfo.querySelector('.product-modal__title').textContent;
            const productPrice = productInfo.querySelector('.product-modal__price').textContent;
            
            // Генерируем номер заказа
            const orderNumber = generateOrderNumber();
            
            // Строим URL с параметрами
            const url = `/development-page.html?title=${encodeURIComponent(productTitle)}&price=${encodeURIComponent(productPrice)}&order=${encodeURIComponent(orderNumber)}&status=Ожидание оплаты`;
            
            // Перенаправляем на страницу оплаты
            console.log("Перенаправление на:", url);
            window.location.href = url;
        });
    });
    
    // Добавляем функциональность для модальных окон
    const productCards = document.querySelectorAll('.product-card');
    const modals = document.querySelectorAll('.product-modal');
    const closeButtons = document.querySelectorAll('.product-modal__close');
    
    // Открытие модального окна при клике на карточку
    productCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Проверяем, не является ли карточка "скоро в продаже"
            if (card.classList.contains('coming-soon-card')) return;
            
            // Только если клик был не по кнопке "Подробнее"
            if (!e.target.classList.contains('btn-view-details')) {
                const modalTarget = card.getAttribute('data-modal-target');
                if (modalTarget) {
                    document.getElementById(modalTarget).style.display = 'flex';
                }
            }
        });
    });
    
    // Закрытие модального окна при клике на кнопку закрытия
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.product-modal');
            modal.style.display = 'none';
        });
    });
    
    // Закрытие модального окна при клике вне его содержимого
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
});
