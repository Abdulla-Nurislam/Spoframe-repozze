# Сложная компонентная архитектура в Spoframe

## Введение

В рамках проекта Spoframe создана передовая компонентная архитектура, демонстрирующая современные подходы к разработке масштабируемых React-приложений. Архитектура позволяет эффективно управлять сложным состоянием, обеспечивать переиспользование кода и оптимизировать производительность.

## Ключевые элементы архитектуры

### 1. Управление глобальным состоянием

В основе архитектуры лежит использование Context API в сочетании с паттерном Reducer. Такой подход предоставляет следующие преимущества:

- **Централизованное управление данными** — все глобальное состояние хранится в одном месте, что упрощает отслеживание изменений
- **Предсказуемые обновления состояния** — благодаря Redux-подобному reducer каждое изменение состояния происходит через явные действия (actions)
- **Мемоизация и оптимизация** — использование `useMemo` и `useCallback` предотвращает лишние перерендеры

Пример реализации:

```jsx
// Контекст и начальное состояние
const AppContext = createContext();
const initialState = {
  theme: 'light',
  user: null,
  isAuthenticated: false,
  // ... другие данные состояния
};

// Reducer для управления состоянием
function appReducer(state, action) {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'LOGIN':
      return { 
        ...state, 
        user: action.payload, 
        isAuthenticated: true,
        // ... дополнительные обновления
      };
    // ... другие действия
    default:
      return state;
  }
}

// Provider компонент
function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  const contextValue = useMemo(() => {
    return { state, dispatch };
  }, [state]);
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}
```

### 2. Кастомные хуки для изоляции логики

Бизнес-логика приложения изолирована в кастомных хуках, что обеспечивает:

- **Разделение ответственности** — логика полностью отделена от представления
- **Тестируемость** — изолированный код проще тестировать
- **Переиспользование** — логику можно использовать в разных компонентах

Примеры реализованных хуков:

```jsx
// Хук для работы с темой
function useTheme() {
  const { state, dispatch } = useApp();
  
  const toggleTheme = useCallback(() => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    dispatch({ type: 'SET_THEME', payload: newTheme });
  }, [state.theme, dispatch]);
  
  // ... дополнительная логика
  
  return {
    theme: state.theme,
    toggleTheme,
    isDark: state.theme === 'dark'
  };
}

// Хук для работы с продуктами
function useProducts() {
  const { state, dispatch } = useApp();
  
  const fetchProducts = useCallback(async () => {
    dispatch({ type: 'FETCH_PRODUCTS_START' });
    // ... логика загрузки данных
  }, [dispatch]);
  
  const filteredProducts = useMemo(() => {
    // ... логика фильтрации
  }, [state.products, state.filters]);
  
  return {
    products: state.products,
    filteredProducts,
    isLoading: state.isLoading,
    error: state.error,
    fetchProducts,
    updateFilters
  };
}
```

### 3. Паттерны HOC и Render Props

Для расширения функциональности и гибкой компоновки компонентов используются продвинутые паттерны React:

#### Higher-Order Components (HOC)

HOC позволяют динамически расширять функциональность компонентов без изменения их исходного кода:

```jsx
// HOC для добавления функционала drag-and-drop
function withDraggable(Component) {
  return function DraggableComponent(props) {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    
    // ... логика перетаскивания
    
    return (
      <div 
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
      >
        <Component {...props} />
      </div>
    );
  };
}

// Применение HOC
const DraggableCart = withDraggable(CartWidget);
```

#### Render Props

Паттерн Render Props обеспечивает гибкую передачу данных между компонентами:

```jsx
// Компонент с render props для измерения размеров
function Measure({ children }) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const measuredRef = useCallback(node => {
    if (node !== null) {
      const { width, height } = node.getBoundingClientRect();
      setSize({ width, height });
    }
  }, []);
  
  if (typeof children === 'function') {
    return children({ size, ref: measuredRef });
  }
  
  return (
    <div ref={measuredRef}>
      {children}
    </div>
  );
}

// Использование
<Measure>
  {({ size, ref }) => (
    <div ref={ref}>
      <ProductCard product={product} />
      <div>Размер: {size.width}x{size.height}px</div>
    </div>
  )}
</Measure>
```

### 4. Ленивая загрузка компонентов

Для оптимизации производительности реализована ленивая загрузка компонентов:

```jsx
// Определение ленивого компонента
const LazyProductDetail = lazy(() => import('./ProductDetail'));

// Использование с Suspense
<Suspense fallback={<LoadingPlaceholder />}>
  <LazyProductDetail product={product} />
</Suspense>
```

### 5. Оптимизация с помощью мемоизации

Для предотвращения избыточных перерендеров используются техники мемоизации:

```jsx
// Мемоизированный компонент
const ProductCard = memo(function ProductCard({ product, onAddToCart }) {
  // ... рендеринг компонента
});

// Мемоизированные вычисления
const filteredProducts = useMemo(() => {
  // ... логика фильтрации
}, [products, filters]);

// Мемоизированные обработчики
const handleAddToCart = useCallback((product) => {
  dispatch({ type: 'ADD_TO_CART', payload: product });
}, [dispatch]);
```

## Структура компонентов

Компоненты в архитектуре организованы согласно принципам:

1. **Atomiс Design** — разделение компонентов на атомы, молекулы, организмы, шаблоны и страницы
2. **Инверсия контроля** — использование пропсов для передачи зависимостей
3. **Презентационные и контейнерные компоненты** — разделение логики и представления

## Структура директорий

```
src/
  ├── components/                # Компоненты
  │   ├── common/                # Общие компоненты
  │   ├── layouts/               # Компоненты макетов
  │   ├── pages/                 # Компоненты страниц
  │   └── standalone/            # Автономные компоненты
  │       ├── ComponentArchitecture.jsx # Пример сложной архитектуры
  │       └── ProductDetail.jsx  # Компонент детализации продукта
  ├── context/                   # Контексты для управления состоянием
  ├── hooks/                     # Кастомные хуки
  ├── utils/                     # Утилиты и вспомогательные функции
  │   ├── DesignPatterns.js      # Реализации паттернов проектирования
  │   └── Router.js              # Кастомная система маршрутизации
  └── styles/                    # Стили
      └── component-architecture.css # Стили для демонстрации архитектуры
```

## Пример использования

Полная демонстрация всех элементов архитектуры представлена в файле `src/components/standalone/ComponentArchitecturemkdir -p static-deploy
cp *.html *.css user-feedback-native.js *.png *.jpg static-deploy/echo '{
  "name": "spoframe-static",
  "version": "1.0.0",
  "private": true,
  "dependencies": {},
  "engines": {
    "node": ">=16.0.0"
  }
}' > static-deploy/package.json`, который реализует:

- Глобальное управление состоянием через Context API + Reducer
- Использование кастомных хуков для различных частей приложения
- Применение HOC для добавления функциональности drag-and-drop
- Использование Render Props для измерения размеров компонентов
- Ленивую загрузку компонентов с Suspense
- Мемоизацию компонентов, вычислений и обработчиков

Компонент можно увидеть в действии, открыв `component-architecture.html` в браузере.

## Заключение

Разработанная компонентная архитектура обеспечивает высокую гибкость, масштабируемость и производительность приложения. Она использует самые современные практики React-разработки и может служить основой для сложных проектов. 