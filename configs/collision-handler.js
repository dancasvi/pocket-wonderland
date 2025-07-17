(() => {
  const CHECK_INTERVAL = 50; // ms
  const DAMAGE_PER_HIT = 1;
  let enemyDataMap = {};

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
                }, 900);
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

  setInterval(checkCollisions, CHECK_INTERVAL);
})();
