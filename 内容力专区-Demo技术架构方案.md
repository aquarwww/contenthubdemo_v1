# 🏗️ 内容力专区 Demo —— 技术架构方案

> 目标：基于 The Met Open Access API + Smithsonian Open Access API，快速搭建一个可浏览、可检索、可扩展的文化内容资源 Demo 专区。

---

## 一、架构总览

```
┌─────────────────────────────────────────────────────────────────┐
│                     内容力专区 Demo 前端                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │ 智能搜索  │  │ 分类浏览  │  │ 素材详情  │  │ 收藏夹/素材包    │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───────┬──────────┘ │
│       └──────────────┴────────────┴─────────────────┘            │
│                           ▼                                      │
│              ┌─────────────────────────┐                         │
│              │    统一数据适配层 (BFF)    │  ← 关键：多数据源归一  │
│              │   Normalize + Cache      │                         │
│              └──────┬──────────┬───────┘                         │
│                     ▼          ▼                                  │
│          ┌──────────────┐  ┌──────────────┐   ┌──────────────┐  │
│          │ The Met API   │  │ Smithsonian  │   │ 未来数据源…   │  │
│          │ (CC0, 无Key)  │  │ API (需Key)  │   │ 故宫/敦煌/…  │  │
│          └──────────────┘  └──────────────┘   └──────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 核心设计原则

1. **数据源无关** —— 前端只与统一数据适配层交互，新增数据源只需写一个 Adapter
2. **渐进增强** —— Demo 阶段纯前端 + API 直连即可跑；正式阶段再加后端/缓存/数据库
3. **面向游戏项目** —— UI/UX 围绕"找参考 → 看细节 → 下载/收藏 → 打包给项目组"设计

---

## 二、数据源接口分析

### The Met Collection API

| 项目 | 说明 |
|------|------|
| **Base URL** | `https://collectionapi.metmuseum.org/public/collection/v1` |
| **认证** | 无需 API Key |
| **速率限制** | 80 次/秒 |
| **核心端点** | `GET /search?q=...` → 返回 objectID 数组 |
|  | `GET /objects/{id}` → 返回完整元数据+图片 URL |
|  | `GET /departments` → 部门列表 |
| **搜索过滤器** | `hasImages`, `isPublicDomain`, `departmentId`, `medium`, `geoLocation`, `dateBegin/End`, `title`, `tags` |
| **图片字段** | `primaryImage`（原图）, `primaryImageSmall`（缩略图）, `additionalImages` |
| **数据量** | 47万+ 对象，49万+ CC0 图像 |

### Smithsonian Open Access API

| 项目 | 说明 |
|------|------|
| **Base URL** | `https://api.si.edu/openaccess/api/v1.0` |
| **认证** | 需要 API Key（从 api.data.gov/signup 免费获取） |
| **核心端点** | `GET /search?q=...` → 搜索 |
|  | `GET /content/{id}` → 获取单个对象 |
|  | `GET /category/search?q=...&category=...` → 分类搜索 |
| **分类** | `art_design`, `history_culture`, `science_technology` |
| **排序** | `relevancy`, `newest`, `updated`, `random` |
| **数据量** | 280万+ CC0 数字资产 |

---

## 三、统一数据模型设计

所有外部数据源的素材都归一化为以下结构：

```typescript
interface ContentItem {
  // === 基础标识 ===
  id: string;                    // 全局唯一 ID（source:originalId）
  source: string;                // 数据来源：'met' | 'smithsonian' | 'gugong' | ...
  sourceUrl: string;             // 原始页面链接

  // === 核心内容 ===
  title: string;                 // 标题
  description: string;           // 描述
  images: {
    thumbnail: string;           // 缩略图 URL
    primary: string;             // 主图 URL（高清）
    additional: string[];        // 更多图片
  };

  // === 文化元数据 ===
  culture: string;               // 文化归属：'Chinese', 'Japanese', ...
  period: string;                // 历史时期：'Song Dynasty', 'Renaissance', ...
  dateDisplay: string;           // 年代展示文本
  dateRange: {                   // 年代数值（用于筛选）
    begin: number;
    end: number;
  };
  medium: string;                // 材质/媒介
  classification: string;        // 分类
  department: string;            // 所属部门/馆

  // === 地理信息 ===
  geography: {
    country: string;
    region: string;
    city: string;
  };

  // === 艺术家信息 ===
  artist: {
    name: string;
    bio: string;
    nationality: string;
  };

  // === 版权信息 ===
  license: {
    type: string;                // 'CC0' | 'CC-BY' | 'CC-BY-NC' | ...
    isPublicDomain: boolean;
    isCommercialUse: boolean;    // 是否可商用
    attribution: string;         // 署名要求
  };

  // === 游戏项目相关标签（内部扩展）===
  tags: string[];                // 原始标签
  gameUseTags: string[];         // 游戏用途标签（内部标注）
  qualityScore: number;          // 质量评分（1-5）
  dimensions: {
    width: number;
    height: number;
    unit: string;
  };
}
```

### 为什么需要统一模型？

| 问题 | 解决 |
|------|------|
| Met 和 Smithsonian 字段名/结构完全不同 | Adapter 层做字段映射 |
| 未来要加故宫、敦煌等国内数据源 | 只需写新 Adapter |
| 前端不用关心数据从哪来 | 前端只对接统一模型 |
| 可以叠加内部标注（游戏用途标签、质量评分） | 扩展字段不影响外部数据 |

---

## 四、前端功能模块设计

### 📋 页面结构

```
首页 (/)
├── 顶部导航栏：Logo + 搜索栏 + 数据源切换
├── 主题专区入口：「中国古风」「西方古典」「纹样图案」「雕塑造型」...
├── 精选推荐：编辑精选的高价值素材卡片
└── 最新入库

搜索结果页 (/search)
├── 左侧筛选面板
│   ├── 数据来源（Met / Smithsonian / All）
│   ├── 文化类型（中国 / 日本 / 欧洲 / ...）
│   ├── 时间范围滑块
│   ├── 材质/媒介
│   ├── 分类
│   └── 仅显示可商用
├── 右侧结果网格（瀑布流 / 网格切换）
└── 分页 / 无限滚动

素材详情页 (/detail/:id)
├── 高清大图查看器（支持缩放/平移）
├── 元数据面板（年代、材质、尺寸、文化背景）
├── 版权信息卡片（醒目标注授权类型）
├── 相关素材推荐
├── 操作栏：下载原图 / 加入收藏 / 分享给同事
└── 游戏参考标注（可添加内部标签和评论）

收藏夹 (/favorites)
├── 个人收藏列表
├── 创建素材包（可打包分享给项目组）
└── 导出素材清单（含版权信息）
```

### 🔍 搜索策略

```
用户输入关键词
    ↓
并行请求 Met API + Smithsonian API
    ↓
各自 Adapter 归一化
    ↓
合并结果 + 按相关性排序
    ↓
前端渲染统一卡片
```

**搜索增强**：
- 中文关键词自动翻译为英文（调用翻译接口），因为两个 API 都是英文索引
- 支持预设搜索模板：「宋代瓷器」→ `q=Song+dynasty+ceramics&hasImages=true&isPublicDomain=true`
- 标签联想/热门搜索引导

---

## 五、技术选型（Demo 阶段）

| 层级 | 选择 | 理由 |
|------|------|------|
| **前端框架** | 纯 HTML + CSS + Vanilla JS | Demo 零依赖，任何人可直接打开 |
| **UI 风格** | 现代卡片式布局 + 暗色主题 | 贴合游戏行业审美 |
| **API 调用** | 前端直连 Met API | Met 无需 Key，支持 CORS |
| **图片加载** | 懒加载 + 缩略图优先 | 控制带宽，提升体验 |
| **状态管理** | LocalStorage | 收藏夹、搜索历史本地持久化 |

### 正式版演进路径

```
Demo（当前）              →  正式 V1                →  正式 V2
─────────────────────     ─────────────────────     ─────────────────────
纯前端                    加 Node.js BFF 层          加数据库 + 后台管理
直连 Met API              统一代理 Met + SI API      定时同步 + 本地缓存
LocalStorage 收藏         服务端用户收藏             协作标注 + 审核流
无登录                    接入司内 SSO               角色权限 + 项目组空间
```

---

## 六、可扩展性设计要点

### 1. 数据源适配器模式

```javascript
// 新增数据源只需实现这个接口
class DataSourceAdapter {
  async search(query, filters) { /* 返回统一格式结果 */ }
  async getDetail(id) { /* 返回统一格式详情 */ }
  getSourceName() { /* 返回数据源名称 */ }
  getSourceIcon() { /* 返回数据源图标 */ }
}

// 注册新数据源
registry.register('met', new MetAdapter());
registry.register('smithsonian', new SmithsonianAdapter());
registry.register('gugong', new GugongAdapter());  // 未来扩展
```

### 2. 筛选器可配置

筛选维度通过配置驱动，新增数据源可自动继承或扩展筛选项。

### 3. 标签体系预留

内部标签体系与外部元数据分离，支持：
- 游戏品类标签（古风/奇幻/写实/…）
- 素材用途标签（概念参考/纹理贴图/造型参考/…）
- 质量评级（⭐ 1-5）
- 项目关联

---

*方案版本：v1.0 | 2026-04-15*
