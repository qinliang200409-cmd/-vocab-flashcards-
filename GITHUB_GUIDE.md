# 📤 GitHub 上传指南

本文档说明如何将项目上传到 GitHub。

---

## ✅ 应该上传的文件和目录

### 📁 必须上传的核心文件

```
✅ src/                          # 源代码目录
   ├── assets/                   # 资源文件
   ├── components/               # Vue 组件（8个）
   ├── composables/              # 组合式 API（7个）
   ├── views/                    # 页面视图（3个）
   ├── utils/                    # 工具函数
   ├── tests/                    # 单元测试
   ├── App.vue                   # 根组件
   └── main.js                   # 入口文件

✅ public/                       # 静态资源
   ├── sample-words.csv          # 示例词库
   └── frequently-used-words.csv # 常用词库

✅ .vscode/                      # VSCode 配置
   └── settings.json             # 编辑器设置

✅ 配置文件
   ├── vite.config.js            # Vite 配置
   ├── tailwind.config.js        # TailwindCSS 配置
   ├── postcss.config.js         # PostCSS 配置
   ├── package.json              # 项目依赖
   ├── package-lock.json         # 依赖锁定
   └── vercel.json               # Vercel 部署配置

✅ 文档文件
   ├── README.md                 # 项目主文档
   ├── DEPLOYMENT.md             # 部署指南
   ├── .gitignore                # Git 忽略规则
   └── index.html                # HTML 入口
```

---

## ❌ 不应该上传的文件和目录

这些文件已在 `.gitignore` 中配置，Git 会自动忽略：

```
❌ node_modules/                # 依赖包（由 npm install 生成）
❌ dist/                        # 构建产物（由 npm run build 生成）
❌ .clinerules/                 # 本地开发配置
❌ docs/                        # 开发文档（已移动到此目录）
   ├── BUG_FIXES_SUMMARY.md
   ├── PROJECT_PLAN.md
   └── MOBILE_TESTING_GUIDE.md
❌ .vercel/                     # Vercel 部署缓存
❌ coverage/                    # 测试覆盖率报告
❌ *.log                        # 日志文件
```

---

## 🚀 上传步骤

### 1. 初始化 Git 仓库（如果还没有）

```bash
cd e:\库\uq
git init
```

### 2. 添加所有需要的文件

```bash
# 添加所有文件（.gitignore 会自动过滤不需要的）
git add .

# 查看将要提交的文件
git status
```

### 3. 创建第一次提交

```bash
git commit -m "Initial commit: 英语单词快速复习卡片网站 v1.0.0"
```

### 4. 在 GitHub 创建仓库

1. 访问 https://github.com/new
2. 填写仓库信息：
   - Repository name: `vocab-flashcards` (或其他名称)
   - Description: `英语单词快速复习卡片网站 - 支持多词库管理、学习统计追踪和数据可视化`
   - Public 或 Private（根据需要选择）
   - **不要**勾选"Initialize with README"（我们已经有了）

### 5. 连接远程仓库并推送

```bash
# 添加远程仓库（替换 YOUR-USERNAME 和 REPO-NAME）
git remote add origin https://github.com/YOUR-USERNAME/REPO-NAME.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

---

## 📊 上传后的仓库结构

上传成功后，GitHub 仓库应该是这样的：

```
your-repo/
├── .gitignore
├── .vscode/
│   └── settings.json
├── index.html
├── package.json
├── package-lock.json
├── vercel.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── README.md
├── DEPLOYMENT.md
├── public/
│   ├── sample-words.csv
│   └── frequently-used-words.csv
└── src/
    ├── assets/
    ├── components/
    ├── composables/
    ├── views/
    ├── utils/
    ├── tests/
    ├── App.vue
    └── main.js
```

**总文件数**: ~40 个文件
**总大小**: ~2-3 MB（不含 node_modules）

---

## 🔍 验证上传

### 检查 GitHub 仓库

1. 访问你的 GitHub 仓库页面
2. 确认以下内容：
   - ✅ README.md 正确显示
   - ✅ 文件结构清晰
   - ✅ 没有 `node_modules/` 目录
   - ✅ 没有 `dist/` 目录
   - ✅ 没有临时文件（.log, .json 等）

### 克隆测试

```bash
# 在另一个目录测试克隆
cd ~/Desktop
git clone https://github.com/YOUR-USERNAME/REPO-NAME.git
cd REPO-NAME

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 如果能正常运行，说明上传成功！
```

---

## 🔄 后续更新

### 修改代码后更新

```bash
# 1. 查看修改的文件
git status

# 2. 添加修改的文件
git add .

# 3. 提交修改
git commit -m "描述你的修改"

# 4. 推送到 GitHub
git push
```

### 常用 Git 命令

```bash
# 查看提交历史
git log --oneline

# 查看远程仓库
git remote -v

# 拉取最新代码
git pull

# 创建新分支
git checkout -b feature/new-feature

# 切换分支
git checkout main
```

---

## 📝 提交信息规范

建议使用清晰的提交信息：

```bash
# 新功能
git commit -m "feat: 添加单词收藏功能"

# Bug修复
git commit -m "fix: 修复重复标记导致总量增加的问题"

# 文档更新
git commit -m "docs: 更新部署文档"

# 样式修改
git commit -m "style: 优化卡片动画效果"

# 重构
git commit -m "refactor: 重构词库管理逻辑"

# 性能优化
git commit -m "perf: 优化大量单词时的渲染性能"

# 测试
git commit -m "test: 添加 useWordbook 单元测试"
```

---

## 🎯 自动部署（可选）

### 连接 Vercel 自动部署

1. 访问 https://vercel.com
2. 点击 "Import Project"
3. 选择你的 GitHub 仓库
4. Vercel 会自动检测配置并部署
5. 每次推送到 main 分支会自动触发部署

### GitHub Actions（可选）

如果需要 CI/CD，可以创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm run test:run
```

---

## ⚠️ 注意事项

### 1. 敏感信息
- ❌ **不要上传** API 密钥、密码等敏感信息
- ❌ **不要上传** `.env` 文件（已在 .gitignore 中）
- ✅ 如需使用环境变量，在 Vercel Dashboard 中配置

### 2. 大文件
- 单个文件不要超过 100MB
- 如有大文件，使用 Git LFS

### 3. 依赖管理
- 确保 `package-lock.json` 已上传（锁定依赖版本）
- 不要手动修改 `package-lock.json`

### 4. 协作开发
- 使用分支进行开发
- 通过 Pull Request 合并代码
- 定期拉取最新代码（`git pull`）

---

## 🆘 常见问题

### 1. 推送被拒绝
```bash
# 错误: Updates were rejected because the remote contains work
# 解决: 先拉取远程代码
git pull origin main --rebase
git push
```

### 2. 文件过大
```bash
# 错误: File size exceeds GitHub's file size limit
# 解决: 检查是否误提交了 node_modules 或 dist
git rm -r --cached node_modules
git commit -m "Remove node_modules"
git push
```

### 3. 忘记添加文件
```bash
# 在上次提交中补充文件
git add missing-file.js
git commit --amend --no-edit
git push -f  # 注意：强制推送会覆盖远程历史
```

---

## 📞 获取帮助

- GitHub 文档: https://docs.github.com
- Git 教程: https://git-scm.com/docs
- 项目 Issues: 在 GitHub 仓库中提交 Issue

---

**最后更新**: 2025-12-04  
**文件整理**: 完成  
**准备状态**: 可以上传 GitHub ✅
