(() => {
  const state = { wood: 420, food: 310, stone: 180, knowledge: 95, population: 5, cap: 10, paused: false, speed: 1 };

  const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    return node;
  };

  function mount() {
    const hud = document.querySelector('.hud');
    if (!hud) return;

    const resources = el('section', 'rts-resources');
    resources.innerHTML = `
      <div class="resource"><span class="resource-icon">▣</span><b id="rtsWood">420</b><small>WOOD</small></div>
      <div class="resource"><span class="resource-icon">●</span><b id="rtsFood">310</b><small>FOOD</small></div>
      <div class="resource"><span class="resource-icon">◆</span><b id="rtsStone">180</b><small>STONE</small></div>
      <div class="resource"><span class="resource-icon">✦</span><b id="rtsKnowledge">95</b><small>KNOWLEDGE</small></div>
      <div class="resource population"><b id="rtsPop">5/10</b><small>POP</small></div>
    `;

    const command = el('section', 'rts-command');
    command.innerHTML = `
      <div class="rts-command-title"><span>COMMAND</span><button id="rtsPause" aria-label="Pause">Ⅱ</button></div>
      <div class="rts-build-grid">
        <button data-cost="wood:80" data-build="House"><strong>⌂</strong><span>House</span><small>80 wood</small></button>
        <button data-cost="wood:120,stone:40" data-build="Workshop"><strong>⚒</strong><span>Workshop</span><small>120w · 40s</small></button>
        <button data-cost="food:100,wood:60" data-build="Farm"><strong>♜</strong><span>Farm</span><small>100f · 60w</small></button>
        <button data-cost="stone:100,knowledge:40" data-build="Archive"><strong>✦</strong><span>Archive</span><small>100s · 40k</small></button>
      </div>
      <div class="rts-speed"><button data-speed="0.5">½×</button><button class="selected" data-speed="1">1×</button><button data-speed="2">2×</button></div>
      <div id="rtsEvent" class="rts-event">World systems ready.</div>
    `;

    const mini = el('section', 'rts-minimap');
    mini.innerHTML = '<div class="minimap-title">WORLD MAP</div><div class="minimap-grid" id="rtsMap"></div>';

    hud.append(resources, mini, command);

    const map = document.getElementById('rtsMap');
    const points = [
      ['working', 31, 34], ['waiting', 68, 35], ['finished', 34, 69],
      ['idle', 67, 65], ['dormant', 50, 51]
    ];
    points.forEach(([type, x, y]) => {
      const p = el('i', `map-point ${type}`);
      p.style.left = `${x}%`; p.style.top = `${y}%`;
      map.appendChild(p);
    });

    document.querySelectorAll('.rts-build-grid button').forEach(btn => btn.addEventListener('click', () => build(btn)));
    document.querySelectorAll('.rts-speed button').forEach(btn => btn.addEventListener('click', () => {
      state.speed = Number(btn.dataset.speed);
      document.querySelectorAll('.rts-speed button').forEach(b => b.classList.toggle('selected', b === btn));
      document.getElementById('rtsEvent').textContent = `Simulation speed set to ${state.speed}×.`;
    }));
    document.getElementById('rtsPause').addEventListener('click', (e) => {
      state.paused = !state.paused;
      e.currentTarget.textContent = state.paused ? '▶' : 'Ⅱ';
      document.getElementById('rtsEvent').textContent = state.paused ? 'World paused.' : 'World resumed.';
    });

    setInterval(tick, 3000);
  }

  function build(button) {
    if (state.paused) return;
    const costs = Object.fromEntries(button.dataset.cost.split(',').map(v => v.split(':').map(Number)));
    for (const [resource, amount] of Object.entries(costs)) {
      if (state[resource] < amount) {
        document.getElementById('rtsEvent').textContent = `Not enough ${resource}.`;
        return;
      }
    }
    if (button.dataset.build === 'House' && state.population >= state.cap) state.cap += 5;
    Object.entries(costs).forEach(([resource, amount]) => state[resource] -= amount);
    document.getElementById('rtsEvent').textContent = `${button.dataset.build} construction started.`;
    render();
  }

  function tick() {
    if (state.paused) return;
    state.wood += Math.round(3 * state.speed);
    state.food += Math.round(2 * state.speed);
    state.stone += Math.round(1 * state.speed);
    state.knowledge += state.speed >= 2 ? 1 : 0;
    render();
  }

  function render() {
    document.getElementById('rtsWood').textContent = state.wood;
    document.getElementById('rtsFood').textContent = state.food;
    document.getElementById('rtsStone').textContent = state.stone;
    document.getElementById('rtsKnowledge').textContent = state.knowledge;
    document.getElementById('rtsPop').textContent = `${state.population}/${state.cap}`;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
