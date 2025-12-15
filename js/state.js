/**
 * Состояние игры
 */

// Начальное состояние
const initialState = {
  name: '',
  level: 0,
  round: 0,
  score: 0,
  timeLeft: 0,
  leftW: [],
  rightW: [],
  shelfW: [],
  roundResults: [],
  totalRounds: 0,
  successRounds: 0,
  playing: false,
  timerInt: null,
  spawnInt: null,
  weightPool: [],
  targetSum: 0,      // Для уровня 2 (точная сумма)
  singleLevel: false // Режим одного уровня
};

// Текущее состояние
export const state = { ...initialState };

/**
 * Сброс состояния к начальному
 */
export function resetState() {
  Object.assign(state, {
    ...initialState,
    leftW: [],
    rightW: [],
    shelfW: [],
    roundResults: [],
    weightPool: []
  });
}

/**
 * Сброс для нового уровня
 */
export function resetLevelState() {
  state.round = 0;
  state.roundResults = [];
  state.leftW = [];
  state.rightW = [];
  state.shelfW = [];
  state.weightPool = [];
  state.targetSum = 0;
}

/**
 * Сброс для нового раунда
 */
export function resetRoundState() {
  state.leftW = [];
  state.rightW = [];
  state.shelfW = [];
  state.weightPool = [];
}

export default state;
