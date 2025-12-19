/**
 * Утилиты
 */

(function (Game) {
  'use strict';

  /**
   * Получение элемента по ID
   */
  const $ = (id) => document.getElementById(id);

  /**
   * Случайное число в диапазоне [a, b]
   */
  const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

  /**
   * Перемешивание массива (Fisher-Yates)
   */
  function shuffle(arr) {
    const result = [...arr];
    for (let pass = 0; pass < 3; pass++) {
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }
    }
    return result;
  }

  /**
   * Показать экран по ID
   */
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    $(id).classList.add('active');
  }

  /**
   * Проверка попадания точки в элемент
   */
  function isOver(pos, elem) {
    const r = elem.getBoundingClientRect();
    return pos.clientX >= r.left && pos.clientX <= r.right &&
           pos.clientY >= r.top && pos.clientY <= r.bottom;
  }

  Game.$ = $;
  Game.rand = rand;
  Game.shuffle = shuffle;
  Game.showScreen = showScreen;
  Game.isOver = isOver;
})(window.Game = window.Game || {});

