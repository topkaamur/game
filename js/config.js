/**
 * Конфигурация игры
 */

export const CONFIG = {
  // Настройки уровней
  levels: [
    {
      id: 1,
      name: 'Баланс',
      description: 'Уравновесь левую и правую чаши',
      type: 'balance',
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
      name: 'Точная сумма',
      description: 'Набери целевую сумму на каждой чаше',
      type: 'target',
      min: 1,
      max: 15,
      fallTime: 3500,
      spawnInterval: 1800,
      timeLimit: 70,
      rounds: 2,
      mult: 1.5,
      targetMin: 15,
      targetMax: 30
    },
    {
      id: 3,
      name: 'Ловушки',
      description: 'Не лови бомбы! Они отнимают очки',
      type: 'traps',
      min: 5,
      max: 25,
      fallTime: 3000,
      spawnInterval: 1000,
      timeLimit: 60,
      rounds: 2,
      mult: 2,
      bombChance: 0.5,
      bombPenalty: 50
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
