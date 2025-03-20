import { useState } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import siteConfig from '../site.config';

export default function Blog({ posts }) {
  const { title, description } = siteConfig.blog;
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <motion.h1>{title}</motion.h1>
        <p>{description}</p>
        
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center mb-12"
        >
          博客文章
        </motion.h1>
        
        <div className="max-w-4xl mx-auto space-y-6">
          {posts.map((post, index) => (
            <motion.div
              key={post.link}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <Link href={`/blog/${post.link}`}>
                <div className="p-6 cursor-pointer hover:bg-gray-50 transition">
                  <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
                  <p className="text-gray-600 mb-4">{post.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="text-blue-500 hover:text-blue-600">
                      阅读全文
                    </div>
                    <div className="text-gray-500 text-sm">
                      {new Date(post.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export async function getStaticProps() {
  const postsDirectory = path.join(process.cwd(), 'blog_post');
  const filenames = fs.readdirSync(postsDirectory);
  
  const posts = filenames
    .filter(filename => filename.endsWith('.md'))
    .map(filename => {
      const filePath = path.join(postsDirectory, filename);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(fileContents);
      
      return {
        title: data.title,
        description: data.description,
        date: data.date,
        link: data.link
      };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // 按日期排序
  
  return {
    props: {
      posts
    }
  };
} 