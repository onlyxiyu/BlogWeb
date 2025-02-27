import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

export default function GameModal({ onClose }) {
  const [isStarted, setIsStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [angle, setAngle] = useState(45);
  const [power, setPower] = useState(50);
  const [isAiming, setIsAiming] = useState(true);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // 游戏状态
  const gameRef = useRef({
    ball: {
      x: 50,
      y: 350,
      radius: 10,
      dx: 0,
      dy: 0,
      gravity: 0.0,     // 降低重力
      bounce: 0.8,      // 增加弹性
      friction: 0.995   // 减少摩擦
    },
    targets: [],
    walls: []  // 不再需要墙壁数组
  });

  // 初始化最高分
  useEffect(() => {
    const savedHighScore = localStorage.getItem('bounceHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  // 生成随机目标
  const generateTargets = () => {
    const targets = [];
    for (let i = 0; i < 5; i++) {
      targets.push({
        x: 200 + Math.random() * 400,
        y: 100 + Math.random() * 200,
        radius: 20,
        points: Math.floor(Math.random() * 5) + 1,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`
      });
    }
    return targets;
  };

  // 发射球
  const shootBall = () => {
    const radians = angle * Math.PI / 180;
    const speed = power * 0.2;
    gameRef.current.ball.dx = Math.cos(radians) * speed;
    gameRef.current.ball.dy = -Math.sin(radians) * speed;
    setIsAiming(false);
  };

  useEffect(() => {
    if (!isStarted || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 400;

    // 初始化游戏
    gameRef.current.targets = generateTargets();
    const game = gameRef.current;

    const drawBall = () => {
      ctx.beginPath();
      ctx.arc(game.ball.x, game.ball.y, game.ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.closePath();
    };

    const drawTargets = () => {
      game.targets.forEach(target => {
        ctx.beginPath();
        ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
        ctx.fillStyle = target.color;
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(target.points, target.x, target.y);
        ctx.closePath();
      });
    };

    const drawAimingLine = () => {
      if (isAiming) {
        const radians = angle * Math.PI / 180;
        const lineLength = power * 2;
        ctx.beginPath();
        ctx.moveTo(game.ball.x, game.ball.y);
        ctx.lineTo(
          game.ball.x + Math.cos(radians) * lineLength,
          game.ball.y - Math.sin(radians) * lineLength
        );
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.stroke();
        ctx.closePath();
      }
    };

    const checkCollisions = () => {
      // 墙壁碰撞
      const ball = game.ball;
      
      // 左右墙壁碰撞
      if (ball.x - ball.radius < 0) {
        ball.x = ball.radius;
        ball.dx = -ball.dx * ball.bounce;
      } else if (ball.x + ball.radius > canvas.width) {
        ball.x = canvas.width - ball.radius;
        ball.dx = -ball.dx * ball.bounce;
      }
      
      // 上下墙壁碰撞
      if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.dy = -ball.dy * ball.bounce;
      } else if (ball.y + ball.radius > canvas.height) {
        ball.y = canvas.height - ball.radius;
        ball.dy = -ball.dy * ball.bounce;
      }

      // 目标碰撞检测保持不变
      game.targets = game.targets.filter(target => {
        const dx = target.x - ball.x;
        const dy = target.y - ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < target.radius + ball.radius) {
          setScore(prev => prev + target.points);
          return false;
        }
        return true;
      });

      // 检查游戏结束
      if (game.targets.length === 0) {
        if (score > highScore) {
          setHighScore(score);
          localStorage.setItem('bounceHighScore', score.toString());
        }
        setGameOver(true);
      }
    };

    const update = () => {
      if (gameOver) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 更新球的位置
      if (!isAiming) {
        game.ball.dy += game.ball.gravity;
        game.ball.dx *= game.ball.friction;
        game.ball.dy *= game.ball.friction;
        game.ball.x += game.ball.dx;
        game.ball.y += game.ball.dy;

        checkCollisions();
      }

      // 绘制游戏元素
      drawBall();
      drawTargets();
      drawAimingLine();

      animationRef.current = requestAnimationFrame(update);
    };

    update();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isStarted, gameOver, isAiming, angle, power, score, highScore]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-900 p-8 rounded-xl shadow-2xl text-center"
      >
        {!isStarted && !gameOver && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">弹球物理游戏</h2>
            <p className="text-gray-300 mb-4">
              调整角度和力度，击中彩色目标得分！
            </p>
            <button 
              onClick={() => setIsStarted(true)}
              className="bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-600 transition"
            >
              开始游戏
            </button>
            <p className="text-white mt-4">最高分: {highScore}</p>
          </div>
        )}

        {isStarted && !gameOver && (
          <div>
            <div className="flex justify-between text-white mb-2">
              <span>分数: {score}</span>
              <span>最高分: {highScore}</span>
            </div>
            <canvas 
              ref={canvasRef} 
              className="border-2 border-gray-700 bg-black mb-4"
            />
            {isAiming && (
              <div className="space-y-4">
                <div>
                  <label className="text-white block mb-2">角度: {angle}°</label>
                  <input
                    type="range"
                    min="0"
                    max="180"
                    value={angle}
                    onChange={(e) => setAngle(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-white block mb-2">力度: {power}%</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={power}
                    onChange={(e) => setPower(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <button
                  onClick={shootBall}
                  className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition"
                >
                  发射
                </button>
              </div>
            )}
          </div>
        )}

        {gameOver && (
          <div className="text-white">
            <h2 className="text-2xl font-bold text-green-500 mb-4">游戏完成！</h2>
            <p className="mb-2">得分: {score}</p>
            <p className="mb-4">最高分: {highScore}</p>
            <button 
              onClick={() => {
                setGameOver(false);
                setIsStarted(false);
                setScore(0);
                setIsAiming(true);
                gameRef.current.ball = {
                  x: 50,
                  y: 350,
                  radius: 10,
                  dx: 0,
                  dy: 0,
                  gravity: 0.3,     // 降低重力
                  bounce: 0.8,      // 增加弹性
                  friction: 0.995   // 减少摩擦
                };
              }}
              className="mt-4 bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition"
            >
              再来一局
            </button>
          </div>
        )}

        <button 
          onClick={onClose}
          className="mt-4 ml-4 bg-gray-700 text-white px-6 py-3 rounded-full hover:bg-gray-600 transition"
        >
          关闭
        </button>
      </motion.div>
    </div>
  );
} 