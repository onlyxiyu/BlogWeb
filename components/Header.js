import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-gray-800">
          Mai Xiyu
        </Link>
        <div className="space-x-4">
          <Link href="/" className="text-gray-600 hover:text-blue-600 transition">
            首页
          </Link>
          <Link href="/projects" className="text-gray-600 hover:text-blue-600 transition">
            项目
          </Link>
          <Link href="/blog" className="text-gray-600 hover:text-blue-600 transition">
            博客
          </Link>
          <Link href="/about" className="text-gray-600 hover:text-blue-600 transition">
            关于
          </Link>
        </div>
      </nav>
    </header>
  );
} 