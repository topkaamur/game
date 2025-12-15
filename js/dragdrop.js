/**
 * Drag & Drop система
 */

import { CONFIG } from './config.js';
import { state } from './state.js';
import { isOver } from './utils.js';
import { getElements, showToast } from './ui.js';
import { renderAll } from './scale.js';
import { selectWeight, selectFallingWeight } from './selection.js';
import { resumeFalling } from './spawner.js';

// Состояние перетаскивания
let ghost = null;
let dragData = { value: null, from: null, el: null };
let dragStartPos = null;
let isDragging = false;

/**
 * Сделать элемент перетаскиваемым
 */
export function makeDraggable(element, from) {
  element.addEventListener('touchstart', e => startDrag(e, element, from), { passive: false });
  element.addEventListener('mousedown', e => startDrag(e, element, from));
  
  // Дабл-клик — переместить на полку
  element.addEventListener('dblclick', e => {
    e.preventDefault();
    moveToShelfOnDoubleClick(element, from);
  });
}

/**
 * Переместить гирьку на полку по дабл-клику
 */
function moveToShelfOnDoubleClick(element, from) {
  if (!state.playing) return;
  if (from === 'shelf') return; // Уже на полке
  
  const value = parseInt(element.dataset.value);
  
  // Проверяем лимит полки
  if (state.shelfW.length >= CONFIG.shelfMax) {
    showToast('📦 Полка заполнена!', 'error', 1000);
    return;
  }
  
  // Удаляем из источника
  if (from === 'falling') {
    if (element.dataset.fallTimeout) {
      clearTimeout(parseInt(element.dataset.fallTimeout));
    }
    element.remove();
  } else if (from === 'left') {
    const i = state.leftW.indexOf(value);
    if (i > -1) state.leftW.splice(i, 1);
  } else if (from === 'right') {
    const i = state.rightW.indexOf(value);
    if (i > -1) state.rightW.splice(i, 1);
  }
  
  // Добавляем на полку
  state.shelfW.push(value);
  
  showToast(`📦 +${value} на полку`, 'success', 800);
  renderAll();
}

/**
 * Начало перетаскивания
 */
function startDrag(e, element, from) {
  e.preventDefault();

  const pos = e.touches ? e.touches[0] : e;
  dragStartPos = { x: pos.clientX, y: pos.clientY };
  isDragging = false;

  dragData.value = parseInt(element.dataset.value);
  dragData.from = from;
  dragData.el = element;

  if (e.touches) {
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
  } else {
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
  }
}

/**
 * Начать фактическое перетаскивание
 */
function beginActualDrag() {
  if (isDragging) return;
  isDragging = true;

  const el = getElements();
  dragData.el.style.opacity = '0.4';

  ghost = document.createElement('div');
  ghost.className = 'weight-ghost';
  ghost.textContent = dragData.value;
  document.body.appendChild(ghost);

  if (state.leftW.length < CONFIG.panMax) el.panLeft.classList.add('drag-over');
  if (state.rightW.length < CONFIG.panMax) el.panRight.classList.add('drag-over');
  if (state.shelfW.length < CONFIG.shelfMax && dragData.from !== 'shelf') {
    el.shelf.classList.add('drag-over');
  }
}

/**
 * Движение при перетаскивании
 */
function onMove(e) {
  e.preventDefault();
  const pos = e.touches ? e.touches[0] : e;

  // Проверяем порог для начала перетаскивания
  if (!isDragging && dragStartPos) {
    const dx = pos.clientX - dragStartPos.x;
    const dy = pos.clientY - dragStartPos.y;
    if (Math.abs(dx) > CONFIG.dragThreshold || Math.abs(dy) > CONFIG.dragThreshold) {
      beginActualDrag();
    }
  }

  if (!isDragging) return;

  const el = getElements();
  moveGhost(pos.clientX, pos.clientY);

  const shelfFull = state.shelfW.length >= CONFIG.shelfMax;
  const leftFull = state.leftW.length >= CONFIG.panMax;
  const rightFull = state.rightW.length >= CONFIG.panMax;

  const overLeft = isOver(pos, el.panLeft);
  const overRight = isOver(pos, el.panRight);
  const overShelf = isOver(pos, el.shelf) && dragData.from !== 'shelf';

  el.panLeft.classList.toggle('drag-over', overLeft && !leftFull);
  el.panLeft.classList.toggle('pan-full', overLeft && leftFull);
  el.panRight.classList.toggle('drag-over', overRight && !rightFull);
  el.panRight.classList.toggle('pan-full', overRight && rightFull);
  el.shelf.classList.toggle('drag-over', overShelf && !shelfFull);
  el.shelf.classList.toggle('shelf-full', overShelf && shelfFull);
}

/**
 * Окончание перетаскивания
 */
function onEnd(e) {
  const pos = e.changedTouches ? e.changedTouches[0] : e;
  const el = getElements();

  // Если не было перетаскивания — это клик для выделения
  if (!isDragging && dragData.el) {
    if (dragData.from === 'falling') {
      selectFallingWeight(dragData.el);
    } else {
      selectWeight(dragData.el, dragData.from);
    }
    cleanupDrag();
    return;
  }

  let target = null;
  let dropFailed = false;

  const shelfFull = state.shelfW.length >= CONFIG.shelfMax;
  const leftFull = state.leftW.length >= CONFIG.panMax;
  const rightFull = state.rightW.length >= CONFIG.panMax;

  if (isOver(pos, el.panLeft)) {
    if (leftFull) {
      showToast('⚖️ Левая чаша полная!', 'error', 1500);
      el.panLeft.classList.add('shake-pan');
      setTimeout(() => el.panLeft.classList.remove('shake-pan'), 300);
      dropFailed = true;
    } else {
      target = 'left';
    }
  } else if (isOver(pos, el.panRight)) {
    if (rightFull) {
      showToast('⚖️ Правая чаша полная!', 'error', 1500);
      el.panRight.classList.add('shake-pan');
      setTimeout(() => el.panRight.classList.remove('shake-pan'), 300);
      dropFailed = true;
    } else {
      target = 'right';
    }
  } else if (isOver(pos, el.shelf) && dragData.from !== 'shelf') {
    if (shelfFull) {
      showToast('📦 Полка заполнена!', 'error', 1500);
      el.shelf.classList.add('shake');
      setTimeout(() => el.shelf.classList.remove('shake'), 300);
      dropFailed = true;
    } else {
      target = 'shelf';
    }
  }

  if (target && !dropFailed) {
    dropWeight(target);
  } else if (dragData.from === 'falling' && dragData.el) {
    resumeFalling(dragData.el);
  }

  cleanupDrag();
}

/**
 * Очистка после перетаскивания
 */
function cleanupDrag() {
  const el = getElements();

  if (dragData.el && dragData.from !== 'falling') {
    dragData.el.style.opacity = '1';
  }
  if (ghost) {
    ghost.remove();
    ghost = null;
  }

  el.panLeft.classList.remove('drag-over', 'pan-full');
  el.panRight.classList.remove('drag-over', 'pan-full');
  el.shelf.classList.remove('drag-over', 'shelf-full');

  dragData = { value: null, from: null, el: null };
  dragStartPos = null;
  isDragging = false;

  document.removeEventListener('touchmove', onMove);
  document.removeEventListener('touchend', onEnd);
  document.removeEventListener('mousemove', onMove);
  document.removeEventListener('mouseup', onEnd);
}

/**
 * Перемещение призрака
 */
function moveGhost(x, y) {
  if (ghost) {
    ghost.style.left = x + 'px';
    ghost.style.top = y + 'px';
  }
}

/**
 * Сбросить гирьку в цель
 */
function dropWeight(target) {
  const v = dragData.value;
  const from = dragData.from;

  // Удаляем из источника
  if (from === 'shelf') {
    const i = state.shelfW.indexOf(v);
    if (i > -1) state.shelfW.splice(i, 1);
  } else if (from === 'left') {
    const i = state.leftW.indexOf(v);
    if (i > -1) state.leftW.splice(i, 1);
  } else if (from === 'right') {
    const i = state.rightW.indexOf(v);
    if (i > -1) state.rightW.splice(i, 1);
  } else if (from === 'falling') {
    if (dragData.el && dragData.el.parentNode) {
      dragData.el.remove();
    }
  }

  // Добавляем в цель
  if (target === 'left') state.leftW.push(v);
  else if (target === 'right') state.rightW.push(v);
  else if (target === 'shelf' && state.shelfW.length < CONFIG.shelfMax) {
    state.shelfW.push(v);
  }

  renderAll();
}

export default { makeDraggable };

