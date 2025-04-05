import { useEffect, useState, useCallback } from 'react';
import { lightTheme, darkTheme, CustomTheme } from '../styles/theme';

type ThemeMode = 'light' | 'dark' | 'system';

export const useTheme = () => {
  const [theme, setTheme] = useState<CustomTheme>(lightTheme);
  const [mode, setMode] = useState<ThemeMode>('system');

  const setThemeMode = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  }, []);

  const getSystemTheme = useCallback((): 'light' | 'dark' => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  const updateTheme = useCallback((mode: ThemeMode) => {
    const themeMode = mode === 'system' ? getSystemTheme() : mode;
    const newTheme = themeMode === 'dark' ? darkTheme : lightTheme;
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [getSystemTheme]);

  const cycleTheme = useCallback(() => {
    if (mode === 'light') {
      setThemeMode('dark');
    } else if (mode === 'dark') {
      setThemeMode('system');
    } else {
      setThemeMode('light');
    }
  }, [mode, setThemeMode]);

  useEffect(() => {
    const savedMode = localStorage.getItem('themeMode') as ThemeMode || 'system';
    setMode(savedMode);
    updateTheme(savedMode);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (mode === 'system') {
        updateTheme('system');
      }
    };

    const handleKeyPress = (event: KeyboardEvent) => {
      // Alt + T для переключения темы
      if (event.altKey && event.key === 't') {
        cycleTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    window.addEventListener('keydown', handleKeyPress);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [mode, updateTheme, cycleTheme]);

  const safeTheme = theme || lightTheme;

  return {
    theme: safeTheme,
    mode,
    setThemeMode,
    cycleTheme,
    isDark: safeTheme === darkTheme,
  };
}; 