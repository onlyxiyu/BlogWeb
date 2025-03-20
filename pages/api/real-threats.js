import { exec } from 'child_process';
import util from 'util';
import net from 'net';
import dns from 'dns';
import fetch from 'node-fetch';

const execPromise = util.promisify(exec);
const dnsResolve = util.promisify(dns.resolve);

// 缓存数据
let threatCache = {
  attacks: [],
  totalAttacks: 0,
  topCountry: '未知',
  topAttackType: '未知',
  lastUpdated: null
};

// 可疑端口列表
const suspiciousPorts = {
  22: 'SSH暴力破解',
  23: 'Telnet攻击',
  3389: 'RDP攻击',
  80: 'Web攻击',
  443: 'Web攻击',
  1433: 'SQL注入',
  3306: 'MySQL攻击',
  6379: 'Redis未授权',
  27017: 'MongoDB攻击'
};

// IP 地理位置缓存
const ipLocationCache = new Map();
const IP_CACHE_DURATION = 3600000; // 1小时缓存
const IP_REQUEST_INTERVAL = 1000; // 每个 IP 请求间隔 1 秒
let lastRequestTime = 0;

// 带延迟的请求函数
async function delayedFetch(url) {
  const now = Date.now();
  const timeToWait = Math.max(0, IP_REQUEST_INTERVAL - (now - lastRequestTime));
  
  if (timeToWait > 0) {
    await new Promise(resolve => setTimeout(resolve, timeToWait));
  }
  
  lastRequestTime = Date.now();
  return fetch(url);
}

// 获取 IP 地理位置信息
async function getIpLocation(ip) {
  // 检查缓存
  const cached = ipLocationCache.get(ip);
  if (cached && Date.now() - cached.timestamp < IP_CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await delayedFetch(`https://api.mir6.com/api/ip?ip=${ip}&type=ini`);
    const text = await response.text();
    
    // 解析返回的 ini 格式数据
    const data = {};
    text.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        data[key.trim()] = value.trim();
      }
    });
    
    if (data.ip) {
      const locationData = {
        ip: data.ip,
        coords: getLocationCoords(data.city, data.province),
        city: data.city?.replace('市', '') || '未知',
        country: data.countryCode || 'UN',
        region: data.province?.replace('省', '') || '未知',
        isp: data.isp || '未知',
        district: data.districts || '未知',
        network: data.net || '未知'
      };
      
      // 更新缓存
      ipLocationCache.set(ip, {
        data: locationData,
        timestamp: Date.now()
      });
      
      return locationData;
    }
    
    throw new Error('无效的响应数据');
  } catch (error) {
    console.warn(`无法获取IP ${ip} 的地理位置:`, error);
    return {
      ip: ip,
      coords: [35.0, 105.0], // 默认使用中国中心点坐标
      city: '未知',
      country: 'UN',
      region: '未知',
      isp: '未知',
      district: '未知',
      network: '未知'
    };
  }
}

// 根据城市和省份获取坐标
function getLocationCoords(city, province) {
  // 移除"市"和"省"后缀
  city = city?.replace('市', '');
  province = province?.replace('省', '');
  
  // 使用城市坐标映射表
  const cityCoords = {
    '济宁': [35.4150, 116.5870],
    '北京': [39.9042, 116.4074],
    '上海': [31.2304, 121.4737],
    '广州': [23.1291, 113.2644],
    '深圳': [22.5431, 114.0579],
    '成都': [30.5728, 104.0668],
    '杭州': [30.2741, 120.1551],
    '武汉': [30.5928, 114.3055]
  };

  // 使用省会城市坐标映射表
  const provinceCoords = {
    '山东': [36.6512, 117.0200], // 济南
    '河南': [34.7472, 113.6253], // 郑州
    '河北': [38.0428, 114.5149], // 石家庄
    '四川': [30.5728, 104.0668], // 成都
    '浙江': [30.2741, 120.1551], // 杭州
    '湖北': [30.5928, 114.3055]  // 武汉
  };

  return cityCoords[city] || provinceCoords[province] || [35.0, 105.0];
}

async function getServerLocation() {
  try {
    const response = await fetch(`http://localhost:${process.env.PORT || 3000}/api/server-location`);
    if (!response.ok) throw new Error('无法获取服务器位置');
    return await response.json();
  } catch (error) {
    console.warn('获取服务器位置失败，使用默认位置:', error);
    return {
      ip: '127.0.0.1',
      coords: [43.825592, 87.616848],
      city: "乌鲁木齐",
      region: "新疆",
      country: "CN",
      isDefault: true
    };
  }
}

async function checkNetworkConnections() {
  try {
    const { stdout } = await execPromise('netstat -n | findstr ESTABLISHED');
    const connections = stdout.split('\n').filter(Boolean);
    
    const attacks = [];
    
    // 使用 Set 去重重复的 IP
    const uniqueIps = new Set();
    for (const connection of connections) {
      const parts = connection.trim().split(/\s+/);
      if (parts.length >= 4) {
        const [proto, localAddr, remoteAddr, state] = parts;
        const remoteIp = remoteAddr.split(':')[0];
        const remotePort = parseInt(remoteAddr.split(':')[1]);
        
        // 检查是否是可疑端口且 IP 未处理过
        if (suspiciousPorts[remotePort] && !uniqueIps.has(remoteIp)) {
          uniqueIps.add(remoteIp);
          
          const locationData = await getIpLocation(remoteIp);
          attacks.push({
            id: `attack-${Date.now()}-${remoteIp}`,
            source: locationData,
            type: suspiciousPorts[remotePort],
            timestamp: new Date().toISOString(),
            severity: 7
          });
        }
      }
    }
    
    return attacks;
  } catch (error) {
    console.error('检查网络连接失败:', error);
    return [];
  }
}

async function parseLogFiles() {
  try {
    if (threatCache.lastUpdated && (Date.now() - threatCache.lastUpdated) < 10000) {
      return threatCache;
    }

    const serverLocation = await getServerLocation();
    const target = {
      ip: serverLocation.ip,
      coords: serverLocation.coords,
      city: serverLocation.city,
      country: serverLocation.country
    };

    // 获取实时网络连接和威胁
    const attacks = await checkNetworkConnections();
    
    // 为每个攻击添加目标信息
    attacks.forEach(attack => {
      attack.target = target;
    });

    // 计算统计数据
    const countryCount = {};
    const typeCount = {};
    
    attacks.forEach(attack => {
      countryCount[attack.source.country] = (countryCount[attack.source.country] || 0) + 1;
      typeCount[attack.type] = (typeCount[attack.type] || 0) + 1;
    });

    // 找出最常见的国家和攻击类型
    let topCountry = Object.entries(countryCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '未知';
    
    let topAttackType = Object.entries(typeCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '未知';

    // 更新缓存
    threatCache = {
      attacks: [...threatCache.attacks, ...attacks].slice(-100),
      totalAttacks: threatCache.totalAttacks + attacks.length,
      topCountry,
      topAttackType,
      lastUpdated: Date.now()
    };

    return threatCache;
  } catch (error) {
    console.error('分析威胁数据时出错:', error);
    return threatCache;
  }
}

export default async function handler(req, res) {
  try {
    const threatData = await parseLogFiles();
    res.status(200).json(threatData);
  } catch (error) {
    console.error('处理威胁数据请求时出错:', error);
    res.status(500).json({ 
      error: '获取威胁数据失败',
      message: error.message
    });
  }
} 