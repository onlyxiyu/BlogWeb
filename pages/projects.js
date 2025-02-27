import Layout from '../components/Layout';
import { motion } from 'framer-motion';

export default function Projects() {
  const projects = [
    {
      name: 'Minecraft Mod',
      description: '开发的 Minecraft 模组项目',
      link: 'https://www.mcmod.cn/author/29947.html'
    },
    {
      name: 'GitHub 开源项目',
      description: '个人开源项目集合',
      link: 'https://github.com/onlyxiyu'
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-12">我的项目</h1>
        <div className="grid md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <h2 className="text-2xl font-semibold mb-4">{project.name}</h2>
              <p className="text-gray-600 mb-4">{project.description}</p>
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                查看详情
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
} 