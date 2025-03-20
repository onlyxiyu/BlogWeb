import fetch from 'node-fetch';
import geoip from 'geoip-lite';

// 缓存威胁数据
let threatCache = {
  data: [],
  lastUpdated: null,
  totalAttacks: 0
};

// 模拟从威胁情报 API 获取数据
// 在实际应用中，您应该使用真实的威胁情报 API
async function fetchThreatData() {
  try {
    // 这里应该是真实的 API 调用
    // const response = await fetch('https://api.threatintelligence.com/attacks');
    // const data = await response.json();
    
    // 模拟数据
    const ipAddresses = [
      '8.8.8.8', // Google DNS (US)
      '114.114.114.114', // 114DNS (China)
      '208.67.222.222', // OpenDNS (US)
      '1.1.1.1', // Cloudflare (Australia)
      '77.88.8.8', // Yandex (Russia)
      '9.9.9.9', // Quad9 (Switzerland)
      '80.80.80.80', // Freenom (Netherlands)
      '101.101.101.101', // TWNIC (Taiwan)
      '210.210.210.210', // (Japan)
      '185.228.168.168' // CleanBrowsing (Germany)
    ];
    
    const attackTypes = ['DDoS', 'SQL注入', 'XSS', '暴力破解', '恶意扫描', 'CSRF', '钓鱼攻击', '恶意软件'];
    
    // 生成1-5个随机攻击
    const attackCount = Math.floor(Math.random() * 5) + 1;
    const newAttacks = [];
    
    for (let i = 0; i < attackCount; i++) {
      const sourceIp = ipAddresses[Math.floor(Math.random() * ipAddresses.length)];
      const geo = geoip.lookup(sourceIp);
      
      if (geo) {
        const attack = {
          id: Date.now() + i,
          source: {
            ip: sourceIp,
            coords: [geo.ll[1], geo.ll[0]], // [经度, 纬度]
            city: geo.city || 'Unknown',
            country: geo.country || 'Unknown',
            region: geo.region || 'Unknown'
          },
          target: {
            ip: '123.123.123.123', // 您的服务器 IP
            coords: [116.4, 39.9], // 北京坐标
            city: '北京',
            country: 'CN'
          },
          type: attackTypes[Math.floor(Math.random() * attackTypes.length)],
          timestamp: new Date().toISOString(),
          severity: Math.floor(Math.random() * 10) + 1 // 1-10
        };
        
        newAttacks.push(attack);
      }
    }
    
    // 更新缓存
    threatCache.data = [...threatCache.data, ...newAttacks].slice(-100); // 保留最近100条
    threatCache.totalAttacks += newAttacks.length;
    threatCache.lastUpdated = new Date().toISOString();
    
    return threatCache;
  } catch (error) {
    console.error('Error fetching threat data:', error);
    return threatCache;
  }
}

export default async function handler(req, res) {
  // 如果缓存为空或者超过10秒没有更新，则获取新数据
  if (!threatCache.lastUpdated || 
      (new Date() - new Date(threatCache.lastUpdated)) > 10000) {
    await fetchThreatData();
  }
  
  res.status(200).json(threatCache);
} 