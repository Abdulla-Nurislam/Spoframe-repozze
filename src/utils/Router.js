/**
 * Сложная система маршрутизации для Spoframe
 * Поддерживает:
 * 1. История браузера (History API)
 * 2. Параметры маршрутов (/product/:id)
 * 3. Вложенные маршруты
 * 4. Защищенные маршруты (авторизация)
 * 5. Middleware для маршрутов
 * 6. Ленивая загрузка компонентов
 */

/**
 * Класс для управления маршрутизацией в приложении
 * Реализация паттерна "Наблюдатель" для отслеживания изменений маршрута
 */
class Router {
  constructor(options = {}) {
    this.routes = [];
    this.notFoundHandler = options.notFoundHandler || this.defaultNotFoundHandler;
    this.errorHandler = options.errorHandler || this.defaultErrorHandler;
    this.root = options.root || '/';
    this.currentRoute = null;
    this.previousRoute = null;
    this.mode = options.mode || 'history';
    this.middlewares = options.middlewares || [];
    
    // Наблюдатели за изменением маршрута
    this.observers = [];
    
    // Инициализация
    this.initialize();
  }
  
  /**
   * Инициализация маршрутизатора
   */
  initialize() {
    // Проверка поддержки History API
    if (this.mode === 'history' && !window.history || !window.history.pushState) {
      console.warn('History API is not supported. Falling back to hash mode.');
      this.mode = 'hash';
    }
    
    // Настройка обработчиков событий в зависимости от режима
    if (this.mode === 'history') {
      window.addEventListener('popstate', () => this.resolve());
      
      // Перехватываем клики по ссылкам для использования History API
      document.body.addEventListener('click', e => {
        // Проверяем, что клик был по ссылке
        if (e.target && e.target.nodeName === 'A') {
          const href = e.target.getAttribute('href');
          
          // Проверяем, что ссылка внутренняя
          if (href && href.startsWith('/') && !href.startsWith('//') && !href.startsWith('/\\/')) {
            e.preventDefault();
            this.navigate(href);
          }
        }
      });
    } else {
      // Режим с хэшем
      window.addEventListener('hashchange', () => this.resolve());
    }
    
    // Первоначальное разрешение маршрута
    this.resolve();
  }
  
  /**
   * Добавление обработчика для указанного пути
   * @param {string} path - Путь для маршрута
   * @param {Function|Object} handler - Обработчик или объект с методами
   * @param {Array} middlewares - Промежуточные обработчики для маршрута
   */
  on(path, handler, middlewares = []) {
    // Преобразуем параметры маршрута в регулярное выражение
    const regexPath = path
      .replace(/\/:\w+/g, '/([^/]+)')  // Заменяем параметры на группы захвата
      .replace(/\//g, '\\/');          // Экранируем слэши
    
    // Создаем объект маршрута
    const route = {
      path,
      regex: new RegExp(`^${regexPath}$`),
      handler,
      middlewares
    };
    
    this.routes.push(route);
    return this;
  }
  
  /**
   * Добавление защищенного маршрута, требующего авторизации
   * @param {string} path - Путь маршрута
   * @param {Function|Object} handler - Обработчик маршрута
   * @param {Object} options - Дополнительные опции
   */
  protected(path, handler, options = {}) {
    const authMiddleware = (route, next) => {
      // Проверка авторизации
      const isAuthenticated = this.checkAuth();
      
      if (isAuthenticated) {
        // Если пользователь авторизован, переходим к следующему обработчику
        next();
      } else {
        // Сохраняем изначальный маршрут для редиректа после авторизации
        localStorage.setItem('redirectAfterLogin', route.path);
        
        // Перенаправляем на страницу входа
        this.navigate(options.loginPath || '/login');
      }
    };
    
    // Добавляем промежуточный обработчик аутентификации
    const middlewares = [authMiddleware, ...(options.middlewares || [])];
    
    return this.on(path, handler, middlewares);
  }
  
  /**
   * Группировка маршрутов с общим префиксом и middlewares
   * @param {string} prefix - Префикс для всех маршрутов в группе
   * @param {Function} callback - Функция с определениями маршрутов
   * @param {Array} middlewares - Общие middlewares для группы
   */
  group(prefix, callback, middlewares = []) {
    // Создаем новый экземпляр для группы маршрутов
    const groupRouter = {
      on: (path, handler, routeMiddlewares = []) => {
        // Объединяем префикс с путем и middleware
        const fullPath = `${prefix}${path}`;
        const fullMiddlewares = [...middlewares, ...routeMiddlewares];
        
        // Добавляем маршрут в основной роутер
        this.on(fullPath, handler, fullMiddlewares);
        return groupRouter;
      },
      protected: (path, handler, options = {}) => {
        const fullPath = `${prefix}${path}`;
        const routeMiddlewares = options.middlewares || [];
        const fullMiddlewares = [...middlewares, ...routeMiddlewares];
        
        options.middlewares = fullMiddlewares;
        this.protected(fullPath, handler, options);
        return groupRouter;
      }
    };
    
    // Вызываем переданную функцию с определениями маршрутов
    callback(groupRouter);
    
    return this;
  }
  
  /**
   * Добавление middleware, который будет выполняться для всех маршрутов
   * @param {Function} middleware - Функция middleware
   */
  use(middleware) {
    this.middlewares.push(middleware);
    return this;
  }
  
  /**
   * Переход по указанному пути
   * @param {string} path - Путь для перехода
   * @param {Object} state - Объект состояния для History API
   */
  navigate(path, state = {}) {
    if (this.mode === 'history') {
      window.history.pushState(state, null, this.root + this.clearSlashes(path));
      this.resolve();
    } else {
      window.location.hash = path;
    }
    
    return this;
  }
  
  /**
   * Замена текущего маршрута без добавления в историю
   * @param {string} path - Путь для замены
   * @param {Object} state - Объект состояния
   */
  replace(path, state = {}) {
    if (this.mode === 'history') {
      window.history.replaceState(state, null, this.root + this.clearSlashes(path));
      this.resolve();
    } else {
      const route = `#${path}`;
      window.location.replace(
        window.location.href.replace(/#.*$/, route)
      );
    }
    
    return this;
  }
  
  /**
   * Разрешение текущего маршрута и выполнение соответствующего обработчика
   */
  async resolve() {
    // Получаем текущий путь
    let current = this.getCurrentPath();
    
    // Сохраняем предыдущий маршрут
    this.previousRoute = this.currentRoute;
    
    // Ищем совпадение среди зарегистрированных маршрутов
    let found = false;
    
    for (let i = 0; i < this.routes.length; i++) {
      const route = this.routes[i];
      const match = current.match(route.regex);
      
      if (match) {
        found = true;
        this.currentRoute = {
          path: current,
          params: this.extractParams(route.path, match),
          query: this.getQueryParams(),
          state: window.history.state || {}
        };
        
        // Создаем цепочку middleware, включая глобальные и для конкретного маршрута
        const middlewareChain = [...this.middlewares, ...route.middlewares];
        
        try {
          // Выполняем цепочку middleware
          await this.runMiddlewareChain(middlewareChain, route.handler);
        } catch (error) {
          console.error('Error in route handling:', error);
          this.errorHandler(error);
        }
        
        // Уведомляем наблюдателей об изменении маршрута
        this.notifyObservers();
        
        break;
      }
    }
    
    // Если маршрут не найден, вызываем обработчик 404
    if (!found) {
      this.currentRoute = {
        path: current,
        params: {},
        query: this.getQueryParams(),
        status: 404
      };
      
      this.notFoundHandler(this.currentRoute);
      this.notifyObservers();
    }
    
    return this;
  }
  
  /**
   * Выполнение цепочки middleware
   * @param {Array} middlewares - Массив middleware для выполнения
   * @param {Function} finalHandler - Конечный обработчик
   */
  async runMiddlewareChain(middlewares, finalHandler) {
    let index = 0;
    
    const next = async () => {
      // Если middleware закончились, выполняем основной обработчик
      if (index >= middlewares.length) {
        if (typeof finalHandler === 'function') {
          await finalHandler(this.currentRoute);
        } else if (typeof finalHandler === 'object' && finalHandler.render) {
          await finalHandler.render(this.currentRoute);
        }
        return;
      }
      
      // Выполняем текущий middleware
      const middleware = middlewares[index++];
      await middleware(this.currentRoute, next);
    };
    
    // Запускаем цепочку middleware
    await next();
  }
  
  /**
   * Извлечение параметров из маршрута
   * @param {string} path - Оригинальный путь с параметрами
   * @param {Array} match - Результат совпадения с регулярным выражением
   * @returns {Object} - Объект с параметрами
   */
  extractParams(path, match) {
    const params = {};
    const paramNames = path.match(/:\w+/g) || [];
    
    // Начинаем с 1, т.к. первый элемент - полное совпадение
    for (let i = 0; i < paramNames.length; i++) {
      const name = paramNames[i].substring(1); // Убираем двоеточие
      params[name] = match[i + 1];
    }
    
    return params;
  }
  
  /**
   * Получение параметров запроса из текущего URL
   * @returns {Object} - Объект с параметрами запроса
   */
  getQueryParams() {
    const query = {};
    let search = window.location.search.substring(1);
    
    if (!search) {
      const hashIndex = window.location.href.indexOf('#');
      if (hashIndex >= 0) {
        const hashParts = window.location.href.substring(hashIndex + 1).split('?');
        if (hashParts.length > 1) {
          search = hashParts[1];
        }
      }
    }
    
    const pairs = search.split('&');
    
    for (let i = 0; i < pairs.length; i++) {
      if (!pairs[i]) continue;
      
      const pair = pairs[i].split('=');
      query[decodeURIComponent(pair[0])] = pair.length > 1 
        ? decodeURIComponent(pair[1].replace(/\+/g, ' ')) 
        : '';
    }
    
    return query;
  }
  
  /**
   * Получение текущего пути
   * @returns {string} - Текущий путь
   */
  getCurrentPath() {
    if (this.mode === 'history') {
      return this.clearSlashes(
        decodeURI(window.location.pathname + window.location.search)
      );
    } else {
      let hash = window.location.hash.replace(/^#/, '');
      return this.clearSlashes(hash);
    }
  }
  
  /**
   * Очистка пути от лишних слешей
   * @param {string} path - Путь для очистки
   * @returns {string} - Очищенный путь
   */
  clearSlashes(path) {
    return path
      .toString()
      .replace(/\/$/, '')  // Удаляем последний слеш
      .replace(/^\//, ''); // Удаляем первый слеш
  }
  
  /**
   * Проверка авторизации пользователя
   * @returns {boolean} - Авторизован ли пользователь
   */
  checkAuth() {
    // В реальном приложении здесь будет логика проверки авторизации
    // Например, проверка наличия JWT токена и его валидности
    return localStorage.getItem('jwt_token') !== null;
  }
  
  /**
   * Регистрация наблюдателя за изменениями маршрута
   * @param {Function} callback - Функция, вызываемая при изменении маршрута
   * @returns {Function} - Функция для отписки от наблюдений
   */
  subscribe(callback) {
    this.observers.push(callback);
    
    // Возвращаем функцию для отписки
    return () => {
      this.observers = this.observers.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Уведомление всех наблюдателей об изменении маршрута
   */
  notifyObservers() {
    this.observers.forEach(callback => {
      try {
        callback(this.currentRoute, this.previousRoute);
      } catch (error) {
        console.error('Error in route observer:', error);
      }
    });
  }
  
  /**
   * Обработчик по умолчанию для маршрутов, которые не найдены
   * @param {Object} route - Информация о маршруте
   */
  defaultNotFoundHandler(route) {
    console.warn(`Route not found: ${route.path}`);
    const notFoundDiv = document.createElement('div');
    notFoundDiv.className = 'not-found';
    notFoundDiv.innerHTML = `
      <h1>404</h1>
      <p>Страница не найдена</p>
      <a href="/">Вернуться на главную</a>
    `;
    
    document.getElementById('app').innerHTML = '';
    document.getElementById('app').appendChild(notFoundDiv);
  }
  
  /**
   * Обработчик ошибок по умолчанию
   * @param {Error} error - Ошибка, возникшая при обработке маршрута
   */
  defaultErrorHandler(error) {
    console.error('Router error:', error);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'router-error';
    errorDiv.innerHTML = `
      <h1>Произошла ошибка</h1>
      <p>${error.message}</p>
      <a href="/">Вернуться на главную</a>
    `;
    
    document.getElementById('app').innerHTML = '';
    document.getElementById('app').appendChild(errorDiv);
  }
}

/**
 * Класс для создания компонентов страниц
 */
class PageComponent {
  constructor(options = {}) {
    this.template = options.template || '';
    this.data = options.data || {};
    this.methods = options.methods || {};
    this.mounted = options.mounted || (() => {});
    this.beforeDestroy = options.beforeDestroy || (() => {});
    this.element = null;
  }
  
  /**
   * Рендеринг компонента в DOM
   * @param {Object} route - Информация о маршруте
   */
  async render(route) {
    if (this.element) {
      // Выполняем метод перед удалением
      await this.beforeDestroy();
      
      // Если элемент уже существует, удаляем его
      this.element.remove();
    }
    
    // Создаем новый элемент
    this.element = document.createElement('div');
    this.element.className = 'page-component';
    
    // Обновляем контекст данных компонента
    this.data = { ...this.data, route };
    
    // Рендерим шаблон с текущими данными
    let html = this.template;
    
    // Простая замена переменных в шаблоне
    Object.entries(this.data).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      html = html.replace(regex, value);
    });
    
    this.element.innerHTML = html;
    
    // Добавляем обработчики событий
    this.setupEventListeners();
    
    // Добавляем элемент в DOM
    document.getElementById('app').innerHTML = '';
    document.getElementById('app').appendChild(this.element);
    
    // Вызываем хук mounted
    await this.mounted.call(this);
  }
  
  /**
   * Настройка обработчиков событий
   */
  setupEventListeners() {
    // Находим все элементы с атрибутом data-event
    const elements = this.element.querySelectorAll('[data-event]');
    
    elements.forEach(el => {
      const eventData = el.getAttribute('data-event').split(':');
      if (eventData.length !== 2) return;
      
      const [eventName, methodName] = eventData;
      
      if (!this.methods[methodName]) {
        console.warn(`Method ${methodName} not found`);
        return;
      }
      
      // Добавляем обработчик события
      el.addEventListener(eventName, (e) => {
        this.methods[methodName].call(this, e);
      });
    });
  }
}

/**
 * Функция для ленивой загрузки компонентов страниц
 * @param {Function} importFunc - Функция импорта компонента
 * @returns {Object} - Объект компонента с методом render
 */
function lazyLoad(importFunc) {
  return {
    render: async (route) => {
      try {
        // Показываем индикатор загрузки
        const loadingEl = document.createElement('div');
        loadingEl.className = 'loading-indicator';
        loadingEl.innerHTML = '<div class="spinner"></div><p>Загрузка...</p>';
        
        document.getElementById('app').innerHTML = '';
        document.getElementById('app').appendChild(loadingEl);
        
        // Загружаем компонент
        const module = await importFunc();
        const component = module.default || module;
        
        // Рендерим загруженный компонент
        await component.render(route);
      } catch (error) {
        console.error('Error loading component:', error);
        
        // Отображаем ошибку
        const errorEl = document.createElement('div');
        errorEl.className = 'loading-error';
        errorEl.innerHTML = `
          <h3>Ошибка загрузки</h3>
          <p>${error.message}</p>
          <button id="retry-load">Повторить</button>
        `;
        
        document.getElementById('app').innerHTML = '';
        document.getElementById('app').appendChild(errorEl);
        
        // Добавляем обработчик для повторной загрузки
        document.getElementById('retry-load').addEventListener('click', () => {
          lazyLoad(importFunc).render(route);
        });
      }
    }
  };
}

// Экспорт классов для использования в других модулях
export {
  Router,
  PageComponent,
  lazyLoad
}; 