(() => {
  const player = document.getElementById('player-character');
  const wrapper = document.querySelector('.phase-wrapper');
  const selectedRaw = localStorage.getItem('selectedCharacter');

  let canShoot = true; // controle de cooldown
  const cooldownTime = 3000; // 3 segundos em milissegundos

  if (!player || !wrapper || !selectedRaw) return;

  const selected = JSON.parse(selectedRaw);
  const characterId = selected.id;

  let attackIcon = 'star';       // padrão
  let attackColor = '#000000';   // padrão
  let characterName = '';
  let attackSound = null;

  // Buscar dados do personagem completo
  fetch('json-db/characters.json')
    .then(res => res.json())
    .then(characters => {
      const char = characters.find(c => c.id === characterId);
      if (!char) return;

      attackColor = char.powerColor || '#000';
      attackIcon = char.type || 'star';
      characterName = char.name.toLowerCase();

      // Prepara o som
      attackSound = new Audio(`assets/characters/${characterName}/basic-attack.mp3`);
    })
    .catch(err => {
      console.error('Erro ao carregar personagem:', err);
    });

  // Escuta espaço para disparar
  window.addEventListener('keydown', e => {
    if (e.code === 'Space') {
      e.preventDefault();

      if (!canShoot) return; // impede disparo durante cooldown

      createProjectile();

      canShoot = false;
      setTimeout(() => {
        canShoot = true;
      }, cooldownTime);

    }
  });

  function createProjectile() {
  if (!characterName) return;

  // Toca som
  if (attackSound) {
    attackSound.currentTime = 0;
    attackSound.play().catch(err => console.warn('Som bloqueado:', err));
  }

  const projectile = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  projectile.setAttribute('width', '28');
  projectile.setAttribute('height', '28');
  projectile.setAttribute('viewBox', '0 0 24 24');
  projectile.style.position = 'absolute';
  projectile.style.left = `${player.offsetLeft + player.offsetWidth - 10}px`;
  projectile.style.bottom = `${parseInt(player.style.bottom || '100') + 50}px`;
  projectile.style.zIndex = '5';
  projectile.style.filter = 'drop-shadow(0 0 6px ' + attackColor + ')';

  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
  filter.setAttribute('id', 'glow');

  const dropShadow = document.createElementNS('http://www.w3.org/2000/svg', 'feDropShadow');
  dropShadow.setAttribute('dx', '0');
  dropShadow.setAttribute('dy', '0');
  dropShadow.setAttribute('stdDeviation', '2');
  dropShadow.setAttribute('flood-color', attackColor);

  filter.appendChild(dropShadow);
  defs.appendChild(filter);
  projectile.appendChild(defs);

  const shape = getProjectileShape(attackIcon, attackColor);
  if (shape) {
    shape.setAttribute('stroke', 'black'); // ✅ borda preta
    shape.setAttribute('stroke-width', '1.2');
    shape.setAttribute('filter', 'url(#glow)'); // ✅ brilho
    projectile.appendChild(shape);
  }

  wrapper.appendChild(projectile);

  // Animação do disparo
  let posX = parseInt(projectile.style.left);
  const speed = 12; // ✅ velocidade aumentada

  function move() {
    if (window.isPaused) {
    requestAnimationFrame(move);
    return;
  }
    posX += speed;
    projectile.style.left = `${posX}px`;

    if (posX > window.innerWidth) {
      projectile.remove();
      return;
    }

    requestAnimationFrame(move);
  }

  requestAnimationFrame(move);
}


  function getProjectileShape(type, color) {
    const ns = 'http://www.w3.org/2000/svg';

    switch (type) {
      case 'fairy': {
        const path = document.createElementNS(ns, 'path');
        path.setAttribute('d', 'M12 2 L14.5 9 H22 L16 14 L18.5 21 L12 17 L5.5 21 L8 14 L2 9 H9.5 Z');
        path.setAttribute('fill', color);
        return path;
      }
      case 'fire': {
        const path = document.createElementNS(ns, 'path');
        path.setAttribute('d', 'M12 2 C10 6, 6 10, 12 22 C18 10, 14 6, 12 2 Z');
        path.setAttribute('fill', color);
        return path;
      }
      case 'electric': {
        const path = document.createElementNS(ns, 'path');
        path.setAttribute('d', 'M10 2 L14 10 H11 L13 22 L6 12 H10 Z');
        path.setAttribute('fill', color);
        return path;
      }
      case 'grass': {
        const ellipse = document.createElementNS(ns, 'ellipse');
        ellipse.setAttribute('cx', '12');
        ellipse.setAttribute('cy', '12');
        ellipse.setAttribute('rx', '8');
        ellipse.setAttribute('ry', '4');
        ellipse.setAttribute('fill', color);
        return ellipse;
      }
      default: {
        const circle = document.createElementNS(ns, 'circle');
        circle.setAttribute('cx', '12');
        circle.setAttribute('cy', '12');
        circle.setAttribute('r', '10');
        circle.setAttribute('fill', color);
        return circle;
      }
    }
  }
})();
