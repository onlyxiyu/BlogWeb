import { useState } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';

export default function Projects({ projects }) {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center mb-12"
        >
          我的项目
        </motion.h1>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {projects.map((project, index) => (
            <motion.div
              key={project.link}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              {project.link.startsWith('http') ? (
                // 外部链接
                <a 
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="p-6 cursor-pointer hover:bg-gray-50 transition">
                    <h2 className="text-2xl font-bold mb-2">{project.title}</h2>
                    <p className="text-gray-600 mb-4">{project.description}</p>
                    <div className="text-blue-500 hover:text-blue-600">
                      访问项目 →
                    </div>
                  </div>
                </a>
              ) : (
                // 内部项目详情页
                <Link href={`/projects/${project.link}`}>
                  <div className="p-6 cursor-pointer hover:bg-gray-50 transition">
                    <h2 className="text-2xl font-bold mb-2">{project.title}</h2>
                    <p className="text-gray-600 mb-4">{project.description}</p>
                    <div className="text-blue-500 hover:text-blue-600">
                      查看详情
                    </div>
                  </div>
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export async function getStaticProps() {
  // 读取第一层项目文件
  const projectsDirectory = path.join(process.cwd(), 'project');
  const filenames = fs.readdirSync(projectsDirectory);
  
  const projects = filenames
    .filter(filename => filename.endsWith('.md'))
    .map(filename => {
      const filePath = path.join(projectsDirectory, filename);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(fileContents);
      
      return {
        title: data.title,
        description: data.description,
        link: data.link
      };
    });
  
  return {
    props: {
      projects
    }
  };
} 