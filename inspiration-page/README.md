# 灵感探索 · Inspiration Explorer

> 全球文化资产知识库平台 —— "内容力专区" 的沉浸式探索页面

## 概述

通过 **时间 × 空间** 两个维度，让游戏行业研发与发行人员直观探索全球文化资产。

页面核心：**3D 可交互地球 + 左侧时间轴 + 右侧信息面板** 三栏布局。

## 目录结构

```
inspiration-page/
├── index.html            # 页面入口
├── css/
│   └── style.css         # 全局样式（深色主题 + 三栏布局）
├── js/
│   ├── main.js           # 主入口，模块协调
│   ├── globe.js          # 3D 地球模块（Three.js）
│   ├── timeline.js       # 时间轴模块（本轮空壳）
│   ├── panel.js          # 信息面板模块（本轮空壳）
│   └── data.js           # Mock 数据（24 条全球文化资产）
└── README.md
```

## 技术栈

- **Three.js r170** — 3D 渲染引擎（CDN ES Module）
- **原生 JavaScript** — 无框架依赖，ES Module 组织
- **CSS Custom Properties** — 设计 Token 体系，与 Content Hub 衔接

## 第1轮开发进度

| 模块 | 状态 | 说明 |
|------|------|------|
| 项目架构 | ✅ | 目录结构、模块划分 |
| 页面布局 | ✅ | 深色主题三栏布局 |
| 3D 地球 | ✅ | 纹理地球 + 大气辉光 + 星空 + 交互 |
| Mock 数据 | ✅ | 24 条数据，覆盖 7 个时期、14 个地区 |
| 时间轴 | 🔲 | 占位容器，第2轮实现 |
| 信息面板 | 🔲 | 占位容器，第2轮实现 |
| 地球标注点 | 🔲 | 第2轮实现 |

## 纹理来源

- **日间纹理**：NASA Blue Marble（via `three-globe` CDN）
  - 原始数据：[NASA Visible Earth](https://visibleearth.nasa.gov/)
- **凹凸贴图**：Earth Topology（via `three-globe` CDN）

## 本地运行

由于使用了 ES Module，需要通过 HTTP 服务器访问（不支持 `file://`）：

```bash
# 使用 Python
cd inspiration-page && python3 -m http.server 8080

# 或使用 Node.js
npx serve inspiration-page

# 然后访问 http://localhost:8080
```

## 后续规划

- **第2轮**：时间轴交互 + 地球标注点 + 面板基础内容
- **第3轮**：标注点动效 + 时间轴联动 + 面板详情页
- **第4轮**：搜索/筛选 + Met API 接入 + 性能优化
