/**
 * 主应用逻辑
 */
(function () {
  // ==================== 设置持久化 ====================
  const SETTINGS_KEY = 'anbao-flashcard-settings';

  const DEFAULT_SETTINGS = {
    speed: 0.5,
    intervalMinutes: 15,
    autoPlay: true,
    cardScale: 1.2,  // 默认"较大"
  };

  function loadSettings() {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (e) { /* ignore */ }
    return { ...DEFAULT_SETTINGS };
  }

  function saveSettings() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
    } catch (e) { /* ignore */ }
  }

  // ==================== 状态管理 ====================
  const state = {
    currentPage: 'catalog',
    currentChapter: null,
    currentDay: null,
    currentSession: null,
    player: new FlashPlayer(),
    settings: loadSettings()
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
  function startFlash(session) {
    state.currentSession = session;
    const player = state.player;

    // 配置播放器（使用全局设置）
    player.setSpeed(state.settings.speed);
    player.intervalMinutes = state.settings.intervalMinutes;
    player.autoPlay = state.settings.autoPlay;
    player.loadSession(session, session.groups);

    // 更新UI — 同步全局设置到闪卡页控件
    document.getElementById('flash-session-info').textContent = `第${session.session}次`;
    document.getElementById('flash-group-info').textContent = `第1/${session.groups.length}组`;
    syncSettingsToUI();

    // 重置控制按钮
    resetFlashControls();
    showFlashControl('btn-flash-play');

    // 清空舞台
    document.getElementById('equation-display').innerHTML = '';

    // 设置状态回调
    player.onStateChange = handleFlashState;

    showPage('flash');
  }

  /**
   * 把 state.settings 同步到所有 UI 控件（闪卡页 + 设置弹窗）
   */
  function syncSettingsToUI() {
    // 闪卡页速度
    const flashSpeed = document.getElementById('flash-speed');
    if (flashSpeed) flashSpeed.value = state.settings.speed;

    // 闪卡页大小
    const flashScale = document.getElementById('flash-card-scale');
    if (flashScale) flashScale.value = state.settings.cardScale;

    // CSS变量
    document.documentElement.style.setProperty('--card-scale', state.settings.cardScale);

    // 设置弹窗速度
    const settingSpeed = document.getElementById('setting-speed');
    if (settingSpeed) settingSpeed.value = state.settings.speed;

    // 设置弹窗间隔
    const settingInterval = document.getElementById('setting-interval');
    if (settingInterval) settingInterval.value = state.settings.intervalMinutes;

    // 设置弹窗自动播放
    const settingAutoplay = document.getElementById('setting-autoplay');
    if (settingAutoplay) settingAutoplay.checked = state.settings.autoPlay;

    // 设置弹窗大小
    const settingScale = document.getElementById('setting-card-scale');
    if (settingScale) settingScale.value = state.settings.cardScale;
  }

  function handleFlashState(stateType, data) {
    const groupInfo = document.getElementById('flash-group-info');
    groupInfo.textContent = `第${data.currentGroup + 1}/${data.totalGroups}组`;

    switch (stateType) {
      case 'playing':
        resetFlashControls();
        showFlashControl('btn-flash-pause');
        break;

      case 'paused':
        resetFlashControls();
        showFlashControl('btn-flash-resume');
        break;

      case 'group-start':
        document.getElementById('equation-display').innerHTML = '';
        break;

      case 'group-complete':
        resetFlashControls();
        showFlashControl('btn-flash-next-group');
        break;

      case 'countdown-start':
      case 'countdown-tick':
        showFlashTimer(data.remaining);
        break;

      case 'session-complete':
        resetFlashControls();
        document.getElementById('flash-complete').classList.remove('hidden');
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
      if (state.currentSession) {
        startFlash(state.currentSession);
      }
    });

    // 速度调节（闪卡页）— 即时生效 + 全局保存
    const onFlashSpeedChange = (e) => {
      state.settings.speed = parseFloat(e.target.value);
      state.player.setSpeed(state.settings.speed);
      saveSettings();
      syncSettingsToUI();
    };
    document.getElementById('flash-speed').addEventListener('change', onFlashSpeedChange);
    document.getElementById('flash-speed').addEventListener('input', onFlashSpeedChange);

    // 卡片大小调节（闪卡页）— 即时生效 + 全局保存
    const onFlashScaleChange = (e) => {
      state.settings.cardScale = parseFloat(e.target.value);
      document.documentElement.style.setProperty('--card-scale', state.settings.cardScale);
      saveSettings();
      syncSettingsToUI();
    };
    document.getElementById('flash-card-scale').addEventListener('change', onFlashScaleChange);
    document.getElementById('flash-card-scale').addEventListener('input', onFlashScaleChange);

    // 设置弹窗
    document.getElementById('btn-settings').addEventListener('click', () => {
      // 打开弹窗前同步当前设置到弹窗控件
      syncSettingsToUI();
      document.getElementById('settings-modal').classList.remove('hidden');
    });

    document.getElementById('btn-close-settings').addEventListener('click', () => {
      document.getElementById('settings-modal').classList.add('hidden');
      // 保存设置弹窗的所有值
      state.settings.speed = parseFloat(document.getElementById('setting-speed').value);
      state.settings.intervalMinutes = parseInt(document.getElementById('setting-interval').value);
      state.settings.autoPlay = document.getElementById('setting-autoplay').checked;
      // 如果有大小设置也读取
      const settingScale = document.getElementById('setting-card-scale');
      if (settingScale) {
        state.settings.cardScale = parseFloat(settingScale.value);
      }
      // 应用到播放器
      state.player.setSpeed(state.settings.speed);
      state.player.intervalMinutes = state.settings.intervalMinutes;
      state.player.autoPlay = state.settings.autoPlay;
      document.documentElement.style.setProperty('--card-scale', state.settings.cardScale);
      // 全局同步 + 持久化
      saveSettings();
      syncSettingsToUI();
    });

    // 点击弹窗外部关闭
    document.getElementById('settings-modal').addEventListener('click', (e) => {
      if (e.target.id === 'settings-modal') {
        document.getElementById('settings-modal').classList.add('hidden');
      }
    });
  }

  // ==================== TV 模式检测 ====================
  function isTVMode() {
    return (window.innerWidth >= 1200 && window.innerHeight >= 700 && window.innerWidth > window.innerHeight)
      || /TV|SmartTV|BRAVIA|SMART-TV|HbbTV|HUAWEI|HarmonyOS/i.test(navigator.userAgent);
  }

  function applyTVDefaults() {
    if (!isTVMode()) return;

    // 只在用户从未手动保存过设置时才应用TV默认值
    const hasSavedSettings = !!localStorage.getItem(SETTINGS_KEY);
    if (hasSavedSettings) return;

    // TV模式默认使用更大的卡片
    if (window.innerWidth >= 2500) {
      state.settings.cardScale = 2.8; // 4K TV
    } else {
      state.settings.cardScale = 2.2; // 1080p TV
    }

    // TV模式闪卡速度稍慢一些（远距离观看需要更多时间）
    state.settings.speed = 0.8;

    // 持久化TV默认设置
    saveSettings();
    syncSettingsToUI();
  }

  // ==================== 初始化 ====================
  function init() {
    renderCatalog();
    bindEvents();
    // 应用持久化的设置到UI
    syncSettingsToUI();
    // TV模式自动调整（仅首次）
    applyTVDefaults();
    showPage('catalog');
  }

  // 启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
