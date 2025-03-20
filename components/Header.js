import Link from 'next/link';
import { useState } from 'react';
import siteConfig from '../site.config';

export default function Header() {
  const { header } = siteConfig.navigation;
  const { headerBg } = siteConfig.theme.colors;
  const [hoveredItem, setHoveredItem] = useState(null);

  return (
    <header className="shadow-sm relative" style={{ backgroundColor: headerBg }}>
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-gray-800">
          {siteConfig.title}
        </Link>
        <div className="space-x-4">
          {header.map((item) => (
            <div
              key={item.path}
              className="relative inline-block"
              onMouseEnter={() => setHoveredItem(item)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Link
                href={item.path}
                className="text-gray-600 hover:text-blue-600 transition"
              >
                {item.name}
              </Link>
              {hoveredItem === item && (
                <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap z-50">
                  {item.description}
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>
    </header>
  );
} 