import { Server } from 'socket.io';
import geoip from 'geoip-lite';

let threatData = {
  attacks: [],
  totalAttacks: 0
};

const ioHandler = (req, res) => {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on('connection', socket => {
      console.log('Threat map client connected');
      
      // 发送初始数据
      socket.emit('threatData', threatData);
      
      // 设置定时器，每1-3秒生成一次攻击
      const interval = setInterval(() => {
        if (Math.random() > 0.3) { // 70%的概率生成攻击
          generateAttack(socket);
        }
      }, 1000 + Math.random() * 2000);
      
      socket.on('disconnect', () => {
        console.log('Threat map client disconnected');
        clearInterval(interval);
      });
    });
    
    // 启动定期清理旧攻击数据的任务
    setInterval(() => {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      threatData.attacks = threatData.attacks.filter(attack => 
        new Date(attack.timestamp) > tenMinutesAgo
      );
    }, 60000); // 每分钟清理一次
  }
  
  res.end();
};

function generateAttack(socket) {
  // 常见的公共 IP 地址
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
  
  const sourceIp = ipAddresses[Math.floor(Math.random() * ipAddresses.length)];
  const geo = geoip.lookup(sourceIp);
  
  if (geo) {
    const attack = {
      id: Date.now(),
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
    
    // 更新全局数据
    threatData.attacks.push(attack);
    threatData.totalAttacks += 1;
    
    // 只保留最近100条记录
    if (threatData.attacks.length > 100) {
      threatData.attacks = threatData.attacks.slice(-100);
    }
    
    // 发送新攻击数据
    socket.emit('newAttack', attack);
  }
}

export default ioHandler; 