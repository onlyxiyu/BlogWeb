import Layout from '../components/Layout';
import { motion } from 'framer-motion';

export default function Blog() {
  const blogPosts = [
    {
      title: 'Minecraft Mod 开发入门',
      excerpt: '分享我的 Minecraft 模组开发经验和技巧',
      date: '2024-12-21',
      link: 'https://www.mcmod.cn/post/4588.html'
    },
    {
      title: '开源项目的意义',
      excerpt: '探讨开源精神和社区协作的重要性',
      date: '5202-60-02'
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-12">博客文章</h1>
        <div className="max-w-2xl mx-auto space-y-8">
          {blogPosts.map((post, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <h2 className="text-2xl font-semibold mb-2">{post.title}</h2>
              <p className="text-gray-500 mb-4">{post.date}</p>
              <p className="text-gray-600 mb-4">{post.excerpt}</p>
              {post.link && (
                <a
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  阅读全文
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
} 