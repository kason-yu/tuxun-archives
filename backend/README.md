# 图寻档案馆 - 后端 API

## 📖 项目概述

**图寻档案馆**是一个基于世界地图的地理知识学习与标注系统。

- **前端主页面：** `world_map/geo_3.html`
- **部署平台：** Vercel (https://tuxun-archives.vercel.app)
- **数据库：** Supabase PostgreSQL (云数据库)
- **数据规模：** 220 个国家 × 222 个特征列

---

## 🚀 技术栈

| 组件 | 技术 | 说明 |
|------|------|------|
| 前端 | HTML/CSS/JavaScript | 纯静态页面 |
| 后端 | Node.js + Express | Serverless 函数 (Vercel) |
| 数据库 | Supabase (PostgreSQL) | 云数据库，REST API |
| 地图 | SVG 矢量地图 | 交互式世界地图 |

---

## 📡 API 文档

### 列管理 (Headers)

| 方法 | 路径 | 说明 | 参数 |
|------|------|------|------|
| `GET` | `/api/headers` | 获取所有列名 | 无 |
| `POST` | `/api/headers` | 新增列 | `{ name: string }` |
| `DELETE` | `/api/headers/:name` | 删除列 | URL参数: 列名 |

### 国家数据 (Countries)

| 方法 | 路径 | 说明 | 参数 |
|------|------|------|------|
| `GET` | `/api/countries` | 获取所有国家数据 | 无 |
| `GET` | `/api/countries/:country` | 获取单个国家 | URL参数: 国家名 |
| `PUT` | `/api/countries/:country/:column` | 更新值 | `{ value: number }` |
| `POST` | `/api/countries` | 新增国家 | `{ country, data }` |
| `DELETE` | `/api/countries/:country` | 删除国家 | URL参数: 国家名 |

### 用户设置 (Settings)

| 方法 | 路径 | 说明 | 参数 |
|------|------|------|------|
| `GET` | `/api/selected-columns` | 获取选中的列 | 无 |
| `PUT` | `/api/selected-columns` | 保存选中的列和模式 | `{ columns, modes }` |
| `GET` | `/api/selected-modes` | 获取列的模式配置 | 无 |

### 数据库初始化

| 方法 | 路径 | 说明 | 参数 |
|------|------|------|------|
| `POST` | `/api/init` | 从 data.json 导入数据到Supabase | `{ force?: boolean }` |

---

## ⚡ 性能优化说明

### 懒加载策略（v2.0+）

为解决新增/删除列时遍历 220 个国家的性能问题（原耗时 10-30秒），采用以下优化：

**新增/删除列：**
- ✅ 只操作 `headers` 表（1次API调用）
- ❌ 不再遍历所有国家更新 data 字段
- ⏱️ **响应时间：< 1秒**

**读取数据时：**
- 自动对比 headers 表补全缺失列（默认值=0）
- 保证数据一致性

**写入数据时：**
- 只更新被编辑的列
- 使用 PATCH 局部更新

---

## 🗄️ 数据库结构

### `headers` 表
```sql
CREATE TABLE headers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `countries` 表
```sql
CREATE TABLE countries (
  name TEXT PRIMARY KEY,
  data JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `settings` 表
```sql
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔧 本地开发

### 安装依赖
```bash
cd backend
npm install
```

### 启动服务器
```bash
npm start
# 或
node server.js
```

服务将在 `http://localhost:3000` 启动

### 测试 API
```bash
# 获取所有列名
curl http://localhost:3000/api/headers

# 获取所有国家
curl http://localhost:3000/api/countries
```

---

## 🌐 部署说明

### Vercel 部署（当前）

1. 连接 GitHub 仓库：`Kason-Yu/tuxun-archives`
2. Vercel 自动检测并部署
3. 配置环境变量（可选）：
   - `SUPABASE_URL`: Supabase 项目URL
   - `SUPABASE_ANON_KEY`: Supabase anon key

### 配置文件
- `vercel.json`: Vercel 构建和路由配置
- `.gitignore`: Git 忽略规则

---

## 📁 相关文件

| 文件/目录 | 用途 |
|-----------|------|
| `server.js` | 后端 API 主文件 |
| `data.json` | 完整数据源（220国家×222列）|
| `package.json` | Node.js 依赖配置 |
| `init_data.json` | Supabase 初始化数据（精简版）|

---

## 📝 更新日志

### v2.1 (2026-05-16)
- ✅ 修复 Supabase URL 拼写错误
- ✅ 优化新增/删除列性能（10-30秒 → <1秒）
- ✅ 添加编辑窗口拖动功能
- ✅ 实现懒加载策略

### v2.0 (2026-05-15)
- ✅ 迁移至 Supabase 云数据库
- ✅ 部署至 Vercel 平台
- ✅ 支持多用户并发访问

### v1.0 (初始版本)
- ✅ 本地 JSON 文件存储
- ✅ 基础 CRUD 功能

---

## 📞 问题排查

### 常见错误

**500 Internal Server Error**
- 检查 Supabase 连接配置
- 查看 Vercel 部署日志

**ENOTFOUND 错误**
- 确认 SUPABASE_URL 正确
- 检查域名拼写

**CORS 错误**
- 已在 server.js 中配置 cors 中间件
- 检查请求来源是否允许

---

## 📄 许可证

MIT License