// Функция для применения языка
function applyLanguage(lang) {
    console.log('Applying language:', lang);
    
    // Сохраняем выбранный язык в localStorage
    localStorage.setItem('selectedLanguage', lang);
    
    // Находим все элементы с атрибутом data-lang-{lang}
    const elements = document.querySelectorAll('[data-lang-' + lang + ']');
    console.log('Found elements with data-lang-' + lang + ':', elements.length);
    
    // Применяем переводы к каждому элементу
    elements.forEach(element => {
        const translation = element.getAttribute('data-lang-' + lang);
        if (translation) {
            element.textContent = translation;
        }
    });
    
    // Обновляем плейсхолдеры
    updatePlaceholders(lang);
    
    // Обновляем выбранный язык в селекте
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.value = lang;
    }
}

// Функция для обновления плейсхолдеров
function updatePlaceholders(lang) {
    const elements = document.querySelectorAll('[data-lang-' + lang + '-placeholder]');
    elements.forEach(element => {
        const translation = element.getAttribute('data-lang-' + lang + '-placeholder');
        if (translation) {
            element.placeholder = translation;
        }
    });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    
    // Получаем сохраненный язык или используем русский по умолчанию
    const savedLang = localStorage.getItem('selectedLanguage') || 'ru';
    console.log('Saved language:', savedLang);
    
    // Применяем сохраненный язык
    applyLanguage(savedLang);
    
    // Добавляем обработчик события для переключения языка
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        console.log('Language selector found');
        languageSelect.addEventListener('change', function() {
            console.log('Language changed to:', this.value);
            applyLanguage(this.value);
        });
        
        // Устанавливаем значение селекта в соответствии с сохраненным языком
        languageSelect.value = savedLang;
    } else {
        console.warn('Language selector not found');
    }
});
