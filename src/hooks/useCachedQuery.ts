import { useApiQuery } from './useApi';
import { useCallback, useMemo } from 'react';
import { UseQueryOptions } from '@tanstack/react-query';

interface CacheConfig {
  staleTime?: number;
  cacheTime?: number;
  retryDelay?: number;
}

const DEFAULT_CACHE_CONFIG: CacheConfig = {
  staleTime: 5 * 60 * 1000, // 5 минут
  cacheTime: 30 * 60 * 1000, // 30 минут
  retryDelay: 1000, // 1 секунда
};

export function useCachedQuery<TData = unknown>(
  key: string[],
  url: string,
  options?: UseQueryOptions<TData>,
  cacheConfig: CacheConfig = DEFAULT_CACHE_CONFIG
) {
  // Мемоизируем конфигурацию кеша
  const finalConfig = useMemo(
    () => ({
      ...DEFAULT_CACHE_CONFIG,
      ...cacheConfig,
    }),
    [cacheConfig]
  );

  // Мемоизируем опции запроса
  const queryOptions = useMemo(
    () => ({
      staleTime: finalConfig.staleTime,
      cacheTime: finalConfig.cacheTime,
      retry: 3,
      retryDelay: finalConfig.retryDelay,
      ...options,
    }),
    [finalConfig, options]
  );

  // Создаем функцию для принудительного обновления данных
  const forceRefetch = useCallback(async () => {
    const result = await queryOptions.queryFn?.();
    return result;
  }, [queryOptions]);

  const query = useApiQuery<TData>(key, url, queryOptions);

  return {
    ...query,
    forceRefetch,
  };
} 