interface ImageDimensions {
  width: number;
  height: number;
}

interface OptimizedImageUrls {
  webp: string;
  fallback: string;
  placeholder: string;
}

export const IMAGE_BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
};

// Генерируем srcset для разных размеров экрана
export function generateSrcSet(imagePath: string, dimensions: ImageDimensions[]): string {
  return dimensions
    .map(({ width }) => {
      const path = imagePath.replace(/\.(jpg|jpeg|png)$/, `_${width}w.$1`);
      return `${path} ${width}w`;
    })
    .join(', ');
}

// Создаем placeholder изображение с размытием
export function generatePlaceholder(imagePath: string): string {
  return imagePath.replace(/\.(jpg|jpeg|png)$/, '_placeholder.$1');
}

// Получаем оптимизированные URL для изображения
export function getOptimizedImageUrls(imagePath: string): OptimizedImageUrls {
  const webp = imagePath.replace(/\.(jpg|jpeg|png)$/, '.webp');
  const placeholder = generatePlaceholder(imagePath);

  return {
    webp,
    fallback: imagePath,
    placeholder,
  };
}

// Генерируем размеры изображений для разных экранов
export function getResponsiveDimensions(
  originalWidth: number,
  originalHeight: number
): ImageDimensions[] {
  const aspectRatio = originalWidth / originalHeight;

  return Object.values(IMAGE_BREAKPOINTS).map((breakpoint) => ({
    width: breakpoint,
    height: Math.round(breakpoint / aspectRatio),
  }));
}

// Проверяем поддержку WebP в браузере
export async function isWebPSupported(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const webP = new Image();
  webP.src =
    'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';

  try {
    await webP.decode();
    return true;
  } catch {
    return false;
  }
}

// Предзагрузка изображения
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

// Оптимизация размера изображения под контейнер
export function getOptimalImageSize(
  containerWidth: number,
  containerHeight: number,
  imageWidth: number,
  imageHeight: number
): ImageDimensions {
  const containerAspectRatio = containerWidth / containerHeight;
  const imageAspectRatio = imageWidth / imageHeight;

  if (containerAspectRatio > imageAspectRatio) {
    // Контейнер шире, чем изображение
    return {
      width: Math.round(containerHeight * imageAspectRatio),
      height: containerHeight,
    };
  } else {
    // Контейнер уже, чем изображение
    return {
      width: containerWidth,
      height: Math.round(containerWidth / imageAspectRatio),
    };
  }
} 