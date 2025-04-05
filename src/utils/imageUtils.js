// Функция для генерации URL изображения с нужными параметрами
export const generateImageUrl = (src, width, quality) => {
  // Если URL уже содержит параметры, добавляем наши
  const url = new URL(src, window.location.origin);
  url.searchParams.set('w', width);
  url.searchParams.set('q', quality);
  
  // Если это локальное изображение, добавляем WebP формат
  if (src.startsWith('/')) {
    url.searchParams.set('format', 'webp');
  }
  
  return url.toString();
};

// Функция для генерации размытого placeholder'а
export const generateBlurPlaceholder = async (src) => {
  try {
    // Создаем маленькую версию изображения (10px в ширину)
    const response = await fetch(generateImageUrl(src, 10, 70));
    const blob = await response.blob();
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error generating blur placeholder:', error);
    return '';
  }
};

// Функция для проверки поддержки WebP
export const checkWebpSupport = () => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 1);
    };
  });
};

// Функция для предварительной загрузки изображений
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// Функция для определения доминантного цвета изображения
export const getDominantColor = async (src) => {
  try {
    const img = await preloadImage(src);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 1;
    canvas.height = 1;
    ctx.drawImage(img, 0, 0, 1, 1);
    
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return `rgb(${r}, ${g}, ${b})`;
  } catch (error) {
    console.error('Error getting dominant color:', error);
    return 'rgb(200, 200, 200)'; // Fallback color
  }
};

// Хук для отложенной загрузки изображений
export const useImageLoader = (src, options = {}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [dominantColor, setDominantColor] = useState(null);

  useEffect(() => {
    if (!src) return;

    const loadImage = async () => {
      try {
        await preloadImage(src);
        if (options.getDominantColor) {
          const color = await getDominantColor(src);
          setDominantColor(color);
        }
        setLoaded(true);
      } catch (err) {
        setError(err);
      }
    };

    loadImage();
  }, [src, options.getDominantColor]);

  return { loaded, error, dominantColor };
}; 