(() => {
  const groundLevel = 100; // Mesmo nível de solo que o jogador

  function spawnEnemy(nome) {
    fetch('json-db/enemies.json')
      .then(res => res.json())
      .then(allEnemies => {
        const data = allEnemies.find(e => e.name.toLowerCase() === nome);
        if (!data) return;

        const enemy = document.createElement('img');
        enemy.src = `assets/enemies/common/${nome}/animated.gif`;
        enemy.classList.add('enemy');
        enemy.style.position = 'absolute';
        enemy.style.left = `${window.innerWidth + 50}px`;

        const player = document.getElementById('player-character');
        const playerBottom = parseFloat(player.style.bottom) || 100;
        enemy.style.bottom = `${playerBottom}px`;

        enemy.style.width = '80px';
        enemy.dataset.life = data.life || 1;
        enemy.dataset.enemyId = data.idEnemy;
        enemy.dataset.speed = data.speed || 2;

        document.body.appendChild(enemy);
        moveEnemy(enemy);
      });
  }

  function moveEnemy(enemy) {
    const speed = parseFloat(enemy.dataset.speed || '2');

    function update() {
      if (window.isPaused) {
        requestAnimationFrame(update);
        return;
      }

      let posX = parseFloat(enemy.style.left);
      if (posX < -enemy.offsetWidth) {
        enemy.remove();
        return;
      }

      enemy.style.left = `${posX - speed}px`;
      requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  // Torna acessível no escopo global
  window.spawnEnemy = spawnEnemy;
})();
