export default function Footer() {
  return (
    <footer className="bg-gray-100 py-8">
      <div className="container mx-auto px-4 text-center">
        <p className="text-gray-600">
          © {new Date().getFullYear()} Mai Xiyu. 保留所有权利。
        </p>
        <div className="mt-4 flex justify-center space-x-4">
          <a 
            href="https://github.com/onlyxiyu" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-700"
          >
            GitHub
          </a>
          <a 
            href="https://x.com/MaiXiyu" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-700"
          >
            X
          </a>
          <a 
            href="https://space.bilibili.com/1339435908" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-700"
          >
            Bilibili
          </a>
        </div>
      </div>
    </footer>
  );
} 