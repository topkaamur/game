/**
 * Работа с localStorage - история игр
 */

(function (Game) {
  'use strict';

  /**
   * Получить историю игр
   */
  function getHistory() {
    const CONFIG = Game.CONFIG;
    try {
      return JSON.parse(localStorage.getItem(CONFIG.storageKey)) || [];
    } catch {
      return [];
    }
  }

  /**
   * Сохранить результат игры
   */
  function saveGame(result) {
    const CONFIG = Game.CONFIG;
    const state = Game.state;
    let history = getHistory();
    const accuracy = state.totalRounds > 0
      ? Math.round((state.successRounds / state.totalRounds) * 100)
      : 0;
    const now = new Date();

    history.unshift({
      id: Date.now(),
      name: state.name,
      score: Math.round(state.score),
      level: state.level + 1,
      rounds: state.successRounds,
      accuracy,
      result,
      date: now.toLocaleDateString('ru-RU'),
      time: now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    });

    history = history.slice(0, CONFIG.maxHistory);
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(history));
    return history;
  }

  /**
   * Очистить историю
   */
  function clearHistory() {
    const CONFIG = Game.CONFIG;
    localStorage.removeItem(CONFIG.storageKey);
    Game.showToast?.('История очищена');
  }

  /**
   * Эмодзи для результата
   */
  function getResultEmoji(result) {
    const emojis = {
      complete: '🏆',
      time: '⏰',
      failed: '❌',
      skipped: '⏭️'
    };
    return emojis[result] || '🎮';
  }

  /**
   * Отрендерить список истории
   */
  function renderHistory(listEl, history, limit = 10) {
    if (!history.length) {
      listEl.innerHTML = '<li class="history-item"><span style="color:var(--muted)">Пусто</span></li>';
      return;
    }

    listEl.innerHTML = history.slice(0, limit).map((game, i) => `
      <li class="history-item ${i === 0 ? 'current' : ''}">
        <span class="history-emoji">${getResultEmoji(game.result)}</span>
        <div class="history-info">
          <div class="history-name">${game.name}</div>
          <div class="history-details">Ур.${game.level} • ${game.rounds}р • ${game.accuracy}%</div>
        </div>
        <div class="history-right">
          <div class="history-score">${game.score}</div>
          <div class="history-date">${game.date}</div>
        </div>
      </li>
    `).join('');
  }

  Game.getHistory = getHistory;
  Game.saveGame = saveGame;
  Game.clearHistory = clearHistory;
  Game.getResultEmoji = getResultEmoji;
  Game.renderHistory = renderHistory;
})(window.Game = window.Game || {});

