/**
 * Работа с localStorage - история игр
 */

import { CONFIG } from './config.js';
import { state } from './state.js';
import { showToast } from './ui.js';

/**
 * Получить историю игр
 */
export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(CONFIG.storageKey)) || [];
  } catch {
    return [];
  }
}

/**
 * Сохранить результат игры
 */
export function saveGame(result) {
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
export function clearHistory() {
  localStorage.removeItem(CONFIG.storageKey);
  showToast('История очищена');
}

/**
 * Эмодзи для результата
 */
export function getResultEmoji(result) {
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
export function renderHistory(listEl, history, limit = 10) {
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

export default { getHistory, saveGame, clearHistory, renderHistory };

