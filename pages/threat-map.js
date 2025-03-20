import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

// 动态导入 Leaflet 组件，禁用 SSR
const MapComponent = dynamic(() => import('../components/ThreatMapLeaflet'), {
  ssr: false
});

export default function ThreatMap() {
  const [attacks, setAttacks] = useState([]);
  const [stats, setStats] = useState({
    totalAttacks: 0,
    activeAttacks: 0,
    topCountry: '未知',
    topAttackType: '未知'
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serverLocation, setServerLocation] = useState({
    ip: '未知',
    coords: [39.9, 116.4], // 默认北京坐标
    city: '北京',
    country: 'CN',
    isDefault: true
  });
  
  // 获取服务器位置
  useEffect(() => {
    const fetchServerLocation = async () => {
      try {
        const response = await fetch('/api/server-location');
        
        if (!response.ok) {
          throw new Error(`服务器返回错误: ${response.status}`);
        }
        
        const data = await response.json();
        setServerLocation(data);
      } catch (err) {
        console.error('获取服务器位置失败:', err);
        // 保持默认位置
      }
    };
    
    fetchServerLocation();
  }, []);
  
  // 获取真实威胁数据
  useEffect(() => {
    const fetchThreatData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/real-threats');
        
        if (!response.ok) {
          throw new Error(`服务器返回错误: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 更新攻击数据，使用服务器真实位置
        const updatedAttacks = (data.attacks || []).map(attack => ({
          ...attack,
          target: {
            ...attack.target,
            coords: serverLocation.coords,
            city: serverLocation.city,
            country: serverLocation.country
          }
        }));
        
        setAttacks(updatedAttacks);
        setStats({
          totalAttacks: data.totalAttacks || 0,
          activeAttacks: updatedAttacks.length,
          topCountry: data.topCountry || '未知',
          topAttackType: data.topAttackType || '未知'
        });
        setIsConnected(true);
      } catch (err) {
        console.error('获取威胁数据失败:', err);
        setError('无法连接到威胁监控系统。使用模拟数据代替。');
        setIsConnected(false);
        // 回退到模拟数据
        useMockData();
      } finally {
        setIsLoading(false);
      }
    };
    
    // 模拟数据生成函数
    const useMockData = () => {
      // 世界主要城市坐标 (经度,纬度)
      const cities = [
        { name: '北京', coords: [39.9, 116.4], country: 'CN', city: '北京' },
        { name: '上海', coords: [31.2, 121.4], country: 'CN', city: '上海' },
        { name: '纽约', coords: [40.7, -74.0], country: 'US', city: '纽约' },
        { name: '伦敦', coords: [51.5, -0.1], country: 'GB', city: '伦敦' },
        { name: '东京', coords: [35.7, 139.7], country: 'JP', city: '东京' },
        { name: '莫斯科', coords: [55.7, 37.6], country: 'RU', city: '莫斯科' },
        { name: '悉尼', coords: [-33.9, 151.2], country: 'AU', city: '悉尼' },
        { name: '巴黎', coords: [48.9, 2.3], country: 'FR', city: '巴黎' },
        { name: '柏林', coords: [52.5, 13.4], country: 'DE', city: '柏林' },
        { name: '新德里', coords: [28.6, 77.2], country: 'IN', city: '新德里' }
      ];
      
      const ipAddresses = [
        '8.8.8.8', '114.114.114.114', '208.67.222.222', '1.1.1.1', 
        '77.88.8.8', '9.9.9.9', '80.80.80.80', '101.101.101.101', 
        '210.210.210.210', '185.228.168.168'
      ];
      
      const attackTypes = ['DDoS', 'SQL注入', 'XSS', '暴力破解', '恶意扫描', 'CSRF', '钓鱼攻击', '恶意软件'];
      
      // 生成随机攻击
      const generateAttack = () => {
        const cityIndex = Math.floor(Math.random() * cities.length);
        const city = cities[cityIndex];
        
        const attack = {
          id: Date.now(),
          source: {
            ip: ipAddresses[cityIndex],
            coords: city.coords,
            city: city.city,
            country: city.country
          },
          target: {
            ip: serverLocation.ip || '123.123.123.123',
            coords: serverLocation.coords,
            city: serverLocation.city,
            country: serverLocation.country
          },
          type: attackTypes[Math.floor(Math.random() * attackTypes.length)],
          timestamp: new Date().toISOString(),
          severity: Math.floor(Math.random() * 10) + 1
        };
        
        setAttacks(prev => [...prev.slice(-99), attack]);
        setStats(prev => ({
          ...prev,
          totalAttacks: prev.totalAttacks + 1,
          activeAttacks: prev.activeAttacks + 1
        }));
      };
      
      // 每隔1-3秒生成一次攻击
      const interval = setInterval(() => {
        if (Math.random() > 0.3) { // 70%的概率生成攻击
          generateAttack();
        }
      }, 1000 + Math.random() * 2000);
      
      return () => clearInterval(interval);
    };
    
    // 初始获取数据
    fetchThreatData();
    
    // 设置定时刷新
    const interval = setInterval(fetchThreatData, 30000); // 每30秒刷新一次
    
    return () => clearInterval(interval);
  }, [serverLocation]); // 添加 serverLocation 作为依赖项
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center mb-6"
        >
          实时网络威胁地图
        </motion.h1>
        
        {error && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
            <p>{error}</p>
          </div>
        )}
        
        {serverLocation.isDefault && (
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6">
            <p>使用默认服务器位置（北京）。无法确定服务器的真实地理位置。</p>
          </div>
        )}
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-6xl mx-auto"
        >
          <div className="bg-black rounded-xl overflow-hidden shadow-2xl">
            {/* 地图容器 */}
            <div className="relative w-full h-[600px]">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <div className="text-white">加载威胁数据中...</div>
                </div>
              ) : (
                <MapComponent attacks={attacks} serverLocation={serverLocation} />
              )}
              
              {/* 连接状态指示器 */}
              <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full flex items-center">
                <span className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span>{isConnected ? '实时连接' : '模拟数据'}</span>
              </div>
              
              {/* 服务器位置信息 */}
              <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full">
                服务器: {serverLocation.city}, {serverLocation.country}
              </div>
            </div>
            
            {/* 统计信息 */}
            <div className="bg-gray-900 text-white p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-gray-400">总攻击次数:</span>
                  <span className="ml-2 font-bold">{stats.totalAttacks}</span>
                </div>
                <div>
                  <span className="text-gray-400">实时攻击:</span>
                  <span className="ml-2 font-bold">{attacks.length}</span>
                </div>
                <div>
                  <span className="text-gray-400">主要攻击国家:</span>
                  <span className="ml-2 font-bold">{stats.topCountry}</span>
                </div>
                <div>
                  <span className="text-gray-400">主要攻击类型:</span>
                  <span className="ml-2 font-bold">{stats.topAttackType}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* 最近攻击列表 */}
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">最近攻击记录</h2>
            {attacks.length === 0 && !isLoading ? (
              <p className="text-gray-500 text-center py-4">暂无攻击记录</p>
            ) : (
              <div className="overflow-auto max-h-[300px]">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 text-left">时间</th>
                      <th className="py-2 px-4 text-left">来源 IP</th>
                      <th className="py-2 px-4 text-left">来源地</th>
                      <th className="py-2 px-4 text-left">国家</th>
                      <th className="py-2 px-4 text-left">攻击类型</th>
                      <th className="py-2 px-4 text-left">严重程度</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attacks.slice().reverse().map(attack => (
                      <tr key={attack.id} className="border-b">
                        <td className="py-2 px-4">
                          {new Date(attack.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-2 px-4">{attack.source.ip}</td>
                        <td className="py-2 px-4">{attack.source.city || '未知'}</td>
                        <td className="py-2 px-4">{attack.source.country || '未知'}</td>
                        <td className="py-2 px-4">
                          <span 
                            className={`px-2 py-1 rounded text-xs text-white
                              ${attack.type === 'DDoS' ? 'bg-red-500' : 
                                attack.type === 'SQL注入' ? 'bg-yellow-500' : 
                                attack.type === 'XSS' ? 'bg-blue-500' : 
                                attack.type === '暴力破解' ? 'bg-orange-500' : 
                                attack.type === '恶意扫描' ? 'bg-purple-500' : 
                                attack.type === 'CSRF' ? 'bg-pink-500' : 
                                attack.type === '钓鱼攻击' ? 'bg-indigo-500' : 'bg-green-500'}`}
                          >
                            {attack.type}
                          </span>
                        </td>
                        <td className="py-2 px-4">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  attack.severity <= 3 ? 'bg-green-500' : 
                                  attack.severity <= 6 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${attack.severity * 10}%` }}
                              ></div>
                            </div>
                            <span>{attack.severity}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              {isConnected 
                ? "此地图显示的是服务器实际遭受的网络攻击，基于防火墙和安全日志分析。" 
                : "当前显示的是模拟数据。要查看真实攻击数据，请确保服务器安全监控系统正常运行。"}
            </p>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
} 