import si from 'systeminformation';

export default async function handler(req, res) {
  try {
    // 并行获取所有系统信息
    const [cpu, mem, disk, networkStats, time] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize(),
      si.networkStats(),
      si.time()
    ]);

    // 计算 CPU 使用率
    const cpuUsage = cpu.currentLoad;
    
    // 计算内存使用率
    const memoryUsage = Math.round((mem.used / mem.total) * 100);
    
    // 计算磁盘使用率 (使用第一个磁盘)
    const diskUsage = disk.length > 0 ? Math.round((disk[0].used / disk[0].size) * 100) : 0;
    
    // 计算网络使用率 (简化版)
    const networkTotal = networkStats.reduce((sum, net) => sum + net.tx_sec + net.rx_sec, 0);
    // 假设最大带宽为 1Gbps = 125MB/s
    const networkUsage = Math.min(Math.round((networkTotal / (125 * 1024 * 1024)) * 100), 100);
    
    // 计算系统运行时间（小时）
    const uptime = Math.round(si.time().uptime / 3600);

    // 返回格式化的数据
    res.status(200).json({
      cpu: Math.round(cpuUsage),
      memory: memoryUsage,
      disk: diskUsage,
      network: networkUsage,
      uptime: uptime,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching server stats:', error);
    res.status(500).json({ error: 'Failed to fetch server statistics' });
  }
} 