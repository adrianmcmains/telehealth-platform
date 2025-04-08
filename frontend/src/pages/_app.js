import { CacheProvider } from '@emotion/react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { createEmotionCache } from '../utils/emotionCache';
import { AuthProvider } from '../contexts/AuthContext';
import Head from 'next/head';

// Client-side cache, shared for the whole session
const clientSideEmotionCache = createEmotionCache();

// Create a theme inspired by Amwell's design
const theme = createTheme({
  palette: {
    primary: {
      main: '#0063b0', // Amwell blue
      light: '#4a8ed0',
      dark: '#004a85',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00a87e', // Teal/green for accents
      light: '#53daa9',
      dark: '#007855',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#637381',
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ff9800',
    },
    info: {
      main: '#2196f3',
    },
    success: {
      main: '#4caf50',
    },
  },
  typography: {
    fontFamily: '"Open Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none', // Avoid all-caps buttons
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#0076d3',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
          borderRadius: 12,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

export default function MyApp({
  Component,
  emotionCache = clientSideEmotionCache,
  pageProps,
}) {
  // Get layout from page or use default
  const getLayout = Component.getLayout || ((page) => page);

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <title>Telehealth Platform</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&display=swap" 
          rel="stylesheet"
        />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          {getLayout(<Component {...pageProps} />)}
        </AuthProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}