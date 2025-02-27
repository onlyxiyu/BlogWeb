import Layout from '../components/Layout';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h1 className="text-4xl font-bold mb-8">关于我</h1>
          <img 
            src="https://gitee.com/god_xiyu/capeimage/releases/download/test1/263370_1732730517_qeAb.png" 
            alt="Mai Xiyu" 
            className="mx-auto w-48 h-48 rounded-full mb-8 object-cover"
          />
          <p className="text-lg text-gray-600 mb-6">
            我是一名热爱 Minecraft 模组开发的程序员，致力于创造有趣且富有创意的开源项目。
            我相信技术的力量可以改变世界，并且享受与开源社区一起成长和学习的过程。
          </p>
          <div className="flex justify-center space-x-4">
            {[
              { name: 'GitHub', url: 'https://github.com/onlyxiyu' },
              { name: 'Bilibili', url: 'https://space.bilibili.com/1339435908' },
              { name: 'X', url: 'https://x.com/MaiXiyu' }
            ].map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
} 