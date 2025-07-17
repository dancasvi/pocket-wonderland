// function loadComponent(path) {
  window.loadComponent = function(path) {
    console.log('[loadComponent] Chamado com:', path);
    const container = document.getElementById('menu-container');

    // limpa o conteúdo
    container.innerHTML = '';

    // remove scripts anteriores (evita múltiplas execuções)
    const oldScripts = document.querySelectorAll('script[data-dynamic]');
    oldScripts.forEach(el => el.remove());

    // remove CSS anterior (se quiser limpar visual)
    const oldLinks = document.querySelectorAll('link[data-dynamic]');
    oldLinks.forEach(el => el.remove());

    // carrega o componente
    fetch(path)
      .then(res => res.text())
      .then(html => {
        // Limpar container antes de inserir novo conteúdo
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }

        container.innerHTML = html;

        // adiciona novo script
        const scriptPath = path.replace('.html', '.js');
        const script = document.createElement('script');
        script.src = scriptPath;
        script.defer = true;
        script.setAttribute('data-dynamic', 'true');
        document.body.appendChild(script);

        // adiciona novo CSS
        const cssPath = path.replace('.html', '.css');
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssPath;
        link.setAttribute('data-dynamic', 'true');
        document.head.appendChild(link);
      })
      .catch(err => console.error('Erro ao carregar componente:', err));
  }

window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('menu-container');

  // Carrega o menu inicialmente
  loadComponent('components/menu-component/menu-component.html');

  // Delegação de evento para navegação
  document.addEventListener('click', (e) => {
    const target = e.target;

    if (target.classList.contains('menu-btn')) {
      const label = target.innerText.trim();

      // Evita múltiplas execuções
      e.stopPropagation();
      e.preventDefault();
      console.log('Menu clicado:', label);
      let gameSound = new Audio(`assets/sounds/menu.mp3`);
      gameSound.currentTime = 0;
      gameSound.volume = 0.3;
      gameSound.play().catch(err => console.warn('Som bloqueado:', err));
      window.gameSound = gameSound;

      switch (label) {
        case 'Play':
          loadComponent('components/phase-component/phase-component.html');
          break;
        case 'Choose Character':
          loadComponent('components/choose-character-component/choose-character-component.html');
          break;
        default:
          alert(`Função "${label}" ainda não implementada.`);
      }
    }
  });

  

  


});
