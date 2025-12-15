/**
 * Основная игровая логика
 */

import { CONFIG } from './config.js';
import { state, resetRoundState } from './state.js';
import { $, showScreen } from './utils.js';
import { getElements, showToast } from './ui.js';
import { renderAll, updateScale } from './scale.js';
import { refillWeightPool } from './weights.js';
import { startSpawning, stopSpawning } from './spawner.js';
import { saveGame, renderHistory } from './storage.js';
import { showConfetti, showLoseEffect, showSuccessRound } from './effects.js';

/**
 * Обновить HUD
 */
export function updateHUD() {
  const el = getElements();
  const cfg = CONFIG.levels[state.level];

  el.hudLevel.textContent = cfg.id;
  el.hudRound.textContent = `${state.round + 1}/${cfg.rounds}`;
  el.hudScore.textContent = Math.round(state.score);
  el.hudTime.textContent = state.timeLeft;

  // Стили времени
  el.hudTime.classList.remove('warning', 'danger');
  if (state.timeLeft <= 10) el.hudTime.classList.add('danger');
  else if (state.timeLeft <= 20) el.hudTime.classList.add('warning');

  // Таймер-бар
  const pct = (state.timeLeft / cfg.timeLimit) * 100;
  el.timeBar.style.width = pct + '%';
  el.timeBar.classList.remove('warning', 'danger');
  if (pct <= 20) el.timeBar.classList.add('danger');
  else if (pct <= 40) el.timeBar.classList.add('warning');

  // Целевая сумма для уровня 2
  if (el.targetDisplay) {
    if (cfg.type === 'target' && state.targetSum > 0) {
      el.targetDisplay.style.display = 'block';
      el.targetValue.textContent = state.targetSum;
    } else {
      el.targetDisplay.style.display = 'none';
    }
  }
}

/**
 * Отрендерить точки раундов
 */
export function renderRoundDots() {
  const el = getElements();
  const cfg = CONFIG.levels[state.level];
  
  el.roundDots.innerHTML = '';
  for (let i = 0; i < cfg.rounds; i++) {
    const d = document.createElement('div');
    d.className = 'round-dot';
    if (i < state.roundResults.length) {
      d.classList.add(state.roundResults[i] ? 'done' : 'failed');
    } else if (i === state.round) {
      d.classList.add('current');
    }
    el.roundDots.appendChild(d);
  }
}

/**
 * Начать игру (все уровни с начала)
 */
export function startGame() {
  const el = getElements();
  state.name = el.nameInput.value.trim() || 'Игрок';
  state.level = 0;
  state.score = 0;
  state.totalRounds = 0;
  state.successRounds = 0;
  state.singleLevel = false;
  showScreen('game-screen');
  startLevel();
}

/**
 * Начать конкретный уровень
 */
export function startSingleLevel(levelIndex) {
  const el = getElements();
  state.name = el.nameInput.value.trim() || 'Игрок';
  state.level = levelIndex;
  state.score = 0;
  state.totalRounds = 0;
  state.successRounds = 0;
  state.singleLevel = true; // Режим одного уровня
  showScreen('game-screen');
  startLevel();
}

/**
 * Начать уровень
 */
export function startLevel() {
  const cfg = CONFIG.levels[state.level];
  state.round = 0;
  state.roundResults = [];
  state.timeLeft = cfg.timeLimit;
  state.playing = true;
  
  // Показать подсказку по уровню
  showToast(`${cfg.name}: ${cfg.description}`, 'info', 3000);
  
  updateHUD();
  renderRoundDots();
  startRound();
  startTimer();
}

/**
 * Начать раунд
 */
export function startRound() {
  const el = getElements();
  resetRoundState();
  refillWeightPool();
  el.panLeft.innerHTML = '';
  el.panRight.innerHTML = '';
  renderAll();
  stopSpawning();
  startSpawning();
  updateHUD();
}

/**
 * Запустить таймер
 */
export function startTimer() {
  clearInterval(state.timerInt);
  state.timerInt = setInterval(() => {
    if (!state.playing) return;
    state.timeLeft--;
    updateHUD();
    if (state.timeLeft <= 0) endGame('time');
  }, 1000);
}

/**
 * Проверить баланс/условие победы
 */
export function checkBalance() {
  if (!state.playing) return;

  const el = getElements();
  const cfg = CONFIG.levels[state.level];
  const L = state.leftW.reduce((a, b) => a + b, 0);
  const R = state.rightW.reduce((a, b) => a + b, 0);

  if (L === 0 && R === 0) return;

  let success = false;
  let message = '';

  // Проверка в зависимости от типа уровня
  switch (cfg.type) {
    case 'target':
      // Уровень 2: обе чаши должны иметь целевую сумму
      success = (L === state.targetSum && R === state.targetSum);
      if (success) {
        message = `✓ Обе чаши = ${state.targetSum}!`;
      } else {
        message = `Нужно ${state.targetSum} на каждой чаше (сейчас: ${L} и ${R})`;
      }
      break;

    case 'traps':
    case 'balance':
    default:
      // Уровень 1 и 3: баланс чаш
      success = (L === R && L > 0);
      message = success ? '✓ Баланс!' : `Не равно! (${L} ≠ ${R})`;
      break;
  }

  if (success) {
    // Успех — останавливаем раунд и начисляем очки
    state.totalRounds++;
    state.successRounds++;
    state.playing = false;
    el.btnCheck.disabled = true;
    stopSpawning();

    let pts = CONFIG.basePoints * cfg.mult;
    if (state.leftW.length + state.rightW.length >= 4) pts += CONFIG.perfectBonus;
    pts += state.timeLeft * CONFIG.timeBonus * cfg.mult;
    state.score += pts;
    state.roundResults.push(true);
    
    showRoundMsg(true, pts, message);
    updateHUD();
    renderRoundDots();
  } else {
    // Неудача — просто показываем предупреждение, игра продолжается
    const pen = CONFIG.wrongPenalty * cfg.mult;
    state.score = Math.max(0, state.score - pen);
    
    el.beam.classList.add('shake');
    setTimeout(() => el.beam.classList.remove('shake'), 250);
    
    // Красная пульсация фона
    document.querySelector('.game-wrapper').classList.add('lose-pulse');
    setTimeout(() => document.querySelector('.game-wrapper').classList.remove('lose-pulse'), 500);
    
    showToast(`❌ ${message} (-${Math.round(pen)})`, 'error', 2000);
    updateHUD();
  }
}

/**
 * Показать сообщение раунда
 */
function showRoundMsg(ok, pts, message) {
  const el = getElements();
  state.playing = false;
  el.btnCheck.disabled = true;

  // Эффект успеха
  if (ok) {
    showSuccessRound();
    document.querySelector('.game-wrapper').classList.add('win-pulse');
    setTimeout(() => document.querySelector('.game-wrapper').classList.remove('win-pulse'), 500);
  }

  const msg = document.createElement('div');
  msg.className = 'game-msg ' + (ok ? 'success' : 'fail');
  msg.innerHTML = `
    <h2>${message}</h2>
    <p>${ok ? 'Отлично!' : 'Попробуйте ещё!'}</p>
    <div class="pts ${pts >= 0 ? 'plus' : 'minus'}">${pts >= 0 ? '+' : ''}${Math.round(pts)}</div>
  `;
  el.gameArea.appendChild(msg);

  setTimeout(() => {
    msg.remove();
    nextRound();
  }, 1200);
}

/**
 * Следующий раунд
 */
function nextRound() {
  const cfg = CONFIG.levels[state.level];
  const wins = state.roundResults.filter(r => r).length;

  if (wins >= cfg.rounds) {
    showLevelComplete();
  } else if (state.roundResults.length >= cfg.rounds + 2) {
    endGame('failed');
  } else {
    state.round++;
    state.playing = true;
    startRound();
  }
}

/**
 * Показать завершение уровня
 */
function showLevelComplete() {
  const el = getElements();
  state.playing = false;
  stopSpawning();

  state.leftW = [];
  state.rightW = [];
  state.shelfW = [];
  renderAll();
  el.btnCheck.disabled = true;

  // Конфетти при завершении уровня
  showConfetti();

  const cfg = CONFIG.levels[state.level];
  const bonus = 150 * cfg.mult;
  state.score += bonus;

  const nextLevel = !state.singleLevel ? CONFIG.levels[state.level + 1] : null;

  const ov = document.createElement('div');
  ov.className = 'level-overlay';
  ov.innerHTML = `
    <div class="level-card">
      <h2>🎉 Уровень ${cfg.id} пройден!</h2>
      <div class="stats">
        <div class="stat">
          <div class="stat-value">+${Math.round(bonus)}</div>
          <div class="stat-label">Бонус</div>
        </div>
        <div class="stat">
          <div class="stat-value">${Math.round(state.score)}</div>
          <div class="stat-label">Всего</div>
        </div>
      </div>
      ${nextLevel
        ? `<p><b>${nextLevel.name}</b>: ${nextLevel.description}</p>
           <button class="btn-start" id="btn-next">▶ Далее</button>`
        : `<p style="color:var(--lime)">${state.singleLevel ? 'Уровень завершён!' : 'Все уровни пройдены!'}</p>
           <button class="btn-start" id="btn-finish">🏆 Финиш</button>`}
    </div>
  `;
  el.gameArea.appendChild(ov);

  const btnId = nextLevel ? 'btn-next' : 'btn-finish';
  $(btnId).onclick = () => {
    ov.remove();
    if (nextLevel) {
      state.level++;
      startLevel();
    } else {
      endGame('complete');
    }
  };
}

/**
 * Завершить игру
 */
export function endGame(reason) {
  const el = getElements();
  state.playing = false;
  el.btnCheck.disabled = true;
  clearInterval(state.timerInt);
  stopSpawning();

  const h = saveGame(reason);

  const cfg = CONFIG.levels[state.level];
  
  // Эффекты в зависимости от результата
  if (reason === 'complete') {
    showConfetti();
  } else if (reason === 'time' || reason === 'failed') {
    showLoseEffect();
  }
  
  const titles = {
    complete: '🏆 Победа!',
    time: '⏰ Время вышло!',
    failed: '❌ Игра окончена',
    skipped: '⏭️ Пропущено'
  };

  const msgs = {
    complete: state.singleLevel 
      ? `Уровень «${cfg.name}» пройден!` 
      : 'Вы прошли все уровни!',
    time: 'Попробуйте ещё!',
    failed: 'Много ошибок',
    skipped: ''
  };

  el.resultsTitle.textContent = titles[reason] || 'Конец';
  el.resultsTitle.className = reason === 'complete' ? 'win' : 'lose';
  el.resultsMsg.textContent = msgs[reason] || '';
  el.finalScore.textContent = Math.round(state.score);
  el.statLevel.textContent = state.level + 1;
  el.statRounds.textContent = state.successRounds;
  el.statAcc.textContent = state.totalRounds > 0
    ? Math.round((state.successRounds / state.totalRounds) * 100) + '%'
    : '—';

  renderHistory(el.resultsHistoryList, h, 10);
  showScreen('results-screen');
}

export default {
  updateHUD,
  renderRoundDots,
  startGame,
  startSingleLevel,
  startLevel,
  startRound,
  checkBalance,
  endGame
};
