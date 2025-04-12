/**
 * Компонентная система Spoframe
 * Позволяет загружать HTML компоненты и вставлять их на страницу
 */

// Загрузка компонентов при инициализации страницы
document.addEventListener('DOMContentLoaded', () => {
    loadComponents();
    setupNavbarActive();
    setupLanguageSwitcher();
});

// Загрузить все компоненты на страницу
async function loadComponents() {
    // Список компонентов для загрузки
    const components = [
        { id: 'navbar-container', file: '/components/navbar.html' },
        { id: 'footer-container', file: '/components/footer.html' }
    ];

    // Загрузка каждого компонента
    for (const component of components) {
        await loadComponent(component.id, component.file);
    }
}

// Загрузить один компонент
async function loadComponent(containerId, filePath) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Не удалось загрузить компонент: ${filePath}`);
        }
        
        const html = await response.text();
        container.innerHTML = html;
        
        // Запускаем скрипты, связанные с компонентом, если необходимо
        if (containerId === 'navbar-container') {
            setupMobileMenu();
        }
    } catch (error) {
        console.error('Ошибка загрузки компонента:', error);
    }
}

// Настройка мобильного меню
function setupMobileMenu() {
    const menuToggle = document.getElementById('mobileMenuToggle');
    if (!menuToggle) return;
    
    menuToggle.addEventListener('click', () => {
        const navLinks = document.getElementById('navLinks');
        navLinks.classList.toggle('active');
        
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', !isExpanded);
    });
}

// Подсветка активного пункта меню
function setupNavbarActive() {
    document.addEventListener('DOMContentLoaded', () => {
        const currentPath = window.location.pathname;
        
        setTimeout(() => {
            let activeLink;
            
            if (currentPath === '/' || currentPath === '/index.html') {
                activeLink = document.getElementById('nav-home');
            } else if (currentPath.includes('/catalog')) {
                activeLink = document.getElementById('nav-catalog');
            } else if (currentPath.includes('/product')) {
                activeLink = document.getElementById('nav-product');
            }
            
            if (activeLink) {
                // Убираем активный класс со всех ссылок
                document.querySelectorAll('.nav-links a').forEach(link => {
                    link.classList.remove('active');
                });
                
                // Добавляем активный класс нужной ссылке
                activeLink.classList.add('active');
            }
        }, 100); // Небольшая задержка для загрузки компонентов
    });
}

// Настройка переключателя языка
function setupLanguageSwitcher() {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            const languageSelector = document.getElementById('languageSelector');
            if (!languageSelector) return;
            
            // Установить текущий язык
            const currentLang = document.documentElement.lang || 'ru';
            languageSelector.value = currentLang;
            
            // Обработчик изменения языка
            languageSelector.addEventListener('change', (e) => {
                const newLang = e.target.value;
                window.location.href = `/api/language/${newLang}`;
            });
        }, 100);
    });
}

// Функция для создания карточек товаров
function createProductCard(product, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    fetch('/components/productCard.html')
        .then(response => response.text())
        .then(template => {
            // Заменяем плейсхолдеры реальными данными
            const card = template
                .replace('{image-src}', product.image)
                .replace('{product-title}', product.title)
                .replace('{product-title}', product.title)
                .replace('{product-description}', product.description)
                .replace('{product-price}', product.price)
                .replace('{product-id}', product.id);
                
            // Добавляем карточку в контейнер
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = card;
            container.appendChild(tempDiv.firstElementChild);
        })
        .catch(error => console.error('Ошибка загрузки шаблона карточки:', error));
} 