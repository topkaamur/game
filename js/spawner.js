/**
 * Спавн падающих гирек
 */

import { CONFIG } from './config.js';
import { state } from './state.js';
import { rand } from './utils.js';
import { getElements, showToast } from './ui.js';
import { refillWeightPool } from './weights.js';
import { makeDraggable } from './dragdrop.js';
import { updateHUD } from './game.js';

/**
 * Создать падающую гирьку
 */
export function spawnWeight() {
  if (!state.playing) return;

  const el = getElements();
  const cfg = CONFIG.levels[state.level];

  if (state.weightPool.length === 0) {
    refillWeightPool();
  }

  const v = state.weightPool.pop();
  const isBomb = v < 0;
  const displayValue = Math.abs(v);

  const w = document.createElement('div');
  w.className = isBomb ? 'falling-weight bomb' : 'falling-weight';
  w.textContent = isBomb ? '💣' : displayValue;
  w.dataset.value = v;
  w.dataset.isBomb = isBomb;

  const zoneWidth = el.fallZone.offsetWidth || 300;
  w.style.left = rand(15, Math.max(50, zoneWidth - 70)) + 'px';

  const fallVariation = cfg.fallTime * (0.85 + Math.random() * 0.3);
  w.style.animation = `fall ${Math.round(fallVariation)}ms linear forwards`;

  el.fallZone.appendChild(w);

  // Обработчики для поимки гирьки
  const handleCatch = (e) => {
    e.preventDefault();
    
    if (w.dataset.fallTimeout) {
      clearTimeout(parseInt(w.dataset.fallTimeout));
      delete w.dataset.fallTimeout;
    }

    // Если это бомба — штраф!
    if (isBomb) {
      const penalty = cfg.bombPenalty || 50;
      state.score = Math.max(0, state.score - penalty);
      showToast(`💥 Бомба! -${penalty}`, 'error', 1500);
      w.style.animation = 'explode 0.4s ease forwards';
      setTimeout(() => w.remove(), 400);
      updateHUD();
      return;
    }

    w.style.animationPlayState = 'paused';
    w.classList.add('caught');
  };

  w.addEventListener('touchstart', handleCatch, { passive: false });
  w.addEventListener('mousedown', handleCatch);

  // Только для обычных гирек
  if (!isBomb) {
    makeDraggable(w, 'falling');
  }

  // Таймаут пропуска гирьки
  const fallTimeout = setTimeout(() => {
    if (w.parentNode && !w.classList.contains('caught')) {
      w.style.animation = 'flyAway 0.3s ease forwards';
      setTimeout(() => w.remove(), 300);
      
      // Штраф только за пропуск обычных гирек, не бомб
      if (!isBomb) {
        state.score = Math.max(0, state.score - CONFIG.missedPenalty * cfg.mult);
        updateHUD();
      }
    }
  }, Math.round(fallVariation));

  w.dataset.fallTimeout = fallTimeout;
}

/**
 * Возобновить падение гирьки
 */
export function resumeFalling(weightEl) {
  if (!weightEl || !weightEl.parentNode) return;

  const el = getElements();
  const cfg = CONFIG.levels[state.level];
  
  weightEl.classList.remove('caught');
  weightEl.style.opacity = '1';
  weightEl.style.animationPlayState = 'running';

  const fallZoneRect = el.fallZone.getBoundingClientRect();
  const weightRect = weightEl.getBoundingClientRect();
  const currentTop = weightRect.top - fallZoneRect.top;

  if (currentTop >= 180) {
    weightEl.style.animation = 'flyAway 0.3s ease forwards';
    setTimeout(() => weightEl.remove(), 300);
    return;
  }

  const remainingDistance = 200 - currentTop;
  const remainingTime = Math.max((remainingDistance / 260) * cfg.fallTime, 400);

  weightEl.style.animation = 'none';
  weightEl.style.top = currentTop + 'px';
  void weightEl.offsetWidth; // Force reflow
  weightEl.style.animation = `fallResume ${remainingTime}ms linear forwards`;

  const timeoutId = setTimeout(() => {
    if (weightEl.parentNode && !weightEl.classList.contains('caught')) {
      weightEl.style.animation = 'flyAway 0.3s ease forwards';
      setTimeout(() => weightEl.remove(), 300);
      state.score = Math.max(0, state.score - CONFIG.missedPenalty * cfg.mult);
      updateHUD();
    }
  }, remainingTime);

  weightEl.dataset.fallTimeout = timeoutId;
}

/**
 * Начать спавн гирек
 */
export function startSpawning() {
  const cfg = CONFIG.levels[state.level];
  spawnWeight();
  state.spawnInt = setInterval(spawnWeight, cfg.spawnInterval);
}

/**
 * Остановить спавн гирек
 */
export function stopSpawning() {
  const el = getElements();
  clearInterval(state.spawnInt);
  el.fallZone.innerHTML = '';
}

export default { spawnWeight, resumeFalling, startSpawning, stopSpawning };
