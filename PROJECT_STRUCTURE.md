# 图寻档案馆 - 项目文件结构说明

**版本：** v2.1  
**更新日期：** 2026-05-16  
**部署地址：** https://tuxun-archives.vercel.app

---

## 📂 项目目录总览

```
图寻档案馆/
├── 📄 index.html                 # 网站首页入口
├── 📄 vercel.json                # Vercel 部署配置
├── 📄 .gitignore                 # Git 忽略规则
├── 📄 init_data.json             # Supabase 初始化数据源
│
├── 📁 backend/                   # 后端 API 服务
│   ├── 📄 server.js              # [核心] 后端主程序
│   ├── 📄 data.json              # 完整数据（220国家×222列）
│   ├── 📄 package.json           # Node.js 依赖配置
│   ├── 📄 package-lock.json      # 依赖版本锁定
│   ├── 📄 README.md              # 后端技术文档
│   ├── 📁 .gitkeep               # 保持空目录
│   └── 📁 .gitignore             # Git 忽略规则
│
├── 📁 world_map/                 # 世界地图模块 ⭐ 主功能
│   ├── 📄 geo_3.html             # [核心] 交互式地图应用
│   ├── 📄 world.svg              # SVG 矢量世界地图
│   ├── 📄 map_world.html         # 地图展示页面
│   ├── 📄 geo.csv                # 地理数据 CSV 源文件
│   ├── 📄 nation_like.csv        # 国家名称映射表
│   └── 📄 readme.txt             # 目录说明文档
│
├── 📁 world_img/                 # 国家特征图片库
│   ├── 📄 world_img.html         # 图片浏览页面
│   ├── 📄 image_list.js          # 图片列表配置
│   └── 🖼️ *.png / *.jpg (200+)  # 国家特征参考图
│
├── 📁 world_number/              # 数字世界模块
│   ├── 📄 world_number.html      # 数字世界页面
│   ├── 📄 number.csv             # 数字编号数据
│   └── 📄 check_list.txt         # 检查清单
│
└── 📁 assets/                    # 静态资源与辅助页面
    ├── 📄 SEA_language.html      # 东南亚语言学习页
    ├── 📄 car_code.html          # 车牌代码学习页
    ├── 📄 ele_pole.html          # 电线杆识别学习页
    ├── 📄 important_concept.html # 重要概念学习页
    ├── 📄 latin_language.html    # 拉丁语字母学习页
    ├── 📄 nation_code.html       # 国家代码学习页
    ├── 📄 national_flag.html     # 国旗识别学习页
    ├── 📄 petrol_station.html    # 加油站标识学习页
    ├── 📄 slavic_language.html   # 斯拉夫语言学习页
    ├── 🖼️ 世界国旗.png            # 世界国旗汇总图
    └── 🖼️ 图寻学院0.png           # 图寻学院标志
```

---

## 🎯 核心文件详解

### 1️⃣ 前端核心

#### `world_map/geo_3.html` - **主应用程序**
- **用途：** 交互式世界地图，支持国家标注和数据编辑
- **功能：**
  - ✅ SVG 矢量地图渲染（可点击每个国家）
  - ✅ 221 个特征列的搜索、新增、删除
  - ✅ 布尔值/数值两种数据类型
  - ✅ 编辑窗口拖动功能
  - ✅ 实时保存到 Supabase 云数据库
- **依赖：**
  - `world.svg` (地图矢量图)
  - `/api/*` (后端API)
- **访问路径：** `https://tuxun-archives.vercel.app/world_map/geo_3.html`

#### `index.html` - **网站首页**
- **用途：** 入口页面，提供各模块导航链接
- **内容：** 
  - 项目介绍
  - 各功能模块入口
  - 外部链接

---

### 2️⃣ 后端核心

#### `backend/server.js` - **API 服务**
- **用途：** Express.js RESTful API 服务器
- **部署方式：** Vercel Serverless Functions
- **主要功能：**

| 功能 | 路径 | 说明 |
|------|------|------|
| 列管理 | `/api/headers` | CRUD 列名 |
| 国家数据 | `/api/countries` | CRUD 国家数据 |
| 用户设置 | `/api/settings` | 存储用户偏好 |
| 数据初始化 | `/api/init` | 导入初始数据 |

- **性能优化：**
  - 采用懒加载策略（新增/删除列 < 1秒）
  - Supabase 连接池复用
  - 错误处理和日志记录

#### `backend/data.json` - **完整数据集**
- **规模：** 220 个国家 × 222 个特征列
- **格式：** JSON
- **用途：** 
  - 本地开发的数据源
  - Supabase 初始化的原始数据
  - 备份和恢复

#### `init_data.json` - **精简初始化数据**
- **用途：** Supabase 数据库初始化专用
- **内容：** 
  - `headers`: 220 个特征列名数组
  - `countries`: 220 个国家的初始数据

---

### 3️⃣ 地图资源

#### `world_map/world.svg` - **矢量地图**
- **类型：** SVG (Scalable Vector Graphics)
- **特点：**
  - 包含所有国家和地区的路径
  - 每个 `<path>` 元素代表一个国家
  - 支持 CSS 样式和 JavaScript 交互
  - 无损缩放，适合各种屏幕尺寸

#### `world_map/geo.csv` & `nation_like.csv`
- **geo.csv:** 原始地理数据（CSV 格式）
- **nation_like.csv:** 国家名称别名映射表（用于模糊匹配）

---

### 4️⃣ 图片资源库 (`world_img/`)

#### 图片命名规范
```
{国家名}_{地区}_{特征}.png
示例：
- 中国_北京_天安门.png
- 日本_东京_电线杆.png
- 巴西_里约_热带植物.png
```

#### 主要分类
| 分类 | 数量 | 说明 |
|------|------|------|
| 电线杆类 | ~50张 | 不同国家/地区的电线杆样式 |
| 路牌路桩 | ~30张 | 交通标志和道路设施 |
| 住宅建筑 | ~40张 | 各地特色民居 |
| 自然植被 | ~30张 | 典型植物和地貌 |
| 车牌标识 | ~20张 | 各国车牌样式 |
| 其他特征 | ~30+ | 加油站、护栏等 |

#### 访问方式
- **网页浏览：** `world_img/world_img.html`
- **程序引用：** 通过 `image_list.js` 配置列表

---

### 5️⃣ 辅助学习模块 (`assets/`)

#### 学习页面列表
| 文件名 | 学习主题 | 内容 |
|--------|---------|------|
| `SEA_language.html` | 东南亚语言 | 泰语、越南语、印尼语等 |
| `car_code.html` | 车牌代码 | 各国车牌格式对比 |
| `ele_pole.html` | 电线杆识别 | 全球电线杆类型图谱 |
| `important_concept.html` | 重要概念 | 图寻核心知识点 |
| `latin_language.html` | 拉丁字母 | 特殊字符对照表 |
| `nation_code.html` | 国家代码 | ISO 3166-1 标准 |
| `national_flag.html` | 国旗识别 | 世界各国国旗 |
| `petrol_station.html` | 加油站标识 | 全球加油站品牌 |
| `slavic_language.html` | 斯拉夫语言 | 西里尔字母变体 |

---

## 🔧 技术架构

### 系统流程图

```
用户浏览器 (geo_3.html)
    ↓ HTTP请求
Vercel Edge Network (CDN + Serverless)
    ↓ API路由
backend/server.js (Express.js)
    ↓ REST API
Supabase PostgreSQL (云数据库)
    ↓ SQL查询
返回 JSON 数据 → 渲染前端界面
```

### 数据流向

```
[读取流程]
前端加载 → GET /api/headers → 获取列名列表
         → GET /api/countries → 获取国家数据（懒加载补全）
         → 渲染 SVG 地图 + 数据面板

[写入流程]
用户操作 → PUT /api/countries/:country/:column → 更新单个值
         → PATCH countries 表 data 字段
         → 返回成功 → 刷新 UI

[管理流程]
新增列 → POST /api/headers → 插入 headers 表（< 1秒）
删除列 → DELETE /api/headers/:name → 删除 headers + 清理设置
```

---

## 🚀 部署配置

### Vercel 配置 (`vercel.json`)
```json
{
  "version": 2,
  "builds": [
    {"src": "backend/server.js", "use": "@vercel/node"},
    {"src": "{assets,world_map,world_img}/**", "use": "@vercel/static"},
    {"src": "*.html", "use": "@vercel/static"}
  ],
  "routes": [
    {"src": "/api/(.*)", "dest": "/backend/server.js"},
    {"src": "/(.*)", "dest": "/$1"}
  ]
}
```

### 环境变量（可选）
| 变量名 | 用途 | 默认值 |
|--------|------|--------|
| `SUPABASE_URL` | Supabase 项目 URL | 已硬编码 |
| `SUPABASE_ANON_KEY` | Supabase 公开密钥 | 已硬编码 |

> **注意：** 当前版本已将 Supabase 配置直接写入 `server.js`，无需额外配置环境变量。

---

## 📊 数据统计

| 指标 | 数量 |
|------|------|
| 总文件数 | ~250 个 |
| 国家数量 | 220 个 |
| 特征列数 | 221 个（含"国家"） |
| 参考图片 | 200+ 张 |
| 学习页面 | 10 个 |
| API 端点 | 11 个 |
| 数据大小 | ~5 MB (JSON) |

---

## 🛠️ 开发指南

### 本地开发环境
```bash
# 1. 克隆仓库
git clone https://github.com/Kason-Yu/tuxun-archives.git

# 2. 安装后端依赖
cd backend
npm install

# 3. 启动本地服务器
npm start
# 或使用 Live Server 打开 index.html

# 4. 浏览器访问
http://localhost:3000/world_map/geo_3.html
```

### Git 工作流
```bash
# 创建新分支
git checkout -b feature/new-feature

# 提交更改
git add .
git commit -m "feat: 新功能描述"

# 推送到远程
git push origin feature/new-feature

# 合并到主分支（自动触发 Vercel 部署）
git checkout main
git merge feature/new-feature
git push origin main
```

---

## ❓ 常见问题

### Q: 为什么有些文件不在 Git 中？
A: `.gitignore` 已排除：
- `node_modules/` (依赖包，可通过 npm install 重装)
- 大型临时文件
- 敏感配置信息

### Q: 如何添加新的特征列？
A: 
1. 在地图页面点击"新增"按钮
2. 输入列名并选择类型
3. 点击确定即可（< 1秒完成）

### Q: 数据会丢失吗？
A: 
- 所有数据存储在 Supabase 云数据库
- 自动备份，多副本冗余
- 支持导出为 JSON/CSV

### Q: 如何自定义地图样式？
A:
- 编辑 `world_map/geo_3.html` 中的 CSS 部分
- 或修改 `world_map/world.svg` 的 fill 属性

---

## 📝 版本历史

### v2.1.0 (2026-05-16) - 当前版本
**新功能：**
- ✅ 编辑窗口拖动功能
- ✅ 性能优化（新增/删除列 < 1秒）
- ✅ 懒加载数据策略

**修复：**
- 🔧 Supabase URL 拼写错误修复
- 🔧 JSON 解析错误处理
- 🔧 Settings 表唯一约束冲突解决

**清理：**
- 🗑️ 删除 8 个废弃文件
- 🔄 更新技术文档

### v2.0.0 (2026-05-15)
- ✅ 迁移至 Supabase 云数据库
- ✅ 部署至 Vercel 平台
- ✅ 支持多用户并发访问
- ✅ 新增数据持久化方案

### v1.x.x (早期版本)
- 本地 JSON 文件存储
- 单用户模式
- 基础 CRUD 功能

---

## 📞 联系与支持

- **GitHub Issues:** https://github.com/Kason-Yu/tuxun-archives/issues
- **在线地址:** https://tuxun-archives.vercel.app
- **作者:** Kason-Yu

---

## 📄 许可证

MIT License © 2026 Kason-Yu

---

*最后更新：2026-05-16*
*文档生成工具：AI Assistant*