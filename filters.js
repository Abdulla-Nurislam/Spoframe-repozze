document.addEventListener('DOMContentLoaded', function() {
    // Получаем все чекбоксы фильтров и товары
    const allCheckboxes = document.querySelectorAll('.filter-section input[type="checkbox"]');
    const styleCheckboxes = document.querySelectorAll('.filter-group:nth-child(1) input[type="checkbox"]');
    const functionCheckboxes = document.querySelectorAll('.filter-group:nth-child(2) input[type="checkbox"]');
    const products = document.querySelectorAll('.product-card:not(.coming-soon-card)');
    const resetButton = document.getElementById('resetFilters');
    const applyButton = document.getElementById('applyFilters');
    const checkboxWrappers = document.querySelectorAll('.checkbox-wrapper');
    
    // Анимации для карточек
    products.forEach(product => {
        product.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        product.style.opacity = '1';
        product.style.transform = 'scale(1) translateY(0)';
    });
    
    // Добавляем клик по всему wrapper чекбокса
    checkboxWrappers.forEach(wrapper => {
        wrapper.addEventListener('click', function(e) {
            // Если клик был не по самому чекбоксу, а по лейблу или обертке
            if (e.target !== wrapper.querySelector('input[type="checkbox"]')) {
                const checkbox = wrapper.querySelector('input[type="checkbox"]');
                checkbox.checked = !checkbox.checked; // инвертируем состояние
                
                // Имитируем событие change для применения стилей и фильтрации
                const event = new Event('change');
                checkbox.dispatchEvent(event);
            }
        });
    });
    
    // Функция обновления визуальных индикаторов для чекбоксов
    function updateCheckboxStyles() {
        allCheckboxes.forEach(checkbox => {
            const wrapper = checkbox.closest('.checkbox-wrapper');
            if (checkbox.checked) {
                wrapper.classList.add('active');
            } else {
                wrapper.classList.remove('active');
            }
        });
    }
    
    // Функция фильтрации товаров
    function filterProducts() {
        let itemsFound = 0;
        
        // Получаем выбранные фильтры
        const selectedStyles = Array.from(styleCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        const selectedFunctions = Array.from(functionCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        // Фильтруем товары с анимацией
        products.forEach(product => {
            const productStyles = product.getAttribute('data-style')?.split(',') || [];
            const productFunctions = product.getAttribute('data-function')?.split(',') || [];
            
            // Проверка соответствия по стилю
            const matchesStyle = selectedStyles.length === 0 || 
                selectedStyles.some(style => productStyles.includes(style.trim()));
                
            // Проверка соответствия по функциональности
            const matchesFunction = selectedFunctions.length === 0 || 
                selectedFunctions.some(func => productFunctions.includes(func.trim()));
            
            // Проверка соответствия всем фильтрам
            const shouldDisplay = matchesStyle && matchesFunction;
            
            // Применяем анимацию и отображение
            if (shouldDisplay) {
                itemsFound++;
                product.style.display = '';
                setTimeout(() => {
                    product.style.opacity = '1';
                    product.style.transform = 'scale(1) translateY(0)';
                }, 50 * (itemsFound % 5)); // Создаем эффект каскада для анимации
            } else {
                product.style.opacity = '0';
                product.style.transform = 'scale(0.95) translateY(10px)';
                setTimeout(() => {
                    product.style.display = 'none';
                }, 350);
            }
        });
        
        // Если не найдено элементов, показываем сообщение
        const catalogGrid = document.querySelector('.catalog-grid');
        let noResultsMessage = document.getElementById('no-results-message');
        
        if (itemsFound === 0) {
            if (!noResultsMessage) {
                noResultsMessage = document.createElement('div');
                noResultsMessage.id = 'no-results-message';
                noResultsMessage.className = 'no-results';
                noResultsMessage.innerHTML = `
                    <i class="fas fa-search"></i>
                    <h3>Ничего не найдено</h3>
                    <p>Попробуйте изменить параметры фильтрации</p>
                `;
                catalogGrid.appendChild(noResultsMessage);
                
                // Добавляем стили для сообщения
                const style = document.createElement('style');
                style.innerHTML = `
                    .no-results {
                        grid-column: 1 / -1;
                        text-align: center;
                        padding: 3rem;
                        background: var(--card-bg);
                        border-radius: 12px;
                        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                        margin: 2rem auto;
                        max-width: 600px;
                        animation: fadeIn 0.5s ease;
                    }
                    .no-results i {
                        font-size: 3rem;
                        color: var(--primary);
                        margin-bottom: 1rem;
                        opacity: 0.7;
                    }
                    .no-results h3 {
                        color: var(--text-main);
                        font-size: 1.5rem;
                        margin-bottom: 0.5rem;
                    }
                    .no-results p {
                        color: var(--text-secondary);
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `;
                document.head.appendChild(style);
            }
            setTimeout(() => {
                noResultsMessage.style.display = 'block';
            }, 400);
        } else if (noResultsMessage) {
            noResultsMessage.style.display = 'none';
        }
    }

    // Функция сброса всех фильтров
    function resetFilters() {
        allCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        updateCheckboxStyles();
        
        // Показываем все товары с каскадной анимацией
        products.forEach((product, index) => {
            product.style.display = '';
            setTimeout(() => {
                product.style.opacity = '1';
                product.style.transform = 'scale(1) translateY(0)';
            }, 30 * index);
        });
        
        // Скрываем сообщение о ненайденных результатах
        const noResultsMessage = document.getElementById('no-results-message');
        if (noResultsMessage) {
            noResultsMessage.style.display = 'none';
        }
    }
    
    // Добавляем обработчики событий
    allCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateCheckboxStyles();
            filterProducts(); // Мгновенная фильтрация при изменении чекбокса
        });
    });
    
    // Обработчик кнопки "Применить"
    applyButton.addEventListener('click', filterProducts);
    
    // Обработчик кнопки "Сбросить"
    resetButton.addEventListener('click', resetFilters);
    
    // Инициализация визуальных индикаторов
    updateCheckboxStyles();
});
