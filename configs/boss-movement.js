(() => {
  window.moveBoss = function (bossEl, attackType, currentPhase, bossName) {
    if (!bossEl || !attackType) return;

    if (attackType === 'smokescreen') {
      let direction = 1;
      function move() {
        if (!document.body.contains(bossEl) || window.isPaused) return;

        let left = parseFloat(bossEl.style.left);
        if (left >= window.innerWidth - 120 || left <= 20) {
          direction *= -1;
        }
        bossEl.style.left = `${left + direction * 2}px`;

        requestAnimationFrame(move);
      }
      move();
      setInterval(() => {
        const smoke = $('<div></div>').css({
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(100,100,100,0.9)',
          top: '0',
          left: '0',
          zIndex: '5',
          display: 'none'
        });
        $('body').append(smoke);
        smoke.fadeIn(300).delay(700).fadeOut(500);

        const soundPath = `assets/enemies/boss/${currentPhase}/${bossName}-attack.mp3`;
        new Audio(`${soundPath}`).play();
      }, 5000);
    }

    if (attackType === 'sting') {
      setInterval(() => {
        if (!document.body.contains(bossEl) || window.isPaused) return;
        const bullet = document.createElement('div');
        bullet.className = 'enemy-bullet';
        bullet.style.position = 'absolute';
        bullet.style.left = `${bossEl.offsetLeft}px`;
        bullet.style.bottom = `${parseFloat(bossEl.style.bottom || '100') + 40}px`;
        bullet.style.width = '25px';
        bullet.style.height = '6px';
        bullet.style.borderRadius = '50%';
        bullet.style.backgroundColor = 'purple';
        bullet.style.zIndex = '998';
        document.body.appendChild(bullet);

        function moveBullet() {
          if (!document.body.contains(bullet)) return;
          bullet.style.left = `${parseFloat(bullet.style.left) - 4}px`;
          if (parseFloat(bullet.style.left) < -20) bullet.remove();
          else requestAnimationFrame(moveBullet);
        }
        moveBullet();
      }, 3000);
    }
  };
})();
