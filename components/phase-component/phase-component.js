(() => {
  window.isPaused = false;

  const player = document.getElementById('player-character');
  const backgroundLayer = document.querySelector('.background-layer');
  const ground = document.querySelector('.ground');
  let currentPhase = 1;

  const selectedCharacterRaw = localStorage.getItem('selectedCharacter');
  if (!selectedCharacterRaw) {
    alert('Nenhum personagem selecionado.');
    loadComponent('components/menu-component/menu-component.html');
    return;
  }

  const selectedCharacter = JSON.parse(selectedCharacterRaw);

  // Carrega dados completos do personagem via characters.json
  fetch('json-db/characters.json')
    .then(res => res.json())
    .then(characters => {
      const fullCharData = characters.find(c => c.id === selectedCharacter.id);
      if (!fullCharData) throw new Error('Personagem não encontrado no JSON.');

      const gifPath = `assets/characters/${fullCharData.name.toLowerCase()}/animated.gif`;
      player.src = gifPath;
      player.alt = fullCharData.name;

      // Aplica inversão se estiver virado para a esquerda
      if (fullCharData.turnedTo === 'left') {
        player.style.transform = 'scaleX(-1)';
      }

      // Agora carrega fase 1
      return fetch('json-db/phases.json');
    })
    .then(res => res.json())
    .then(phases => {
      const phase1 = phases.find(p => p.id === 1);
      if (!phase1) throw new Error('Fase 1 não encontrada.');
      currentPhase = 1;
      // Atualiza HUD com nome da fase
      document.getElementById('hud-phase').textContent = currentPhase.id;

      // Aplica visual da fase
      const bgColor = phase1['background-img'] || '#a3d9ff';
      backgroundLayer.style.backgroundColor = bgColor;
      backgroundLayer.style.backgroundImage = 'none'; // se quiser usar imagem, altere aqui
      
      // Agora inicia o spawn dos inimigos
      startEnemySpawn(phase1.enemiesId);
    })
    .catch(err => {
      console.error('Erro ao carregar fase ou personagem:', err);
      alert('Erro ao carregar a fase.');
    });

    function createHUD() {
  const hud = document.createElement('div');
  hud.id = 'hud';
  hud.className = 'hud-card';
  hud.innerHTML = `
    <div class="hud-top">
      <img id="hud-icon" class="hud-icon" src="" alt="icon" />
      <span id="hud-name" class="hud-name">Nome</span>
      <span id="hud-level" class="hud-level">Lv. 1</span>
    </div>
    <div class="hud-life" id="hud-life">
      <span class="life-dot"></span>
      <span class="life-dot"></span>
      <span class="life-dot"></span>
    </div>
    <div class="hud-info">
      <div>Fase: <span id="hud-phase">1</span></div>
      <div>Pontos: <span id="hud-points">0</span></div>
      <div>
        <img src="assets/stuff/pokeball.png" class="pokeball-icon" alt="pokeball" />
        <span id="hud-pokeballs">0</span>
      </div>
    </div>
    <div class="hud-xp-bar-wrapper">
      <div class="hud-xp-bar" id="hud-xp-bar"></div>
    </div>
  `;

  document.querySelector('.phase-wrapper').appendChild(hud);
}

  function updateHUD() {
    const selectedRaw = localStorage.getItem('selectedCharacter');
    if (!selectedRaw) return;

    const selected = JSON.parse(selectedRaw);
    const charId = selected.id;

    fetch('json-db/characters.json')
      .then(res => res.json())
      .then(chars => {
        const char = chars.find(c => c.id === charId);
        if (!char) return;

        const imgPath = `assets/characters/${char.name.toLowerCase()}/ingame-icon.${char.ingameIconExtension}`;

        document.getElementById('hud-icon').src = imgPath;

        const nameEl = document.getElementById('hud-name');
        nameEl.textContent = char.name;
        nameEl.style.color = char.powerColor || '#000';
      });
  }

  let points = 0;
  let pointInterval = null;

  function startPointCounter() {
    pointInterval = setInterval(() => {
      if (!isPaused) {
        points++;
        const el = document.getElementById('hud-points');
        if (el) el.textContent = points;
      }
    }, 1000);
  }

  function stopPointCounter() {
    clearInterval(pointInterval);
  }


  let xp = 0;
let level = 1;
let pokeballs = 0;

function addXP(amount) {
  xp += amount;
  const bar = document.getElementById('hud-xp-bar');
  const levelEl = document.getElementById('hud-level');

  let maxXP = 100 + (level - 1) * 30;
  let percent = Math.min((xp / maxXP) * 100, 100);
  bar.style.width = percent + '%';

  // Level up!
  if (xp >= maxXP) {
    xp = xp - maxXP;
    level++;
    levelEl.textContent = `Lv. ${level}`;

    levelUpAnimation(); // quando subir de nível
  }
}

// Pressionar T para testar ganho de XP
window.addEventListener('keydown', e => {
  if (e.code === 'KeyT') {
	addXP(50); // test XP gain
  }
});

function addPokeball(count = 1) {
  pokeballs += count;
  const el = document.getElementById('hud-pokeballs');
  if (el) el.textContent = pokeballs;
}

let isPaused = false;
let pauseMenu = null;

function saveGame() {
  const selected = JSON.parse(localStorage.getItem('selectedCharacter') || '{}');

  const data = {
    personagem: {
      id: selected.id || null
    },
    level,
    pontos: points,
    fase: 1
  };

  const content = JSON.stringify(data, null, 2);
  const blob = new Blob([content], { type: 'text/plain' });
  const link = document.createElement('a');
  link.download = `save-data-${Date.now()}.txt`;
  link.href = URL.createObjectURL(blob);
  link.click();
}

function levelUpAnimation() {
  const hud = document.getElementById('hud');
  hud.classList.add('level-up');

  let levelUpSound = new Audio(`assets/sounds/hud/level-up.mp3`);
  levelUpSound.currentTime = 0;
  levelUpSound.volume = 0.2;
  levelUpSound.play().catch(err => console.warn('Som bloqueado:', err));

  setTimeout(() => {
    hud.classList.remove('level-up');
  }, 800);
}

function startEnemySpawn(enemiesIdList) {
  fetch('json-db/enemies.json')
    .then(res => res.json())
    .then(allEnemies => {
      // 1. Filtra os inimigos permitidos nesta fase
      const validEnemies = allEnemies.filter(e => enemiesIdList.includes(e.idEnemy));

      if (validEnemies.length === 0) return;

      // 2. Calcula média de spawnTime
      const totalSpawnTime = validEnemies.reduce((sum, enemy) => sum + (enemy.spawnTime || 3), 0);
      const avgSpawnTime = totalSpawnTime / validEnemies.length;

      // 3. Converte para milissegundos
      const intervalTime = avgSpawnTime * 1000;

      // 4. Cria spawn com esse intervalo médio
      setInterval(() => {
        if (!window.isPaused && typeof window.spawnEnemy === 'function') {
          const enemy = validEnemies[Math.floor(Math.random() * validEnemies.length)];
          if (enemy) {
            window.spawnEnemy(enemy.name.toLowerCase()); // ou use enemy.imgFile, etc
          }
        }
      }, intervalTime);
    });
}







    createHUD();
    updateHUD();
    startPointCounter();

    const movementScript = document.createElement('script');
    movementScript.src = 'configs/movement.js';
    movementScript.defer = true;
    movementScript.setAttribute('data-dynamic', 'true');
    document.body.appendChild(movementScript);

    const shootingScript = document.createElement('script');
    shootingScript.src = 'configs/shooting.js';
    shootingScript.defer = true;
    shootingScript.setAttribute('data-dynamic', 'true');
    document.body.appendChild(shootingScript);

    const enemyMovementScript = document.createElement('script');
    enemyMovementScript.src = 'configs/enemy-movement.js';
    enemyMovementScript.defer = true;
    enemyMovementScript.setAttribute('data-dynamic', 'true');
    document.body.appendChild(enemyMovementScript);

    const collisionScript = document.createElement('script');
    collisionScript.src = 'configs/collision-handler.js';
    collisionScript.defer = true;
    collisionScript.setAttribute('data-dynamic', 'true');
    document.body.appendChild(collisionScript);

    // Torna acessível no escopo global
    window.addXP = addXP;
})();
