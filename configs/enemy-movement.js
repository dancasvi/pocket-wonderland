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
        const playerBottom = groundLevel || 100;
        enemy.style.bottom = `${playerBottom}px`;

        enemy.style.width = '80px';
        enemy.dataset.life = data.life || 1;
        enemy.dataset.enemyId = data.idEnemy;
        enemy.dataset.speed = data.speed || 2;
        enemy.dataset.attackTypes = JSON.stringify(data.attackTypes || []);
        enemy.dataset.attackColor = data.attackColor || '#ff0000';


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

    initEnemyAttacks(enemy);
  }

  function initEnemyAttacks(enemy) {
    const attackTypes = JSON.parse(enemy.dataset.attackTypes || '[]');

    attackTypes.forEach(atk => {
      const style = atk.style;
      const cooldown = (atk.cd || 3) * 1000;

      if (style === 'shoot') {
        setInterval(() => {
          if (window.isPaused || !document.body.contains(enemy)) return;
          enemyShoot(enemy);
        }, cooldown);
      }

      if (style === 'jump') {
        setInterval(() => {
          if (window.isPaused || !document.body.contains(enemy)) return;
          enemyJump(enemy);
        }, cooldown);
      }

      // walk = padrão, não faz nada
    });
  }

  function enemyShoot(enemy) {
    const bullet = document.createElement('div');
    bullet.className = 'enemy-bullet';
    bullet.style.position = 'absolute';
    bullet.style.left = `${enemy.offsetLeft}px`;
    bullet.style.bottom = `${parseFloat(enemy.style.bottom || '100') + 20}px`;
    bullet.style.width = '10px';
    bullet.style.height = '10px';
    bullet.style.borderRadius = '50%';
    bullet.style.backgroundColor = enemy.dataset.attackColor || 'red';
    bullet.style.zIndex = '998';

    document.body.appendChild(bullet);

    const speed = 4;
    function move() {
      if (!document.body.contains(bullet)) return;
      const left = parseFloat(bullet.style.left);
      if (left < -20) {
        bullet.remove();
        return;
      }
      bullet.style.left = `${left - speed}px`;
      requestAnimationFrame(move);
    }

    requestAnimationFrame(move);
  }

  function enemyJump(enemy) {
    const initialBottom = parseFloat(enemy.style.bottom || '100');
    let velocity = 8;
    const gravity = 0.5;

    function animateJump() {
      if (!document.body.contains(enemy)) return;

      velocity -= gravity;
      const newBottom = parseFloat(enemy.style.bottom || '100') + velocity;

      if (newBottom <= initialBottom) {
        enemy.style.bottom = `${initialBottom}px`;
        return;
      }

      enemy.style.bottom = `${newBottom}px`;
      requestAnimationFrame(animateJump);
    }

    requestAnimationFrame(animateJump);
  }




  // Torna acessível no escopo global
  window.spawnEnemy = spawnEnemy;
})();
