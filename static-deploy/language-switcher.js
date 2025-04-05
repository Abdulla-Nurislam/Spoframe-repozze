// Простой скрипт для переключения языков без React и серверного API
document.addEventListener('DOMContentLoaded', function() {
    console.log('Language switcher initialized (static version)');
    
    // Объект для хранения переводов
    window.translations = {};
    
    // Получаем элемент выбора языка
    const languageSelect = document.getElementById('languageSelect');
    
    // Если нет элемента выбора языка, выходим
    if (!languageSelect) {
        console.log('Language select not found');
        return;
    }
    
    // Функция загрузки переводов
    async function loadTranslations(lang) {
        try {
            const response = await fetch(`/locales/${lang}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load ${lang}.json: ${response.status}`);
            }
            
            const translations = await response.json();
            console.log(`Loaded translations for ${lang}`);
            window.translations[lang] = translations;
            return translations;
        } catch (error) {
            console.error('Error loading translations:', error);
            return null;
        }
    }
    
    // Функция применения переводов
    function applyTranslations(translations) {
        // Находим все элементы с атрибутом data-i18n
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = getTranslationByKey(translations, key);
            
            if (translation) {
                // Для полей ввода обновляем placeholder, для остальных - содержимое
                if (element.hasAttribute('placeholder')) {
                    element.setAttribute('placeholder', translation);
                } else {
                    element.textContent = translation;
                }
            }
        });
    }
    
    // Функция получения перевода по составному ключу (например, "navigation.home")
    function getTranslationByKey(translations, key) {
        const keys = key.split('.');
        let result = translations;
        
        for (const k of keys) {
            if (result && k in result) {
                result = result[k];
            } else {
                return null;
            }
        }
        
        return result;
    }
    
    // Функция смены языка
    async function changeLanguage(lang) {
        console.log(`Changing language to: ${lang}`);
        
        // Если переводы для этого языка еще не загружены, загружаем их
        if (!window.translations[lang]) {
            const translations = await loadTranslations(lang);
            if (!translations) return false;
        }
        
        // Применяем переводы
        applyTranslations(window.translations[lang]);
        
        // Сохраняем выбранный язык
        localStorage.setItem('language', lang);
        
        // Обновляем атрибут lang для HTML
        document.documentElement.setAttribute('lang', lang);
        
        return true;
    }
    
    // Устанавливаем начальный язык
    const savedLang = localStorage.getItem('language') || 'ru';
    languageSelect.value = savedLang;
    
    // Инициализируем переводы
    changeLanguage(savedLang);
    
    // Добавляем обработчик события изменения языка
    languageSelect.addEventListener('change', function() {
        const selectedLang = this.value;
        changeLanguage(selectedLang);
    });
});