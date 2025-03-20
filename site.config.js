const siteConfig = {
  // 基本信息
  title: "Mai Xiyu",
  description: "个人网站 & 技术博客",
  language: "zh-CN",
  siteUrl: "https://www.example.com",

  // 作者信息
  author: {
    name: "Mai FUCK  Xiyu",
    avatar: "/images/avatar.jpg",
    bio: "Web开发者 / 开源爱好者",
    contacts: {
      email: "mai_xiyu@vip.qq.com",
      github: "https://github.com/onlyxiyu",
      twitter: "https://twitter.com/yourusername",
      bilibili: "https://space.bilibili.com/yourid"
    }
  },

  // 主题配置
  theme: {
    // 颜色
    colors: {
      primary: "#3B82F6",     // 主色调
      secondary: "#1D4ED8",   // 次要色调
      background: "#F3F4F6",  // 背景色
      text: "#111827",        // 文字颜色
      headerBg: "white",      // 头部背景
      footerBg: "#1F2937"     // 底部背景
    },
    // 字体
    fonts: {
      sans: '"Inter", system-ui, -apple-system, sans-serif',
      mono: '"Fira Code", monospace'
    },
    // 布局
    layout: {
      maxWidth: "1200px",
      contentWidth: "768px"
    }
  },

  // 导航配置
  navigation: {
    header: [
      { name: "首页", path: "/", description: "返回首页" },
      { name: "项目", path: "/projects", description: "查看我的项目" },
      { name: "博客", path: "/blog", description: "阅读技术文章" },
      { name: "服务器状态", path: "/server-status", description: "查看服务器运行状态" },
      { name: "威胁地图", path: "/threat-map", description: "实时网络威胁可视化" },
      { name: "关于", path: "/about", description: "了解更多关于我" }
    ],
    footer: [
      { name: "GitHub", url: "https://github.com/onlyxiyu" },
      { name: "Bilibili", url: "https://space.bilibili.com/yourid" }
    ]
  },

  // 首页配置
  home: {
    // 头部展示
    hero: {
      title: "你好，我是 Mai Xiyu",
      description: "欢迎访问我的个人网站",
      image: "/images/hero.jpg"
    },
    // 特色项目
    featuredProjects: [
      "minecraft-mod",
      "github-projects"
    ]
  },

  // 项目页面配置
  projects: {
    title: "我的项目",
    description: "这里展示了我的一些个人项目",
    perPage: 6
  },

  // 博客配置
  blog: {
    title: "博客文章",
    description: "分享技术文章和个人思考",
    postsPerPage: 10,
    showAuthor: true,
    showDate: true,
    showReadingTime: true
  },

  // SEO 配置
  seo: {
    titleTemplate: "%s | Mai Xiyu",
    defaultTitle: "Mai Xiyu - 个人网站",
    defaultDescription: "Mai Xiyu的个人网站和技术博客",
    images: {
      ogImage: "/images/og-image.png",
      favicon: "/favicon.ico"
    }
  },

  // 服务器状态页面配置
  serverStatus: {
    title: "服务器状态监控",
    refreshInterval: 5000,
    showUptime: true,
    location: {
      city: "乌鲁木齐",
      region: "新疆",
      country: "CN",
      coords: [43.825592, 87.616848], // [纬度, 经度]
      timezone: "Asia/Shanghai"
    }
  },

  // 威胁地图配置
  threatMap: {
    title: "实时网络威胁地图",
    description: "实时监控并可视化网络攻击",
    updateInterval: 30000, // 更新间隔（毫秒）
  },

  // 游戏配置
  game: {
    title: "弹球游戏",
    soundEnabled: true,
    difficulty: "medium",
    highScoreKey: "bounceHighScore"
  },

  // 其他配置
  misc: {
    // Google Analytics ID
    googleAnalyticsId: "G-XXXXXXXXXX",
    // 是否启用 PWA
    enablePWA: true,
    // 版权信息
    copyright: `© ${new Date().getFullYear()} Mai Xiyu. 保留所有权利。`
  },

  // 关于页面配置
  about: {
    title: "关于我",
    description: "了解更多关于我的信息",
    sections: {
      skills: {
        title: "掌握技能",
        show: true
      },
      experience: {
        title: "工作履历",
        show: true
      },
      education: {
        title: "教育经历",
        show: true
      }
    },
    content: {
      intro: "你好，我是 Mai Xiyu，一名热爱技术的开发者。",
      skills: [
        "Web 开发",
        "Minecraft Mod 开发",
        "摆烂"
      ],
      experience: [
        {
          title: "全栈开发工程师",
          company: "某科技公司",
          period: "2020 - 至今",
          description: "负责公司核心产品的开发和维护"
        }
      ],
      education: {
        degree: "计算机科学技术学院网络工程专业",
        school: "新疆师范大学",
        year: "2024"
      }
    }
  }
};

module.exports = siteConfig; 