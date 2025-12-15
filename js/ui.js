/**
 * UI компоненты - уведомления и DOM-элементы
 */

import { $ } from './utils.js';

// Кэш DOM-элементов
let elements = null;

/**
 * Инициализация и получение DOM-элементов
 */
export function getElements() {
  if (elements) return elements;

  elements = {
    // Экраны
    splash: $('splash-screen'),
    game: $('game-screen'),
    results: $('results-screen'),

    // Ввод
    nameInput: $('player-name'),

    // Кнопки
    btnStart: $('btn-start'),
    btnCheck: $('btn-check'),
    btnSkip: $('btn-skip'),
    btnRestart: $('btn-restart'),
    btnNewPlayer: $('btn-new-player'),
    btnClearSplash: $('btn-clear-splash'),
    btnClearResults: $('btn-clear-results'),

    // HUD
    hudLevel: $('hud-level'),
    hudRound: $('hud-round'),
    hudTime: $('hud-time'),
    hudScore: $('hud-score'),
    timeBar: $('time-bar'),
    roundDots: $('round-dots'),
    targetDisplay: $('target-display'),
    targetValue: $('target-value'),

    // Игровая область
    gameArea: $('game-area'),
    fallZone: $('fall-zone'),
    shelf: $('shelf'),
    beam: $('beam'),
    panLeft: $('pan-left'),
    panRight: $('pan-right'),
    panZoneLeft: $('pan-zone-left'),
    panZoneRight: $('pan-zone-right'),
    totalLeft: $('total-left'),
    totalRight: $('total-right'),

    // Результаты
    resultsTitle: $('results-title'),
    finalScore: $('final-score'),
    resultsMsg: $('results-msg'),
    statLevel: $('stat-level'),
    statRounds: $('stat-rounds'),
    statAcc: $('stat-acc'),

    // История
    splashHistory: $('splash-history'),
    splashHistoryList: $('splash-history-list'),
    resultsHistoryList: $('results-history-list'),

    // Тост
    toast: $('toast')
  };

  return elements;
}

/**
 * Показать уведомление
 */
export function showToast(msg, type = 'info', duration = 2000) {
  const el = getElements();
  el.toast.textContent = msg;
  el.toast.className = 'toast show ' + type;
  setTimeout(() => el.toast.classList.remove('show'), duration);
}

export default { getElements, showToast };

