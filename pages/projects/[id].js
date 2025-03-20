import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { motion } from 'framer-motion';

export default function ProjectDetail({ content, frontmatter }) {
  const router = useRouter();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <button
            onClick={() => router.back()}
            className="mb-8 text-gray-600 hover:text-gray-800 flex items-center"
          >
            ← 返回项目列表
          </button>
          
          <article className="prose prose-lg max-w-none">
            <h1>{frontmatter.title}</h1>
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </article>
        </motion.div>
      </div>
    </Layout>
  );
}

export async function getStaticPaths() {
  const projectsDirectory = path.join(process.cwd(), 'project');
  const filenames = fs.readdirSync(projectsDirectory);
  
  const paths = filenames
    .filter(filename => filename.endsWith('.md'))
    .map(filename => {
      const filePath = path.join(projectsDirectory, filename);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(fileContents);
      
      // 只为内部项目生成路径
      if (!data.link.startsWith('http')) {
        return {
          params: { id: data.link }
        };
      }
    })
    .filter(Boolean); // 过滤掉 undefined
  
  return {
    paths,
    fallback: false
  };
}

export async function getStaticProps({ params }) {
  const { id } = params;
  
  // 确保这是一个内部项目链接
  if (id.startsWith('http')) {
    return {
      notFound: true
    };
  }

  const filePath = path.join(process.cwd(), 'project', 'project_md', `${id}.md`);
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);
  
  const htmlContent = marked(content);
  
  return {
    props: {
      content: htmlContent,
      frontmatter: data
    }
  };
} 