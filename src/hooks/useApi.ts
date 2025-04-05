import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

interface ApiError {
  message: string;
  status: number;
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = useAuthStore.getState().token;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error: ApiError = {
      message: 'An error occurred while fetching the data.',
      status: response.status,
    };
    try {
      const data = await response.json();
      error.message = data.message || error.message;
    } catch {
      // Игнорируем ошибку парсинга JSON
    }
    throw error;
  }

  return response.json();
}

export function useApiQuery<TData = unknown>(
  key: string[],
  url: string,
  options?: UseQueryOptions<TData, ApiError>
) {
  return useQuery<TData, ApiError>({
    queryKey: key,
    queryFn: () => fetchWithAuth(url),
    ...options,
  });
}

export function useApiMutation<TData = unknown, TVariables = unknown>(
  url: string,
  options?: UseMutationOptions<TData, ApiError, TVariables>
) {
  return useMutation<TData, ApiError, TVariables>({
    mutationFn: (variables) =>
      fetchWithAuth(url, {
        method: 'POST',
        body: JSON.stringify(variables),
      }),
    ...options,
  });
} 