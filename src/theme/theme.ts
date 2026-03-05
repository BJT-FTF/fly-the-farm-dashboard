import { createTheme, alpha } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    accent: Palette['primary'];
    surface: {
      glass: string;
      elevated: string;
      topo: string;
    };
  }
  interface PaletteOptions {
    accent?: PaletteOptions['primary'];
    surface?: {
      glass: string;
      elevated: string;
      topo: string;
    };
  }
}

// Fly the Farm brand greens — sourced from flythefarm.com.au
const GREEN_900 = '#0a1f0a';  // Darkest - footer bg
const GREEN_800 = '#143a1a';  // Dark green - header/nav bg
const GREEN_700 = '#1a5c24';  // Section headings
const GREEN_600 = '#217a2d';  // Active elements
const GREEN_500 = '#2e9e3c';  // Bright brand green
const GREEN_400 = '#4cb85a';  // Leaf green / CTA accent
const GREEN_300 = '#7ad084';  // Light green accent
const GREEN_200 = '#a8e2af';  // Tinted backgrounds
const GREEN_100 = '#d4f0d7';  // Light green surface
const GREEN_50 = '#edf8ee';   // Lightest green bg

// Lime green — the vivid accent from newsletter/section backgrounds
const LIME_500 = '#8bc34a';
const LIME_400 = '#9ccc65';
const LIME_300 = '#aed581';
const LIME_200 = '#c5e1a5';
const LIME_100 = '#dcedc8';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: GREEN_800,
      light: GREEN_600,
      dark: GREEN_900,
      contrastText: '#ffffff',
    },
    secondary: {
      main: GREEN_400,
      light: GREEN_300,
      dark: GREEN_500,
      contrastText: '#ffffff',
    },
    accent: {
      main: LIME_500,
      light: LIME_300,
      dark: GREEN_500,
      contrastText: GREEN_900,
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
    },
    warning: {
      main: '#e65100',
      light: '#ff8f00',
      dark: '#bf360c',
    },
    error: {
      main: '#c62828',
      light: '#e53935',
      dark: '#b71c1c',
    },
    background: {
      default: '#f3f7f3',
      paper: '#ffffff',
    },
    text: {
      primary: GREEN_900,
      secondary: '#3e5a3e',
    },
    divider: alpha(GREEN_800, 0.1),
    surface: {
      glass: alpha(GREEN_800, 0.03),
      elevated: '#ffffff',
      topo: alpha(GREEN_400, 0.04),
    },
  },
  typography: {
    fontFamily: '"Source Sans 3", "Source Sans Pro", system-ui, sans-serif',
    h1: {
      fontFamily: '"Outfit", system-ui, sans-serif',
      fontWeight: 800,
      letterSpacing: '-0.02em',
      lineHeight: 1.1,
    },
    h2: {
      fontFamily: '"Outfit", system-ui, sans-serif',
      fontWeight: 700,
      letterSpacing: '-0.01em',
      lineHeight: 1.15,
    },
    h3: {
      fontFamily: '"Outfit", system-ui, sans-serif',
      fontWeight: 700,
      letterSpacing: '-0.01em',
      lineHeight: 1.2,
    },
    h4: {
      fontFamily: '"Outfit", system-ui, sans-serif',
      fontWeight: 700,
      letterSpacing: '-0.005em',
      lineHeight: 1.25,
    },
    h5: {
      fontFamily: '"Outfit", system-ui, sans-serif',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h6: {
      fontFamily: '"Outfit", system-ui, sans-serif',
      fontWeight: 600,
      lineHeight: 1.35,
    },
    subtitle1: {
      fontWeight: 600,
      lineHeight: 1.4,
    },
    subtitle2: {
      fontWeight: 700,
      fontSize: '0.8125rem',
      letterSpacing: '0.06em',
      textTransform: 'uppercase' as const,
    },
    body1: {
      lineHeight: 1.6,
      fontSize: '0.9375rem',
    },
    body2: {
      lineHeight: 1.5,
      fontSize: '0.875rem',
    },
    caption: {
      fontSize: '0.75rem',
      letterSpacing: '0.01em',
      lineHeight: 1.4,
    },
    button: {
      fontFamily: '"Outfit", system-ui, sans-serif',
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    overline: {
      fontFamily: '"Outfit", system-ui, sans-serif',
      fontWeight: 700,
      fontSize: '0.6875rem',
      letterSpacing: '0.1em',
      lineHeight: 2,
    },
  },
  shape: {
    borderRadius: 10,
  },
  shadows: [
    'none',
    '0 1px 3px rgba(10,31,10,0.06), 0 1px 2px rgba(10,31,10,0.04)',
    '0 2px 6px rgba(10,31,10,0.07), 0 1px 3px rgba(10,31,10,0.05)',
    '0 4px 12px rgba(10,31,10,0.08), 0 2px 4px rgba(10,31,10,0.04)',
    '0 6px 16px rgba(10,31,10,0.09), 0 3px 6px rgba(10,31,10,0.05)',
    '0 8px 24px rgba(10,31,10,0.1), 0 4px 8px rgba(10,31,10,0.05)',
    '0 12px 32px rgba(10,31,10,0.11), 0 6px 12px rgba(10,31,10,0.05)',
    '0 16px 40px rgba(10,31,10,0.12), 0 8px 16px rgba(10,31,10,0.06)',
    '0 20px 48px rgba(10,31,10,0.13)',
    '0 24px 56px rgba(10,31,10,0.14)',
    '0 28px 64px rgba(10,31,10,0.15)',
    '0 32px 72px rgba(10,31,10,0.16)',
    '0 36px 80px rgba(10,31,10,0.17)',
    '0 40px 88px rgba(10,31,10,0.18)',
    '0 44px 96px rgba(10,31,10,0.19)',
    '0 48px 104px rgba(10,31,10,0.2)',
    '0 52px 112px rgba(10,31,10,0.21)',
    '0 56px 120px rgba(10,31,10,0.22)',
    '0 60px 128px rgba(10,31,10,0.23)',
    '0 64px 136px rgba(10,31,10,0.24)',
    '0 68px 144px rgba(10,31,10,0.25)',
    '0 72px 152px rgba(10,31,10,0.26)',
    '0 76px 160px rgba(10,31,10,0.27)',
    '0 80px 168px rgba(10,31,10,0.28)',
    '0 84px 176px rgba(10,31,10,0.29)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ':root': {
          '--ftf-green-900': GREEN_900,
          '--ftf-green-800': GREEN_800,
          '--ftf-green-700': GREEN_700,
          '--ftf-green-600': GREEN_600,
          '--ftf-green-500': GREEN_500,
          '--ftf-green-400': GREEN_400,
          '--ftf-green-300': GREEN_300,
          '--ftf-green-200': GREEN_200,
          '--ftf-green-100': GREEN_100,
          '--ftf-green-50': GREEN_50,
          '--ftf-lime-500': LIME_500,
          '--ftf-lime-400': LIME_400,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 10,
          padding: '10px 24px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        contained: {
          boxShadow: `0 2px 8px ${alpha(GREEN_800, 0.2)}`,
          '&:hover': {
            boxShadow: `0 4px 16px ${alpha(GREEN_800, 0.3)}`,
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
            backgroundColor: alpha(GREEN_800, 0.04),
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: `1px solid ${alpha(GREEN_800, 0.08)}`,
          boxShadow: `0 2px 8px ${alpha(GREEN_800, 0.05)}, 0 1px 2px ${alpha(GREEN_800, 0.03)}`,
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: `0 8px 24px ${alpha(GREEN_800, 0.1)}, 0 4px 8px ${alpha(GREEN_800, 0.05)}`,
          },
        },
      },
    },
    MuiCardActionArea: {
      styleOverrides: {
        root: {
          '&:hover': {
            '& .MuiCardActionArea-focusHighlight': {
              opacity: 0.03,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 8,
          fontSize: '0.8125rem',
        },
        outlined: {
          borderWidth: '1.5px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: GREEN_500,
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 500,
        },
        standardSuccess: {
          backgroundColor: GREEN_50,
          color: GREEN_700,
        },
        standardWarning: {
          backgroundColor: '#fff3e0',
          color: '#e65100',
        },
        standardError: {
          backgroundColor: '#ffebee',
          color: '#c62828',
        },
        standardInfo: {
          backgroundColor: GREEN_50,
          color: GREEN_700,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: alpha(GREEN_800, 0.08),
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: '10px !important',
          textTransform: 'none',
          fontWeight: 600,
          fontFamily: '"Outfit", system-ui, sans-serif',
          padding: '8px 16px',
          borderColor: alpha(GREEN_800, 0.15),
          '&.Mui-selected': {
            backgroundColor: GREEN_800,
            color: '#ffffff',
            '&:hover': {
              backgroundColor: GREEN_700,
            },
          },
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          gap: 8,
          '& .MuiToggleButtonGroup-grouped': {
            border: `1.5px solid ${alpha(GREEN_800, 0.15)}`,
            '&:not(:first-of-type)': {
              borderLeft: `1.5px solid ${alpha(GREEN_800, 0.15)}`,
              marginLeft: 0,
            },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
        },
      },
    },
  },
});

export default theme;
