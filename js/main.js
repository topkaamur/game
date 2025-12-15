/**
 * Главный модуль - инициализация и обработчики событий
 */

import { state } from './state.js';
import { showScreen } from './utils.js';
import { getElements, showToast } from './ui.js';
import { getHistory, clearHistory, renderHistory } from './storage.js';
import { selected, clearSelection, moveSelectedTo } from './selection.js';
import { startGame, startSingleLevel, startLevel, checkBalance, endGame } from './game.js';
import { initBackgroundParticles } from './effects.js';

/**
 * Обновить историю на стартовом экране
 */
function updateSplashHistory() {
  const el = getElements();
  const h = getHistory();
  
  if (h.length > 0) {
    el.splashHistory.style.display = 'block';
    renderHistory(el.splashHistoryList, h, 5);
  } else {
    el.splashHistory.style.display = 'none';
  }
}

/**
 * Инициализация приложения
 */
function init() {
  const el = getElements();

  // Кнопка старта (все уровни)
  el.btnStart.onclick = startGame;

  // Кнопки выбора уровня
  document.querySelectorAll('.level-btn').forEach(btn => {
    btn.onclick = () => {
      const levelIndex = parseInt(btn.dataset.level);
      startSingleLevel(levelIndex);
    };
  });

  // Кнопка проверки
  el.btnCheck.onclick = checkBalance;

  // Кнопка пропуска
  el.btnSkip.onclick = () => {
    if (confirm('Завершить игру?')) endGame('skipped');
  };

  // Кнопка рестарта
  el.btnRestart.onclick = () => {
    showScreen('game-screen');
    state.level = 0;
    state.score = 0;
    state.totalRounds = 0;
    state.successRounds = 0;
    startLevel();
  };

  // Кнопка смены игрока
  el.btnNewPlayer.onclick = () => {
    showScreen('splash-screen');
    el.nameInput.value = '';
    el.nameInput.focus();
    updateSplashHistory();
  };

  // Очистка истории (стартовый экран)
  el.btnClearSplash.onclick = () => {
    if (confirm('Очистить историю?')) {
      clearHistory();
      updateSplashHistory();
    }
  };

  // Очистка истории (результаты)
  el.btnClearResults.onclick = () => {
    if (confirm('Очистить историю?')) {
      clearHistory();
      renderHistory(el.resultsHistoryList, []);
    }
  };

  // Enter для старта
  el.nameInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') startGame();
  });

  // Горячие клавиши
  document.addEventListener('keydown', e => {
    const gameScreen = document.getElementById('game-screen');
    if (!gameScreen || !gameScreen.classList.contains('active')) return;
    if (document.activeElement.tagName === 'INPUT') return;

    const key = e.key.toLowerCase();

    if (key === 'a' || key === 'ф') {
      e.preventDefault();
      if (selected.el) moveSelectedTo('left');
      else showToast('Сначала кликни на гирьку', 'info', 1000);
    } else if (key === 'd' || key === 'в') {
      e.preventDefault();
      if (selected.el) moveSelectedTo('right');
      else showToast('Сначала кликни на гирьку', 'info', 1000);
    } else if (key === 'w' || key === 'ц') {
      e.preventDefault();
      if (selected.el) moveSelectedTo('shelf');
      else showToast('Сначала кликни на гирьку', 'info', 1000);
    } else if (key === ' ') {
      e.preventDefault();
      if (state.playing && !el.btnCheck.disabled) checkBalance();
    } else if (key === 'escape') {
      e.preventDefault();
      clearSelection(true);
    }
  });

  // Снять выделение при клике на пустое место
  el.gameArea.addEventListener('click', e => {
    if (!e.target.classList.contains('pan-weight') &&
        !e.target.classList.contains('shelf-weight') &&
        !e.target.classList.contains('falling-weight')) {
      clearSelection(true);
    }
  });

  // Инициализация фоновых частиц
  initBackgroundParticles();

  // Инициализация
  updateSplashHistory();
  el.nameInput.focus();

  // Показать рекорд
  const h = getHistory();
  if (h.length > 0) {
    const best = h.reduce((a, b) => a.score > b.score ? a : b);
    showToast(`🏆 Рекорд: ${best.name} — ${best.score}`, 'info', 3000);
  }
}

// Запуск после загрузки DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export default { init };

