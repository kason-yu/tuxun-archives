# 🌐 图寻档案馆 - Vercel 部署完整指南

## ✨ 已完成的准备工作

我已经为你完成了以下配置：

### 1. **创建 vercel.json 配置文件**
- 位置：`d:\app\trae\图寻档案馆\vercel.json`
- 功能：告诉 Vercel 如何处理 Node.js 后端和静态文件

### 2. **修改后端代码适配 Serverless**
- 文件：`图寻/backend/server.js`
- 改动：添加 `module.exports = app` 导出，兼容本地开发和Vercel部署

### 3. **前端 API 地址自动适配**
- 文件：`图寻/world_map/geo_3.html`
- 改动：`API_BASE` 从固定 `localhost:3000` 改为 `window.location.origin`
- 效果：自动识别当前域名（本地或线上）

---

## 🚀 部署步骤（预计10分钟）

### **阶段1：准备 Git 仓库**

#### 步骤1：初始化 Git 仓库（如果还没有）
```bash
cd d:\app\trae\图寻档案馆
git init
```

#### 步骤2：创建 .gitignore 文件
在项目根目录创建 `.gitignore` 文件：

```gitignore
# 依赖目录
node_modules/

# 系统文件
.DS_Store
Thumbs.db

# IDE 配置
.vscode/
.idea/

# 日志文件
*.log
npm-debug.log*

# 环境变量（如果有）
.env
.env.local
```

#### 步骤3：提交所有文件
```bash
git add .
git commit -m "feat: 初始化图寻档案馆项目"
```

#### 步骤4：推送到 GitHub
**如果你还没有 GitHub 仓库：**

1. 打开 https://github.com/new
2. 仓库名称：`tuxun-archives` （或你喜欢的名字）
3. 选择 **Private**（私有）或 **Public**（公开）
4. **不要勾选** "Add a README file" 或其他初始化选项
5. 点击 **Create repository**

**推送代码到 GitHub：**
```bash
git remote add origin https://github.com/你的用户名/tuxun-archives.git
git branch -M main
git push -u origin main
```

---

### **阶段2：部署到 Vercel**

#### 步骤1：注册/登录 Vercel
1. 打开 https://vercel.com
2. 点击 **Sign Up**（注册）或 **Log In**（登录）
3. 使用 **GitHub 账号**登录（推荐，方便后续集成）

#### 步骤2：导入项目
1. 登录后进入 Dashboard
2. 点击 **Add New...** → **Project**
3. 选择 **Import Git Repository**
4. 找到你刚创建的仓库 `tuxun-archives`
5. 点击 **Import**

#### 步骤3：配置项目
Vercel 会自动检测到 Node.js 项目，你需要确认以下配置：

**Project Settings:**
- **Framework Preset**: Other（其他）
- **Root Directory**: `./` （保持默认）
- **Build Command**: 留空（不需要构建步骤）
- **Output Directory**: 留空
- **Install Command**: `npm install`

**Environment Variables（环境变量）：**
暂时不需要添加，所有配置都在 `vercel.json` 中。

#### 步骤4：点击 Deploy
1. 点击 **Deploy** 按钮
2. 等待约 30 秒 - 2 分钟（首次部署会安装依赖）
3. 看到 **Congratulations!** 页面说明成功！

#### 步骤5：获取域名
部署成功后，Vercel 会给你一个临时域名：
- 格式：`https://your-project-name.vercel.app`
- 例如：`https://tuxun-archives.vercel.app`

---

## ✅ 验证部署是否成功

### 测试清单：

#### 1️⃣ **访问主页**
- 打开：`https://你的项目名.vercel.app/图寻/world_map/geo_3.html`
- 应该看到地图界面

#### 2️⃣ **测试 API 接口**
在浏览器访问：
- `https://你的项目名.vercel.app/api/headers`
- 应该返回 JSON 数组：`["国家", "左行国家", ...]`

#### 3️⃣ **测试交互功能**
- ✅ 搜索列名功能正常
- ✅ 新增列功能正常
- ✅ 编辑国家数据正常
- ✅ 地图颜色变化正常

#### 4️⃣ **检查控制台**
按 F12 打开开发者工具 → Console：
- ❌ 不应该有红色错误
- ⚠️ 可以忽略 CORS 相关警告（如果有的话）

---

## 🔧 高级配置（可选）

### **绑定自定义域名**

1. 在 Vercel Dashboard 进入项目
2. 点击 **Settings** → **Domains**
3. 输入你的域名，例如：`map.yourdomain.com`
4. 按照提示配置 DNS 记录
5. 等待 DNS 生效（通常 5-30 分钟）

**需要准备：**
- 已购买的域名（阿里云、腾讯云、Cloudflare 等）
- 能够修改 DNS 记录的权限

### **优化性能**

在 `vercel.json` 中可以添加缓存策略：

```json
{
  "version": 2,
  "builds": [...],
  "routes": [
    {
      "src": "/api/(.*)",
      "headers": {
        "Cache-Control": "no-cache, no-store, must-revalidate"
      },
      "dest": "/backend/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

---

## 🐛 常见问题排查

### **问题1：部署后页面空白**

**可能原因：**
- API 地址不正确
- 文件路径错误

**解决方案：**
1. 检查浏览器控制台是否有错误
2. 确认访问路径正确：`/图寻/world_map/geo_3.html`
3. 查看 Vercel 的 Deployment Logs

**查看日志方法：**
1. 进入 Vercel Dashboard
2. 点击你的项目
3. 点击 **Deployments** 标签
4. 点击最新的部署记录
5. 点击 **View Function Logs**

---

### **问题2：API 返回 404 错误**

**可能原因：**
- `vercel.json` 路由配置错误
- server.js 未正确导出

**解决方案：**
1. 确认 `server.js` 最后有：`module.exports = app;`
2. 确认 `vercel.json` 中路由配置正确
3. 重新部署：在 Vercel Dashboard 点击 **Redeploy**

---

### **问题3：数据无法保存**

**可能原因：**
- Vercel Serverless Functions 是无状态的
- 每次请求可能在不同的服务器执行
- `/tmp` 目录是唯一可写的地方

**当前方案的限制：**
- ✅ 数据存储在 JSON 文件中（适合小规模使用）
- ⚠️ Vercel 免费版的 `/tmp` 可能会在函数重启时丢失数据
- 💡 对于生产环境，建议迁移到真实数据库（如 Supabase、PlanetScale）

**如果遇到数据丢失问题：**
1. 升级到 Vercel Pro（持久化存储）
2. 或者改用外部数据库服务

---

### **问题4：CORS 跨域错误**

**症状：** 控制台显示 "Access-Control-Allow-Origin" 错误

**原因：** 前端和后端域名不一致

**解决方案：**
当前代码已经配置了 `cors()` 中间件，应该不会有此问题。
如果还有问题，检查：
1. 前端的 `API_BASE` 是否为 `window.location.origin`
2. 是否有其他地方硬编码了 localhost

---

## 📊 成本估算

### **Vercel 免费额度（Hobby Plan）：**

| 资源 | 免费额度 | 你的项目预估用量 |
|------|----------|------------------|
| **带宽** | 100 GB/月 | < 1 GB |
| **Serverless 执行次数** | 100K 次/月 | < 10K 次 |
| **构建时间** | 6,000 分钟/月 | < 10 分钟 |
| **团队人数** | 1 人 | 1 人 |

**结论：** 完全免费！✅

---

## 🎯 下一步建议

### **短期优化（本周可做）：**
- [ ] 绑定自定义域名（提升专业度）
- [ ] 添加 Google Analytics 统计访问量
- [ ] 创建 README.md 项目介绍文档

### **中期改进（本月可做）：**
- [ ] 迁移到外部数据库（Supabase 免费）
- [ ] 添加用户认证系统
- [ ] 优化移动端体验

### **长期规划（未来）：**
- [ ] 添加多语言支持
- [ ] 开发协作编辑功能
- [ ] 接入 AI 辅助标注

---

## 🆘 获取帮助

### **官方文档：**
- Vercel 文档：https://vercel.com/docs
- Node.js on Vercel：https://vercel.com/docs/frameworks/nodejs

### **社区支持：**
- Vercel Discord：https://vercel.com/discord
- Stack Overflow：搜索 `[vercel]` 标签

### **紧急联系：**
如果部署过程中遇到问题：
1. 截图错误信息
2. 复制完整的日志输出
3. 描述你操作的具体步骤
4. 我会帮你快速解决！

---

## 🎉 总结

你现在拥有一个：
- ✅ **完全免费**的在线网站
- ✅ **全球CDN加速**（访问速度快）
- ✅ **自动HTTPS**（安全加密）
- ✅ **Git集成**（推送即更新）

**下一步行动：**
1. 按照"阶段1"准备 Git 仓库并推送到 GitHub
2. 按照"阶段2"在 Vercel 上部署
3. 用"验证部署"部分测试功能
4. 分享给你的朋友们使用！

祝你部署顺利！🚀
