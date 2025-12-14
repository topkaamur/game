/**
 * Управление весами и чашами
 */

import { CONFIG } from './config.js';
import { state } from './state.js';
import { getElements } from './ui.js';
import { makeDraggable } from './dragdrop.js';

/**
 * Обновить визуал весов
 */
export function updateScale() {
  const el = getElements();
  const L = state.leftW.reduce((a, b) => a + b, 0);
  const R = state.rightW.reduce((a, b) => a + b, 0);

  el.totalLeft.textContent = L;
  el.totalRight.textContent = R;

  // Угол наклона
  const diff = L - R;
  const angle = Math.max(-12, Math.min(12, (diff / 50) * 12));
  el.beam.style.transform = `translateX(-50%) rotate(${-angle}deg)`;

  // Смещение чаш
  const shift = Math.abs(angle) * 3.5;
  if (L > R) {
    el.panZoneLeft.style.transform = `translateY(${shift}px)`;
    el.panZoneRight.style.transform = `translateY(${-shift}px)`;
  } else if (R > L) {
    el.panZoneLeft.style.transform = `translateY(${-shift}px)`;
    el.panZoneRight.style.transform = `translateY(${shift}px)`;
  } else {
    el.panZoneLeft.style.transform = 'translateY(0)';
    el.panZoneRight.style.transform = 'translateY(0)';
  }

  // Кнопка проверки
  el.btnCheck.disabled = !(L > 0 || R > 0);
  el.btnCheck.style.opacity = (L === R && L > 0) ? '1' : '0.7';
}

/**
 * Отрендерить чашу
 */
export function renderPan(panEl, weights) {
  const side = panEl.dataset.side;
  panEl.innerHTML = weights.map(w => 
    `<div class="pan-weight" data-value="${w}">${w}</div>`
  ).join('');
  panEl.querySelectorAll('.pan-weight').forEach(w => makeDraggable(w, side));
}

/**
 * Отрендерить полку
 */
export function renderShelf() {
  const el = getElements();
  el.shelf.querySelectorAll('.shelf-weight').forEach(w => w.remove());
  
  state.shelfW.forEach(w => {
    const div = document.createElement('div');
    div.className = 'shelf-weight';
    div.dataset.value = w;
    div.textContent = w;
    makeDraggable(div, 'shelf');
    el.shelf.appendChild(div);
  });
}

/**
 * Перерендерить все
 */
export function renderAll() {
  const el = getElements();
  renderPan(el.panLeft, state.leftW);
  renderPan(el.panRight, state.rightW);
  renderShelf();
  updateScale();
}

export default { updateScale, renderPan, renderShelf, renderAll };

