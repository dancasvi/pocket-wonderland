(() => {
  const player = document.getElementById('player-character');
  if (!player) return;

  let posX = parseInt(player.style.left) || 200;
  let posY = parseInt(player.style.bottom) || 100;

  let velocityY = 0;
  let isJumping = false;
  let keysPressed = {};

  const speed = 4;
  const jumpForce = 12;
  const gravity = 0.5;
  const groundLevel = 100;

  function updatePosition() {
    if (window.isPaused) {
    requestAnimationFrame(updatePosition);
    return;
  }
  // Movimento lateral
  if (keysPressed['ArrowLeft']) {
    posX -= speed;
  }
  if (keysPressed['ArrowRight']) {
    posX += speed;
  }

  // Pulo
  if (keysPressed['ArrowUp'] && !isJumping) {
    velocityY = jumpForce;
    isJumping = true;
  }

  // Queda forçada
  if (keysPressed['ArrowDown']) {
    velocityY -= 1.5;
  }

  // Gravidade
  velocityY -= gravity;
  posY += velocityY;

  // Chão
  if (posY <= groundLevel) {
    posY = groundLevel;
    velocityY = 0;
    isJumping = false;
  }

  // ✅ Limites horizontais
  const maxRight = window.innerWidth - player.offsetWidth - 10;
  if (posX < 0) posX = 0;
  if (posX > maxRight) posX = maxRight;

  // (opcional) Limite superior
  if (posY > window.innerHeight - player.offsetHeight) {
    posY = window.innerHeight - player.offsetHeight;
    velocityY = 0;
  }

  player.style.left = `${posX}px`;
  player.style.bottom = `${posY}px`;

  requestAnimationFrame(updatePosition);
}


  // Teclado
  window.addEventListener('keydown', e => {
    keysPressed[e.key] = true;
  });

  window.addEventListener('keyup', e => {
    keysPressed[e.key] = false;
  });

  // Inicializar posição inicial
  player.style.left = `${posX}px`;
  player.style.bottom = `${posY}px`;

  requestAnimationFrame(updatePosition);
})();
