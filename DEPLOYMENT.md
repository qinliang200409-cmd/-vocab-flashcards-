# 📦 项目部署指南

本文档说明如何将"英语单词快速复习卡片网站"部署到 Vercel 平台。

---

## 🚀 快速部署（推荐）

### 方式1: 使用 Vercel CLI（最快）

1. **安装 Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **部署项目**
   ```bash
   vercel
   ```
   
   首次部署时会询问：
   - Set up and deploy? → **Yes**
   - Which scope? → 选择你的账户
   - Link to existing project? → **No**
   - What's your project's name? → 输入项目名称（例如：`vocab-flashcards`）
   - In which directory is your code located? → `.`
   - Want to override the settings? → **No**

4. **生产部署**
   ```bash
   vercel --prod
   ```

### 方式2: 通过 Vercel Dashboard（最简单）

1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub/GitLab/Bitbucket 登录
3. 点击 "Import Project"
4. 导入你的 Git 仓库
5. Vercel 会自动检测 Vite 项目并配置
6. 点击 "Deploy"

---

## 🔧 部署配置

### vercel.json 配置说明

项目已包含 `vercel.json` 配置文件，主要功能：

```json
{
  "buildCommand": "npm run build",        // 构建命令
  "outputDirectory": "dist",              // 输出目录
  "framework": "vite",                    // 框架类型
  "rewrites": [                           // SPA 路由重写
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [                            // 资源缓存优化
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 环境变量（可选）

如果项目需要环境变量，在 Vercel Dashboard 中设置：
1. 进入项目 → Settings → Environment Variables
2. 添加变量（例如 `VITE_API_URL`）
3. 重新部署

---

## 📝 部署前检查清单

- [x] 已创建 `.gitignore` 文件
- [x] 已创建 `vercel.json` 配置
- [ ] 测试生产构建（`npm run build`）
- [ ] 测试预览模式（`npm run preview`）
- [ ] 确保所有依赖已安装
- [ ] 代码已提交到 Git 仓库（如果使用 Git 部署）

---

## 🏗️ 本地测试生产构建

在部署前，建议先在本地测试生产构建：

```bash
# 1. 构建项目
npm run build

# 2. 预览构建结果
npm run preview

# 3. 访问 http://localhost:4173 测试
```

---

## 🌐 部署后配置

### 自定义域名

1. 在 Vercel Dashboard 中进入项目
2. Settings → Domains
3. 添加自定义域名
4. 按照提示配置 DNS 记录

### 性能监控

Vercel 自动提供：
- ✅ **Analytics**: 访问统计
- ✅ **Speed Insights**: 性能指标
- ✅ **Lighthouse**: 自动检测

在 Dashboard 中查看：Project → Analytics

---

## 🔄 更新部署

### 自动部署（推荐）

如果通过 Git 连接：
- 每次推送到主分支 → 自动部署到生产环境
- 每次推送到其他分支 → 自动创建预览部署

### 手动部署

使用 Vercel CLI：
```bash
# 预览部署
vercel

# 生产部署
vercel --prod
```

---

## 🐛 常见问题

### 1. 路由 404 错误
**问题**: 访问 `/review` 或 `/settings` 返回 404
**解决**: 确保 `vercel.json` 中的 rewrites 配置正确

### 2. 构建失败
**问题**: 部署时构建失败
**解决**: 
- 检查 `package.json` 中的 build 脚本
- 确保所有依赖都在 `dependencies` 中（不在 `devDependencies`）
- 本地运行 `npm run build` 测试

### 3. 静态资源 404
**问题**: CSS/JS 文件加载失败
**解决**: 检查 `vite.config.js` 中的 `base` 配置（应该是 `'/'`）

### 4. LocalStorage 数据丢失
**问题**: 用户数据在部署后丢失
**说明**: 这是正常的，LocalStorage 存储在浏览器本地，部署不会影响用户数据

---

## 📊 生产优化建议

### 已实现的优化
- ✅ 静态资源长期缓存（1年）
- ✅ TailwindCSS 生产模式（自动 purge）
- ✅ Vite 生产构建优化（压缩、tree-shaking）
- ✅ 响应式设计（移动端友好）

### 可选优化
- [ ] 添加 PWA 支持（离线访问）
- [ ] 使用 CDN 加速静态资源
- [ ] 启用 Brotli 压缩
- [ ] 添加 Web Analytics

---

## 📱 部署到其他平台

### GitHub Pages

1. 修改 `vite.config.js`:
   ```javascript
   export default {
     base: '/your-repo-name/'
   }
   ```

2. 使用 GitHub Actions 自动部署（见官方文档）

### Netlify

1. 连接 Git 仓库
2. 构建设置：
   - Build command: `npm run build`
   - Publish directory: `dist`
3. 部署

---

## 🎯 预期结果

部署成功后，您将获得：

- 🌐 **生产URL**: `https://your-project.vercel.app`
- ⚡ **自动HTTPS**: Vercel 自动配置 SSL 证书
- 🚀 **全球CDN**: 自动分发到全球节点
- 📈 **性能分析**: 内置 Analytics 和 Speed Insights
- 🔄 **自动部署**: Git 推送后自动更新

---

## 📞 获取帮助

- Vercel 文档: https://vercel.com/docs
- Vite 文档: https://vitejs.dev/guide/static-deploy.html
- 项目问题: 查看项目 README.md

---

**最后更新**: 2025-12-04  
**部署平台**: Vercel  
**框架**: Vue 3 + Vite
