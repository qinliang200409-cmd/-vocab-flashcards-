# 📱 移动端测试指南

## 目录
- [测试方法](#测试方法)
- [本地网络测试](#本地网络测试)
- [ngrok 远程测试](#ngrok-远程测试)
- [模拟器测试](#模拟器测试)
- [测试清单](#测试清单)

---

## 测试方法

有三种主要方法测试移动端功能：

### 1. 本地网络测试（推荐 - 免费且快速）
### 2. ngrok 远程测试（需要互联网访问）
### 3. 移动设备模拟器（基本测试）

---

## 本地网络测试

### 前提条件
- 电脑和手机连接到同一WiFi网络
- 电脑防火墙允许本地网络访问

### 步骤

#### Step 1: 启动开发服务器
```bash
npm run dev
```

服务器会在默认端口 5174 启动

#### Step 2: 查找电脑的本地IP地址

**Windows 系统:**
```bash
ipconfig
```
查找 "无线局域网适配器 WLAN" 或 "以太网适配器" 下的 IPv4 地址
例如: `192.168.1.100`

**Mac/Linux 系统:**
```bash
ifconfig
```
或
```bash
ip addr show
```
查找 `en0` (WiFi) 或 `eth0` (以太网) 下的 inet 地址

#### Step 3: 配置 Vite 允许网络访问

修改 `vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    host: '0.0.0.0', // 允许外部访问
    port: 5174,
    strictPort: false
  }
})
```

#### Step 4: 重启开发服务器
```bash
# 停止当前服务器 (Ctrl+C)
npm run dev
```

你会看到类似输出：
```
VITE v5.2.0  ready in 300 ms

➜  Local:   http://localhost:5174/
➜  Network: http://192.168.1.100:5174/
```

#### Step 5: 在手机浏览器中访问

在手机的浏览器中输入 Network URL（使用你电脑的IP）：
```
http://192.168.1.100:5174
```

### 故障排除

**问题1: 手机无法访问**
- 确认手机和电脑在同一WiFi网络
- 检查电脑防火墙设置
  - Windows: 控制面板 → Windows Defender 防火墙 → 允许应用通过防火墙
  - 添加 Node.js 或 端口 5174 到允许列表

**问题2: 连接超时**
```bash
# Windows: 临时关闭防火墙测试（不推荐长期使用）
netsh advfirewall set allprofiles state off

# 测试后重新启用
netsh advfirewall set allprofiles state on
```

**问题3: 热更新不工作**
在 `vite.config.js` 中添加：
```javascript
server: {
  host: '0.0.0.0',
  port: 5174,
  hmr: {
    host: '192.168.1.100', // 使用你的实际IP
    port: 5174
  }
}
```

---

## ngrok 远程测试

### 优势
- 无需手机和电脑在同一网络
- 可以分享给其他人测试
- 支持 HTTPS（Web Speech API 需要）

### 安装 ngrok

**方法1: 下载安装**
1. 访问 https://ngrok.com/download
2. 注册免费账号
3. 下载并安装

**方法2: npm 安装**
```bash
npm install -g ngrok
```

### 使用步骤

#### Step 1: 启动本地服务器
```bash
npm run dev
```

#### Step 2: 启动 ngrok
打开新的终端窗口：
```bash
ngrok http 5174
```

你会看到类似输出：
```
Session Status                online
Forwarding                    https://abc123.ngrok.io -> http://localhost:5174
```

#### Step 3: 在手机访问
使用 ngrok 提供的 HTTPS URL:
```
https://abc123.ngrok.io
```

### 注意事项
- 免费版每次启动URL会变化
- 免费版有请求限制
- 付费版可以固定域名

---

## 模拟器测试

### Chrome DevTools 移动模拟
1. 打开 Chrome DevTools (F12)
2. 点击设备工具栏图标 (Ctrl+Shift+M)
3. 选择设备类型（iPhone, Pixel等）
4. 测试触摸事件

### 限制
- 无法完全模拟真实触摸手势
- 无法测试真实设备性能
- 无法测试特定浏览器兼容性

### 推荐用于
- 基本UI响应式测试
- 快速原型验证
- 布局检查

---

## 测试清单

### 触摸交互测试

#### ✅ 基本触摸
- [ ] 点击卡片翻转
- [ ] 点击状态按钮（认识/模糊/不认识）
- [ ] 点击发音按钮
- [ ] 点击撤销按钮
- [ ] 点击导航按钮

#### ✅ 滑动手势
- [ ] 向左滑动切换到下一个单词
- [ ] 向右滑动回到上一个单词
- [ ] 在第一个单词向右滑动（边界处理）
- [ ] 在最后一个单词向左滑动（边界处理）
- [ ] 快速连续滑动
- [ ] 慢速滑动识别

#### ✅ 多点触控
- [ ] 两指缩放（应该被禁用）
- [ ] 长按操作
- [ ] 双击操作

### 性能测试

- [ ] 页面加载速度（3G网络）
- [ ] 页面加载速度（4G网络）
- [ ] 卡片翻转动画流畅度（60fps）
- [ ] 大量单词（100+）时的性能
- [ ] 内存使用情况

### 浏览器兼容性

#### iOS Safari
- [ ] 触摸事件
- [ ] 滑动手势
- [ ] 卡片动画
- [ ] 发音功能（Web Speech API）
- [ ] LocalStorage 持久化

#### Chrome Mobile (Android)
- [ ] 触摸事件
- [ ] 滑动手势
- [ ] 卡片动画
- [ ] 发音功能
- [ ] LocalStorage 持久化

#### Firefox Mobile
- [ ] 基本功能测试
- [ ] 发音功能可能不支持

#### Samsung Internet
- [ ] 基本功能测试

### UI/UX 测试

- [ ] 按钮大小适合手指点击（最小44x44px）
- [ ] 文字大小可读（最小16px）
- [ ] 间距足够避免误触
- [ ] 横屏模式下的显示
- [ ] 竖屏模式下的显示
- [ ] 刘海屏适配
- [ ] 软键盘弹出时的界面

### 功能测试

- [ ] CSV文件导入（小文件）
- [ ] CSV文件导入（大文件 1000+ 单词）
- [ ] 随机单词抽取（50个）
- [ ] 随机单词抽取（100个）
- [ ] 复习进度保存
- [ ] 页面刷新后数据恢复
- [ ] 完成复习后的统计显示
- [ ] 重新复习陌生词功能

### 网络测试

- [ ] 离线访问（Service Worker如已配置）
- [ ] 慢速网络下的加载
- [ ] 网络中断时的处理
- [ ] 本地CSV文件访问

---

## 调试技巧

### 1. Chrome Remote Debugging（Android）

**步骤:**
1. 在Android设备上启用开发者模式和USB调试
2. 用USB线连接手机和电脑
3. 在Chrome访问: `chrome://inspect`
4. 选择你的设备查看Console日志

### 2. Safari Remote Debugging（iOS）

**步骤:**
1. iOS设备: 设置 → Safari → 高级 → 启用Web检查器
2. Mac: Safari → 开发 → [你的设备名] → 选择页面

### 3. Eruda（移动端Console）

在HTML中添加调试工具:

```html
<!-- index.html -->
<script src="https://cdn.jsdelivr.net/npm/eruda"></script>
<script>eruda.init();</script>
```

在移动端页面上会显示一个调试按钮，可以查看Console、Network等

### 4. vConsole（替代方案）

```bash
npm install vconsole
```

```javascript
// main.js
import VConsole from 'vconsole'

if (process.env.NODE_ENV === 'development') {
  new VConsole()
}
```

---

## 性能监控

### Performance API

在 Review.vue 中添加性能监控:

```javascript
// 监控卡片翻转性能
const measureFlipPerformance = () => {
  performance.mark('flip-start')
  
  // 卡片翻转逻辑
  
  performance.mark('flip-end')
  performance.measure('flip-duration', 'flip-start', 'flip-end')
  
  const measures = performance.getEntriesByName('flip-duration')
  console.log('Flip duration:', measures[0].duration, 'ms')
}
```

### Frame Rate Monitoring

```javascript
let lastTime = performance.now()
let frames = 0
let fps = 0

function calculateFPS() {
  const currentTime = performance.now()
  frames++
  
  if (currentTime >= lastTime + 1000) {
    fps = Math.round((frames * 1000) / (currentTime - lastTime))
    console.log('FPS:', fps)
    frames = 0
    lastTime = currentTime
  }
  
  requestAnimationFrame(calculateFPS)
}

// 在组件挂载时启动
onMounted(() => {
  calculateFPS()
})
```

---

## 常见移动端问题及解决方案

### 1. 滑动手势不灵敏

**问题:** VueUse的 `useSwipe` 阈值太高

**解决:** 在 `useCardDeck.js` 中调整:
```javascript
const { direction, lengthX, lengthY, isSwiping } = useSwipe(cardRef, {
  threshold: 30, // 降低阈值（默认50）
  passive: true
})
```

### 2. 点击延迟

**问题:** 移动Safari有300ms点击延迟

**解决:** 在 `main.css` 中添加:
```css
* {
  touch-action: manipulation;
}
```

### 3. 卡片翻转卡顿

**问题:** 硬件加速未启用

**解决:** 在 `FlashCard.vue` 的样式中:
```css
.flash-card {
  transform: translateZ(0);
  will-change: transform;
  backface-visibility: hidden;
}
```

### 4. LocalStorage 失效

**问题:** 私密浏览模式下LocalStorage不可用

**解决:** 添加错误处理:
```javascript
try {
  localStorage.setItem('test', 'test')
  localStorage.removeItem('test')
} catch (e) {
  alert('请关闭私密浏览模式以保存复习记录')
}
```

### 5. 发音不工作

**问题:** 需要HTTPS或用户手势触发

**解决:** 
- 使用ngrok的HTTPS链接测试
- 确保发音是通过用户点击触发的

---

## 测试报告模板

```markdown
## 测试设备信息
- 设备型号: iPhone 14 Pro
- 操作系统: iOS 17.1
- 浏览器: Safari 17
- 屏幕分辨率: 1170x2532
- 网络类型: WiFi

## 测试结果

### 功能测试 (✅/❌)
- ✅ CSV导入
- ✅ 卡片翻转
- ✅ 滑动切换
- ✅ 状态标记
- ❌ 发音功能（无声音）

### 性能测试
- 页面加载: 1.2秒
- 卡片翻转FPS: 58fps
- 内存使用: 45MB

### 问题记录
1. 发音按钮点击后无声音
   - 严重程度: 中
   - 重现步骤: 点击任意单词的发音按钮
   - 预期: 听到单词发音
   - 实际: 无声音

### 建议
- 增加发音失败的错误提示
- 优化首次加载速度
```

---

## 自动化测试（可选）

### Playwright Mobile Testing

```javascript
// tests/mobile.spec.js
import { test, devices } from '@playwright/test'

test.use({
  ...devices['iPhone 14 Pro']
})

test('mobile swipe navigation', async ({ page }) => {
  await page.goto('http://localhost:5174')
  
  // 模拟滑动手势
  await page.touchscreen.swipe({
    startX: 300,
    startY: 400,
    endX: 100,
    endY: 400,
    steps: 10
  })
  
  // 验证导航到下一个单词
  // ...
})
```

---

## 总结

### 推荐测试流程

1. **开发阶段**: Chrome DevTools 移动模拟
2. **功能验证**: 本地网络测试（真实设备）
3. **兼容性测试**: 多种设备和浏览器
4. **性能优化**: 真实设备性能监控
5. **最终测试**: ngrok HTTPS 环境（发音功能）

### 优先级

**高优先级:**
- 触摸交互基本功能
- 滑动手势
- 数据持久化

**中优先级:**
- 发音功能
- 性能优化
- 边界情况处理

**低优先级:**
- 离线支持
- 高级动画效果
- 多浏览器兼容性

---

**文档版本**: v1.0
**更新时间**: 2025-12-04
**维护者**: Development Team
