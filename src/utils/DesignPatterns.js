/**
 * Файл с демонстрацией различных паттернов проектирования, 
 * используемых в проекте Spoframe
 */

/**
 * Паттерн Singleton (Одиночка)
 * Гарантирует, что класс имеет только один экземпляр
 * и предоставляет глобальную точку доступа к нему
 * 
 * Используется для менеджера состояния, конфигурации и т.д.
 */
class ConfigManager {
  static instance = null;
  
  constructor() {
    this.config = {
      apiUrl: process.env.API_URL || 'https://api.spoframe.com',
      debug: process.env.NODE_ENV !== 'production',
      theme: localStorage.getItem('theme') || 'light',
      language: localStorage.getItem('language') || 'ru'
    };
    
    // Защита от создания нескольких экземпляров
    if (ConfigManager.instance) {
      return ConfigManager.instance;
    }
    
    ConfigManager.instance = this;
  }
  
  get(key) {
    return this.config[key];
  }
  
  set(key, value) {
    this.config[key] = value;
    
    // Сохраняем некоторые настройки в localStorage
    if (['theme', 'language'].includes(key)) {
      localStorage.setItem(key, value);
    }
    
    return this;
  }
}

/**
 * Паттерн Factory Method (Фабричный метод)
 * Определяет интерфейс для создания объекта,
 * но позволяет подклассам выбирать класс создаваемого экземпляра
 * 
 * Используется для создания различных типов компонентов
 */
class ComponentFactory {
  // Базовый метод создания компонента
  createComponent(type, config) {
    let component;
    
    switch (type) {
      case 'modal':
        component = new ModalComponent(config);
        break;
      case 'carousel':
        component = new CarouselComponent(config);
        break;
      case 'gallery':
        component = new GalleryComponent(config);
        break;
      case 'filter':
        component = new FilterComponent(config);
        break;
      default:
        throw new Error(`Unknown component type: ${type}`);
    }
    
    // Общая постобработка
    this.registerComponent(component);
    return component;
  }
  
  registerComponent(component) {
    // Регистрация компонента для отслеживания жизненного цикла
    console.log(`Component ${component.name} registered`);
  }
}

// Классы компонентов (упрощенно)
class BaseComponent {
  constructor(config) {
    this.config = config;
    this.state = {};
    this.element = null;
  }
  
  render() {
    throw new Error('Method not implemented');
  }
  
  mount(container) {
    if (!container) {
      throw new Error('Container not provided');
    }
    
    const renderedElement = this.render();
    container.appendChild(renderedElement);
    this.element = renderedElement;
    
    this.afterMount();
    return this;
  }
  
  afterMount() {
    // Хук после монтирования, может быть переопределен
  }
  
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
  }
}

class ModalComponent extends BaseComponent {
  constructor(config) {
    super(config);
    this.name = 'Modal';
    this.isOpen = false;
  }
  
  render() {
    const modalEl = document.createElement('div');
    modalEl.className = 'modal' + (this.config.customClass ? ` ${this.config.customClass}` : '');
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    if (this.config.title) {
      const title = document.createElement('h2');
      title.textContent = this.config.title;
      modalContent.appendChild(title);
    }
    
    if (this.config.content) {
      const content = document.createElement('div');
      content.innerHTML = this.config.content;
      modalContent.appendChild(content);
    }
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => this.close());
    
    modalContent.appendChild(closeBtn);
    modalEl.appendChild(modalContent);
    
    // Обработка клика вне модального окна
    modalEl.addEventListener('click', (e) => {
      if (e.target === modalEl) {
        this.close();
      }
    });
    
    return modalEl;
  }
  
  open() {
    if (!this.element) {
      throw new Error('Modal not mounted');
    }
    
    this.element.style.display = 'flex';
    this.isOpen = true;
    
    // Вызываем обработчик события открытия
    if (this.config.onOpen) {
      this.config.onOpen();
    }
    
    return this;
  }
  
  close() {
    if (!this.element) return;
    
    this.element.style.display = 'none';
    this.isOpen = false;
    
    // Вызываем обработчик события закрытия
    if (this.config.onClose) {
      this.config.onClose();
    }
    
    return this;
  }
}

class CarouselComponent extends BaseComponent {
  constructor(config) {
    super(config);
    this.name = 'Carousel';
    this.currentSlide = 0;
    this.slides = config.slides || [];
  }
  
  render() {
    // Упрощенная реализация карусели
    const carousel = document.createElement('div');
    carousel.className = 'carousel';
    
    // Добавляем слайды
    const slidesContainer = document.createElement('div');
    slidesContainer.className = 'carousel-slides';
    
    this.slides.forEach((slide, index) => {
      const slideElement = document.createElement('div');
      slideElement.className = 'carousel-slide';
      slideElement.style.display = index === this.currentSlide ? 'block' : 'none';
      
      if (slide.imageUrl) {
        const img = document.createElement('img');
        img.src = slide.imageUrl;
        img.alt = slide.alt || '';
        slideElement.appendChild(img);
      }
      
      if (slide.caption) {
        const caption = document.createElement('div');
        caption.className = 'slide-caption';
        caption.textContent = slide.caption;
        slideElement.appendChild(caption);
      }
      
      slidesContainer.appendChild(slideElement);
    });
    
    // Добавляем кнопки навигации
    const prevBtn = document.createElement('button');
    prevBtn.className = 'carousel-prev';
    prevBtn.innerHTML = '&lt;';
    prevBtn.addEventListener('click', () => this.prevSlide());
    
    const nextBtn = document.createElement('button');
    nextBtn.className = 'carousel-next';
    nextBtn.innerHTML = '&gt;';
    nextBtn.addEventListener('click', () => this.nextSlide());
    
    carousel.appendChild(slidesContainer);
    carousel.appendChild(prevBtn);
    carousel.appendChild(nextBtn);
    
    return carousel;
  }
  
  nextSlide() {
    if (!this.element) return;
    
    const slides = this.element.querySelectorAll('.carousel-slide');
    slides[this.currentSlide].style.display = 'none';
    
    this.currentSlide = (this.currentSlide + 1) % slides.length;
    slides[this.currentSlide].style.display = 'block';
  }
  
  prevSlide() {
    if (!this.element) return;
    
    const slides = this.element.querySelectorAll('.carousel-slide');
    slides[this.currentSlide].style.display = 'none';
    
    this.currentSlide = (this.currentSlide - 1 + slides.length) % slides.length;
    slides[this.currentSlide].style.display = 'block';
  }
}

class GalleryComponent extends BaseComponent {
  constructor(config) {
    super(config);
    this.name = 'Gallery';
    this.images = config.images || [];
  }
  
  render() {
    // Реализация галереи изображений
    const gallery = document.createElement('div');
    gallery.className = 'gallery-grid';
    
    this.images.forEach(image => {
      const imgContainer = document.createElement('div');
      imgContainer.className = 'gallery-item';
      
      const img = document.createElement('img');
      img.src = image.thumbnail || image.src;
      img.alt = image.alt || '';
      
      // Открытие полноразмерного изображения при клике
      imgContainer.addEventListener('click', () => {
        if (this.config.onImageClick) {
          this.config.onImageClick(image);
        } else {
          this.openLightbox(image);
        }
      });
      
      imgContainer.appendChild(img);
      gallery.appendChild(imgContainer);
    });
    
    return gallery;
  }
  
  openLightbox(image) {
    // Создаем модальное окно для просмотра изображения
    const modal = new ModalComponent({
      customClass: 'lightbox-modal',
      content: `<img src="${image.src}" alt="${image.alt || ''}" class="lightbox-image">`,
      onClose: () => {
        modal.destroy();
      }
    });
    
    // Монтируем и открываем
    modal.mount(document.body).open();
  }
}

class FilterComponent extends BaseComponent {
  constructor(config) {
    super(config);
    this.name = 'Filter';
    this.filters = config.filters || {};
    this.onFilterChange = config.onFilterChange || (() => {});
  }
  
  render() {
    const filterContainer = document.createElement('div');
    filterContainer.className = 'filter-container';
    
    // Создаем группы фильтров
    Object.entries(this.filters).forEach(([groupName, options]) => {
      const group = document.createElement('div');
      group.className = 'filter-group';
      
      const heading = document.createElement('h3');
      heading.textContent = groupName;
      group.appendChild(heading);
      
      // Создаем опции фильтра
      options.forEach(option => {
        const checkboxWrapper = document.createElement('div');
        checkboxWrapper.className = 'checkbox-wrapper';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `filter-${groupName}-${option.value}`;
        checkbox.value = option.value;
        checkbox.checked = option.selected || false;
        
        checkbox.addEventListener('change', () => {
          // Обновляем состояние фильтра
          this.updateFilter(groupName, option.value, checkbox.checked);
          
          // Уведомляем о изменении
          this.onFilterChange(this.getActiveFilters());
        });
        
        const label = document.createElement('label');
        label.htmlFor = `filter-${groupName}-${option.value}`;
        label.textContent = option.label;
        
        checkboxWrapper.appendChild(checkbox);
        checkboxWrapper.appendChild(label);
        group.appendChild(checkboxWrapper);
      });
      
      filterContainer.appendChild(group);
    });
    
    return filterContainer;
  }
  
  updateFilter(groupName, value, isChecked) {
    if (!this.filters[groupName]) return;
    
    this.filters[groupName] = this.filters[groupName].map(option => {
      if (option.value === value) {
        return { ...option, selected: isChecked };
      }
      return option;
    });
  }
  
  getActiveFilters() {
    const active = {};
    
    Object.entries(this.filters).forEach(([groupName, options]) => {
      active[groupName] = options
        .filter(option => option.selected)
        .map(option => option.value);
    });
    
    return active;
  }
}

/**
 * Паттерн Observer (Наблюдатель)
 * Определяет зависимость типа "один ко многим" между объектами так,
 * что при изменении состояния одного объекта все зависимые от него оповещаются
 * 
 * Используется для реактивного обновления компонентов
 */
class EventBus {
  constructor() {
    this.listeners = {};
  }
  
  subscribe(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    
    const index = this.listeners[event].push(callback) - 1;
    
    // Возвращаем функцию для отписки
    return () => {
      this.listeners[event].splice(index, 1);
    };
  }
  
  publish(event, data) {
    if (!this.listeners[event]) {
      return;
    }
    
    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event ${event} handler:`, error);
      }
    });
  }
}

/**
 * Паттерн Adapter (Адаптер)
 * Позволяет объектам с несовместимыми интерфейсами работать вместе
 * 
 * Используется для интеграции внешних API
 */
class SpotifyApiAdapter {
  constructor(spotifyClient) {
    this.client = spotifyClient;
  }
  
  async getTrack(trackId) {
    try {
      // Получаем трек из Spotify API
      const spotifyTrack = await this.client.getTrack(trackId);
      
      // Адаптируем к формату нашего приложения
      return {
        id: spotifyTrack.id,
        title: spotifyTrack.name,
        artist: spotifyTrack.artists.map(a => a.name).join(', '),
        album: spotifyTrack.album.name,
        cover: spotifyTrack.album.images[0]?.url || '',
        duration: this.formatDuration(spotifyTrack.duration_ms),
        previewUrl: spotifyTrack.preview_url,
        externalUrl: spotifyTrack.external_urls.spotify
      };
    } catch (error) {
      console.error('Error fetching track from Spotify:', error);
      throw new Error('Could not fetch track information');
    }
  }
  
  async searchTracks(query, limit = 10) {
    try {
      // Выполняем поиск через Spotify API
      const results = await this.client.search(query, ['track'], { limit });
      
      // Адаптируем результаты
      return results.tracks.items.map(track => ({
        id: track.id,
        title: track.name,
        artist: track.artists.map(a => a.name).join(', '),
        album: track.album.name,
        cover: track.album.images[0]?.url || '',
        duration: this.formatDuration(track.duration_ms)
      }));
    } catch (error) {
      console.error('Error searching tracks in Spotify:', error);
      throw new Error('Search failed');
    }
  }
  
  formatDuration(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, '0')}`;
  }
}

/**
 * Паттерн Strategy (Стратегия)
 * Определяет семейство алгоритмов, инкапсулирует каждый из них и делает их взаимозаменяемыми
 * 
 * Используется для разных стратегий аутентификации
 */
class AuthContext {
  constructor() {
    this.strategy = null;
  }
  
  setStrategy(strategy) {
    this.strategy = strategy;
  }
  
  async login(credentials) {
    if (!this.strategy) {
      throw new Error('Authentication strategy not set');
    }
    
    return this.strategy.login(credentials);
  }
  
  async logout() {
    if (!this.strategy) {
      throw new Error('Authentication strategy not set');
    }
    
    return this.strategy.logout();
  }
  
  async getCurrentUser() {
    if (!this.strategy) {
      throw new Error('Authentication strategy not set');
    }
    
    return this.strategy.getCurrentUser();
  }
}

// Конкретные стратегии аутентификации
class JwtAuthStrategy {
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.tokenKey = 'jwt_token';
  }
  
  async login(credentials) {
    try {
      const response = await this.apiClient.post('/auth/login', credentials);
      const { token, user } = response.data;
      
      // Сохраняем токен
      localStorage.setItem(this.tokenKey, token);
      
      return user;
    } catch (error) {
      console.error('JWT login failed:', error);
      throw new Error('Authentication failed');
    }
  }
  
  async logout() {
    localStorage.removeItem(this.tokenKey);
    return true;
  }
  
  async getCurrentUser() {
    const token = localStorage.getItem(this.tokenKey);
    
    if (!token) {
      return null;
    }
    
    try {
      const response = await this.apiClient.get('/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }
}

class OAuth2Strategy {
  constructor(provider, clientId, redirectUri) {
    this.provider = provider;
    this.clientId = clientId;
    this.redirectUri = redirectUri;
    this.tokenKey = `oauth_${provider}_token`;
  }
  
  async login() {
    // Открываем окно OAuth провайдера
    const width = 600;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const authUrl = this.getAuthUrl();
    const authWindow = window.open(
      authUrl,
      `${this.provider}Auth`,
      `width=${width},height=${height},left=${left},top=${top}`
    );
    
    return new Promise((resolve, reject) => {
      // Обработка сообщения от окна аутентификации
      const handleMessage = (event) => {
        // Проверяем источник сообщения для безопасности
        if (event.origin !== window.location.origin) return;
        
        const { token, error, user } = event.data;
        
        if (error) {
          reject(new Error(error));
        } else if (token) {
          localStorage.setItem(this.tokenKey, token);
          resolve(user);
        }
        
        // Удаляем обработчик сообщений
        window.removeEventListener('message', handleMessage);
      };
      
      window.addEventListener('message', handleMessage);
      
      // Обработка закрытия окна без авторизации
      const checkClosed = setInterval(() => {
        if (authWindow.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          reject(new Error('Authentication cancelled'));
        }
      }, 500);
    });
  }
  
  getAuthUrl() {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: this.getScope()
    });
    
    return `${this.getProviderAuthUrl()}?${params.toString()}`;
  }
  
  getProviderAuthUrl() {
    switch (this.provider) {
      case 'google':
        return 'https://accounts.google.com/o/oauth2/v2/auth';
      case 'facebook':
        return 'https://www.facebook.com/v12.0/dialog/oauth';
      default:
        throw new Error(`Unsupported provider: ${this.provider}`);
    }
  }
  
  getScope() {
    switch (this.provider) {
      case 'google':
        return 'profile email';
      case 'facebook':
        return 'public_profile,email';
      default:
        return '';
    }
  }
  
  async logout() {
    localStorage.removeItem(this.tokenKey);
    return true;
  }
  
  async getCurrentUser() {
    const token = localStorage.getItem(this.tokenKey);
    
    if (!token) {
      return null;
    }
    
    try {
      // Здесь должен быть запрос к API для проверки токена и получения данных пользователя
      // В примере просто симулируем
      return {
        id: 'oauth-user-id',
        name: 'OAuth User',
        email: 'oauth@example.com',
        provider: this.provider
      };
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }
}

/**
 * Паттерн Chain of Responsibility (Цепочка ответственности)
 * Позволяет передавать запросы последовательно по цепочке обработчиков
 * 
 * Используется для валидации форм
 */
class ValidationHandler {
  constructor() {
    this.nextHandler = null;
  }
  
  setNext(handler) {
    this.nextHandler = handler;
    return handler;
  }
  
  validate(data) {
    if (this.nextHandler) {
      return this.nextHandler.validate(data);
    }
    
    return { isValid: true };
  }
}

class RequiredFieldValidator extends ValidationHandler {
  constructor(fieldName, errorMessage) {
    super();
    this.fieldName = fieldName;
    this.errorMessage = errorMessage || `Поле ${fieldName} обязательно для заполнения`;
  }
  
  validate(data) {
    if (!data[this.fieldName] || data[this.fieldName].trim() === '') {
      return {
        isValid: false,
        field: this.fieldName,
        error: this.errorMessage
      };
    }
    
    // Если проверка пройдена, передаем запрос следующему обработчику
    return super.validate(data);
  }
}

class EmailValidator extends ValidationHandler {
  constructor(fieldName, errorMessage) {
    super();
    this.fieldName = fieldName;
    this.errorMessage = errorMessage || 'Некорректный формат email';
  }
  
  validate(data) {
    if (data[this.fieldName]) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data[this.fieldName])) {
        return {
          isValid: false,
          field: this.fieldName,
          error: this.errorMessage
        };
      }
    }
    
    return super.validate(data);
  }
}

class PasswordValidator extends ValidationHandler {
  constructor(fieldName, errorMessage, options = {}) {
    super();
    this.fieldName = fieldName;
    this.errorMessage = errorMessage || 'Пароль должен содержать минимум 8 символов, включая цифры и буквы';
    this.options = {
      minLength: 8,
      requireDigits: true,
      requireLetters: true,
      ...options
    };
  }
  
  validate(data) {
    if (data[this.fieldName]) {
      const password = data[this.fieldName];
      
      // Проверка минимальной длины
      if (password.length < this.options.minLength) {
        return {
          isValid: false,
          field: this.fieldName,
          error: `Пароль должен содержать минимум ${this.options.minLength} символов`
        };
      }
      
      // Проверка наличия цифр
      if (this.options.requireDigits && !/\d/.test(password)) {
        return {
          isValid: false,
          field: this.fieldName,
          error: 'Пароль должен содержать хотя бы одну цифру'
        };
      }
      
      // Проверка наличия букв
      if (this.options.requireLetters && !/[a-zA-Z]/.test(password)) {
        return {
          isValid: false,
          field: this.fieldName,
          error: 'Пароль должен содержать хотя бы одну букву'
        };
      }
    }
    
    return super.validate(data);
  }
}

class PasswordMatchValidator extends ValidationHandler {
  constructor(passwordField, confirmField, errorMessage) {
    super();
    this.passwordField = passwordField;
    this.confirmField = confirmField;
    this.errorMessage = errorMessage || 'Пароли не совпадают';
  }
  
  validate(data) {
    if (data[this.passwordField] && data[this.confirmField]) {
      if (data[this.passwordField] !== data[this.confirmField]) {
        return {
          isValid: false,
          field: this.confirmField,
          error: this.errorMessage
        };
      }
    }
    
    return super.validate(data);
  }
}

// Экспорт классов для использования в других модулях
export {
  ConfigManager,
  ComponentFactory,
  ModalComponent,
  CarouselComponent,
  GalleryComponent,
  FilterComponent,
  EventBus,
  SpotifyApiAdapter,
  AuthContext,
  JwtAuthStrategy,
  OAuth2Strategy,
  ValidationHandler,
  RequiredFieldValidator,
  EmailValidator,
  PasswordValidator,
  PasswordMatchValidator
}; 