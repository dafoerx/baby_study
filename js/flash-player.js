/**
 * 闪卡播放器
 * 控制闪卡的播放流程：session -> group -> equation -> parts
 */
class FlashPlayer {
  constructor() {
    this.currentSession = null;
    this.currentGroupIndex = 0;
    this.currentEquationIndex = 0;
    this.speed = 0.5; // 默认0.5秒
    this.intervalMinutes = 15;
    this.autoPlay = true;
    this.isPlaying = false;
    this.isPaused = false;
    this.cancelCurrentAnimation = null;
    this.countdownTimer = null;
    this.onStateChange = null; // 状态变化回调
  }

  /**
   * 加载一个session的数据
   */
  loadSession(sessionData, groupsData) {
    this.sessionData = sessionData;
    this.groups = groupsData;
    this.currentGroupIndex = 0;
    this.currentEquationIndex = 0;
    this.isPlaying = false;
    this.isPaused = false;
  }

  /**
   * 设置速度
   */
  setSpeed(speed) {
    this.speed = parseFloat(speed);
  }

  /**
   * 开始播放
   */
  play() {
    if (!this.groups || this.groups.length === 0) return;

    this.isPlaying = true;
    this.isPaused = false;
    this._notifyState('playing');
    this._playCurrentGroup();
  }

  /**
   * 暂停
   */
  pause() {
    this.isPaused = true;
    this._notifyState('paused');
    if (this.cancelCurrentAnimation) {
      this.cancelCurrentAnimation();
    }
  }

  /**
   * 继续
   */
  resume() {
    this.isPaused = false;
    this._notifyState('playing');
    this._playCurrentGroup();
  }

  /**
   * 停止
   */
  stop() {
    this.isPlaying = false;
    this.isPaused = false;
    if (this.cancelCurrentAnimation) {
      this.cancelCurrentAnimation();
    }
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
    this._notifyState('stopped');
  }

  /**
   * 跳到下一组
   */
  nextGroup() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
    if (this.cancelCurrentAnimation) {
      this.cancelCurrentAnimation();
    }

    this.currentGroupIndex++;
    this.currentEquationIndex = 0;

    if (this.currentGroupIndex >= this.groups.length) {
      this._notifyState('session-complete');
      return;
    }

    this._notifyState('group-change');
    this._playCurrentGroup();
  }

  /**
   * 播放当前组
   */
  _playCurrentGroup() {
    if (this.isPaused || !this.isPlaying) return;

    const group = this.groups[this.currentGroupIndex];
    if (!group) {
      this._notifyState('session-complete');
      return;
    }

    this.currentEquationIndex = 0;
    this._notifyState('group-start');
    this._playCurrentEquation();
  }

  /**
   * 播放当前等式
   */
  _playCurrentEquation() {
    if (this.isPaused || !this.isPlaying) return;

    const group = this.groups[this.currentGroupIndex];
    if (!group || this.currentEquationIndex >= group.equations.length) {
      // 当前组播放完毕
      this._onGroupComplete();
      return;
    }

    const equation = group.equations[this.currentEquationIndex];
    const container = document.getElementById('equation-display');
    container.innerHTML = '';

    const renderer = new EquationRenderer(equation, {
      speed: this.speed,
      size: 'large'
    });

    this.cancelCurrentAnimation = renderer.animateRender(container, () => {
      // 等式播放完成，等待一段时间后播放下一个
      setTimeout(() => {
        this.currentEquationIndex++;
        this._playCurrentEquation();
      }, this.speed * 1000 * 2); // 等式间等待2倍速度时间
    });
  }

  /**
   * 当前组播放完毕
   */
  _onGroupComplete() {
    if (this.currentGroupIndex >= this.groups.length - 1) {
      // 所有组都播放完了
      this._notifyState('session-complete');
      return;
    }

    // 还有下一组，显示倒计时或直接跳转
    this._notifyState('group-complete');

    if (this.autoPlay) {
      this._startCountdown();
    }
  }

  /**
   * 开始倒计时
   */
  _startCountdown() {
    let remaining = this.intervalMinutes * 60; // 秒
    this._notifyState('countdown-start', { remaining });

    this.countdownTimer = setInterval(() => {
      remaining--;
      this._notifyState('countdown-tick', { remaining });

      if (remaining <= 0) {
        clearInterval(this.countdownTimer);
        this.nextGroup();
      }
    }, 1000);
  }

  /**
   * 通知状态变化
   */
  _notifyState(state, data = {}) {
    if (this.onStateChange) {
      this.onStateChange(state, {
        ...data,
        currentGroup: this.currentGroupIndex,
        totalGroups: this.groups ? this.groups.length : 0,
        currentEquation: this.currentEquationIndex,
        isPlaying: this.isPlaying,
        isPaused: this.isPaused,
      });
    }
  }
}
