/**
 * timeline.js - 时间轴模块（第2轮：完整实现）
 *
 * 功能清单：
 * - 纵向发光时间轴，7 个时期节点（对数间距）
 * - 点击节点直接切换
 * - 可拖拽滑块 + 吸附（snap to nearest node）
 * - 滚轮 / 键盘（上下方向键）切换
 * - 选中节点放大辉光 + 线条渐变色跟随
 * - 入场动画（滑入 + 节点依次淡入）
 * - 通过 onPeriodChange 回调发布事件
 */

import { TIME_PERIODS } from './data.js';

// ===== 配置 =====
const CONF = {
  defaultPeriod: 'classical',         // 默认选中古典时期
  heightRatio:   0.70,                // 时间轴占视口高度 70%
  nodeSize:      10,                  // 节点基础直径 (px)
  nodeActiveScale: 1.6,               // 选中放大倍率
  snapThreshold: 0.12,                // 拖拽吸附阈值（归一化 0~1）
  animStagger:   80,                  // 节点入场逐个延迟 (ms)
  transitionMs:  300,                 // 切换过渡时长 (ms)
};

export class TimelineModule {
  constructor(container) {
    this.container = container;

    // 状态
    this.periods = TIME_PERIODS;
    this.activeIndex = this.periods.findIndex(p => p.key === CONF.defaultPeriod);
    if (this.activeIndex < 0) this.activeIndex = 2;
    this.activePeriod = this.periods[this.activeIndex].key;

    // 节点归一化 Y 位置 (0=顶部=远古, 1=底部=现代)
    this.nodePositions = [];

    // DOM 引用
    this.els = {};

    // 拖拽状态
    this._dragging = false;
    this._dragStartY = 0;
    this._sliderPos = 0;            // 归一化 0~1

    // 回调
    this.onPeriodChange = null;     // (periodData) => void

    // 清理列表
    this._cleanups = [];
  }

  // ===== 初始化入口 =====
  init() {
    this._calcNodePositions();
    this._render();
    this._cacheEls();
    this._bindInteractions();
    this._setActive(this.activeIndex, false);  // 静默设置初始态
    this._playEntrance();
  }

  // ===== 节点位置计算（均匀分布 + 边距）=====
  _calcNodePositions() {
    /**
     * 史前时期跨度（300万年）与其他时期（几百年）差异过大，
     * 纯对数映射会导致除史前外的节点全部挤在一起。
     *
     * 方案：N 个节点均匀分布在 [marginTop, 1 - marginBottom]，
     * 保证每个时期在视觉上都有足够的点击区域和辨识度。
     */
    const n = this.periods.length;
    const marginTop = 0.04;     // 上边距留白
    const marginBottom = 0.04;  // 下边距留白
    const usable = 1 - marginTop - marginBottom;

    this.nodePositions = this.periods.map((_, i) => {
      return marginTop + (i / (n - 1)) * usable;
    });
  }

  // ===== 渲染 =====
  _render() {
    this.container.innerHTML = `
      <div class="tl-wrapper" tabindex="0" aria-label="时间轴导航">
        <!-- 发光线条 -->
        <div class="tl-track">
          <div class="tl-track-glow"></div>
        </div>

        <!-- 时期节点 -->
        ${this.periods.map((p, i) => {
          const top = this.nodePositions[i] * 100;
          const yearStr = this._formatRange(p.range);
          return `
            <div class="tl-node" data-index="${i}" data-period="${p.key}"
                 style="top: ${top}%"
                 title="${p.name} ${yearStr}">
              <div class="tl-node-dot" style="--node-color: ${p.color}"></div>
              <div class="tl-node-text">
                <div class="tl-node-label">${p.name}</div>
                <div class="tl-node-year">${yearStr}</div>
                <div class="tl-node-count" data-period="${p.key}"></div>
              </div>
            </div>
          `;
        }).join('')}

        <!-- 可拖拽滑块 -->
        <div class="tl-slider" aria-label="时间滑块">
          <div class="tl-slider-handle"></div>
        </div>

        <!-- 头尾标尺 -->
        <div class="tl-year-label tl-year-top">远古</div>
        <div class="tl-year-label tl-year-bottom">当代</div>
      </div>
    `;
  }

  /**
   * 格式化年代范围
   */
  _formatRange(range) {
    const fmt = (y) => {
      if (y <= -10000) return `${Math.round(y / -1000)}千年前`;
      if (y < 0) return `前${-y}`;
      return String(y);
    };
    return `${fmt(range[0])} – ${fmt(range[1])}`;
  }

  _cacheEls() {
    this.els.wrapper  = this.container.querySelector('.tl-wrapper');
    this.els.track    = this.container.querySelector('.tl-track');
    this.els.trackGlow= this.container.querySelector('.tl-track-glow');
    this.els.slider   = this.container.querySelector('.tl-slider');
    this.els.handle   = this.container.querySelector('.tl-slider-handle');
    this.els.nodes    = Array.from(this.container.querySelectorAll('.tl-node'));
  }

  // ===== 交互绑定 =====
  _bindInteractions() {
    const wrapper = this.els.wrapper;
    const slider  = this.els.slider;

    // 1) 点击节点
    this.els.nodes.forEach(node => {
      const handler = (e) => {
        e.stopPropagation();
        const idx = parseInt(node.dataset.index);
        this._goToPeriod(idx);
      };
      node.addEventListener('click', handler);
      this._cleanups.push(() => node.removeEventListener('click', handler));
    });

    // 2) 拖拽滑块
    const onPointerDown = (e) => {
      this._dragging = true;
      this._dragStartY = e.clientY;
      slider.classList.add('dragging');
      document.body.style.userSelect = 'none';
      e.preventDefault();
    };
    const onPointerMove = (e) => {
      if (!this._dragging) return;
      const rect = this.els.track.getBoundingClientRect();
      const relY = (e.clientY - rect.top) / rect.height;
      const clamped = Math.max(0, Math.min(1, relY));
      this._moveSliderTo(clamped);
      // 实时检查吸附
      this._checkSnapHint(clamped);
    };
    const onPointerUp = () => {
      if (!this._dragging) return;
      this._dragging = false;
      slider.classList.remove('dragging');
      document.body.style.userSelect = '';
      // 释放 → 吸附到最近节点
      this._snapToNearest();
    };

    slider.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
    this._cleanups.push(
      () => slider.removeEventListener('pointerdown', onPointerDown),
      () => document.removeEventListener('pointermove', onPointerMove),
      () => document.removeEventListener('pointerup', onPointerUp)
    );

    // 也允许点击轨道任意位置跳转
    const onTrackClick = (e) => {
      if (this._dragging) return;
      const rect = this.els.track.getBoundingClientRect();
      const relY = (e.clientY - rect.top) / rect.height;
      const clamped = Math.max(0, Math.min(1, relY));
      this._moveSliderTo(clamped);
      this._snapToNearest();
    };
    this.els.track.addEventListener('click', onTrackClick);
    this._cleanups.push(() => this.els.track.removeEventListener('click', onTrackClick));

    // 3) 滚轮切换
    const onWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.deltaY > 0) {
        // 向下 → 更现代
        this._goToPeriod(Math.min(this.activeIndex + 1, this.periods.length - 1));
      } else {
        // 向上 → 更古老
        this._goToPeriod(Math.max(this.activeIndex - 1, 0));
      }
    };
    wrapper.addEventListener('wheel', onWheel, { passive: false });
    this._cleanups.push(() => wrapper.removeEventListener('wheel', onWheel));

    // 4) 键盘交互
    const onKeyDown = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        this._goToPeriod(Math.max(this.activeIndex - 1, 0));
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        this._goToPeriod(Math.min(this.activeIndex + 1, this.periods.length - 1));
      }
    };
    wrapper.addEventListener('keydown', onKeyDown);
    this._cleanups.push(() => wrapper.removeEventListener('keydown', onKeyDown));

    // 让 wrapper 可获取焦点以接收键盘事件
    wrapper.addEventListener('click', () => wrapper.focus());
  }

  // ===== 核心切换逻辑 =====
  _goToPeriod(index) {
    if (index === this.activeIndex) return;
    this._setActive(index, true);
  }

  _setActive(index, animated = true) {
    this.activeIndex = index;
    this.activePeriod = this.periods[index].key;
    const period = this.periods[index];
    const pos = this.nodePositions[index];

    // 更新节点样式
    this.els.nodes.forEach((node, i) => {
      const isActive = i === index;
      node.classList.toggle('active', isActive);
      // 设置节点颜色 CSS 变量
      node.querySelector('.tl-node-dot').style.setProperty('--node-color', this.periods[i].color);
    });

    // 移动滑块到目标位置
    this._moveSliderTo(pos, animated);
    this._sliderPos = pos;

    // 更新轨道渐变色
    this._updateTrackGlow(period.color, animated);

    // 触发回调
    if (this.onPeriodChange) {
      this.onPeriodChange({
        key: period.key,
        name: period.name,
        range: period.range,
        color: period.color,
        index: index,
      });
    }
  }

  // ===== 滑块控制 =====
  _moveSliderTo(normalizedY, animated = true) {
    const slider = this.els.slider;
    slider.style.transition = animated ? `top ${CONF.transitionMs}ms cubic-bezier(0.2, 0, 0, 1)` : 'none';
    slider.style.top = `${normalizedY * 100}%`;
    this._sliderPos = normalizedY;
  }

  _checkSnapHint(pos) {
    // 拖拽过程中：接近节点时高亮提示
    let nearestIdx = 0;
    let nearestDist = Infinity;
    this.nodePositions.forEach((nPos, i) => {
      const dist = Math.abs(pos - nPos);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    });

    // 吸附范围内 → 添加 hover hint
    this.els.nodes.forEach((node, i) => {
      node.classList.toggle('snap-hint', i === nearestIdx && nearestDist < CONF.snapThreshold);
    });
  }

  _snapToNearest() {
    let nearestIdx = 0;
    let nearestDist = Infinity;
    this.nodePositions.forEach((nPos, i) => {
      const dist = Math.abs(this._sliderPos - nPos);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    });

    // 清除 snap hints
    this.els.nodes.forEach(n => n.classList.remove('snap-hint'));

    // 跳到最近的
    this._setActive(nearestIdx, true);
  }

  // ===== 轨道渐变色更新 =====
  _updateTrackGlow(color, animated = true) {
    const glow = this.els.trackGlow;
    glow.style.transition = animated ? `background ${CONF.transitionMs}ms ease` : 'none';
    glow.style.background = `linear-gradient(to bottom, 
      ${color}00 0%, 
      ${color}66 20%, 
      ${color}cc 50%, 
      ${color}66 80%, 
      ${color}00 100%)`;
  }

  // ===== 入场动画 =====
  _playEntrance() {
    const wrapper = this.els.wrapper;
    wrapper.classList.add('tl-entering');

    // 节点依次淡入
    this.els.nodes.forEach((node, i) => {
      node.style.animationDelay = `${300 + i * CONF.animStagger}ms`;
    });

    // 滑块延迟出现
    this.els.slider.style.animationDelay = `${300 + this.periods.length * CONF.animStagger}ms`;

    // 入场完成后移除动画类
    const totalDuration = 300 + this.periods.length * CONF.animStagger + 500;
    setTimeout(() => {
      wrapper.classList.remove('tl-entering');
      wrapper.classList.add('tl-entered');
      // 确保 wrapper 获取焦点以接收键盘事件
      wrapper.focus({ preventScroll: true });
    }, totalDuration);
  }

  // ===== 公共 API =====

  /**
   * 外部设置激活时期
   */
  setActivePeriod(periodKey) {
    const idx = this.periods.findIndex(p => p.key === periodKey);
    if (idx >= 0 && idx !== this.activeIndex) {
      this._setActive(idx, true);
    }
  }

  /**
   * 获取当前激活时期
   */
  getActivePeriod() {
    return this.periods[this.activeIndex];
  }

  /**
   * 更新指定时期节点的资产计数显示
   */
  updateNodeCount(periodKey, count) {
    const el = this.container.querySelector(`.tl-node-count[data-period="${periodKey}"]`);
    if (el) el.textContent = count > 0 ? String(count) : '';
  }

  /**
   * 销毁
   */
  dispose() {
    this._cleanups.forEach(fn => fn());
    this._cleanups = [];
    this.container.innerHTML = '';
  }
}
