import { Html, Head, Main, NextScript } from 'next/document';
import siteConfig from '../site.config';

export default function Document() {
  return (
    <Html lang={siteConfig.language}>
      <Head>
        <link rel="icon" href={siteConfig.seo.images.favicon} />
        <meta name="description" content={siteConfig.seo.defaultDescription} />
        <meta property="og:image" content={siteConfig.seo.images.ogImage} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 