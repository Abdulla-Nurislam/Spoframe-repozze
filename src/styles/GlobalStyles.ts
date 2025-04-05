import { createGlobalStyle } from 'styled-components';
import { CustomTheme, lightTheme } from './theme';

// Создаем гарантированную резервную тему
const fallbackTheme = lightTheme;

export const GlobalStyles = createGlobalStyle<{ theme?: CustomTheme }>`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    background-color: ${({ theme = fallbackTheme }) => theme.colors.background};
    color: ${({ theme = fallbackTheme }) => theme.colors.text};
    font-family: ${({ theme = fallbackTheme }) => theme.typography.fontFamily};
    font-size: ${({ theme = fallbackTheme }) => theme.typography.fontSize};
    line-height: ${({ theme = fallbackTheme }) => theme.typography.lineHeight};
    transition: all ${({ theme = fallbackTheme }) => theme.transitions.default};
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${({ theme = fallbackTheme }) => theme.typography.headingFontFamily};
    font-weight: ${({ theme = fallbackTheme }) => theme.typography.headingFontWeight};
    margin-bottom: ${({ theme = fallbackTheme }) => theme.spacing.medium};
  }

  a {
    color: ${({ theme = fallbackTheme }) => theme.colors.primary};
    text-decoration: none;
    transition: color ${({ theme = fallbackTheme }) => theme.transitions.default};

    &:hover {
      color: ${({ theme = fallbackTheme }) => theme.colors.primaryDark};
    }
  }

  button {
    font-family: inherit;
    border: none;
    cursor: pointer;
    background: none;
    padding: ${({ theme = fallbackTheme }) => theme.spacing.small} ${({ theme = fallbackTheme }) => theme.spacing.medium};
    border-radius: ${({ theme = fallbackTheme }) => theme.borderRadius.default};
    transition: all ${({ theme = fallbackTheme }) => theme.transitions.default};

    &:disabled {
      cursor: not-allowed;
      opacity: 0.7;
    }
  }

  input, textarea {
    font-family: inherit;
    padding: ${({ theme = fallbackTheme }) => theme.spacing.small};
    border: 1px solid ${({ theme = fallbackTheme }) => theme.colors.border};
    border-radius: ${({ theme = fallbackTheme }) => theme.borderRadius.default};
    background-color: ${({ theme = fallbackTheme }) => theme.colors.surface};
    color: ${({ theme = fallbackTheme }) => theme.colors.text};
    transition: all ${({ theme = fallbackTheme }) => theme.transitions.default};

    &:focus {
      outline: none;
      border-color: ${({ theme = fallbackTheme }) => theme.colors.primary};
    }
  }

  ::selection {
    background-color: ${({ theme = fallbackTheme }) => theme.colors.primary};
    color: ${({ theme = fallbackTheme }) => theme.colors.white};
  }
`; 