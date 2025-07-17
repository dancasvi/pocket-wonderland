
(() => {
  let playerLives = 3;
  const CHECK_INTERVAL = 50; // ms
  const DAMAGE_PER_HIT = 1;
  let enemyDataMap = {};
  const hurtSound = new Audio('assets/sounds/hurt.mp3');
  const loseSound = new Audio('assets/sounds/lose.mp3');

  // Pré-carrega enemies.json uma vez
  fetch('json-db/enemies.json')
    .then(res => res.json())
    .then(data => {
      enemyDataMap = Object.fromEntries(data.map(e => [String(e.idEnemy), e]));
    });

  function isColliding(rect1, rect2) {
    return !(
      rect1.right < rect2.left ||
      rect1.left > rect2.right ||
      rect1.bottom < rect2.top ||
      rect1.top > rect2.bottom
    );
  }

  function checkCollisions() {
    const projectiles = document.querySelectorAll('svg');
    const enemies = document.querySelectorAll('.enemy');
    const player = document.getElementById('player-character');

    // Verifica se foi tocado
    if (!player || player.dataset.immune === 'true') return;
    const playerRect = player.getBoundingClientRect();

    enemies.forEach(enemy => {
      const eRect = enemy.getBoundingClientRect();

      if (isColliding(playerRect, eRect)) {
        // Ativa imunidade por 3 segundos
        player.dataset.immune = 'true';
        
        hurtSound.volume = 0.3;
        hurtSound.play().catch(err => console.warn('Som bloqueado:', err));

        // Reduz vida
        playerLives--;
        updatePlayerLifeHUD(playerLives); // atualiza visualmente

        if (playerLives <= 0) {
          showGameOverMessage();
          window.isPaused = true; // congela jogo
          if (typeof window.stopPointCounter === 'function') {
            window.stopPointCounter();
          }


          setTimeout(() => {
            loadComponent('components/menu-component/menu-component.html');
          }, 3000);
          return;
        }

        // Piscar 3 vezes
        let blinkCount = 0;
        const blinkInterval = setInterval(() => {
          player.style.visibility = player.style.visibility === 'hidden' ? 'visible' : 'hidden';
          blinkCount++;

          if (blinkCount >= 6) {
            clearInterval(blinkInterval);
            player.style.visibility = 'visible';
          }
        }, 250);

        // Remove imunidade após 3 segundos
        setTimeout(() => {
          player.dataset.immune = 'false';
        }, 3000);
      }
    });
    // FIM TOQUE

    projectiles.forEach(projectile => {
      const pRect = projectile.getBoundingClientRect();

      enemies.forEach(enemy => {
        const eRect = enemy.getBoundingClientRect();

        if (isColliding(pRect, eRect)) {
          // Dano e vida
          let life = parseInt(enemy.dataset.life || '1');
          life -= DAMAGE_PER_HIT;

          if (life <= 0) {
            const enemyId = enemy.dataset.enemyId;
            const enemyInfo = enemyDataMap[enemyId];

            enemy.dataset.life = 0;

            const faintGif = 'assets/stuff/enemy-faint.gif';

            // Garante que a nova imagem seja carregada antes de remover
            enemy.onload = () => {
                setTimeout(() => {
                    enemy.remove();
                }, 500);
            };

            enemy.src = faintGif; // Só depois de definir o .onload

            // Ganha XP
            if (enemyInfo && typeof window.addXP === 'function') {
              const exp = enemyInfo.exp || 5;
              window.addXP(exp);

              // Cria elemento visual +EXP
              const expText = document.createElement('span');
              expText.textContent = `+${exp}`;
              expText.style.position = 'absolute';
              expText.style.left = `${enemy.offsetLeft + enemy.offsetWidth / 2}px`;
              expText.style.bottom = `${parseFloat(enemy.style.bottom || '100') + 80}px`;
              expText.style.color = '#4caf50';
              expText.style.fontWeight = 'bold';
              expText.style.fontSize = '18px';
              expText.style.zIndex = '999';
              expText.style.pointerEvents = 'none';
              expText.style.transition = 'all 0.9s ease-out';
              expText.style.opacity = '1';
              expText.style.transform = 'translateY(0)';

              document.body.appendChild(expText);

              // Força reflow para aplicar transição
              void expText.offsetWidth;

              // Aplica animação (sobe e desaparece)
              setTimeout(() => {
                expText.style.opacity = '0';
                expText.style.transform = 'translateY(40px)';
              }, 10);

              // Remove após animação
              setTimeout(() => {
                expText.remove();
              }, 1000);
            }          

            // Som de derrota (opcional)
            if (enemyInfo && enemyInfo.cryFile) {
              const cry = new Audio(`assets/enemies/common/${enemyInfo.name.toLowerCase()}/cry.mp3`);
              cry.volume = 0.2;
              cry.play().catch(() => {});
            }
          } else {
            enemy.dataset.life = life;
          }

          // Remove o projétil após o impacto
          projectile.remove();
        }
      });
    });
  }

  function showGameOverMessage() {    
    loseSound.volume = 0.9;
    loseSound.play().catch(err => console.warn('Som bloqueado:', err));

    const msg = document.createElement('div');
    msg.textContent = 'Oh no, you fainted!';
    msg.style.position = 'fixed';
    msg.style.top = '50%';
    msg.style.left = '50%';
    msg.style.transform = 'translate(-50%, -50%)';
    msg.style.color = 'red';
    msg.style.fontSize = '32px';
    msg.style.fontWeight = 'bold';
    msg.style.zIndex = '9999';
    msg.style.fontFamily = 'sans-serif';
    msg.style.textShadow = '1px 1px 4px black';
    document.body.appendChild(msg);

    // Remove todos os inimigos da tela
    document.querySelectorAll('.enemy').forEach(enemy => enemy.remove());

    window.points = 0;
    if (typeof window.updatePointsHUD === 'function') {
      window.updatePointsHUD();
    }

    setTimeout(() => {
      msg.remove();
    }, 2500);
    return;
  }

  setInterval(checkCollisions, CHECK_INTERVAL);

  window.updatePlayerLifeHUD = function (livesRemaining) {
    const hearts = document.querySelectorAll('.hud-life .life-heart svg');
    hearts.forEach((svg, index) => {
      svg.style.opacity = index < livesRemaining ? '1' : '0.2';
    });
  };
})();
