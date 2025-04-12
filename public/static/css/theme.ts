import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme extends CustomTheme {}
}

export interface CustomTheme {
  colors: {
    primary: string;
    primaryDark: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    white: string;
  };
  spacing: {
    xs: string;
    small: string;
    medium: string;
    large: string;
    xl: string;
  };
  typography: {
    fontFamily: string;
    headingFontFamily: string;
    fontSize: string;
    lineHeight: string;
    headingFontWeight: number;
    h1: {
      fontSize: string;
      lineHeight: string;
      fontWeight: number;
    };
    h2: {
      fontSize: string;
      lineHeight: string;
      fontWeight: number;
    };
    body: {
      fontSize: string;
      lineHeight: string;
    };
    button: {
      fontSize: string;
      lineHeight: string;
    };
  };
  borderRadius: {
    small: string;
    default: string;
    large: string;
  };
  shadows: {
    small: string;
    default: string;
    large: string;
  };
  breakpoints: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  transitions: {
    fast: string;
    default: string;
    slow: string;
  };
}

export const lightTheme: CustomTheme = {
  colors: {
    primary: '#007AFF',
    primaryDark: '#0056B3',
    secondary: '#6C757D',
    background: '#F8F9FA',
    surface: '#FFFFFF',
    text: '#212529',
    textSecondary: '#6C757D',
    border: '#DEE2E6',
    error: '#DC3545',
    success: '#28A745',
    warning: '#FFC107',
    info: '#17A2B8',
    white: '#FFFFFF',
  },
  spacing: {
    xs: '0.25rem',
    small: '0.5rem',
    medium: '1rem',
    large: '1.5rem',
    xl: '2rem',
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
    headingFontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
    fontSize: '16px',
    lineHeight: '1.5',
    headingFontWeight: 600,
    h1: {
      fontSize: '2.5rem',
      lineHeight: '1.2',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      lineHeight: '1.3',
      fontWeight: 600,
    },
    body: {
      fontSize: '1rem',
      lineHeight: '1.5',
    },
    button: {
      fontSize: '1rem',
      lineHeight: '1.5',
    },
  },
  borderRadius: {
    small: '0.25rem',
    default: '0.5rem',
    large: '1rem',
  },
  shadows: {
    small: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    default: '0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)',
    large: '0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.10)',
  },
  breakpoints: {
    xs: '0px',
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
  },
  transitions: {
    fast: '150ms',
    default: '300ms',
    slow: '500ms',
  },
};

export const darkTheme: CustomTheme = {
  colors: {
    primary: '#0A84FF',
    primaryDark: '#0056B3',
    secondary: '#6C757D',
    background: '#1C1C1E',
    surface: '#2C2C2E',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    border: '#3A3A3C',
    error: '#DC3545',
    success: '#28A745',
    warning: '#FFC107',
    info: '#17A2B8',
    white: '#FFFFFF',
  },
  spacing: {
    xs: '0.25rem',
    small: '0.5rem',
    medium: '1rem',
    large: '1.5rem',
    xl: '2rem',
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
    headingFontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
    fontSize: '16px',
    lineHeight: '1.5',
    headingFontWeight: 600,
    h1: {
      fontSize: '2.5rem',
      lineHeight: '1.2',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      lineHeight: '1.3',
      fontWeight: 600,
    },
    body: {
      fontSize: '1rem',
      lineHeight: '1.5',
    },
    button: {
      fontSize: '1rem',
      lineHeight: '1.5',
    },
  },
  borderRadius: {
    small: '0.25rem',
    default: '0.5rem',
    large: '1rem',
  },
  shadows: {
    small: '0 1px 3px rgba(0,0,0,0.24), 0 1px 2px rgba(0,0,0,0.36)',
    default: '0 3px 6px rgba(0,0,0,0.30), 0 2px 4px rgba(0,0,0,0.24)',
    large: '0 10px 20px rgba(0,0,0,0.30), 0 3px 6px rgba(0,0,0,0.20)',
  },
  breakpoints: {
    xs: '0px',
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
  },
  transitions: {
    fast: '150ms',
    default: '300ms',
    slow: '500ms',
  },
}; 