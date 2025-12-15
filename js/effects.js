/**
 * Визуальные эффекты - конфетти, частицы, анимации
 */

/**
 * Создать конфетти при победе
 */
export function showConfetti() {
  const container = document.createElement('div');
  container.className = 'confetti-container';
  document.body.appendChild(container);

  const colors = ['#22d3ee', '#84cc16', '#fbbf24', '#f472b6', '#a78bfa', '#34d399'];
  const shapes = ['square', 'circle', 'triangle'];

  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement('div');
    confetti.className = `confetti ${shapes[Math.floor(Math.random() * shapes.length)]}`;
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = Math.random() * 2 + 's';
    confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
    container.appendChild(confetti);
  }

  // Удалить через 5 секунд
  setTimeout(() => container.remove(), 5000);
}

/**
 * Создать эффект проигрыша — падающие осколки
 */
export function showLoseEffect() {
  const container = document.createElement('div');
  container.className = 'lose-effect-container';
  document.body.appendChild(container);

  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.className = 'lose-particle';
    particle.style.left = Math.random() * 100 + 'vw';
    particle.style.animationDelay = Math.random() * 0.5 + 's';
    particle.textContent = ['💔', '😢', '❌', '⏰'][Math.floor(Math.random() * 4)];
    container.appendChild(particle);
  }

  // Удалить через 3 секунды
  setTimeout(() => container.remove(), 3000);
}

/**
 * Инициализировать фоновые частицы
 */
export function initBackgroundParticles() {
  const container = document.createElement('div');
  container.className = 'bg-particles';
  container.id = 'bg-particles';
  document.body.prepend(container);

  for (let i = 0; i < 50; i++) {
    const particle = document.createElement('div');
    particle.className = 'bg-particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 8 + 's';
    particle.style.animationDuration = (8 + Math.random() * 12) + 's';
    particle.style.width = (3 + Math.random() * 6) + 'px';
    particle.style.height = particle.style.width;
    particle.style.opacity = 0.1 + Math.random() * 0.3;
    container.appendChild(particle);
  }
}

/**
 * Показать эффект успешного раунда
 */
export function showSuccessRound() {
  const container = document.createElement('div');
  container.className = 'success-burst';
  document.body.appendChild(container);

  for (let i = 0; i < 12; i++) {
    const star = document.createElement('div');
    star.className = 'success-star';
    star.textContent = '✨';
    star.style.setProperty('--angle', (i * 30) + 'deg');
    container.appendChild(star);
  }

  setTimeout(() => container.remove(), 1000);
}

export default { showConfetti, showLoseEffect, initBackgroundParticles, showSuccessRound };

