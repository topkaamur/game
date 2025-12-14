/**
 * Утилиты
 */

/**
 * Получение элемента по ID
 */
export const $ = (id) => document.getElementById(id);

/**
 * Случайное число в диапазоне [a, b]
 */
export const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

/**
 * Перемешивание массива (Fisher-Yates)
 */
export function shuffle(arr) {
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
export function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(id).classList.add('active');
}

/**
 * Проверка попадания точки в элемент
 */
export function isOver(pos, elem) {
  const r = elem.getBoundingClientRect();
  return pos.clientX >= r.left && pos.clientX <= r.right &&
         pos.clientY >= r.top && pos.clientY <= r.bottom;
}

export default { $, rand, shuffle, showScreen, isOver };

