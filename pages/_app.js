import '../styles/globals.css';
import { useState, useEffect } from 'react';
import siteConfig from '../site.config';
import LoadingScreen from '../components/LoadingScreen';

function MyApp({ Component, pageProps }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 模拟加载过程
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ 
      color: siteConfig.theme.colors.text,
      fontFamily: siteConfig.theme.fonts.sans 
    }}>
      {isLoading && <LoadingScreen />}
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp; 