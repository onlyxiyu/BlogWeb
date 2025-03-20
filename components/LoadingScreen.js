import { motion } from 'framer-motion';
import siteConfig from '../site.config';

export default function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 1 }}
      onAnimationComplete={() => document.body.style.overflow = 'unset'}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }}
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            duration: 0.3
          }}
          className="mb-8"
        >
          <div className="w-32 h-32 mx-auto relative">
            {/* 自定义加载动画 */}
            <div className="absolute inset-0 border-8 border-white rounded-full animate-spin" 
                 style={{ borderTopColor: 'transparent' }} />
            <div className="absolute inset-4 border-8 border-blue-300 rounded-full animate-ping" 
                 style={{ animationDuration: '1s' }} />
          </div>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-white mb-4"
        >
          {siteConfig.title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-blue-100"
        >
          {siteConfig.description}
        </motion.p>
      </div>
    </motion.div>
  );
} 