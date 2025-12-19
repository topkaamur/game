/**
 * Главный модуль - инициализация и обработчики событий
 */

(function (Game) {
  'use strict';

/**
 * Обновить историю на стартовом экране
 */
function updateSplashHistory() {
  const el = Game.getElements();
  const h = Game.getHistory();
  
  if (h.length > 0) {
    el.splashHistory.style.display = 'block';
    Game.renderHistory(el.splashHistoryList, h, 5);
  } else {
    el.splashHistory.style.display = 'none';
  }
}

/**
 * Инициализация приложения
 */
function init() {
  const el = Game.getElements();

  // Кнопка старта (все уровни)
  el.btnStart.onclick = Game.startGame;

  // Кнопки выбора уровня
  document.querySelectorAll('.level-btn').forEach(btn => {
    btn.onclick = () => {
      const levelIndex = parseInt(btn.dataset.level);
      Game.startSingleLevel(levelIndex);
    };
  });

  // Кнопка проверки
  el.btnCheck.onclick = Game.checkBalance;

  // Кнопка пропуска
  el.btnSkip.onclick = () => {
    if (confirm('Завершить игру?')) Game.endGame('skipped');
  };

  // Кнопка рестарта
  el.btnRestart.onclick = () => {
    Game.showScreen('game-screen');
    Game.state.level = 0;
    Game.state.score = 0;
    Game.state.totalRounds = 0;
    Game.state.successRounds = 0;
    Game.startLevel();
  };

  // Кнопка смены игрока
  el.btnNewPlayer.onclick = () => {
    Game.showScreen('splash-screen');
    el.nameInput.value = '';
    el.nameInput.focus();
    updateSplashHistory();
  };

  // Главное меню (после проигрыша) — без сброса имени
  if (el.btnMenu) {
    el.btnMenu.onclick = () => {
      Game.showScreen('splash-screen');
      updateSplashHistory();
      el.nameInput.focus();
    };
  }

  // Очистка истории (стартовый экран)
  el.btnClearSplash.onclick = () => {
    if (confirm('Очистить историю?')) {
      Game.clearHistory();
      updateSplashHistory();
    }
  };

  // Очистка истории (результаты)
  el.btnClearResults.onclick = () => {
    if (confirm('Очистить историю?')) {
      Game.clearHistory();
      Game.renderHistory(el.resultsHistoryList, []);
    }
  };

  // Enter для старта
  el.nameInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') Game.startGame();
  });

  // Горячие клавиши
  document.addEventListener('keydown', e => {
    const gameScreen = document.getElementById('game-screen');
    if (!gameScreen || !gameScreen.classList.contains('active')) return;
    if (document.activeElement.tagName === 'INPUT') return;

    const key = e.key.toLowerCase();

    if (key === 'a' || key === 'ф') {
      e.preventDefault();
      if (Game.selected.el) Game.moveSelectedTo('left');
      else Game.showToast('Сначала кликни на гирьку', 'info', 1000);
    } else if (key === 'd' || key === 'в') {
      e.preventDefault();
      if (Game.selected.el) Game.moveSelectedTo('right');
      else Game.showToast('Сначала кликни на гирьку', 'info', 1000);
    } else if (key === 'w' || key === 'ц') {
      e.preventDefault();
      if (Game.selected.el) Game.moveSelectedTo('shelf');
      else Game.showToast('Сначала кликни на гирьку', 'info', 1000);
    } else if (key === ' ') {
      e.preventDefault();
      if (Game.state.playing && !el.btnCheck.disabled) Game.checkBalance();
    } else if (key === 'escape') {
      e.preventDefault();
      Game.clearSelection(true);
    }
  });

  // Снять выделение при клике на пустое место
  el.gameArea.addEventListener('click', e => {
    if (!e.target.classList.contains('pan-weight') &&
        !e.target.classList.contains('shelf-weight') &&
        !e.target.classList.contains('falling-weight')) {
      Game.clearSelection(true);
    }
  });

  // Инициализация фоновых частиц
  Game.initBackgroundParticles();

  // Инициализация
  updateSplashHistory();
  el.nameInput.focus();

  // Показать рекорд
  const h = Game.getHistory();
  if (h.length > 0) {
    const best = h.reduce((a, b) => a.score > b.score ? a : b);
    Game.showToast(`🏆 Рекорд: ${best.name} — ${best.score}`, 'info', 3000);
  }
}

// Запуск после загрузки DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

Game.init = init;
})(window.Game = window.Game || {});

