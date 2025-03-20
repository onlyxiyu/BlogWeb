import { Server } from 'socket.io';
import si from 'systeminformation';

const ioHandler = (req, res) => {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on('connection', socket => {
      console.log('Client connected');
      
      // 发送初始数据
      sendServerStats(socket);
      
      // 设置定时器，每5秒发送一次数据
      const interval = setInterval(() => {
        sendServerStats(socket);
      }, 5000);
      
      socket.on('disconnect', () => {
        console.log('Client disconnected');
        clearInterval(interval);
      });
    });
  }
  
  res.end();
};

async function sendServerStats(socket) {
  try {
    const [cpu, mem, disk, networkStats, time] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize(),
      si.networkStats(),
      si.time()
    ]);

    const cpuUsage = Math.round(cpu.currentLoad);
    const memoryUsage = Math.round((mem.used / mem.total) * 100);
    const diskUsage = disk.length > 0 ? Math.round((disk[0].used / disk[0].size) * 100) : 0;
    
    const networkTotal = networkStats.reduce((sum, net) => sum + net.tx_sec + net.rx_sec, 0);
    const networkUsage = Math.min(Math.round((networkTotal / (125 * 1024 * 1024)) * 100), 100);
    
    const uptime = Math.round(time.uptime / 3600);

    socket.emit('serverStats', {
      cpu: cpuUsage,
      memory: memoryUsage,
      disk: diskUsage,
      network: networkUsage,
      uptime: uptime,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error sending server stats:', error);
  }
}

export default ioHandler; 