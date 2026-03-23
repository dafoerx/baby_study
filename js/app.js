/**
 * 主应用逻辑
 */
(function () {
  // ==================== 持久化设置 ====================
  const SETTINGS_KEY = 'baby_study_settings';

  /**
   * 默认设置
   */
  const DEFAULT_SETTINGS = {
    speed: 0.5,
    intervalMinutes: 15,
    autoPlay: true,
    cardScale: 1.0,
  };

  /**
   * 从 localStorage 加载设置
   */
  function loadSettings() {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (e) {
      console.warn('加载设置失败，使用默认值', e);
    }
    return { ...DEFAULT_SETTINGS };
  }

  /**
   * 保存设置到 localStorage
   */
  function saveSettings() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
    } catch (e) {
      console.warn('保存设置失败', e);
    }
  }

  /**
   * 更新设置并同步到所有 UI
   */
  function applySettings() {
    // 同步到闪卡页的速度选择框
    const flashSpeedEl = document.getElementById('flash-speed');
    if (flashSpeedEl) flashSpeedEl.value = state.settings.speed;

    // 同步到闪卡页的大小选择框
    const flashScaleEl = document.getElementById('flash-card-scale');
    if (flashScaleEl) flashScaleEl.value = state.settings.cardScale;

    // 同步到设置弹窗
    const settingSpeedEl = document.getElementById('setting-speed');
    if (settingSpeedEl) settingSpeedEl.value = state.settings.speed;

    const settingScaleEl = document.getElementById('setting-card-scale');
    if (settingScaleEl) settingScaleEl.value = state.settings.cardScale;

    const settingIntervalEl = document.getElementById('setting-interval');
    if (settingIntervalEl) settingIntervalEl.value = state.settings.intervalMinutes;

    const settingAutoplayEl = document.getElementById('setting-autoplay');
    if (settingAutoplayEl) settingAutoplayEl.checked = state.settings.autoPlay;

    // 应用 CSS 变量
    document.documentElement.style.setProperty('--card-scale', state.settings.cardScale);

    // 同步到播放器
    state.player.setSpeed(state.settings.speed);

    // 持久化
    saveSettings();
  }

  // ==================== 状态管理 ====================
  const state = {
    currentPage: 'catalog',
    currentChapter: null,
    currentDay: null,
    currentSession: null,
    player: new FlashPlayer(),
    settings: loadSettings(),
  };

  // ==================== 页面路由 ====================
  function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const page = document.getElementById(`page-${pageId}`);
    if (page) {
      page.classList.add('active');
      state.currentPage = pageId;
    }
  }

  // ==================== 目录页 ====================
  function renderCatalog() {
    const list = document.getElementById('chapter-list');
    list.innerHTML = '';

    CHAPTERS.forEach(ch => {
      const card = document.createElement('div');
      card.className = `chapter-card chapter-${ch.status}`;
      card.innerHTML = `
        <div class="chapter-icon">${ch.icon}</div>
        <div class="chapter-info">
          <h3>${ch.title}</h3>
          <p class="chapter-subtitle">${ch.subtitle}</p>
          <p class="chapter-desc">${ch.description}</p>
        </div>
        <div class="chapter-arrow">${ch.status === 'available' ? '→' : ''}</div>
      `;

      if (ch.status === 'available') {
        card.addEventListener('click', () => openChapter(ch));
      }

      list.appendChild(card);
    });
  }

  // ==================== 章节页 ====================
  function openChapter(chapter) {
    state.currentChapter = chapter;

    document.getElementById('chapter-title').textContent = chapter.title + ' - ' + chapter.subtitle;
    document.getElementById('chapter-desc').textContent = chapter.description;

    const dayList = document.getElementById('day-list');
    dayList.innerHTML = '';

    // 根据章节ID获取数据
    const chapterData = getChapterData(chapter.id);
    if (!chapterData) {
      dayList.innerHTML = '<p class="empty-msg">暂无课程数据</p>';
      showPage('chapter');
      return;
    }

    chapterData.days.forEach(day => {
      const card = document.createElement('div');
      card.className = 'day-card';

      const totalEquations = day.sessions.reduce((sum, s) =>
        sum + s.groups.reduce((gs, g) => gs + g.equations.length, 0), 0);

      card.innerHTML = `
        <div class="day-header">
          <h3>📅 ${day.title}</h3>
          <span class="day-badge">${day.sessions.length}次 × ${day.sessions[0]?.groups.length || 0}组</span>
        </div>
        <p class="day-desc">${day.description}</p>
        <div class="day-stats">
          <span>共 ${totalEquations} 个等式</span>
          <span>预计 ${day.sessions.length * 3 * state.settings.intervalMinutes} 分钟</span>
        </div>
      `;

      card.addEventListener('click', () => openDay(chapterData, day));
      dayList.appendChild(card);
    });

    showPage('chapter');
  }

  // ==================== 每日详情页 ====================
  function openDay(chapterData, day) {
    state.currentDay = day;

    document.getElementById('day-title').textContent = `${chapterData.title} - ${day.title}`;
    document.getElementById('day-desc').textContent = day.description;

    const sessionList = document.getElementById('session-list');
    sessionList.innerHTML = '';

    day.sessions.forEach((session, sIdx) => {
      const card = document.createElement('div');
      card.className = 'session-card';

      // 生成组预览
      let groupsPreview = '';
      session.groups.forEach((group, gIdx) => {
        const equations = group.equations.map(eq => {
          return eq.parts.map(p => typeof p === 'number' ? p : ` ${p} `).join('');
        });
        groupsPreview += `
          <div class="group-preview">
            <div class="group-label">第${gIdx + 1}组</div>
            <div class="group-equations">
              ${equations.map(e => `<span class="eq-preview">${e}</span>`).join('')}
            </div>
          </div>
        `;
      });

      card.innerHTML = `
        <div class="session-header">
          <h3>🎯 第${session.session}次</h3>
          <button class="btn-start-session" data-session="${sIdx}">开始闪卡 ▶</button>
        </div>
        <div class="session-groups">${groupsPreview}</div>
      `;

      card.querySelector('.btn-start-session').addEventListener('click', (e) => {
        e.stopPropagation();
        startFlash(session);
      });

      sessionList.appendChild(card);
    });

    showPage('day');
  }

  // ==================== 闪卡播放页 ====================

  /**
   * 进入全屏播放模式
   */
  function enterFullscreenMode() {
    const flashPage = document.getElementById('page-flash');
    flashPage.classList.add('fullscreen-playing');
    document.body.classList.add('flash-fullscreen');
    document.getElementById('main-nav').style.display = 'none';
  }

  /**
   * 退出全屏播放模式
   */
  function exitFullscreenMode() {
    const flashPage = document.getElementById('page-flash');
    flashPage.classList.remove('fullscreen-playing');
    document.body.classList.remove('flash-fullscreen');
    document.getElementById('main-nav').style.display = '';
    removeOverlay();
  }

  /**
   * 移除覆盖层
   */
  function removeOverlay() {
    const existing = document.querySelector('.flash-overlay-controls');
    if (existing) existing.remove();
  }

  /**
   * 显示组完成的覆盖层
   */
  function showGroupCompleteOverlay(data) {
    removeOverlay();

    const overlay = document.createElement('div');
    overlay.className = 'flash-overlay-controls';
    overlay.innerHTML = `
      <div class="overlay-title">✅ 第${data.currentGroup + 1}组 完成</div>
      <div class="overlay-subtitle">还剩 ${data.totalGroups - data.currentGroup - 1} 组</div>
      <div class="overlay-buttons">
        <button class="btn-overlay btn-overlay-primary" id="overlay-next-group">下一组 →</button>
        <button class="btn-overlay btn-overlay-secondary" id="overlay-back">返回</button>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('#overlay-next-group').addEventListener('click', () => {
      removeOverlay();
      state.player.nextGroup();
    });
    overlay.querySelector('#overlay-back').addEventListener('click', () => {
      removeOverlay();
      exitFullscreenMode();
      state.player.stop();
      if (state.currentDay) {
        const chapterData = getChapterData(state.currentChapter.id);
        if (chapterData) {
          openDay(chapterData, state.currentDay);
        }
      }
    });
  }

  /**
   * 显示倒计时覆盖层
   */
  function showCountdownOverlay(remaining, data) {
    let overlay = document.querySelector('.flash-overlay-controls');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'flash-overlay-controls';
      overlay.innerHTML = `
        <div class="overlay-title">✅ 第${data.currentGroup + 1}组 完成</div>
        <div class="overlay-subtitle" id="overlay-countdown-text">下一组倒计时：${formatTime(remaining)}</div>
        <div class="overlay-buttons">
          <button class="btn-overlay btn-overlay-primary" id="overlay-next-group">立即下一组 →</button>
          <button class="btn-overlay btn-overlay-secondary" id="overlay-back">返回</button>
        </div>
      `;
      document.body.appendChild(overlay);

      overlay.querySelector('#overlay-next-group').addEventListener('click', () => {
        removeOverlay();
        state.player.nextGroup();
      });
      overlay.querySelector('#overlay-back').addEventListener('click', () => {
        removeOverlay();
        exitFullscreenMode();
        state.player.stop();
        if (state.currentDay) {
          const chapterData = getChapterData(state.currentChapter.id);
          if (chapterData) {
            openDay(chapterData, state.currentDay);
          }
        }
      });
    } else {
      const countdownText = overlay.querySelector('#overlay-countdown-text');
      if (countdownText) {
        countdownText.textContent = `下一组倒计时：${formatTime(remaining)}`;
      }
    }
  }

  /**
   * 显示全部完成的覆盖层
   */
  function showSessionCompleteOverlay() {
    removeOverlay();

    const overlay = document.createElement('div');
    overlay.className = 'flash-overlay-controls';
    overlay.innerHTML = `
      <div class="overlay-title">🎉 本次练习完成！</div>
      <div class="overlay-subtitle">太棒了，宝宝真厉害！</div>
      <div class="overlay-buttons">
        <button class="btn-overlay btn-overlay-primary" id="overlay-restart">重新开始</button>
        <button class="btn-overlay btn-overlay-secondary" id="overlay-back">返回</button>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('#overlay-restart').addEventListener('click', () => {
      removeOverlay();
      exitFullscreenMode();
      if (state.currentSession) {
        startFlash(state.currentSession);
      }
    });
    overlay.querySelector('#overlay-back').addEventListener('click', () => {
      removeOverlay();
      exitFullscreenMode();
      state.player.stop();
      if (state.currentDay) {
        const chapterData = getChapterData(state.currentChapter.id);
        if (chapterData) {
          openDay(chapterData, state.currentDay);
        }
      }
    });
  }

  /**
   * 格式化时间
   */
  function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }

  function startFlash(session) {
    state.currentSession = session;
    const player = state.player;

    // 配置播放器（使用全局持久化的设置）
    player.setSpeed(state.settings.speed);
    player.intervalMinutes = state.settings.intervalMinutes;
    player.autoPlay = state.settings.autoPlay;
    player.loadSession(session, session.groups);

    // 更新UI信息
    document.getElementById('flash-session-info').textContent = `第${session.session}次`;
    document.getElementById('flash-group-info').textContent = `第1/${session.groups.length}组`;

    // 同步所有设置到UI
    applySettings();

    // 重置控制按钮
    resetFlashControls();
    showFlashControl('btn-flash-play');

    // 清空舞台
    document.getElementById('equation-display').innerHTML = '';

    // 确保退出全屏模式
    exitFullscreenMode();

    // 设置状态回调
    player.onStateChange = handleFlashState;

    showPage('flash');
  }

  function handleFlashState(stateType, data) {
    const groupInfo = document.getElementById('flash-group-info');
    groupInfo.textContent = `第${data.currentGroup + 1}/${data.totalGroups}组`;

    switch (stateType) {
      case 'playing':
        // 进入全屏模式，隐藏所有UI
        enterFullscreenMode();
        removeOverlay();
        resetFlashControls();
        break;

      case 'paused':
        // 暂停时退出全屏，显示控制
        exitFullscreenMode();
        resetFlashControls();
        showFlashControl('btn-flash-resume');
        break;

      case 'group-start':
        // 新组开始，确保全屏
        enterFullscreenMode();
        removeOverlay();
        document.getElementById('equation-display').innerHTML = '';
        break;

      case 'group-complete':
        // 一组完成，显示覆盖层按钮
        showGroupCompleteOverlay(data);
        break;

      case 'countdown-start':
      case 'countdown-tick':
        // 倒计时显示在覆盖层
        showCountdownOverlay(data.remaining, data);
        break;

      case 'session-complete':
        // 全部完成，显示完成覆盖层
        showSessionCompleteOverlay();
        break;
    }
  }

  function resetFlashControls() {
    ['btn-flash-play', 'btn-flash-pause', 'btn-flash-resume',
      'btn-flash-next-group', 'btn-flash-next-session',
      'flash-timer', 'flash-complete'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
      });
  }

  function showFlashControl(id) {
    document.getElementById(id).classList.remove('hidden');
  }

  function showFlashTimer(remaining) {
    const timerEl = document.getElementById('flash-timer');
    const countdownEl = document.getElementById('timer-countdown');
    timerEl.classList.remove('hidden');

    const min = Math.floor(remaining / 60);
    const sec = remaining % 60;
    countdownEl.textContent = `${min}:${sec.toString().padStart(2, '0')}`;

    // 同时显示跳过按钮
    showFlashControl('btn-flash-next-group');
  }

  // ==================== 数据获取 ====================
  function getChapterData(chapterId) {
    switch (chapterId) {
      case 7: return CHAPTER7_DATA;
      default: return null;
    }
  }

  // ==================== 事件绑定 ====================
  function bindEvents() {
    // 导航
    document.getElementById('btn-back-catalog').addEventListener('click', () => {
      showPage('catalog');
    });

    document.getElementById('btn-back-chapter').addEventListener('click', () => {
      if (state.currentChapter) {
        openChapter(state.currentChapter);
      }
    });

    document.getElementById('btn-back-day').addEventListener('click', () => {
      state.player.stop();
      exitFullscreenMode();
      if (state.currentDay) {
        const chapterData = getChapterData(state.currentChapter.id);
        if (chapterData) {
          openDay(chapterData, state.currentDay);
        }
      }
    });

    // 闪卡控制
    document.getElementById('btn-flash-play').addEventListener('click', () => {
      state.player.play();
    });

    document.getElementById('btn-flash-pause').addEventListener('click', () => {
      state.player.pause();
    });

    document.getElementById('btn-flash-resume').addEventListener('click', () => {
      state.player.resume();
    });

    document.getElementById('btn-flash-next-group').addEventListener('click', () => {
      state.player.nextGroup();
    });

    document.getElementById('btn-flash-restart').addEventListener('click', () => {
      exitFullscreenMode();
      if (state.currentSession) {
        startFlash(state.currentSession);
      }
    });

    // 点击舞台区域暂停/继续闪卡
    document.getElementById('flash-stage').addEventListener('click', () => {
      const player = state.player;
      if (player.isPlaying && !player.isPaused) {
        player.pause();
      }
    });

    // 速度调节（闪卡页）—— 全局生效
    document.getElementById('flash-speed').addEventListener('change', (e) => {
      state.settings.speed = parseFloat(e.target.value);
      applySettings();
    });

    // 卡片大小调节（闪卡页）—— 全局生效
    document.getElementById('flash-card-scale').addEventListener('change', (e) => {
      state.settings.cardScale = parseFloat(e.target.value);
      applySettings();
    });

    // 设置弹窗
    document.getElementById('btn-settings').addEventListener('click', () => {
      // 打开弹窗时同步当前设置到弹窗UI
      applySettings();
      document.getElementById('settings-modal').classList.remove('hidden');
    });

    document.getElementById('btn-close-settings').addEventListener('click', () => {
      document.getElementById('settings-modal').classList.add('hidden');
    });

    // 设置弹窗中的速度 —— 修改即生效
    document.getElementById('setting-speed').addEventListener('change', (e) => {
      state.settings.speed = parseFloat(e.target.value);
      applySettings();
    });

    // 设置弹窗中的卡片大小 —— 修改即生效
    document.getElementById('setting-card-scale').addEventListener('change', (e) => {
      state.settings.cardScale = parseFloat(e.target.value);
      applySettings();
    });

    // 设置弹窗中的组间间隔 —— 修改即生效
    document.getElementById('setting-interval').addEventListener('change', (e) => {
      state.settings.intervalMinutes = parseInt(e.target.value);
      applySettings();
    });

    // 设置弹窗中的自动播放 —— 修改即生效
    document.getElementById('setting-autoplay').addEventListener('change', (e) => {
      state.settings.autoPlay = e.target.checked;
      applySettings();
    });

    // 点击弹窗外部关闭
    document.getElementById('settings-modal').addEventListener('click', (e) => {
      if (e.target.id === 'settings-modal') {
        document.getElementById('settings-modal').classList.add('hidden');
      }
    });
  }

  // ==================== 初始化 ====================
  function init() {
    renderCatalog();
    bindEvents();

    // 启动时应用持久化的设置到所有UI
    applySettings();

    showPage('catalog');
  }

  // 启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
