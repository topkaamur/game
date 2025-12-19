/**
 * Выделение гирек (для клавиатурного управления)
 */

(function (Game) {
  'use strict';

// Текущая выделенная гирька
const selected = {
  el: null,
  from: null,
  value: null
};

function isMobileLikeDevice() {
  // max-width — “маленькие устройства”, pointer:coarse — тач-устройства
  return window.matchMedia('(max-width: 768px)').matches || window.matchMedia('(pointer: coarse)').matches;
}

/**
 * Выделить гирьку на чаше/полке
 */
function selectWeight(element, from) {
  const state = Game.state;
  if (!state.playing) return;
  clearSelection(true);
  selected.el = element;
  selected.from = from;
  selected.value = parseInt(element.dataset.value);
  element.classList.add('selected');
  if (!isMobileLikeDevice()) {
    Game.showToast(`Гирька ${selected.value} — A/D/W`, 'info', 1200);
  }
}

/**
 * Выделить падающую гирьку
 */
function selectFallingWeight(element) {
  const state = Game.state;
  if (!state.playing) return;
  clearSelection(true);
  selected.el = element;
  selected.from = 'falling';
  selected.value = parseInt(element.dataset.value);
  element.classList.add('selected');
  if (!isMobileLikeDevice()) {
    Game.showToast(`Поймана ${selected.value} — A/D/W`, 'success', 1200);
  }
}

/**
 * Снять выделение
 */
function clearSelection(resumePrevious = false) {
  if (selected.el) {
    selected.el.classList.remove('selected');
    // Возобновить падение если была падающая гирька
    if (resumePrevious && selected.from === 'falling' && selected.el.parentNode) {
      Game.resumeFalling(selected.el);
    }
  }
  selected.el = null;
  selected.from = null;
  selected.value = null;
}

/**
 * Переместить выделенную гирьку
 */
function moveSelectedTo(target) {
  const CONFIG = Game.CONFIG;
  const state = Game.state;
  if (!selected.el || !state.playing) return;

  // Проверка лимитов
  if (target === 'left' && state.leftW.length >= CONFIG.panMax) {
    Game.showToast('⚖️ Левая чаша полная!', 'error', 1000);
    const pan = document.getElementById('pan-left');
    pan.classList.add('shake-pan');
    setTimeout(() => pan.classList.remove('shake-pan'), 400);
    return;
  }
  if (target === 'right' && state.rightW.length >= CONFIG.panMax) {
    Game.showToast('⚖️ Правая чаша полная!', 'error', 1000);
    const pan = document.getElementById('pan-right');
    pan.classList.add('shake-pan');
    setTimeout(() => pan.classList.remove('shake-pan'), 400);
    return;
  }
  if (target === 'shelf' && state.shelfW.length >= CONFIG.shelfMax) {
    Game.showToast('📦 Полка заполнена!', 'error', 1000);
    const shelf = document.getElementById('shelf');
    shelf.classList.add('shake');
    setTimeout(() => shelf.classList.remove('shake'), 400);
    return;
  }
  if (target === selected.from) return;

  // Удаляем из источника
  if (selected.from === 'falling') {
    if (selected.el && selected.el.parentNode) {
      selected.el.remove();
    }
  } else {
    const arr = selected.from === 'left' ? state.leftW 
              : selected.from === 'right' ? state.rightW 
              : state.shelfW;
    const i = arr.indexOf(selected.value);
    if (i > -1) arr.splice(i, 1);
  }

  // Добавляем в цель
  if (target === 'left') state.leftW.push(selected.value);
  else if (target === 'right') state.rightW.push(selected.value);
  else state.shelfW.push(selected.value);

  clearSelection();
  Game.renderAll();
}

Game.selected = selected;
Game.selectWeight = selectWeight;
Game.selectFallingWeight = selectFallingWeight;
Game.clearSelection = clearSelection;
Game.moveSelectedTo = moveSelectedTo;
})(window.Game = window.Game || {});

