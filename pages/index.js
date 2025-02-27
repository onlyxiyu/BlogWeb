import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { 
  BrandGithubIcon, 
  BrandBilibiliIcon, 
  BrandXIcon 
} from '@heroicons/react/24/solid';
import { useState } from 'react';
import dynamic from 'next/dynamic';

// 动态导入 GameModal
const GameModal = dynamic(() => import('../components/GameModal'), {
  ssr: false  // 禁用服务端渲染
});

export default function Home() {
  const [isGameOpen, setIsGameOpen] = useState(false);

  const socialLinks = [
    { 
      name: 'GitHub', 
      url: 'https://github.com/onlyxiyu',
      color: 'from-[#24292e] to-[#373e47]'
    },
    { 
      name: 'Bilibili', 
      url: 'https://space.bilibili.com/1339435908',
      color: 'from-[#00a1d6] to-[#4dabf7]'
    },
    { 
      name: 'X', 
      url: 'https://x.com/MaiXiyu',
      color: 'from-[#000] to-[#333]'
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-[#f0f4f8] via-[#e6f1ff] to-[#d1e7ff] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.8, 
            type: "spring", 
            stiffness: 100 
          }}
          className="text-center max-w-2xl p-10 bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30"
        >
          <motion.img 
            src="https://gitee.com/god_xiyu/capeimage/releases/download/test1/263370_1732730517_qeAb.png" 
            alt="Mai Xiyu" 
            initial={{ rotate: -10 }}
            animate={{ 
              rotate: [null, 10, -10, 0],
              transition: { 
                duration: 2, 
                repeat: Infinity, 
                repeatType: "reverse" 
              }
            }}
            className="mx-auto w-40 h-40 rounded-full mb-8 border-4 border-white shadow-lg object-cover"
          />
          <motion.h1 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6a11cb] to-[#2575fc] mb-6"
          >
            Mai Xiyu
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl text-gray-600 mb-8 tracking-wide"
          >
            Minecraft Mod 开发者 | 开源爱好者 | 创意编程者
          </motion.p>
          <div className="flex justify-center space-x-6">
            {socialLinks.map((link) => (
              <motion.a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`px-6 py-3 bg-gradient-to-r ${link.color} text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center space-x-2`}
              >
                <span>{link.name}</span>
              </motion.a>
            ))}
          </div>
          
          {/* 游戏按钮 */}
          <motion.button
            onClick={() => setIsGameOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-6 px-6 py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            打开小游戏
          </motion.button>
        </motion.div>
      </div>

      {/* 游戏模态框 */}
      {isGameOpen && (
        <GameModal onClose={() => setIsGameOpen(false)} />
      )}
    </Layout>
  );
} 