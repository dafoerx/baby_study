/**
 * TV 遥控器焦点导航控制器
 * 适配华为智慧屏 V75 遥控器操控
 * 支持：方向键导航、OK确认、返回键
 */
(function () {
  'use strict';

  // ============ TV 模式检测 ============
  const isTVMode = () => {
    return (window.innerWidth >= 1200 && window.innerHeight >= 700 && window.innerWidth > window.innerHeight)
      || /TV|SmartTV|BRAVIA|SMART-TV|HbbTV|LG NetCast|HUAWEI|HarmonyOS/i.test(navigator.userAgent);
  };

  if (!isTVMode()) {
    // 非TV模式，监听resize以便动态切换
    window.addEventListener('resize', () => {
      if (isTVMode() && !window._tvRemoteInited) {
        initTVRemote();
      }
    });
    return;
  }

  initTVRemote();

  function initTVRemote() {
    if (window._tvRemoteInited) return;
    window._tvRemoteInited = true;

    document.body.classList.add('tv-mode');

    // ============ 焦点管理 ============
    const FOCUSABLE_SELECTOR = '.tv-focusable:not(.hidden):not([style*="display: none"])';
    let currentFocusIndex = 0;
    let hideHintTimer = null;

    // 创建焦点操作提示
    const hint = document.createElement('div');
    hint.className = 'tv-focus-hint';
    hint.innerHTML = '🎮 方向键选择 · OK确认 · 返回键后退';
    document.body.appendChild(hint);

    // 3秒后隐藏提示
    hideHintTimer = setTimeout(() => hint.classList.add('hidden'), 5000);

    /**
     * 获取当前页面所有可聚焦元素
     */
    function getFocusableElements() {
      const activePage = document.querySelector('.page.active');
      if (!activePage) return [];

      // 获取页面内可见的tv-focusable元素
      const elements = Array.from(activePage.querySelectorAll(FOCUSABLE_SELECTOR));

      // 也包括弹窗内的
      const modal = document.querySelector('.modal:not(.hidden)');
      if (modal) {
        return Array.from(modal.querySelectorAll(FOCUSABLE_SELECTOR));
      }

      return elements.filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });
    }

    /**
     * 将焦点移到指定元素
     */
    function focusElement(el) {
      if (!el) return;

      // 清除所有焦点
      document.querySelectorAll('.tv-focused').forEach(e => e.classList.remove('tv-focused'));

      // 设置新焦点
      el.classList.add('tv-focused');
      el.focus({ preventScroll: false });

      // 确保元素可见（滚动到视口内）
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }

    /**
     * 找到最近的方向元素（基于空间位置）
     */
    function findNearestInDirection(current, elements, direction) {
      if (!current || elements.length === 0) return null;

      const rect = current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      let bestEl = null;
      let bestScore = Infinity;

      elements.forEach(el => {
        if (el === current) return;

        const eRect = el.getBoundingClientRect();
        const ex = eRect.left + eRect.width / 2;
        const ey = eRect.top + eRect.height / 2;

        const dx = ex - cx;
        const dy = ey - cy;

        let valid = false;
        let primaryDist = 0;
        let secondaryDist = 0;

        switch (direction) {
          case 'up':
            valid = dy < -10;
            primaryDist = Math.abs(dy);
            secondaryDist = Math.abs(dx);
            break;
          case 'down':
            valid = dy > 10;
            primaryDist = Math.abs(dy);
            secondaryDist = Math.abs(dx);
            break;
          case 'left':
            valid = dx < -10;
            primaryDist = Math.abs(dx);
            secondaryDist = Math.abs(dy);
            break;
          case 'right':
            valid = dx > 10;
            primaryDist = Math.abs(dx);
            secondaryDist = Math.abs(dy);
            break;
        }

        if (valid) {
          // 优先方向距离，次优横向距离
          const score = primaryDist + secondaryDist * 0.5;
          if (score < bestScore) {
            bestScore = score;
            bestEl = el;
          }
        }
      });

      return bestEl;
    }

    /**
     * 方向导航
     */
    function navigate(direction) {
      const elements = getFocusableElements();
      if (elements.length === 0) return;

      const currentFocused = document.querySelector('.tv-focused') || document.activeElement;

      // 如果当前没有焦点，聚焦第一个元素
      if (!currentFocused || !elements.includes(currentFocused)) {
        focusElement(elements[0]);
        return;
      }

      const next = findNearestInDirection(currentFocused, elements, direction);
      if (next) {
        focusElement(next);
      }
    }

    /**
     * 确认操作
     */
    function confirmAction() {
      const focused = document.querySelector('.tv-focused');
      if (focused) {
        focused.click();
      }
    }

    /**
     * 返回操作
     */
    function goBack() {
      // 先检查弹窗
      const modal = document.querySelector('.modal:not(.hidden)');
      if (modal) {
        const closeBtn = modal.querySelector('.btn-close');
        if (closeBtn) closeBtn.click();
        return;
      }

      // 找当前页面的返回按钮
      const activePage = document.querySelector('.page.active');
      if (activePage) {
        const backBtn = activePage.querySelector('.btn-back');
        if (backBtn) {
          backBtn.click();
          return;
        }
      }
    }

    // ============ 键盘事件监听 ============
    // Android TV / 华为遥控器键值映射
    const KEY_MAP = {
      38: 'up',     // Arrow Up
      40: 'down',   // Arrow Down
      37: 'left',   // Arrow Left
      39: 'right',  // Arrow Right
      13: 'enter',  // OK / Enter / Select
      23: 'enter',  // D-pad Center (Android TV)
      66: 'enter',  // KEYCODE_ENTER (Android)
      4: 'back',    // Android Back
      27: 'back',   // Escape
      8: 'back',    // Backspace
      // 华为遥控器特殊按键
      82: 'menu',   // Menu
      19: 'up',     // KEYCODE_DPAD_UP (Android)
      20: 'down',   // KEYCODE_DPAD_DOWN
      21: 'left',   // KEYCODE_DPAD_LEFT
      22: 'right',  // KEYCODE_DPAD_RIGHT
    };

    document.addEventListener('keydown', function (e) {
      const action = KEY_MAP[e.keyCode];
      if (!action) return;

      // 当焦点在 select/input 等表单控件上时，让浏览器原生处理上下键（切换选项值）
      const activeEl = document.activeElement;
      const isFormControl = activeEl && (activeEl.tagName === 'SELECT' || activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');

      if (isFormControl) {
        // 表单控件上：上下键给原生控件处理，左右键用于导航到其他元素，确认键让原生处理
        if (action === 'up' || action === 'down') {
          // 不拦截，让select自己切换选项
          return;
        }
        if (action === 'enter') {
          // select的enter让原生处理（打开/确认下拉）
          if (activeEl.tagName === 'SELECT') return;
        }
      }

      e.preventDefault();
      e.stopPropagation();

      switch (action) {
        case 'up':
        case 'down':
        case 'left':
        case 'right':
          navigate(action);
          break;
        case 'enter':
          confirmAction();
          break;
        case 'back':
          goBack();
          break;
        case 'menu':
          // 打开设置
          document.getElementById('btn-settings')?.click();
          break;
      }
    });

    // ============ 页面切换时自动聚焦 ============
    // 监听页面切换（MutationObserver）
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const target = mutation.target;
          if (target.classList.contains('page') && target.classList.contains('active')) {
            // 页面切换，延迟聚焦第一个可聚焦元素
            setTimeout(() => {
              const elements = getFocusableElements();
              if (elements.length > 0) {
                focusElement(elements[0]);
              }
            }, 300);
          }
        }
      });
    });

    document.querySelectorAll('.page').forEach(page => {
      observer.observe(page, { attributes: true });
    });

    // ============ 自动标记可聚焦元素 ============
    // 定时扫描并添加 tv-focusable 和 tabindex
    function markFocusableElements() {
      // 章节卡片
      document.querySelectorAll('.chapter-card.chapter-available').forEach(el => {
        if (!el.classList.contains('tv-focusable')) {
          el.classList.add('tv-focusable');
          el.setAttribute('tabindex', '0');
        }
      });

      // 天数卡片
      document.querySelectorAll('.day-card').forEach(el => {
        if (!el.classList.contains('tv-focusable')) {
          el.classList.add('tv-focusable');
          el.setAttribute('tabindex', '0');
        }
      });

      // 按钮
      document.querySelectorAll('button:not(.tv-focusable)').forEach(el => {
        el.classList.add('tv-focusable');
        el.setAttribute('tabindex', '0');
      });

      // select
      document.querySelectorAll('select:not(.tv-focusable)').forEach(el => {
        el.classList.add('tv-focusable');
        el.setAttribute('tabindex', '0');
      });

      // input
      document.querySelectorAll('input:not(.tv-focusable)').forEach(el => {
        el.classList.add('tv-focusable');
        el.setAttribute('tabindex', '0');
      });
    }

    // 初始标记
    markFocusableElements();

    // DOM变更时重新标记（新渲染的卡片等）
    const bodyObserver = new MutationObserver(() => {
      markFocusableElements();
    });
    bodyObserver.observe(document.body, { childList: true, subtree: true });

    // 初始聚焦
    setTimeout(() => {
      const elements = getFocusableElements();
      if (elements.length > 0) {
        focusElement(elements[0]);
      }
    }, 500);

    console.log('[TV Remote] 华为智慧屏遥控器导航已启用');
  }
})();
