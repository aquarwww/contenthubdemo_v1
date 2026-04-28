# 🌐 CC0 / 开放素材博物馆 API 资源全景清单

> 筛选标准：①提供 CC0 或等同的公共领域图像 ②有可直接调用的 REST API ③素材量足够大  
> 整理时间：2026年4月16日

---

## ⭐ 第一梯队：API 成熟 + CC0 + 大规模素材

### 1. The Metropolitan Museum of Art（大都会艺术博物馆）🇺🇸

| 项 | 内容 |
|---|------|
| **官网** | https://www.metmuseum.org |
| **Open Access** | https://www.metmuseum.org/hubs/open-access |
| **API 文档** | https://metmuseum.github.io/ |
| **Base URL** | `https://collectionapi.metmuseum.org/public/collection/v1` |
| **认证** | ❌ 无需 Key |
| **速率限制** | 80 次/秒 |
| **素材规模** | 47万+ 藏品，49万+ CC0 图像 |
| **授权** | CC0（完全公共领域，可商用） |
| **接入难度** | ⭐ 极简（无 Key，直接 fetch） |
| **亮点** | 横跨5000年，从中国瓷器到欧洲油画，图像质量极高 |
| **已接入** | ✅ 已在 Demo 中使用 |

---

### 2. Art Institute of Chicago（芝加哥艺术博物馆）🇺🇸

| 项 | 内容 |
|---|------|
| **官网** | https://www.artic.edu |
| **Open Access** | https://www.artic.edu/open-access/open-access-images |
| **API 文档** | https://api.artic.edu/docs/ |
| **Base URL** | `https://api.artic.edu/api/v1` |
| **认证** | ❌ 无需 Key |
| **素材规模** | 12万+ 藏品，大量 CC0 高清图 |
| **授权** | CC0（公共领域作品），部分受版权保护作品有限制 |
| **接入难度** | ⭐ 极简（无 Key，JSON REST） |
| **核心端点** | `GET /artworks?q=keyword` 搜索 |
| | `GET /artworks/{id}` 获取详情 |
| | 图片通过 IIIF：`https://www.artic.edu/iiif/2/{image_id}/full/843,/0/default.jpg` |
| **亮点** | 支持 IIIF 标准，可自由裁剪/缩放图片；支持全文搜索和 Elasticsearch 查询语法 |

---

### 3. Rijksmuseum（荷兰国立博物馆）🇳🇱

| 项 | 内容 |
|---|------|
| **官网** | https://www.rijksmuseum.nl |
| **Open Access** | https://www.rijksmuseum.nl/en/rijksstudio |
| **API 文档** | https://data.rijksmuseum.nl/ |
| **Base URL** | `https://www.rijksmuseum.nl/api/nl/collection` |
| **认证** | ✅ 需要 API Key（免费注册获取） |
| **素材规模** | 70万+ 藏品记录，大量高清图 |
| **授权** | CC0（公共领域作品），Rijksstudio 鼓励二次创作 |
| **接入难度** | ⭐⭐ 简单（注册获取 Key 即可） |
| **核心端点** | `GET /collection?key=xxx&q=keyword` 搜索 |
| | `GET /collection/{objectNumber}?key=xxx` 详情 |
| | 支持 IIIF Image API 获取各种分辨率 |
| **亮点** | 包含伦勃朗《夜巡》、维米尔等荷兰黄金时代大师名作；IIIF 支持任意裁剪缩放 |

---

### 4. Cleveland Museum of Art（克利夫兰艺术博物馆）🇺🇸

| 项 | 内容 |
|---|------|
| **官网** | https://www.clevelandart.org |
| **Open Access** | https://www.clevelandart.org/open-access |
| **API 文档** | https://openaccess-api.clevelandart.org/ |
| **Base URL** | `https://openaccess-api.clevelandart.org/api/artworks/` |
| **认证** | ❌ 无需 Key |
| **素材规模** | 6.4万+ 藏品，3.7万+ 高清图 |
| **授权** | CC0 |
| **接入难度** | ⭐ 极简 |
| **核心端点** | `GET /api/artworks/?q=keyword` 搜索 |
| | 响应直接包含图片 URL（web/print/full 三种尺寸） |
| **亮点** | API 设计非常友好，一个请求就返回完整图片URL；GitHub 还提供完整数据集下载（JSON/CSV） |

---

### 5. Harvard Art Museums（哈佛艺术博物馆）🇺🇸

| 项 | 内容 |
|---|------|
| **官网** | https://harvardartmuseums.org |
| **API 文档** | https://github.com/harvardartmuseums/api-docs |
| **Base URL** | `https://api.harvardartmuseums.org` |
| **认证** | ✅ 需要 API Key（免费申请） |
| **素材规模** | 24万+ 藏品，大量高清图 |
| **授权** | 公共领域作品可免费使用（非统一 CC0，但大量 public domain） |
| **接入难度** | ⭐⭐ 简单 |
| **核心端点** | `GET /object?q=keyword&apikey=xxx` 搜索 |
| | `GET /object/{id}?apikey=xxx` 详情 |
| | `GET /image/{id}?apikey=xxx` 图片 |
| **亮点** | 数据极其结构化（色彩分析、技术研究数据）；覆盖 Fogg、Busch-Reisinger、Sackler 三个馆 |

---

### 6. Smithsonian Institution（史密森尼学会）🇺🇸

| 项 | 内容 |
|---|------|
| **官网** | https://www.si.edu |
| **Open Access** | https://www.si.edu/openaccess |
| **API 文档** | https://edan.si.edu/openaccess/apidocs/ |
| **Base URL** | `https://api.si.edu/openaccess/api/v1.0` |
| **认证** | ✅ 需要 API Key（从 https://api.data.gov/signup 免费获取） |
| **素材规模** | 280万+ 2D/3D 数字资产（19个博物馆的总和） |
| **授权** | CC0 |
| **接入难度** | ⭐⭐ 简单 |
| **核心端点** | `GET /search?q=keyword&api_key=xxx` 搜索 |
| | `GET /content/{id}?api_key=xxx` 详情 |
| | `GET /category/search?category=art_design&q=keyword` 分类搜索 |
| **亮点** | 规模最大（280万+），覆盖艺术、自然、科技、历史、文化全领域；还有 3D 扫描 API |
| **3D API** | https://3d-api.si.edu/api-docs/ |

---

### 7. Europeana（欧洲文化遗产数字平台）🇪🇺

| 项 | 内容 |
|---|------|
| **官网** | https://www.europeana.eu |
| **API 文档** | https://pro.europeana.eu/page/apis |
| **Base URL** | `https://api.europeana.eu/record/v2/` |
| **认证** | ✅ 需要 API Key（免费注册） |
| **素材规模** | 5800万+ 文化遗产记录（聚合全欧洲 3000+ 机构） |
| **授权** | 混合（CC0 / CC BY / CC BY-SA 等，每条记录标注） |
| **接入难度** | ⭐⭐ 简单 |
| **核心端点** | `GET /search.json?wskey=xxx&query=keyword` 搜索 |
| | `GET /record/v2/{id}.json?wskey=xxx` 详情 |
| **亮点** | 规模最大的聚合平台（5800万+），可一次搜索全欧洲博物馆；支持按国家/机构/媒介/时间段筛选 |

---

## 🔶 第二梯队：API 可用 + 开放程度良好

### 8. Cooper Hewitt, Smithsonian Design Museum（库珀·休伊特设计博物馆）🇺🇸

| 项 | 内容 |
|---|------|
| **API 文档** | https://apidocs.cooperhewitt.org/ |
| **Base URL** | `https://api.collection.cooperhewitt.org/rest/` |
| **认证** | ✅ 需要 API Key |
| **素材规模** | 21.5万件设计藏品 |
| **授权** | CC0（大部分） |
| **接入难度** | ⭐⭐ |
| **亮点** | **设计类素材**为主——纺织品纹样、壁纸、工业设计、海报，对游戏 UI/视觉设计参考价值极高 |

---

### 9. Walters Art Museum（沃尔特斯艺术博物馆）🇺🇸

| 项 | 内容 |
|---|------|
| **API 文档** | https://api.thewalters.org/ |
| **GitHub** | https://github.com/WaltersArtMuseum/api-thewalters-org |
| **认证** | ❌ 无需 Key |
| **素材规模** | 数万件（古埃及、中世纪、伊斯兰艺术为强项） |
| **授权** | CC0 |
| **接入难度** | ⭐ 极简 |
| **亮点** | 中世纪手稿插图、拜占庭艺术、伊斯兰书法的质量非常高 |

---

### 10. Victoria and Albert Museum（V&A 维多利亚与阿尔伯特博物馆）🇬🇧

| 项 | 内容 |
|---|------|
| **API 文档** | https://developers.vam.ac.uk/guide/v2/welcome.html |
| **Base URL** | `https://api.vam.ac.uk/v2/objects/search` |
| **认证** | ❌ 无需 Key |
| **素材规模** | 120万+ 藏品记录 |
| **授权** | 混合（大量公共领域图片，部分 CC BY-NC） |
| **接入难度** | ⭐⭐ 简单 |
| **亮点** | 全球最大的装饰艺术与设计博物馆——纺织品、家具、服饰、珠宝、陶瓷，游戏美术参考的宝库 |

---

### 11. Getty Museum（盖蒂博物馆）🇺🇸

| 项 | 内容 |
|---|------|
| **API 文档** | https://data.getty.edu/museum/collection/docs/ |
| **Base URL** | `https://data.getty.edu/museum/collection` |
| **认证** | ❌ 无需 Key |
| **素材规模** | 10万+ 藏品 |
| **授权** | 开放获取（公共领域作品免费使用） |
| **接入难度** | ⭐⭐ |
| **亮点** | 基于 IIIF + Linked Art 标准；Getty 还提供 AAT（艺术与建筑词典）/ ULAN / TGN 等权威术语库 API |

---

## 🟢 第三梯队：有数据集/IIIF 但非传统 REST API

### 12. National Gallery of Art（美国国家美术馆）🇺🇸

| 项 | 内容 |
|---|------|
| **官网** | https://www.nga.gov/artworks/free-images-and-open-access |
| **数据获取** | 开放获取图片可从作品页直接下载；有 CSV 数据集 |
| **授权** | CC0 |
| **API** | 无官方 REST API，但可爬取或使用 IIIF |
| **亮点** | 欧洲绘画大师（达芬奇、凡艾克、莫奈等）的顶级藏品 |

---

### 13. Sketchfab Cultural Heritage（3D 扫描文化遗产）

| 项 | 内容 |
|---|------|
| **官网** | https://sketchfab.com/3d-models/categories/cultural-heritage-history |
| **API 文档** | https://docs.sketchfab.com/data-api/v3/ |
| **认证** | ✅ OAuth Token |
| **素材规模** | 10万+ 3D 文化遗产模型 |
| **授权** | CC0 / CC BY（每个模型单独标注） |
| **接入难度** | ⭐⭐⭐ |
| **亮点** | **唯一大规模的 3D 文化遗产开放平台**，史密森尼等 27+ 机构的 3D 扫描模型，可直接用于游戏引擎 |

---

## 📊 对比总结：推荐接入优先级

| 排名 | 机构 | 无需Key | CC0 | 素材量 | 接入难度 | 推荐理由 |
|:----:|------|:------:|:---:|:------:|:-------:|---------|
| 🥇 | **Art Institute of Chicago** | ✅ | ✅ | 12万+ | ⭐ | 无Key + CC0 + IIIF 图片裁剪，**最值得优先接入** |
| 🥈 | **Cleveland Museum of Art** | ✅ | ✅ | 6.4万+ | ⭐ | 无Key + API 返回直接含图片URL，接入最简单 |
| 🥉 | **Rijksmuseum** | Key | ✅ | 70万+ | ⭐⭐ | 荷兰黄金时代名作，IIIF 高清 |
| 4 | **Smithsonian** | Key | ✅ | 280万+ | ⭐⭐ | 规模最大，280万+含3D |
| 5 | **Harvard Art Museums** | Key | 大部分 | 24万+ | ⭐⭐ | 数据结构化极好 |
| 6 | **Europeana** | Key | 混合 | 5800万+ | ⭐⭐ | 聚合全欧洲，一个API搜全部 |
| 7 | **Cooper Hewitt** | Key | ✅ | 21.5万 | ⭐⭐ | 设计类素材独一无二 |
| 8 | **Walters Art** | ✅ | ✅ | 数万 | ⭐ | 无Key，中世纪/伊斯兰强项 |
| 9 | **V&A** | ✅ | 混合 | 120万+ | ⭐⭐ | 装饰艺术/设计最大馆 |
| 10 | **Getty** | ✅ | 开放 | 10万+ | ⭐⭐ | IIIF+Linked Art 标准 |
| 11 | **Sketchfab** | Token | 混合 | 10万+3D | ⭐⭐⭐ | 唯一3D素材平台 |

---

## 🚀 建议的接入路线

```
第一批（无需 Key，立即接入）：
  ✅ The Met          ← 已完成
  → Art Institute of Chicago   ← 无 Key + CC0 + IIIF
  → Cleveland Museum of Art    ← 无 Key + CC0 + 最简 API

第二批（注册 Key，1-2天搞定）：
  → Rijksmuseum         ← 70万+ 欧洲名作
  → Smithsonian         ← 280万+ 全品类
  → Cooper Hewitt       ← 设计类独家素材

第三批（聚合层 + 3D）：
  → Europeana           ← 一个入口搜全欧洲
  → Sketchfab           ← 3D 模型直接进引擎
```

---

*整理时间：2026年4月16日*
