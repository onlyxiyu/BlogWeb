import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function GameModal({ onClose }) {
  const [isStarted, setIsStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const requestRef = useRef(null);
  const ballRef = useRef({ x: 50, y: 350, dx: 3, dy: -4, radius: 10 });
  const targetsRef = useRef([]);
  const lastTimeRef = useRef(0);
  const paddleRef = useRef({ x: 300, width: 100, height: 10, speed: 8 });
  const keysRef = useRef({ left: false, right: false });
  const powerupsRef = useRef([]);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const sounds = useRef({
    hit: new Audio('/sounds/hit.mp3'),
    paddle: new Audio('/sounds/paddle.mp3'),
    powerup: new Audio('/sounds/powerup.mp3'),
    levelup: new Audio('/sounds/levelup.mp3'),
    gameover: new Audio('/sounds/gameover.mp3')
  }).current;
  const [isPaused, setIsPaused] = useState(false);
  const particlesRef = useRef([]);
  const [stats, setStats] = useState({
    totalHits: 0,
    powerupsCollected: 0,
    maxLevel: 1,
    playTime: 0
  });

  // 初始化最高分
  useEffect(() => {
    const savedHighScore = localStorage.getItem('bounceHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  // 调整画布大小
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const maxWidth = 600;
        const width = Math.min(maxWidth, containerWidth - 20);
        const height = width * 0.67; // 保持宽高比
        
        setCanvasSize({ width, height });
        
        // 如果游戏已经开始，需要重新调整游戏元素位置
        if (isStarted) {
          const canvas = canvasRef.current;
          if (canvas) {
            canvas.width = width;
            canvas.height = height;
            
            // 调整挡板位置
            paddleRef.current.x = (width - paddleRef.current.width) / 2;
            
            // 调整球位置
            if (ballRef.current.y > height - 50) {
              ballRef.current.y = height - 50;
            }
            
            // 重新生成目标
            generateTargets();
          }
        }
      }
    };
    
    // 初始调整
    handleResize();
    
    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isStarted]);

  // 初始化游戏
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvasSize.width === 0) return;

    // 设置画布尺寸
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    // 初始绘制
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制开始界面
    if (!isStarted) {
      ctx.fillStyle = '#333';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('点击"开始游戏"开始', canvas.width / 2, canvas.height / 2);
    }

    // 键盘事件监听
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') keysRef.current.left = true;
      if (e.key === 'ArrowRight') keysRef.current.right = true;
    };

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft') keysRef.current.left = false;
      if (e.key === 'ArrowRight') keysRef.current.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isStarted, canvasSize]);

  // 生成目标
  const generateTargets = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const targets = [];
    const targetCount = 5 + level * 2; // 随关卡增加目标数量
    const rows = Math.min(4, Math.ceil(level / 2)); // 最多4行
    const cols = Math.ceil(targetCount / rows);
    
    const blockWidth = (canvas.width - 100) / cols;
    const blockHeight = 30;
    const startY = 50;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (targets.length >= targetCount) break;
        
        const health = Math.min(3, Math.ceil(level / 3)); // 随关卡增加生命值
        
      targets.push({
          x: 50 + col * blockWidth + blockWidth / 2,
          y: startY + row * (blockHeight + 10),
          width: blockWidth - 10,
          height: blockHeight,
          color: getHealthColor(health),
          health: health,
          maxHealth: health,
          points: health * 10
        });
      }
    }
    
    targetsRef.current = targets;
  };
  
  // 根据生命值获取颜色
  const getHealthColor = (health) => {
    switch (health) {
      case 1: return '#e74c3c'; // 红色
      case 2: return '#f39c12'; // 橙色
      case 3: return '#2ecc71'; // 绿色
      default: return '#3498db'; // 蓝色
    }
  };
  
  // 随机颜色
  const getRandomColor = () => {
    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // 生成道具
  const spawnPowerup = (x, y) => {
    // 30%概率生成道具
    if (Math.random() > 0.3) return;
    
    const types = ['extraLife', 'bigBall', 'widePaddle', 'slowBall'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    powerupsRef.current.push({
      x,
      y,
      dy: 2,
      radius: 8,
      type,
      color: getPowerupColor(type)
    });
  };
  
  // 获取道具颜色
  const getPowerupColor = (type) => {
    switch (type) {
      case 'extraLife': return '#e74c3c'; // 红色
      case 'bigBall': return '#3498db'; // 蓝色
      case 'widePaddle': return '#f39c12'; // 橙色
      case 'slowBall': return '#2ecc71'; // 绿色
      default: return '#9b59b6'; // 紫色
    }
  };
  
  // 应用道具效果
  const applyPowerup = (type) => {
    switch (type) {
      case 'extraLife':
        setLives(prev => prev + 1);
        break;
      case 'bigBall':
        ballRef.current.radius = 15;
        setTimeout(() => {
          if (ballRef.current) ballRef.current.radius = 10;
        }, 10000);
        break;
      case 'widePaddle':
        paddleRef.current.width = 150;
        setTimeout(() => {
          if (paddleRef.current) paddleRef.current.width = 100;
        }, 10000);
        break;
      case 'slowBall':
        const ball = ballRef.current;
        const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        ball.dx = ball.dx / speed * 2;
        ball.dy = ball.dy / speed * 2;
        setTimeout(() => {
          if (ballRef.current) {
            const newSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
            ball.dx = ball.dx / newSpeed * 5;
            ball.dy = ball.dy / newSpeed * 5;
          }
        }, 10000);
        break;
    }
  };

  // 创建粒子效果
  const createParticles = (x, y, color, count = 10) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x,
        y,
        dx: (Math.random() - 0.5) * 8,
        dy: (Math.random() - 0.5) * 8,
        radius: Math.random() * 3 + 1,
        alpha: 1,
        color
      });
    }
  };

  // 在游戏循环中更新和绘制粒子
  const updateParticles = (ctx) => {
    particlesRef.current = particlesRef.current.filter(particle => {
      particle.x += particle.dx;
      particle.y += particle.dy;
      particle.alpha *= 0.96;
      
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${particle.color}, ${particle.alpha})`;
      ctx.fill();
      
      return particle.alpha > 0.1;
    });
  };

  // 添加防抖函数
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // 使用防抖的音效播放函数
  const debouncedPlaySound = debounce((type) => {
    if (!isSoundEnabled) return;
    sounds[type].currentTime = 0;
    sounds[type].play().catch(() => {});
  }, 50);

  // 游戏循环
  const gameLoop = (timestamp) => {
    if (!isStarted || gameOver || isPaused) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const ball = ballRef.current;
    const paddle = paddleRef.current;
    
    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;
    
    // 使用 deltaTime 计算移动距离
    const timeScale = deltaTime / (1000 / 60); // 标准化为60fps
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制背景
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 更新挡板位置
    if (keysRef.current.left) {
      paddle.x = Math.max(paddle.x - paddle.speed * timeScale, 0);
    }
    if (keysRef.current.right) {
      paddle.x = Math.min(paddle.x + paddle.speed * timeScale, canvas.width - paddle.width);
    }
    
    // 更新球位置
    ball.x += ball.dx * timeScale;
    ball.y += ball.dy * timeScale;
    
    // 碰撞检测 - 墙壁
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
      ball.dx = -ball.dx;
    }
    if (ball.y - ball.radius < 0) {
      ball.dy = -ball.dy;
    }
    
    // 碰撞检测 - 底部 (失去生命)
    if (ball.y + ball.radius > canvas.height) {
      setLives(prev => {
        if (prev <= 1) {
          setGameOver(true);
          return 0;
        }
        
        // 重置球位置
        ball.x = canvas.width / 2;
        ball.y = canvas.height - 50;
        ball.dx = 3 * (Math.random() > 0.5 ? 1 : -1);
        ball.dy = -4;
        
        return prev - 1;
      });
    }
    
    // 碰撞检测 - 挡板
    if (ball.y + ball.radius > canvas.height - 20 && 
        ball.x > paddle.x && 
        ball.x < paddle.x + paddle.width) {
      
      // 根据击中挡板的位置改变反弹角度
      const hitPos = (ball.x - paddle.x) / paddle.width;
      const angle = hitPos * Math.PI - Math.PI/2;
      
      const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
      ball.dx = Math.cos(angle) * speed;
      ball.dy = Math.sin(angle) * speed;
      
      // 确保球向上移动
      if (ball.dy > 0) ball.dy = -ball.dy;
      
      // 添加挡板碰撞音效
      debouncedPlaySound('paddle');
    }
    
    // 碰撞检测 - 目标
    let allDestroyed = true;
    targetsRef.current.forEach(target => {
      if (target.health > 0) {
        allDestroyed = false;
        
        // 检测碰撞 (矩形)
        if (ball.x + ball.radius > target.x - target.width/2 &&
            ball.x - ball.radius < target.x + target.width/2 &&
            ball.y + ball.radius > target.y - target.height/2 &&
            ball.y - ball.radius < target.y + target.height/2) {
          
          // 减少目标生命值
          target.health--;
          target.color = getHealthColor(target.health);
          
          // 添加击中音效
          debouncedPlaySound('hit');
          
          // 如果目标被摧毁，增加分数并可能生成道具
          if (target.health <= 0) {
            setScore(prev => prev + target.points);
            spawnPowerup(target.x, target.y);
          }
          
          // 确定碰撞方向并反弹
          const dx = ball.x - target.x;
          const dy = ball.y - target.y;
          
          // 水平碰撞
          if (Math.abs(dx) > Math.abs(dy)) {
            ball.dx = -ball.dx;
          } 
          // 垂直碰撞
          else {
            ball.dy = -ball.dy;
          }
        }
      }
    });
    
    // 更新道具
    powerupsRef.current.forEach((powerup, index) => {
      powerup.y += powerup.dy;
      
      // 检测与挡板的碰撞
      if (powerup.y + powerup.radius > canvas.height - 20 &&
          powerup.y - powerup.radius < canvas.height - 10 &&
          powerup.x > paddle.x &&
          powerup.x < paddle.x + paddle.width) {
        
        // 添加道具音效
        debouncedPlaySound('powerup');
        
        // 应用道具效果
        applyPowerup(powerup.type);
        
        // 移除道具
        powerupsRef.current.splice(index, 1);
      }
      
      // 移除超出屏幕的道具
      if (powerup.y - powerup.radius > canvas.height) {
        powerupsRef.current.splice(index, 1);
      }
    });
    
    // 检查是否所有目标都被摧毁
    if (allDestroyed) {
      // 添加升级音效
      debouncedPlaySound('levelup');
      
      // 进入下一关
      setLevel(prev => prev + 1);
      setScore(prev => prev + level * 50); // 关卡奖励
      
      // 重置球位置
      ball.x = canvas.width / 2;
      ball.y = canvas.height - 50;
      ball.dx = 3 * (Math.random() > 0.5 ? 1 : -1);
      ball.dy = -4;
      
      // 生成新目标
      generateTargets();
      
      // 清空道具
      powerupsRef.current = [];
    }
    
    // 绘制目标
    targetsRef.current.forEach(target => {
      if (target.health > 0) {
        ctx.fillStyle = target.color;
        ctx.fillRect(
          target.x - target.width/2, 
          target.y - target.height/2, 
          target.width, 
          target.height
        );
        
        // 绘制生命值
        if (target.maxHealth > 1) {
          ctx.fillStyle = '#fff';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(target.health, target.x, target.y);
        }
      }
    });
    
    // 绘制道具
    powerupsRef.current.forEach(powerup => {
      ctx.beginPath();
      ctx.arc(powerup.x, powerup.y, powerup.radius, 0, Math.PI * 2);
      ctx.fillStyle = powerup.color;
      ctx.fill();
      ctx.closePath();
      
      // 绘制道具图标
      ctx.fillStyle = '#fff';
      ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
      
      let icon = '?';
      switch (powerup.type) {
        case 'extraLife': icon = '♥'; break;
        case 'bigBall': icon = 'B'; break;
        case 'widePaddle': icon = 'W'; break;
        case 'slowBall': icon = 'S'; break;
      }
      
      ctx.fillText(icon, powerup.x, powerup.y);
    });
    
    // 绘制球
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#3498db';
    ctx.fill();
        ctx.closePath();
    
    // 绘制挡板
    ctx.fillStyle = '#34495e';
    ctx.fillRect(paddle.x, canvas.height - 20, paddle.width, paddle.height);
    
    // 绘制UI
    // 分数
    ctx.fillStyle = '#333';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`分数: ${score}`, 10, 20);
    
    // 关卡
    ctx.textAlign = 'center';
    ctx.fillText(`关卡 ${level}`, canvas.width / 2, 20);
    
    // 生命
    ctx.textAlign = 'right';
    ctx.fillText(`生命: ${'❤️'.repeat(lives)}`, canvas.width - 10, 20);
    
    // 继续游戏循环
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  // 开始游戏
  const startGame = () => {
    if (canvasSize.width === 0) return; // 确保画布已初始化
    
    setIsStarted(true);
    setScore(0);
    setGameOver(false);
    setLevel(1);
    setLives(3);
    
    // 重置球位置
    ballRef.current = {
      x: canvasSize.width / 2,
      y: canvasSize.height - 50,
      dx: 3,
      dy: -4,
      radius: 10
    };
    
    // 重置挡板位置
    paddleRef.current = {
      x: (canvasSize.width - 100) / 2,
      width: 100,
      height: 10,
      speed: 8
    };
    
    // 清空道具
    powerupsRef.current = [];
    
    // 生成目标
    generateTargets();
    
    // 开始游戏循环
    lastTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  // 清理动画
  useEffect(() => {
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  // 更新最高分
  useEffect(() => {
    if (gameOver) {
      debouncedPlaySound('gameover');
        if (score > highScore) {
          setHighScore(score);
          localStorage.setItem('bounceHighScore', score.toString());
        }
    }
  }, [gameOver, score, highScore]);

  // 添加暂停/继续处理
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape' && isStarted && !gameOver) {
        setIsPaused(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isStarted, gameOver]);

  // 更新统计信息
  const updateStats = (type, value = 1) => {
    setStats(prev => ({
      ...prev,
      [type]: prev[type] + value
    }));
  };

  // 添加控制面板组件
  const ControlPanel = ({ onClose }) => (
    <div className="absolute top-4 right-4 flex items-center space-x-4">
      <button
        onClick={() => setIsSoundEnabled(prev => !prev)}
        className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition"
      >
        {isSoundEnabled ? '🔊' : '🔇'}
      </button>
      {isPaused && (
        <button
          onClick={() => setIsPaused(false)}
          className="px-4 py-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition"
        >
          继续游戏
        </button>
      )}
      <button
        onClick={onClose}
        className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition"
      >
        ✕
      </button>
    </div>
  );

  // 添加触摸控制
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    let touchStartX = 0;
    
    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
    };
    
    const handleTouchMove = (e) => {
      if (!isStarted || gameOver || isPaused) return;
      
      const touchX = e.touches[0].clientX;
      const deltaX = touchX - touchStartX;
      touchStartX = touchX;
      
      const paddle = paddleRef.current;
      paddle.x = Math.max(0, Math.min(canvas.width - paddle.width, paddle.x + deltaX));
    };
    
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isStarted, gameOver, isPaused]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl p-4 w-full max-w-xl"
      >
        <h2 className="text-2xl font-bold text-center mb-4">弹球游戏</h2>
        
        <div ref={containerRef} className="relative w-full">
          <canvas 
            ref={canvasRef} 
            className="border border-gray-300 rounded-lg mx-auto bg-gray-100 w-full"
          />
          
          {!isStarted && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 rounded-lg">
              <h3 className="text-2xl font-bold text-white mb-4">弹球挑战</h3>
              <p className="text-white mb-2">击中所有目标，获得高分！</p>
              <p className="text-white mb-4 text-sm">
                使用左右方向键控制挡板
            </p>
            <button 
                onClick={startGame}
                className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition"
            >
              开始游戏
            </button>
            <p className="text-white mt-4">最高分: {highScore}</p>
          </div>
        )}

          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 rounded-lg">
              <h2 className="text-2xl font-bold text-white mb-4">游戏结束！</h2>
              <div className="text-white space-y-2 mb-6">
                <p>得分: {score}</p>
                <p>最高分: {highScore}</p>
                <p>达到关卡: {level}</p>
                <p>击中次数: {stats.totalHits}</p>
                <p>收集道具: {stats.powerupsCollected}</p>
                <p>游戏时长: {Math.floor(stats.playTime / 60)}分{stats.playTime % 60}秒</p>
              </div>
            <button 
                onClick={startGame}
                className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition"
            >
              再来一局
            </button>
          </div>
        )}
        </div>
        
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>使用左右方向键控制挡板</p>
          <p className="mt-1">收集道具获得特殊能力！</p>
        </div>

        <div className="mt-4 flex justify-center">
        <button 
          onClick={onClose}
            className="bg-gray-700 text-white px-6 py-2 rounded-full hover:bg-gray-600 transition"
        >
          关闭
        </button>
        </div>

        <ControlPanel onClose={onClose} />
      </motion.div>
    </div>
  );
} 