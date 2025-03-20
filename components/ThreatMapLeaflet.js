import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function ThreatMapLeaflet({ attacks, serverLocation }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const attackLinesRef = useRef([]);
  const markersRef = useRef({});
  const [mapReady, setMapReady] = useState(false);
  const serverMarkerRef = useRef(null);

  // 初始化地图
  useEffect(() => {
    // 修复 Leaflet 图标问题
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });

    // 创建地图实例
    if (!mapInstanceRef.current && mapRef.current) {
      // 使用深色主题地图
      const map = L.map(mapRef.current, {
        center: [30, 10], // 世界中心位置
        zoom: 2,
        minZoom: 2,
        maxZoom: 10,
        zoomControl: true,
        attributionControl: true
      });

      // 添加深色主题瓦片图层
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      // 添加自定义 CSS 样式
      const style = document.createElement('style');
      style.textContent = `
        .pulse {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(0, 120, 255, 0.6);
          box-shadow: 0 0 0 rgba(0, 120, 255, 0.6);
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(0, 120, 255, 0.6);
          }
          70% {
            box-shadow: 0 0 0 20px rgba(0, 120, 255, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(0, 120, 255, 0);
          }
        }
        
        .attack-marker {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: red;
          opacity: 0.8;
        }
        
        .attack-line {
          stroke-dasharray: 5, 5;
          animation: dash 30s linear infinite;
          opacity: 0.7;
        }
        
        @keyframes dash {
          to {
            stroke-dashoffset: 1000;
          }
        }
      `;
      document.head.appendChild(style);

      mapInstanceRef.current = map;
      setMapReady(true);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      document.querySelectorAll('style').forEach(el => {
        if (el.textContent.includes('.pulse')) {
          el.remove();
        }
      });
    };
  }, []);

  // 更新服务器位置标记
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !serverLocation) return;
    
    const map = mapInstanceRef.current;
    
    // 移除旧的服务器标记
    if (serverMarkerRef.current && map.hasLayer(serverMarkerRef.current)) {
      map.removeLayer(serverMarkerRef.current);
    }
    
    // 添加目标服务器标记
    const targetIcon = L.divIcon({
      className: 'target-marker',
      html: '<div class="pulse"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    // 添加服务器位置
    const targetMarker = L.marker([serverLocation.coords[0], serverLocation.coords[1]], { 
      icon: targetIcon,
      zIndexOffset: 1000 // 确保目标标记始终在顶层
    }).addTo(map);
    
    targetMarker.bindPopup(`<strong>您的服务器</strong><br>${serverLocation.city}, ${serverLocation.country}`);
    serverMarkerRef.current = targetMarker;
    
    // 将地图中心移动到服务器位置
    map.setView([serverLocation.coords[0], serverLocation.coords[1]], 3);
    
  }, [mapReady, serverLocation]);

  // 处理攻击数据更新
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // 清除旧的攻击线条
    attackLinesRef.current.forEach(line => {
      if (map.hasLayer(line)) {
        map.removeLayer(line);
      }
    });
    attackLinesRef.current = [];

    // 添加新的攻击线条和标记
    attacks.forEach(attack => {
      const { source, target, type, id } = attack;
      
      // 如果源坐标无效，跳过
      if (!source.coords || source.coords.length !== 2) return;
      
      // 获取攻击类型对应的颜色
      const getAttackColor = (attackType) => {
        switch (attackType) {
          case 'DDoS': return '#ff4d4d';
          case 'SQL注入': return '#ffcc00';
          case 'XSS': return '#00ccff';
          case '暴力破解': return '#ff9900';
          case '恶意扫描': return '#9966ff';
          case 'CSRF': return '#ff66cc';
          case '钓鱼攻击': return '#6666ff';
          case '恶意软件': return '#66ff66';
          default: return '#ffffff';
        }
      };
      
      const color = getAttackColor(type);
      
      // 创建或更新源标记
      if (!markersRef.current[id]) {
        const attackIcon = L.divIcon({
          className: 'attack-marker',
          html: `<div style="background-color: ${color}; width: 8px; height: 8px; border-radius: 50%;"></div>`,
          iconSize: [8, 8],
          iconAnchor: [4, 4]
        });
        
        const marker = L.marker([source.coords[0], source.coords[1]], { icon: attackIcon }).addTo(map);
        marker.bindPopup(`
          <strong>${type}</strong><br>
          来源: ${source.city || '未知'}, ${source.country || '未知'}<br>
          IP: ${source.ip}<br>
          时间: ${new Date(attack.timestamp).toLocaleTimeString()}
        `);
        
        markersRef.current[id] = marker;
        
        // 5分钟后自动移除标记
        setTimeout(() => {
          if (map.hasLayer(marker)) {
            map.removeLayer(marker);
          }
          delete markersRef.current[id];
        }, 5 * 60 * 1000);
      }
      
      // 创建攻击线条
      const attackLine = L.polyline(
        [
          [source.coords[0], source.coords[1]],
          [target.coords[0], target.coords[1]] // 使用服务器真实坐标
        ],
        {
          color: color,
          weight: 2,
          opacity: 0.7,
          dashArray: '5, 5',
          className: 'attack-line'
        }
      ).addTo(map);
      
      attackLinesRef.current.push(attackLine);
      
      // 30秒后自动移除线条
      setTimeout(() => {
        if (map.hasLayer(attackLine)) {
          map.removeLayer(attackLine);
        }
        attackLinesRef.current = attackLinesRef.current.filter(line => line !== attackLine);
      }, 30 * 1000);
    });
  }, [attacks, mapReady, serverLocation]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
} 