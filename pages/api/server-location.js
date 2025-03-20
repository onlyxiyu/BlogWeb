import fetch from 'node-fetch';

// 缓存服务器位置信息
let serverLocationCache = null;

// 中国城市坐标映射
const cityCoords = {
  '安阳': [36.0997, 114.3931],
  '郑州': [34.7472, 113.6253],
  '北京': [39.9042, 116.4074],
  '上海': [31.2304, 121.4737],
  '广州': [23.1291, 113.2644],
  '深圳': [22.5431, 114.0579]
};

// 省会城市坐标映射
const provinceCoords = {
  '河南': [34.7472, 113.6253], // 郑州
  '北京': [39.9042, 116.4074],
  '上海': [31.2304, 121.4737],
  '广东': [23.1291, 113.2644] // 广州
};

export default async function handler(req, res) {
  try {
    // 如果已有缓存且未过期，直接返回
    if (serverLocationCache && 
        Date.now() - serverLocationCache.timestamp < 3600000) {
      return res.status(200).json(serverLocationCache);
    }

    // 先获取 IP
    const ipResponse = await fetch('http://jsonip.com');
    const ipData = await ipResponse.json();
    
    // 然后获取详细的位置信息
    const infoResponse = await fetch(`https://www.hsselite.com/ipinfo`);
    const infoData = await infoResponse.json();
    
    if (infoData && infoData.ip) {
      // 构建位置信息
      serverLocationCache = {
        ip: ipData.ip,
        city: infoData.city || '未知',
        region: infoData.region || '未知',
        country: infoData.country_code || 'UN',
        coords: [infoData.latitude, infoData.longitude],
        timezone: 'Asia/Shanghai',
        isp: infoData.isp || '未知',
        organization: infoData.organization,
        continent: infoData.continent_code,
        postal_code: infoData.postal_code,
        timestamp: Date.now(),
        isDefault: false
      };

      res.status(200).json(serverLocationCache);
    } else {
      throw new Error('IP信息查询失败');
    }
  } catch (error) {
    console.error('获取服务器位置失败:', error);
    res.status(500).json({ 
      error: '获取服务器位置失败',
      message: error.message
    });
  }
} 