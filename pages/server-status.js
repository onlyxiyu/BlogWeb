import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';

export default function ServerStatus() {
  const [serverStats, setServerStats] = useState({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
    uptime: 0,
    lastUpdated: null
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 获取真实服务器数据
  useEffect(() => {
    const fetchServerStats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/server-stats');
        
        if (!response.ok) {
          throw new Error(`服务器返回错误: ${response.status}`);
        }
        
        const data = await response.json();
        setServerStats(data);
        setIsConnected(true);
        setError(null);
      } catch (err) {
        console.error('获取服务器状态失败:', err);
        setError('无法连接到服务器监控系统。使用模拟数据代替。');
        setIsConnected(false);
        
        // 回退到模拟数据
        generateMockData();
      } finally {
        setIsLoading(false);
      }
    };
    
    // 生成模拟数据
    const generateMockData = () => {
      setServerStats({
        cpu: Math.floor(Math.random() * 100),
        memory: Math.floor(Math.random() * 100),
        disk: 70 + Math.floor(Math.random() * 20),
        network: Math.floor(Math.random() * 100),
        uptime: Math.floor(Math.random() * 1000),
        lastUpdated: new Date().toISOString()
      });
    };
    
    // 初始获取数据
    fetchServerStats();
    
    // 设置定时刷新
    const interval = setInterval(fetchServerStats, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const getStatusColor = (value) => {
    if (value < 60) return 'bg-green-500';
    if (value < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center mb-8"
        >
          服务器状态监控
        </motion.h1>
        
        {error && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
            <p>{error}</p>
          </div>
        )}
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">实时资源使用情况</h2>
            <div className="flex items-center">
              <span className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-sm text-gray-500 mr-4">
                {isConnected ? '实时连接' : '模拟数据'}
              </span>
              <span className="text-sm text-gray-500">
                最后更新: {serverStats.lastUpdated ? new Date(serverStats.lastUpdated).toLocaleTimeString() : '加载中...'}
              </span>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500">加载服务器数据中...</div>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                {/* CPU 使用率 */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">CPU 使用率</span>
                    <span className="font-bold">{serverStats.cpu}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className={`h-4 rounded-full ${getStatusColor(serverStats.cpu)}`}
                      style={{ width: `${serverStats.cpu}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* 内存使用率 */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">内存使用率</span>
                    <span className="font-bold">{serverStats.memory}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className={`h-4 rounded-full ${getStatusColor(serverStats.memory)}`}
                      style={{ width: `${serverStats.memory}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* 硬盘使用率 */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">硬盘使用率</span>
                    <span className="font-bold">{serverStats.disk}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className={`h-4 rounded-full ${getStatusColor(serverStats.disk)}`}
                      style={{ width: `${serverStats.disk}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* 网络使用率 */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">网络使用率</span>
                    <span className="font-bold">{serverStats.network}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className={`h-4 rounded-full ${getStatusColor(serverStats.network)}`}
                      style={{ width: `${serverStats.network}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between">
                  <span className="font-medium">服务器运行时间</span>
                  <span className="font-bold">{serverStats.uptime} 小时</span>
                </div>
              </div>
            </>
          )}
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              {isConnected 
                ? "数据每5秒自动刷新一次，显示的是服务器实际资源使用情况。" 
                : "当前显示的是模拟数据。要查看真实服务器状态，请确保服务器监控系统正常运行。"}
            </p>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
} 