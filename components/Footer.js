import siteConfig from '../site.config';

export default function Footer() {
  const { footer } = siteConfig.navigation;
  const { footerBg } = siteConfig.theme.colors;
  const { copyright } = siteConfig.misc;

  return (
    <footer style={{ backgroundColor: footerBg }} className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-center space-x-6 mb-4">
          {footer.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition"
            >
              {link.name}
            </a>
          ))}
        </div>
        <p className="text-center text-gray-400">
          {copyright}
        </p>
      </div>
    </footer>
  );
} 