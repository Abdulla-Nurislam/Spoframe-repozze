// Импортируем стили
import './styles/main.css';
import './styles/auth.css';
import './styles/scroll-buttons.css';

// Функциональность навигации
document.addEventListener('DOMContentLoaded', function() {
    // Навигация
    const navLinks = {
        catalog: document.querySelector('.nav.catalog, [data-nav="catalog"]'),
        about: document.querySelector('.nav.about, [data-nav="about"]'),
        login: document.querySelector('.nav.login, [data-nav="login"]'),
        register: document.querySelector('.nav.register, [data-nav="register"]')
    };

    // Обработчики навигации
    if (navLinks.catalog) navLinks.catalog.addEventListener('click', () => window.location.href = '/catalog.html');
    if (navLinks.about) navLinks.about.addEventListener('click', () => window.location.href = '/about.html');
    if (navLinks.login) navLinks.login.addEventListener('click', () => showAuthModal('login'));
    if (navLinks.register) navLinks.register.addEventListener('click', () => showAuthModal('register'));

    // Инициализация модального окна
    initAuthModal();

    // Кнопки прокрутки
    const scrollButtons = document.querySelectorAll('.scroll-button');
    scrollButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Форма обратной связи
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(contactForm);
            // Здесь будет логика отправки формы
            alert('Сообщение отправлено!');
            contactForm.reset();
        });
    }

    // Анимации при прокрутке
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    });

    animatedElements.forEach(element => observer.observe(element));
});

// Инициализация модального окна авторизации
function initAuthModal() {
    // Создаем модальное окно, если его нет
    if (!document.getElementById('auth-modal')) {
        const modalHTML = `
            <div id="auth-modal" class="modal">
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <div class="login-form">
                        <h2>Вход</h2>
                        <form id="loginForm">
                            <div class="form-group">
                                <label for="email">Email</label>
                                <input type="email" id="email" required>
                            </div>
                            <div class="form-group">
                                <label for="password">Пароль</label>
                                <input type="password" id="password" required>
                            </div>
                            <button type="submit">Войти</button>
                        </form>
                        <p>Нет аккаунта? <a href="#" class="switch-form" data-form="register">Зарегистрироваться</a></p>
                    </div>
                    <div class="register-form" style="display: none;">
                        <h2>Регистрация</h2>
                        <form id="registerForm">
                            <div class="form-group">
                                <label for="reg-email">Email</label>
                                <input type="email" id="reg-email" required>
                            </div>
                            <div class="form-group">
                                <label for="reg-password">Пароль</label>
                                <input type="password" id="reg-password" required>
                            </div>
                            <div class="form-group">
                                <label for="reg-confirm-password">Подтвердите пароль</label>
                                <input type="password" id="reg-confirm-password" required>
                            </div>
                            <button type="submit">Зарегистрироваться</button>
                        </form>
                        <p>Уже есть аккаунт? <a href="#" class="switch-form" data-form="login">Войти</a></p>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Добавляем обработчики событий
    const modal = document.getElementById('auth-modal');
    const closeBtn = modal.querySelector('.close');
    const switchForms = modal.querySelectorAll('.switch-form');

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    switchForms.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const formType = link.getAttribute('data-form');
            showAuthModal(formType);
        });
    });

    // Обработка форм
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Здесь будет логика входа
        alert('Выполняется вход...');
    });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Здесь будет логика регистрации
        alert('Выполняется регистрация...');
    });
}

// Функция показа модального окна авторизации
function showAuthModal(type) {
    const modal = document.getElementById('auth-modal');
    const loginForm = modal.querySelector('.login-form');
    const registerForm = modal.querySelector('.register-form');
    
    modal.style.display = 'block';
    
    if (type === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
}

// Функционал модального окна
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('authModal');
    
    // Проверяем, существует ли модальное окно
    if (modal) {
        const closeBtn = modal.querySelector('.close');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const switchFormLinks = document.querySelectorAll('.switch-form');

        // Открытие модального окна
        document.querySelectorAll('[data-action="auth"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                modal.style.display = 'block';
                const formType = link.dataset.form || 'login';
                showForm(formType);
            });
        });

        // Закрытие модального окна
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        // Переключение между формами
        function showForm(formType) {
            if (loginForm && registerForm) {
                if (formType === 'login') {
                    loginForm.style.display = 'block';
                    registerForm.style.display = 'none';
                } else {
                    loginForm.style.display = 'none';
                    registerForm.style.display = 'block';
                }
            }
        }

        if (switchFormLinks) {
            switchFormLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    showForm(link.dataset.form);
                });
            });
        }

        // Обработка отправки форм
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('loginEmail')?.value || '';
                const password = document.getElementById('loginPassword')?.value || '';
                
                try {
                    // Здесь будет логика авторизации
                    console.log('Попытка входа:', { email, password });
                    alert('Успешный вход!');
                    modal.style.display = 'none';
                } catch (error) {
                    alert('Ошибка при входе: ' + error.message);
                }
            });
        }

        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = document.getElementById('registerName')?.value || '';
                const email = document.getElementById('registerEmail')?.value || '';
                const password = document.getElementById('registerPassword')?.value || '';
                
                try {
                    // Здесь будет логика регистрации
                    console.log('Попытка регистрации:', { name, email, password });
                    alert('Успешная регистрация!');
                    modal.style.display = 'none';
                } catch (error) {
                    alert('Ошибка при регистрации: ' + error.message);
                }
            });
        }
    }
});