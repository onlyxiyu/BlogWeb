import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>Mai Xiyu - 个人博客</title>
        <link 
          rel="icon" 
          href="https://gitee.com/god_xiyu/capeimage/releases/download/test1/263370_1732730517_qeAb.png" 
        />
        <meta name="description" content="Mai Xiyu 的个人博客 - Minecraft Mod 开发者" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Header />
      <AnimatePresence mode="wait">
        <motion.main 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-grow"
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <Footer />
    </div>
  );
} 