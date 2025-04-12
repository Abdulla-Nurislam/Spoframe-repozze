// Простая реализация фильтров без лишних зависимостей
document.addEventListener('DOMContentLoaded', function() {
    // Получаем все чекбоксы и карточки товаров
    const styleCheckboxes = document.querySelectorAll('.filter-group:nth-child(1) input[type="checkbox"]');
    const functionCheckboxes = document.querySelectorAll('.filter-group:nth-child(2) input[type="checkbox"]');
    const productCards = document.querySelectorAll('.product-card');
    const comingSoonCards = document.querySelectorAll('.product-card.coming-soon-card');
    const regularCards = document.querySelectorAll('.product-card:not(.coming-soon-card)');
    
    // Добавляем обработчики для всех чекбоксов
    styleCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', applyFilters);
    });
    
    functionCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', applyFilters);
    });
    
    // Функция применения фильтров
    function applyFilters() {
        // Получаем выбранные значения фильтров
        const selectedStyles = Array.from(styleCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
            
        const selectedFunctions = Array.from(functionCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
        
        // Проверяем, выбран ли хотя бы один фильтр
        const isAnyFilterActive = selectedStyles.length > 0 || selectedFunctions.length > 0;
        
        // Скрываем все карточки "скоро в продаже" если активен хотя бы один фильтр
        comingSoonCards.forEach(card => {
            card.style.display = isAnyFilterActive ? 'none' : '';
        });
        
        // Если нет активных фильтров, показываем все обычные карточки
        if (!isAnyFilterActive) {
            regularCards.forEach(card => {
                card.style.display = '';
            });
            return;
        }
        
        // Применяем фильтрацию к обычным карточкам
        regularCards.forEach(card => {
            const cardStyles = card.getAttribute('data-style')?.split(',') || [];
            const cardFunctions = card.getAttribute('data-function')?.split(',') || [];
            
            // Проверяем соответствие стилю
            const matchesStyle = selectedStyles.length === 0 || 
                selectedStyles.some(style => cardStyles.includes(style.trim()));
                
            // Проверяем соответствие функционалу
            const matchesFunction = selectedFunctions.length === 0 || 
                selectedFunctions.some(func => cardFunctions.includes(func.trim()));
                
            // Отображаем карточку только если она соответствует всем выбранным фильтрам
            card.style.display = (matchesStyle && matchesFunction) ? '' : 'none';
        });
        
        // Добавляем кнопку сброса фильтров, если её ещё нет
        if (isAnyFilterActive) {
            addResetButton();
        } else {
            removeResetButton();
        }
        
        // Проверяем, есть ли видимые карточки
        checkForEmptyResults();
    }
    
    // Функция для проверки наличия результатов
    function checkForEmptyResults() {
        const visibleCards = document.querySelectorAll('.product-card:not(.coming-soon-card):not([style*="display: none"])');
        const catalogGrid = document.querySelector('.catalog-grid');
        let noResultsMessage = document.getElementById('no-results-message');
        
        if (visibleCards.length === 0) {
            if (!noResultsMessage) {
                noResultsMessage = document.createElement('div');
                noResultsMessage.id = 'no-results-message';
                noResultsMessage.className = 'no-results';
                noResultsMessage.innerHTML = `
                    <i class="fas fa-search"></i>
                    <h3>Ничего не найдено</h3>
                    <p>Попробуйте изменить параметры фильтрации</p>
                `;
                
                // Добавляем стили для сообщения
                const style = document.createElement('style');
                style.textContent = `
                    .no-results {
                        grid-column: 1 / -1;
                        text-align: center;
                        padding: 3rem;
                        background: var(--card-bg);
                        border-radius: 12px;
                        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                        margin: 2rem auto;
                        max-width: 600px;
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
                `;
                document.head.appendChild(style);
                catalogGrid.appendChild(noResultsMessage);
            } else {
                noResultsMessage.style.display = 'block';
            }
        } else if (noResultsMessage) {
            noResultsMessage.style.display = 'none';
        }
    }
    
    // Функция добавления кнопки сброса фильтров
    function addResetButton() {
        if (!document.getElementById('reset-filters-btn')) {
            const resetBtn = document.createElement('button');
            resetBtn.id = 'reset-filters-btn';
            resetBtn.textContent = 'Сбросить фильтры';
            resetBtn.style.cssText = `
                display: block;
                margin: 1rem auto;
                padding: 0.75rem 1.5rem;
                background-color: transparent;
                color: var(--text-main);
                border: 1px solid var(--border-color);
                border-radius: 8px;
                cursor: pointer;
                font-size: 1rem;
            `;
            
            resetBtn.addEventListener('click', function() {
                // Сбрасываем все чекбоксы
                styleCheckboxes.forEach(cb => cb.checked = false);
                functionCheckboxes.forEach(cb => cb.checked = false);
                
                // Показываем все карточки
                productCards.forEach(card => card.style.display = '');
                
                // Удаляем сообщение о пустых результатах
                const noResultsMessage = document.getElementById('no-results-message');
                if (noResultsMessage) {
                    noResultsMessage.style.display = 'none';
                }
                
                // Удаляем кнопку сброса
                this.remove();
            });
            
            // Добавляем кнопку после секции фильтров
            const filterSection = document.querySelector('.filter-section');
            filterSection.after(resetBtn);
        }
    }
    
    // Функция удаления кнопки сброса фильтров
    function removeResetButton() {
        const resetBtn = document.getElementById('reset-filters-btn');
        if (resetBtn) {
            resetBtn.remove();
        }
    }
    
    // Добавляем стили для активных чекбоксов
    const style = document.createElement('style');
    style.textContent = `
        .checkbox-wrapper.active {
            background: rgba(124, 58, 237, 0.12);
        }
    `;
    document.head.appendChild(style);
    
    // Обработчик для стилизации чекбоксов
    document.querySelectorAll('.checkbox-wrapper').forEach(wrapper => {
        const checkbox = wrapper.querySelector('input[type="checkbox"]');
        
        // Обновляем стиль при изменении состояния
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                wrapper.classList.add('active');
            } else {
                wrapper.classList.remove('active');
            }
        });
        
        // Добавляем возможность клика по всему wrapper
        wrapper.addEventListener('click', function(e) {
            if (e.target !== checkbox) {
                checkbox.checked = !checkbox.checked;
                
                // Имитируем событие change
                const event = new Event('change');
                checkbox.dispatchEvent(event);
            }
        });
    });
});
