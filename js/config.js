/**
 * Конфигурация игры
 */

export const CONFIG = {
  // Настройки уровней
  levels: [
    {
      id: 1,
      name: 'Лёгкий',
      min: 1,
      max: 10,
      fallTime: 4000,
      spawnInterval: 2000,
      timeLimit: 60,
      rounds: 2,
      mult: 1
    },
    {
      id: 2,
      name: 'Средний',
      min: 1,
      max: 25,
      fallTime: 3200,
      spawnInterval: 1700,
      timeLimit: 55,
      rounds: 2,
      mult: 1.5
    },
    {
      id: 3,
      name: 'Сложный',
      min: 5,
      max: 50,
      fallTime: 2500,
      spawnInterval: 1400,
      timeLimit: 50,
      rounds: 2,
      mult: 2
    }
  ],

  // Лимиты
  shelfMax: 3,
  panMax: 15,

  // Очки
  basePoints: 100,
  perfectBonus: 50,
  timeBonus: 1.5,
  wrongPenalty: 30,
  missedPenalty: 5,

  // Хранилище
  storageKey: 'weightGame_history',
  maxHistory: 50,

  // Drag & Drop
  dragThreshold: 5
};

export default CONFIG;

