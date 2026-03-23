/**
 * 点卡组件 - DotCard
 * 用红色圆点表示数字的卡片（杜曼闪卡方法）
 * 点卡配色：红色圆点在白色背景上
 */

class DotCard {
  /**
   * 创建点卡
   * @param {number} number - 要展示的数字
   * @param {string} color - 点的颜色 ('red'|'blue'|'green'|'purple')
   * @param {object} options - 配置选项
   */
  constructor(number, color = 'red', options = {}) {
    this.number = number;
    this.color = color;
    this.size = options.size || 'medium'; // small, medium, large
    this.animated = options.animated !== false;
  }

  /**
   * 获取颜色值
   */
  getColorValue() {
    const colors = {
      red: '#E53935',      // 鲜红 - 主要点卡色
      blue: '#1E88E5',     // 蓝色
      green: '#43A047',    // 绿色
      purple: '#8E24AA',   // 紫色
      orange: '#FB8C00',   // 橙色
    };
    return colors[this.color] || colors.red;
  }

  /**
   * 计算点的布局
   * 使用随机但不重叠的方式排列点（模拟杜曼点卡的效果）
   */
  calculateDotPositions() {
    const positions = [];
    const num = this.number;

    if (num <= 0) return positions;

    // 使用基于数字的种子随机排列，保证同一数字每次显示一样
    const seed = this.number * 7 + 13;
    const random = this._seededRandom(seed);

    // 根据数量决定网格大小
    let cols, rows;
    if (num <= 5) { cols = 3; rows = 2; }
    else if (num <= 10) { cols = 4; rows = 3; }
    else if (num <= 20) { cols = 5; rows = 4; }
    else if (num <= 50) { cols = 8; rows = 7; }
    else if (num <= 100) { cols = 10; rows = 10; }
    else { cols = 12; rows = 10; }

    // 生成随机但不重叠的位置
    const cellWidth = 100 / cols;
    const cellHeight = 100 / rows;
    const allCells = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        allCells.push({ row: r, col: c });
      }
    }

    // Fisher-Yates 洗牌
    for (let i = allCells.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [allCells[i], allCells[j]] = [allCells[j], allCells[i]];
    }

    // 取前 num 个位置
    const selected = allCells.slice(0, Math.min(num, allCells.length));

    selected.forEach(cell => {
      // 在格子内添加一些随机偏移
      const offsetX = (random() - 0.5) * cellWidth * 0.3;
      const offsetY = (random() - 0.5) * cellHeight * 0.3;
      const x = cell.col * cellWidth + cellWidth / 2 + offsetX;
      const y = cell.row * cellHeight + cellHeight / 2 + offsetY;

      positions.push({
        x: Math.max(4, Math.min(96, x)),
        y: Math.max(4, Math.min(96, y))
      });
    });

    return positions;
  }

  /**
   * 种子随机数生成器
   */
  _seededRandom(seed) {
    let s = seed;
    return function () {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }

  /**
   * 获取点的大小（基于卡片实际尺寸的百分比，完全自适应）
   * 返回的是百分比值，渲染时转为卡片尺寸的百分比
   */
  getDotSizePercent() {
    const num = this.number;
    // 点的直径占卡片宽度的百分比
    if (num <= 5) return 14;
    else if (num <= 10) return 11;
    else if (num <= 20) return 8.5;
    else if (num <= 35) return 6.5;
    else if (num <= 50) return 5;
    else if (num <= 75) return 4;
    else return 3.2;
  }

  /**
   * 渲染为 DOM 元素
   * @returns {HTMLElement}
   */
  render() {
    const card = document.createElement('div');
    card.className = `dot-card dot-card-${this.size}`;
    if (this.animated) card.classList.add('dot-card-animated');
    card.dataset.number = this.number;

    // 卡片内容区域
    const cardInner = document.createElement('div');
    cardInner.className = 'dot-card-inner';

    // 点阵区域
    const dotsArea = document.createElement('div');
    dotsArea.className = 'dot-card-dots';

    const positions = this.calculateDotPositions();
    const dotSizePct = this.getDotSizePercent();
    const colorValue = this.getColorValue();

    positions.forEach((pos, index) => {
      const dot = document.createElement('div');
      dot.className = 'dot';
      dot.style.cssText = `
        left: ${pos.x}%;
        top: ${pos.y}%;
        width: ${dotSizePct}%;
        height: ${dotSizePct}%;
        background-color: ${colorValue};
      `;

      dotsArea.appendChild(dot);
    });

    cardInner.appendChild(dotsArea);
    card.appendChild(cardInner);

    return card;
  }

  /**
   * 渲染为 SVG（用于高质量显示）
   * @returns {SVGElement}
   */
  renderSVG() {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 200 200');
    svg.setAttribute('class', `dot-card-svg dot-card-svg-${this.size}`);

    // 白色背景圆角矩形
    const bg = document.createElementNS(svgNS, 'rect');
    bg.setAttribute('x', '2');
    bg.setAttribute('y', '2');
    bg.setAttribute('width', '196');
    bg.setAttribute('height', '196');
    bg.setAttribute('rx', '12');
    bg.setAttribute('fill', 'white');
    bg.setAttribute('stroke', '#e0e0e0');
    bg.setAttribute('stroke-width', '2');
    svg.appendChild(bg);

    const positions = this.calculateDotPositions();
    const dotSizePct = this.getDotSizePercent();
    const colorValue = this.getColorValue();

    positions.forEach(pos => {
      const circle = document.createElementNS(svgNS, 'circle');
      circle.setAttribute('cx', (pos.x / 100) * 190 + 5);
      circle.setAttribute('cy', (pos.y / 100) * 190 + 5);
      circle.setAttribute('r', (dotSizePct / 100) * 200 * 0.5);
      circle.setAttribute('fill', colorValue);
      svg.appendChild(circle);
    });

    return svg;
  }
}

/**
 * 运算符卡片
 */
class OperatorCard {
  constructor(operator) {
    this.operator = operator;
  }

  render() {
    const card = document.createElement('div');
    card.className = 'operator-card';
    card.textContent = this.operator;
    return card;
  }
}

/**
 * 等式渲染器 - 将等式渲染为一行点卡+运算符
 */
class EquationRenderer {
  /**
   * @param {object} equation - { parts: [95, '-', 62, '=', 33], colors: [...] }
   * @param {object} options
   */
  constructor(equation, options = {}) {
    this.equation = equation;
    this.speed = options.speed || 0.5;
    this.size = options.size || 'medium';
  }

  /**
   * 渲染整个等式（一次性全部显示）
   */
  render() {
    const container = document.createElement('div');
    container.className = 'equation-row';

    this.equation.parts.forEach((part, index) => {
      const color = this.equation.colors ? this.equation.colors[index] : 'red';

      if (typeof part === 'number') {
        const dotCard = new DotCard(part, color === 'op' ? 'red' : color, {
          size: this.size,
          animated: false
        });
        const cardEl = dotCard.render();
        // 添加数字标签
        const label = document.createElement('div');
        label.className = 'dot-card-label';
        label.textContent = part;
        label.style.color = dotCard.getColorValue();
        cardEl.appendChild(label);
        container.appendChild(cardEl);
      } else {
        const opCard = new OperatorCard(part);
        container.appendChild(opCard.render());
      }
    });

    return container;
  }

  /**
   * 动画渲染 - 从左到右依次直接显示（位置固定，无位移动画）
   * @param {HTMLElement} container - 容器元素
   * @param {function} onComplete - 完成回调
   * @returns {function} cancel - 取消函数
   */
  animateRender(container, onComplete) {
    const row = document.createElement('div');
    row.className = 'equation-row';
    container.appendChild(row);

    const parts = this.equation.parts;
    const colors = this.equation.colors || [];
    const elements = [];
    let timers = [];
    let cancelled = false;

    // 先创建所有元素并隐藏，位置固定不动
    parts.forEach((part, index) => {
      const color = colors[index] || 'red';
      let element;

      if (typeof part === 'number') {
        const dotCard = new DotCard(part, color === 'op' ? 'red' : color, {
          size: this.size,
          animated: false
        });
        element = dotCard.render();
        const label = document.createElement('div');
        label.className = 'dot-card-label';
        label.textContent = part;
        label.style.color = dotCard.getColorValue();
        element.appendChild(label);
      } else {
        element = new OperatorCard(part).render();
      }

      element.style.visibility = 'hidden';
      row.appendChild(element);
      elements.push(element);
    });

    // 按时间依次直接显示
    elements.forEach((el, index) => {
      const timer = setTimeout(() => {
        if (cancelled) return;
        el.style.visibility = 'visible';
        // 最后一个元素显示后触发完成回调
        if (index === elements.length - 1 && onComplete) {
          onComplete();
        }
      }, index * this.speed * 1000);
      timers.push(timer);
    });

    return () => {
      cancelled = true;
      timers.forEach(t => clearTimeout(t));
    };
  }
}
