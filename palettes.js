(() => {
  'use strict';
  const storageKey = 'jcp.lower.palettes.v1';
  const presets = [
    {name:'ACNA', colors:{accent:'#dc3200',plate:'#170e0b',headline:'#f5f6fa',subtitle:'#e97c5c'}},
    {name:'ANeA', colors:{accent:'#448d21',plate:'#0e170b',headline:'#f5f6fa',subtitle:'#87b66f'}},
    {name:'ACSA', colors:{accent:'#2f557f',plate:'#0b1117',headline:'#f5f6fa',subtitle:'#7a92ad'}},
    {name:'ACEA', colors:{accent:'#ffaa00',plate:'#17120b',headline:'#f5f6fa',subtitle:'#ffaa00'}}
  ];
  const initial = {accent:'#f7a813',plate:'#17120b',headline:'#f5f6fa',subtitle:'#f7a813'};
  const colorKeys = Object.keys(initial);
  const isHex = value => /^#[0-9a-f]{6}$/i.test(value ?? '');
  const nameKey = name => name.trim().toLowerCase();

  function readSaved() {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
      if (Array.isArray(stored)) return stored.filter(item =>
        typeof item?.name === 'string' && item.name.trim() && item.name.length <= 60 &&
        colorKeys.every(key => isHex(item.colors?.[key])));
    } catch { /* Keep the built-in palettes available without browser storage. */ }
    return [];
  }

  function mount(root, {read, apply, manual, reset}) {
    if (!root) return;
    root.innerHTML = `
      <details class="palette-picker">
        <summary aria-label="Paleta de colores">
          <span class="palette-label">Paleta</span><span class="palette-current"></span>
        </summary>
        <div class="palette-options" role="group" aria-label="Paletas de colores"></div>
      </details>
      <div class="palette-actions">
        <button type="button" data-save>Guardar paleta…</button>
        <button type="button" data-remove disabled>Eliminar paleta</button>
      </div>
      <form class="palette-actions" hidden>
        <label>Nombre de la paleta<input maxlength="60" required autocomplete="off"></label>
        <button type="submit">Guardar</button>
        <button type="button" data-cancel>Cancelar</button>
      </form>
      <p class="palette-status" role="status" hidden></p>`;
    const details = root.querySelector('details');
    const summary = details.querySelector('summary');
    const current = root.querySelector('.palette-current');
    const options = root.querySelector('.palette-options');
    const save = root.querySelector('[data-save]');
    const remove = root.querySelector('[data-remove]');
    const form = root.querySelector('form');
    const nameInput = form.querySelector('input');
    const status = root.querySelector('[role=status]');
    let selected = null;
    let complete = {...initial};

    const message = text => { status.textContent = text; status.hidden = !text; };
    const colors = () => ({...complete,...read()});
    function addLabel(node, name, accent) {
      const dot = document.createElement('span');
      dot.className = 'palette-swatch';
      dot.setAttribute('aria-hidden','true');
      dot.style.backgroundColor = accent;
      const label = document.createElement('span');
      label.textContent = name;
      node.append(dot,label);
    }
    function refresh() {
      const entries = [
        {name:'Colores manuales', colors:colors(), id:'manual'},
        ...presets.map(p => ({...p,id:'preset:'+p.name})),
        ...readSaved().map(p => ({...p,id:'custom:'+nameKey(p.name)}))
      ];
      if (selected?.id.startsWith('custom:') && !entries.some(entry => entry.id === selected.id))
        selected = null;
      const currentName = selected?.name ?? 'Colores manuales';
      summary.setAttribute('aria-label','Paleta de colores: '+currentName);
      current.replaceChildren();
      addLabel(current, currentName, colors().accent);
      options.replaceChildren();
      for (const entry of entries) {
        const button = document.createElement('button');
        button.type = 'button';
        button.setAttribute('aria-pressed',String(entry.id === (selected?.id ?? 'manual')));
        addLabel(button,entry.name,entry.colors.accent);
        button.addEventListener('click', () => {
          selected = entry.id === 'manual' ? null : entry;
          if (selected) {
            complete = {...entry.colors};
            apply({...complete});
          }
          details.open = false;
          message('');
          refresh();
          summary.focus();
        });
        options.append(button);
      }
      remove.disabled = !selected?.id.startsWith('custom:');
    }
    function persist(entries) {
      try { localStorage.setItem(storageKey,JSON.stringify(entries)); return true; }
      catch { message('No se pudieron guardar los cambios en este navegador.'); return false; }
    }
    save.addEventListener('click', () => {
      form.hidden = false;
      nameInput.value = selected?.id.startsWith('custom:') ? selected.name : '';
      nameInput.focus(); nameInput.select(); message('');
    });
    form.querySelector('[data-cancel]').addEventListener('click', () => {
      form.hidden = true; save.focus();
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      const name = nameInput.value.trim();
      if (!name) { message('Escribí un nombre para la paleta.'); return; }
      const entries = readSaved();
      const position = entries.findIndex(item => nameKey(item.name) === nameKey(name));
      if (position >= 0 && !window.confirm('¿Actualizar la paleta «'+entries[position].name+'»?')) return;
      const entry = {name,colors:colors()};
      entries[position < 0 ? entries.length : position] = entry;
      if (!persist(entries)) return;
      selected = {...entry,id:'custom:'+nameKey(name)};
      complete = {...entry.colors};
      apply({...complete});
      form.hidden = true;
      refresh();
      message('Paleta guardada.');
      summary.focus();
    });
    remove.addEventListener('click', () => {
      if (!selected?.id.startsWith('custom:') || !window.confirm('¿Eliminar la paleta «'+selected.name+'»?')) return;
      if (!persist(readSaved().filter(item => 'custom:'+nameKey(item.name) !== selected.id))) return;
      selected = null;
      refresh();
      message('Paleta eliminada.');
      summary.focus();
    });
    for (const input of manual) input.addEventListener('input', () => { selected = null; refresh(); });
    reset?.addEventListener('click', () => {
      selected = null; complete = {...initial}; message(''); refresh();
    });
    details.addEventListener('keydown', event => {
      if (event.key === 'Escape' && details.open) {
        event.preventDefault();
        details.open = false;
        summary.focus();
      }
    });
    window.addEventListener('storage', event => { if (event.key === storageKey || event.key === null) refresh(); });
    refresh();
  }
  window.GraphicPalettes = Object.freeze({mount});
})();
