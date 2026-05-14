// build-npm-local.js
// 从「故宫资料3万余件台北故宫藏品」原始数据集（GB18030 文本 + 配对 JPG）中
// 抽样精选若干条，生成 contenthubdemo/assets/npm/<id>.jpg + npm-local.json
//
// 运行方式：
//   cd contenthubdemo && node build-npm-local.js
//
// 解决问题：原 NPM Adapter 用 wikimedia 远程图被公司网络拦截 → 改用本地图片
//          原始 txt 是 GB18030 编码，需要 TextDecoder('gb18030') 解码

const fs = require('fs');
const path = require('path');

// ============== 配置 ==============
const SRC_ROOT = path.resolve(
  __dirname,
  '..',
  '故宫资料3万余件台北故宫藏品高清图片素材文字说明'
);
const OUT_IMG_DIR = path.resolve(__dirname, 'assets', 'npm');
const OUT_JSON = path.resolve(__dirname, 'npm-local.json');

// 各子类目抽样配额（目标入库 ~1700 件，对应大英 2600 件的中等规模）
// "有图 txt 数"上限见注释；任何配额都受池子上限约束
const QUOTA = {
  '02.[青铜器类]': 350,  // 4418 个有图 txt（中国最强类）
  '04.[玉石器类]': 60,   // 68 个有图 → 几乎全要（剩余是 tif）
  '05.[漆器资料]': 250,  // 542
  '06.[珐琅器类]': 300,  // 1699（乾隆珐琅是台北故宫精品）
  '07.[竹木牙角]': 200,  // 515
  '08.[书画丝帛]': 80,   // 84 → 几乎全要（剩余是 tif 大图）
  '11.[文房用具]': 200,  // 470
  '[故 杂 3480件]': 100, // 595
  '[购 杂 915件]': 80,   // 912
  '[赠 杂 170件]': 40,   // 170 → 几乎全要
  '[中 杂 120件]': 40,   // 120 → 几乎全要
};
// 配额合计：350+60+250+300+200+80+200+100+80+40+40 = 1700

// 类目 → 标签（中英文）
const CATEGORY_TAGS = {
  '02.[青铜器类]': { zh: '青铜器', en: 'Bronze', period: '汉/商周' },
  '04.[玉石器类]': { zh: '玉石器', en: 'Jade & Stone', period: '' },
  '05.[漆器资料]': { zh: '漆器', en: 'Lacquerware', period: '' },
  '06.[珐琅器类]': { zh: '珐琅器', en: 'Enamel', period: '清' },
  '07.[竹木牙角]': { zh: '竹木牙角', en: 'Bamboo & Wood Carving', period: '' },
  '08.[书画丝帛]': { zh: '书画', en: 'Painting & Calligraphy', period: '' },
  '11.[文房用具]': { zh: '文房', en: 'Scholar Object', period: '' },
  '[故 杂 3480件]': { zh: '杂项', en: 'Miscellaneous', period: '' },
  '[购 杂 915件]': { zh: '杂项', en: 'Miscellaneous', period: '' },
  '[赠 杂 170件]': { zh: '杂项', en: 'Miscellaneous', period: '' },
  '[中 杂 120件]': { zh: '杂项', en: 'Miscellaneous', period: '' },
};

const ENTITY_DIR = path.join(SRC_ROOT, '[器物典藏](32072件)');

// ============== 工具函数 ==============
const decoderGBK = new TextDecoder('gb18030');
const decoderUtf8 = new TextDecoder('utf-8', { fatal: false });

// 数据集是混编的：早期文件 GB18030，后期文件 UTF-8。自动检测。
function readSmartText(filePath) {
  const buf = fs.readFileSync(filePath);
  // 先尝试 UTF-8。如果出现替换字符或乱码（出现高 GB18030 特征字符在 UTF-8 解码后多为 \uFFFD），回落 GBK
  const u8 = decoderUtf8.decode(buf);
  // 用关键词判断：UTF-8 文档应该能正确解出"品名"或"基本"
  if (u8.includes('品名') || u8.includes('基本資料') || u8.includes('基本资料')) {
    return u8;
  }
  // 否则按 GB18030 处理
  return decoderGBK.decode(buf);
}

// 解析单个 txt 文件，提取字段
function parseTxt(text) {
  const lines = text.split(/\r?\n/);
  const result = {
    titleZh: '',
    titleEn: '',
    accession: '',
    category: '',
    medium: '',
    func: '',
    size: '',
    dateZh: '',
    dateEn: '',
    desc: '',
    sourceUrl: '',
  };

  // sourceUrl
  const urlLine = lines.find((l) => /antiquities\.npm\.gov\.tw/i.test(l));
  if (urlLine) result.sourceUrl = urlLine.trim();

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const m = line.match(/^([^：:\t]+)[：:]\s*\t?(.*)$/);
    if (m) {
      const key = m[1].trim();
      let val = m[2].trim();
      // 续行（下一行如果以 \t 开头则属于本字段）
      const extras = [];
      let j = i + 1;
      while (j < lines.length && /^\t/.test(lines[j])) {
        extras.push(lines[j].replace(/^\t+/, '').trim());
        j++;
      }
      const fullVal = [val, ...extras].filter(Boolean);

      switch (key) {
        case '編號':
        case '编号':
          result.accession = fullVal[0] || '';
          break;
        case '品名': {
          // 第 1 行中文，第 2 行起可能是英文
          result.titleZh = fullVal[0] || '';
          if (fullVal.length > 1) {
            // 把剩余行合并为英文
            result.titleEn = fullVal.slice(1).join(' ');
          }
          break;
        }
        case '類別':
        case '类别':
          result.category = fullVal.join('；');
          break;
        case '質材':
        case '质材':
          result.medium = fullVal.join('；');
          break;
        case '功能':
          result.func = fullVal.join('；');
          break;
        case '尺寸':
          result.size = fullVal.join('；');
          break;
        case '時代':
        case '时代':
          result.dateZh = fullVal[0] || '';
          // dateEn 规则：丢弃"纯数字"（多为入藏年/内部编号），其余文字（含"西元..."、"乾隆xx年"、"19th century"）都保留
          if (fullVal.length > 1) {
            const second = fullVal[1].trim();
            if (second && !/^\d+$/.test(second)) {
              result.dateEn = second;
            }
          }
          break;
        case '說明':
        case '说明':
          result.desc = fullVal.join(' ');
          break;
      }
      i = j;
    } else {
      i++;
    }
  }
  return result;
}

// 找一个 txt 对应的第一张展示用 jpg
// 文件命名规律：故漆000001.txt ↔ 故漆000001_N000000000PAB.jpg / 故漆000001_N000000000PAE.jpg ...
function findCompanionJpg(dir, txtName) {
  const stem = txtName.replace(/\.txt$/i, '');
  const candidates = fs
    .readdirSync(dir)
    .filter(
      (f) =>
        f.startsWith(stem + '_') &&
        /\.jpe?g$/i.test(f) &&
        !f.endsWith('.tif')
    );
  if (!candidates.length) return null;
  // 优先 PAA / PAB（通常是主图），否则取字典序第一张
  candidates.sort();
  const paa = candidates.find((f) => /PA[AB]\./i.test(f));
  return paa || candidates[0];
}

// 推断时期英文
function inferPeriod(dateZh) {
  if (!dateZh) return '';
  if (/清/.test(dateZh)) return 'Qing Dynasty';
  if (/明/.test(dateZh)) return 'Ming Dynasty';
  if (/元/.test(dateZh)) return 'Yuan Dynasty';
  if (/[南北]?宋/.test(dateZh)) return 'Song Dynasty';
  if (/唐/.test(dateZh)) return 'Tang Dynasty';
  if (/隋/.test(dateZh)) return 'Sui Dynasty';
  if (/[南北]朝/.test(dateZh)) return 'Northern & Southern Dynasties';
  if (/晉|晋/.test(dateZh)) return 'Jin Dynasty';
  if (/漢|汉/.test(dateZh)) return 'Han Dynasty';
  if (/秦/.test(dateZh)) return 'Qin Dynasty';
  if (/戰國|战国/.test(dateZh)) return 'Warring States';
  if (/春秋/.test(dateZh)) return 'Spring & Autumn';
  if (/[西東东]?周/.test(dateZh)) return 'Zhou Dynasty';
  if (/商/.test(dateZh)) return 'Shang Dynasty';
  if (/民國|民国/.test(dateZh)) return 'Republican Era';
  return '';
}

function inferClassification(category, medium) {
  const s = (category + ' ' + medium).toLowerCase();
  if (/瓷|陶/.test(category + medium)) return 'Ceramics';
  if (/銅|铜|金屬|金属/.test(category + medium)) return 'Bronze';
  if (/玉|石/.test(category + medium)) return 'Jade';
  if (/漆/.test(category + medium)) return 'Lacquer';
  if (/琺瑯|珐琅/.test(category + medium)) return 'Enamel';
  if (/書|书|畫|画|絹|绢|帛|紙|纸/.test(category + medium))
    return 'Painting & Calligraphy';
  if (/竹|木|牙|角/.test(category + medium)) return 'Carving';
  return 'Object';
}

// ============== 主流程 ==============
function main() {
  if (!fs.existsSync(ENTITY_DIR)) {
    console.error('源目录不存在：', ENTITY_DIR);
    process.exit(1);
  }
  fs.mkdirSync(OUT_IMG_DIR, { recursive: true });

  const items = [];
  let copied = 0;
  let skipped = 0;

  const subDirs = fs.readdirSync(ENTITY_DIR);

  for (const sub of subDirs) {
    const quota = QUOTA[sub];
    if (!quota) continue;
    const subPath = path.join(ENTITY_DIR, sub);
    if (!fs.statSync(subPath).isDirectory()) continue;

    const allFiles = fs.readdirSync(subPath);
    const txts = allFiles.filter((f) => /\.txt$/i.test(f));

    // 先在文件列表中筛出"有配对 jpg"的 txt
    const fileSet = new Set(allFiles);
    const txtsWithJpg = txts.filter((txtName) => {
      const stem = txtName.replace(/\.txt$/i, '');
      return allFiles.some(
        (f) => f.startsWith(stem + '_') && /\.jpe?g$/i.test(f)
      );
    });

    // 均匀采样：步长 = floor(total / quota)
    const step = Math.max(1, Math.floor(txtsWithJpg.length / quota));
    const picked = [];
    for (let i = 0; i < txtsWithJpg.length && picked.length < quota; i += step) {
      picked.push(txtsWithJpg[i]);
    }
    console.log(
      `  ${sub}: txt=${txts.length}, 有图=${txtsWithJpg.length}, 抽取=${picked.length}/${quota}`
    );

    const tag = CATEGORY_TAGS[sub] || { zh: '', en: '', period: '' };

    for (const txtName of picked) {
      const txtPath = path.join(subPath, txtName);
      let parsed;
      try {
        parsed = parseTxt(readSmartText(txtPath));
      } catch (e) {
        skipped++;
        continue;
      }
      const jpgName = findCompanionJpg(subPath, txtName);
      if (!jpgName || !parsed.titleZh) {
        skipped++;
        continue;
      }

      // 复制图片到 assets/npm/<id>.jpg
      // 文件名只用 ASCII，但要保证唯一：用 类目前缀 + accession 前缀字母（如 "故"→g、"中"→z、"购"→p、"赠"→z2、"南"→n）+ 编号
      // 简单做法：tag前缀 + accession 哈希式压缩（前缀首字符按字典序映射）
      const tagPrefix = (tag.en || 'obj').toLowerCase().replace(/\s.*$/, '').replace(/[^a-z]/g, '');
      const rawId = parsed.accession || txtName.replace(/\.txt$/i, '');
      // 把 accession 中的中文前缀映射为字母代号
      const PREFIX_MAP = { '故': 'g', '中': 'z', '購': 'p', '购': 'p', '贈': 's', '赠': 's', '南': 'n', '北': 'b', '雜': 'x', '杂': 'x' };
      // 取 accession 第一组中文前缀（如 "故-雜" → "gx"，"南購-玉" → "np-玉"）
      const prefixChars = (rawId.match(/^[\u4e00-\u9fff]+/) || [''])[0]
        .split('')
        .map(c => PREFIX_MAP[c] || '')
        .join('') || 'x';
      const numParts = rawId.match(/\d+/g) || [];
      const idTail = numParts.join('-') || `${items.length}`;
      let safeId = `${tagPrefix}-${prefixChars}-${idTail}`.replace(/-+/g, '-').replace(/^-+|-+$/g, '');
      // 兜底去重：如果当前 items 已有同 id，则追加序号
      let dupCnt = 0;
      const baseId = safeId;
      while (items.some(it => it.id === 'npm:' + safeId)) {
        dupCnt++;
        safeId = `${baseId}-${dupCnt}`;
      }
      const newImgName = `${safeId}.jpg`;
      const srcImg = path.join(subPath, jpgName);
      const dstImg = path.join(OUT_IMG_DIR, newImgName);
      if (!fs.existsSync(dstImg)) {
        fs.copyFileSync(srcImg, dstImg);
      }
      copied++;

      const periodEn = inferPeriod(parsed.dateZh);
      const classification = tag.en || inferClassification(parsed.category, parsed.medium);

      items.push({
        id: 'npm:' + safeId,
        accession: parsed.accession || '',
        titleZh: parsed.titleZh,
        titleEn: parsed.titleEn || '',
        dateZh: parsed.dateZh || '',
        dateEn: parsed.dateEn || '',
        period: periodEn,
        category: parsed.category || '',
        medium: parsed.medium || '',
        func: parsed.func || '',
        size: parsed.size || '',
        desc: parsed.desc || '',
        classification,
        tagZh: tag.zh,
        sourceUrl: parsed.sourceUrl || 'https://www.npm.gov.tw/',
        img: `assets/npm/${newImgName}`,
      });
    }
  }

  // 输出 JSON（紧凑格式）
  fs.writeFileSync(OUT_JSON, JSON.stringify(items, null, 0), 'utf8');
  console.log(`✅ 完成：共抽取 ${items.length} 条，复制图片 ${copied} 张，跳过 ${skipped}`);
  console.log(`   JSON → ${OUT_JSON}`);
  console.log(`   IMG  → ${OUT_IMG_DIR}`);
}

main();
