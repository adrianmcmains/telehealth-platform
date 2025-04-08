import { CacheProvider } from '@emotion/react';
import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { createEmotionCache } from '../utils/emotionCache';
import { AuthProvider } from '../contexts/AuthContext';
import Head from 'next/head';

// Client-side cache, shared for the whole session
const clientSideEmotionCache = createEmotionCache();

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb', // Blue
    },
    secondary: {
      main: '#10b981', // Green
    },
  },
});

export default function MyApp({
  Component,
  emotionCache = clientSideEmotionCache,
  pageProps
}) {
  // Get layout from page or use default
  const getLayout = Component.getLayout || ((page) => page);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <title>Telehealth Platform</title>
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          {mounted && getLayout(<Component {...pageProps} />)}
        </AuthProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}