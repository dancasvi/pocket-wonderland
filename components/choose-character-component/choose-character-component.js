(() => {
  const target = document.getElementById('characters-list');
  const confirmButton = document.getElementById('confirm-character');
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  let selectedCharacterId = null;

  if (!target || !confirmButton) return;

  fetch('json-db/characters.json')
    .then(res => res.json())
    .then(chars => {
      chars.forEach(c => {
        const ext = c.chooseIconExtension;
        const imgPath = `assets/characters/${c.name.toLowerCase()}/choose-icon.${ext}`;
        const powerColor = c.powerColor || '#000000';

        const col = document.createElement('div');
        col.className = 'col-12 col-sm-6 col-md-4 mb-4';

        const card = document.createElement('div');
        card.className = 'character-card';
        card.setAttribute('data-id', c.id);
        card.setAttribute('data-name', c.name);
        card.setAttribute('data-color', powerColor);
        card.style.boxShadow = `0 4px 12px ${powerColor}33`;

        card.innerHTML = `
          <img class="character-icon" src="${imgPath}" alt="${c.name}">
          <span class="character-name">${c.name}</span>
        `;

        // card.addEventListener('click', () => {
        //   const alreadySelected = card.classList.contains('selected');
        //   document.querySelectorAll('.character-card').forEach(el => el.classList.remove('selected'));
        //   selectedCharacterId = null;

        //   if (!alreadySelected) {
        //     card.classList.add('selected');
        //     selectedCharacterId = c.id;
        //     confirmButton.classList.remove('d-none');
        //   } else {
        //     confirmButton.classList.add('d-none');
        //   }
        // });
        card.addEventListener('click', () => {
        const alreadySelected = card.classList.contains('selected');
        document.querySelectorAll('.character-card').forEach(el => el.classList.remove('selected'));
        selectedCharacterId = null;

        if (!alreadySelected) {
          card.classList.add('selected');
          selectedCharacterId = c.id;
          confirmButton.classList.remove('d-none');

          // 👉 Se for mobile, já aciona o botão de confirmar
          if (isMobile) {
            confirmButton.click();
          }
        } else {
          confirmButton.classList.add('d-none');
        }
      });


        col.appendChild(card);
        target.appendChild(col);
      });
    })
    .catch(err => console.error('Erro carregando personagens:', err));

  confirmButton.addEventListener('click', () => {
    if (selectedCharacterId) {
      const selected = document.querySelector('.character-card.selected');
      const name = selected?.getAttribute('data-name');
      const color = selected?.getAttribute('data-color') || '#000';
      const infoEl = document.getElementById('selected-character-info');
      infoEl.innerHTML = `Você escolheu <strong style="color: ${color}">${name}</strong>`;
      infoEl.style.color = '#000';

      localStorage.setItem('selectedCharacter', JSON.stringify({
        id: selectedCharacterId
      }));


      const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
      modal.show();

      document.getElementById('modal-ok-btn').onclick = () => {
        loadComponent('components/menu-component/menu-component.html');
      };
    }
  });

  // Botão de voltar ao menu
  document.getElementById('back-to-menu')?.addEventListener('click', () => {
    loadComponent('components/menu-component/menu-component.html');
  });

})();
