# Geo Map API Backend

## 快速开始

```bash
npm install
node init-db.js    # 从 geo.csv 导入数据
npm start           # 启动服务器
```

## 部署到 Railway

1. 连接 GitHub 仓库的 `backend/` 目录
2. Railway 会自动检测 Node.js 项目
3. 确保设置了 `NODE_ENV=production`
4. 数据会持久化在 data.db（Railway 的数据库是临时的，需要配置 Volume 或使用外部数据库）

## API 文档

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/headers` | 获取所有列名 |
| POST | `/api/headers` | 新增列 `{name, type}` |
| DELETE | `/api/headers/:name` | 删除列 |
| GET | `/api/countries` | 获取所有国家数据 |
| GET | `/api/countries/:country` | 获取单个国家数据 |
| PUT | `/api/countries/:country/:column` | 更新值 `{value: number}` |
| POST | `/api/countries` | 新增国家 `{country, data}` |
| DELETE | `/api/countries/:country` | 删除国家 |
