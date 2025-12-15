/**
 * Генерация гирек с гарантией решения
 */

import { CONFIG } from './config.js';
import { state } from './state.js';
import { rand, shuffle } from './utils.js';

/**
 * Генерация набора гирек для целевой суммы
 */
function generateWeightsForSum(targetSum, count, min, max) {
  const weights = [];
  let remaining = targetSum;

  for (let i = 0; i < count - 1; i++) {
    const minNeeded = (count - i - 1) * min;
    const maxAllowed = remaining - minNeeded;

    if (maxAllowed < min) break;

    const w = rand(min, Math.min(max, maxAllowed));
    weights.push(w);
    remaining -= w;
  }

  if (remaining >= min && remaining <= max) {
    weights.push(remaining);
  } else if (remaining > max) {
    while (remaining > 0) {
      const w = Math.min(remaining, max);
      weights.push(w);
      remaining -= w;
    }
  } else if (remaining > 0) {
    weights.push(remaining);
  }

  return weights;
}

/**
 * Генерация гирек для уровня "Баланс"
 */
function generateBalanceWeights(cfg, count) {
  const weights = [];
  const minTarget = cfg.min * 2;
  const maxTarget = Math.min(cfg.max * 3, 100);
  const targetSum = Math.max(rand(minTarget, maxTarget), cfg.min * 2);

  const leftWeights = generateWeightsForSum(targetSum, rand(2, 4), cfg.min, cfg.max);
  const rightWeights = generateWeightsForSum(targetSum, rand(2, 4), cfg.min, cfg.max);

  weights.push(...leftWeights, ...rightWeights);

  const distractorCount = Math.max(0, count - weights.length);
  for (let i = 0; i < distractorCount; i++) {
    weights.push(rand(cfg.min, cfg.max));
  }

  return shuffle(weights);
}

/**
 * Генерация гирек для уровня "Точная сумма"
 */
function generateTargetWeights(cfg, count) {
  const weights = [];
  const target = rand(cfg.targetMin, cfg.targetMax);
  state.targetSum = target;

  // Гирьки для левой и правой чаши
  const leftWeights = generateWeightsForSum(target, rand(2, 4), cfg.min, cfg.max);
  const rightWeights = generateWeightsForSum(target, rand(2, 4), cfg.min, cfg.max);

  weights.push(...leftWeights, ...rightWeights);

  // Добавляем отвлекающие гирьки
  const distractorCount = Math.max(0, count - weights.length);
  for (let i = 0; i < distractorCount; i++) {
    weights.push(rand(cfg.min, cfg.max));
  }

  return shuffle(weights);
}

/**
 * Генерация гирек для уровня "Ловушки"
 */
function generateTrapsWeights(cfg, count) {
  const weights = [];
  const minTarget = cfg.min * 2;
  const maxTarget = Math.min(cfg.max * 3, 100);
  const targetSum = Math.max(rand(minTarget, maxTarget), cfg.min * 2);

  // Обычные гирьки для решения
  const leftWeights = generateWeightsForSum(targetSum, rand(2, 4), cfg.min, cfg.max);
  const rightWeights = generateWeightsForSum(targetSum, rand(2, 4), cfg.min, cfg.max);

  weights.push(...leftWeights, ...rightWeights);

  // Добавляем отвлекающие гирьки
  const distractorCount = Math.max(0, count - weights.length);
  for (let i = 0; i < distractorCount; i++) {
    weights.push(rand(cfg.min, cfg.max));
  }

  // Добавляем бомбы (отрицательные значения как маркер)
  const bombCount = Math.floor(count * cfg.bombChance);
  for (let i = 0; i < bombCount; i++) {
    weights.push(-rand(cfg.min, cfg.max)); // Отрицательное = бомба
  }

  return shuffle(weights);
}

/**
 * Пополнить пул гирек в зависимости от типа уровня
 */
export function refillWeightPool() {
  const cfg = CONFIG.levels[state.level];
  const count = rand(12, 20);

  switch (cfg.type) {
    case 'target':
      state.weightPool = generateTargetWeights(cfg, count);
      break;
    case 'traps':
      state.weightPool = generateTrapsWeights(cfg, count);
      break;
    case 'balance':
    default:
      state.weightPool = generateBalanceWeights(cfg, count);
      break;
  }
}

export default { refillWeightPool };
