import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { motion } from 'framer-motion';

export default function BlogPost({ content, frontmatter }) {
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
            ← 返回博客列表
          </button>
          
          <article className="prose prose-lg max-w-none">
            <header className="mb-8">
              <h1 className="mb-2">{frontmatter.title}</h1>
              <div className="text-gray-600">
                <time>{new Date(frontmatter.date).toLocaleDateString()}</time>
                {frontmatter.author && (
                  <span className="mx-2">· {frontmatter.author}</span>
                )}
              </div>
              {frontmatter.tags && (
                <div className="mt-4 flex gap-2">
                  {frontmatter.tags.map(tag => (
                    <span key={tag} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </header>
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </article>
        </motion.div>
      </div>
    </Layout>
  );
}

export async function getStaticPaths() {
  const postsDirectory = path.join(process.cwd(), 'blog_post');
  const filenames = fs.readdirSync(postsDirectory);
  
  const paths = filenames
    .filter(filename => filename.endsWith('.md'))
    .map(filename => {
      const filePath = path.join(postsDirectory, filename);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(fileContents);
      
      return {
        params: { id: data.link }
      };
    });
  
  return {
    paths,
    fallback: false
  };
}

export async function getStaticProps({ params }) {
  const { id } = params;
  const filePath = path.join(process.cwd(), 'blog_post', 'blog_post_md', `${id}.md`);
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