// Функция инициализации переключения языка
function initLanguageSelector() {
    console.log('Инициализация переключателя языка');
    
    const languageSelect = document.getElementById('languageSelect');
    if (!languageSelect) {
        console.error('Не найден элемент с id "languageSelect"');
        return;
    }
    
    // Устанавливаем текущий язык из localStorage или используем язык страницы
    const currentLang = localStorage.getItem('language') || document.documentElement.lang;
    languageSelect.value = currentLang;
    
    // Применяем язык при загрузке страницы
    applyLanguage(currentLang);
    
    // Добавляем обработчик события изменения языка
    languageSelect.addEventListener('change', function() {
        const selectedLang = this.value;
        localStorage.setItem('language', selectedLang);
        applyLanguage(selectedLang);
    });
}

// Функция применения выбранного языка
function applyLanguage(lang) {
    console.log('Применение языка:', lang);
    
    // Устанавливаем язык документа
    document.documentElement.lang = lang;
    
    // Находим все элементы с атрибутами data-lang-ru и data-lang-en
    const elements = document.querySelectorAll('[data-lang-ru][data-lang-en]');
    
    // Обновляем текст элементов в соответствии с выбранным языком
    elements.forEach(element => {
        const text = element.getAttribute(`data-lang-${lang}`);
        if (text) {
            if (element.tagName === 'INPUT' && element.getAttribute('placeholder')) {
                element.placeholder = text;
            } else {
                element.textContent = text;
            }
        }
    });
    
    // Обработка плейсхолдеров для инпутов
    const inputElements = document.querySelectorAll(`input[data-lang-${lang}-placeholder]`);
    inputElements.forEach(input => {
        const placeholderTranslation = input.getAttribute(`data-lang-${lang}-placeholder`);
        if (placeholderTranslation) {
            input.placeholder = placeholderTranslation;
        }
    });
    
    // Обновляем заголовок страницы
    const titleElement = document.querySelector('title');
    if (titleElement && titleElement.getAttribute(`data-lang-${lang}`)) {
        titleElement.textContent = titleElement.getAttribute(`data-lang-${lang}`);
    }
}

// Инициализация переключения языка при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initLanguageSelector();
});
