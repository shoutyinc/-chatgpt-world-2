/* ChatGPT World — RTS gameplay layer
 * Phase 2: selectable villagers, resource nodes, gathering, building placement,
 * population/capacity, and simple territory interaction.
 */
(() => {
  const GAME = {
    resources: { wood: 120, food: 160, stone: 80, knowledge: 20 },
    units: [],
    nodes: [],
    buildings: [],
    selected: null,
    mode: 'select',
    nextUnitId: 1,
    nextBuildingId: 1,
    populationCap: 8,
    paused: false,
    speed: 1,
    last: performance.now()
  };

  const COSTS = {
    house: { wood: 50 },
    workshop: { wood: 90, stone: 30 },
    farm: { wood: 35 },
    archive: { wood: 70, stone: 50, knowledge: 10 }
  };

  function ui() {
    return document.getElementById('rtsGameLayer');
  }

  function makeEl(tag, cls, text) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text !== undefined) el.textContent = text;
    return el;
  }

  function boot() {
    if (document.getElementById('rtsGameLayer')) return;
    const root = makeEl('div', 'rts-game-layer');
    root.id = 'rtsGameLayer';
    root.innerHTML = `
      <div class="rts-resourcebar">
        <span>🪵 <b data-r="wood">120</b></span>
        <span>🌾 <b data-r="food">160</b></span>
        <span>🪨 <b data-r="stone">80</b></span>
        <span>✦ <b data-r="knowledge">20</b></span>
        <span>👥 <b data-r="pop">0/8</b></span>
      </div>
      <div class="rts-actions">
        <button data-action="villager">Villager <small>50 food</small></button>
        <button data-action="house">House <small>50 wood</small></button>
        <button data-action="workshop">Workshop <small>90 wood · 30 stone</small></button>
        <button data-action="farm">Farm <small>35 wood</small></button>
      </div>
      <div class="rts-selection" hidden>
        <strong data-sel-title>Nothing selected</strong>
        <span data-sel-detail>Click a villager, building, or resource.</span>
      </div>
      <div class="rts-toast" aria-live="polite"></div>`;
    document.body.appendChild(root);

    root.addEventListener('click', e => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      if (action === 'villager') trainVillager();
      else enterBuildMode(action);
    });

    window.addEventListener('rts:select', e => select(e.detail));
    window.addEventListener('rts:build', e => placeBuilding(e.detail.type, e.detail.x, e.detail.z));

    createNodes();
    createStartingVillagers();
    refreshUI();
    requestAnimationFrame(loop);
  }

  function material(color, emissive = 0x000000) {
    return new THREE.MeshStandardMaterial({ color, emissive, emissiveIntensity: emissive ? .35 : 0, roughness: .72 });
  }

  function createNodes() {
    const defs = [
      ['wood', -8, -1, 700], ['wood', 7, -6, 700],
      ['food', -7, 6, 1000], ['food', 7, 5, 1000],
      ['stone', 8, 0, 600], ['stone', -8, -6, 600]
    ];
    defs.forEach(([type, x, z, amount]) => {
      const g = new THREE.Group();
      const color = type === 'wood' ? 0x4b8a52 : type === 'food' ? 0xd5a84c : 0x8d96a8;
      const geo = type === 'wood' ? new THREE.ConeGeometry(.6, 1.5, 7) : new THREE.DodecahedronGeometry(.65, 0);
      const mesh = new THREE.Mesh(geo, material(color));
      mesh.position.y = type === 'wood' ? 1.6 : 1.45;
      g.add(mesh);
      g.position.set(x, 0, z);
      g.userData.rtsNode = { type, amount };
      scene.add(g);
      GAME.nodes.push({ type, amount, mesh: g });
    });
  }

  function createStartingVillagers() {
    [[-1.4, .8],[-.7, 1.1],[.1, .8]].forEach(([x,z]) => spawnVillager(x,z));
  }

  function spawnVillager(x, z) {
    if (GAME.units.length >= GAME.populationCap) return null;
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(.22, .55, 4, 8), material(0xc8d4e8, 0x25344f));
    body.position.y = 1.35;
    const head = new THREE.Mesh(new THREE.SphereGeometry(.19, 10, 8), material(0xe0b18a));
    head.position.y = 1.85;
    g.add(body, head);
    g.position.set(x, 0, z);
    g.userData.rtsUnit = true;
    scene.add(g);
    const unit = { id: GAME.nextUnitId++, mesh: g, job: 'idle', target: null, carry: 0, carryType: null, hp: 100 };
    GAME.units.push(unit);
    return unit;
  }

  function trainVillager() {
    if (GAME.units.length >= GAME.populationCap) return toast('Population cap reached — build a House.');
    if (!spend({ food: 50 })) return toast('Not enough food.');
    const unit = spawnVillager(0, 1.5);
    if (unit) {
      unit.target = { x: 0, z: 2.2 };
      toast('Villager trained.');
    }
    refreshUI();
  }

  function enterBuildMode(type) {
    if (!COSTS[type]) return;
    GAME.mode = 'build:' + type;
    toast(`Place ${type}: tap/click the island.`);
  }

  function placeBuilding(type, x, z) {
    if (GAME.mode !== 'build:' + type) return;
    if (!spend(COSTS[type])) return toast('Not enough resources.');
    const sizes = { house: 1.15, workshop: 1.35, farm: .9, archive: 1.25 };
    const colors = { house: 0x6e4c82, workshop: 0x4b637d, farm: 0x718a43, archive: 0x5b4c91 };
    const s = sizes[type] || 1;
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(s * 1.7, s * 1.35, s * 1.7), material(colors[type]));
    base.position.y = 1.75 * s;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(s * 1.25, s * .8, 4), material(0x2b2537, colors[type]));
    roof.position.y = 2.75 * s;
    roof.rotation.y = Math.PI / 4;
    g.add(base, roof);
    g.position.set(x, 0, z);
    g.userData.rtsBuilding = { type, id: GAME.nextBuildingId++ };
    scene.add(g);
    GAME.buildings.push({ type, mesh: g });
    if (type === 'house') GAME.populationCap += 4;
    GAME.mode = 'select';
    toast(`${type[0].toUpperCase() + type.slice(1)} constructed.`);
    refreshUI();
  }

  function spend(cost) {
    for (const k in cost) if ((GAME.resources[k] || 0) < cost[k]) return false;
    for (const k in cost) GAME.resources[k] -= cost[k];
    return true;
  }

  function select(obj) {
    GAME.selected = obj;
    const panel = document.querySelector('.rts-selection');
    if (!panel) return;
    panel.hidden = !obj;
    if (!obj) return;
    const title = panel.querySelector('[data-sel-title]');
    const detail = panel.querySelector('[data-sel-detail]');
    if (obj.id) {
      title.textContent = `Villager #${obj.id}`;
      detail.textContent = obj.job === 'gather' ? `Gathering ${obj.carryType || 'resources'}` : 'Ready for orders';
    } else if (obj.type) {
      title.textContent = obj.type[0].toUpperCase() + obj.type.slice(1);
      detail.textContent = `${Math.floor(obj.amount)} remaining`;
    }
  }

  function refreshUI() {
    const root = ui();
    if (!root) return;
    Object.entries(GAME.resources).forEach(([k,v]) => { const el = root.querySelector(`[data-r="${k}"]`); if (el) el.textContent = Math.floor(v); });
    const pop = root.querySelector('[data-r="pop"]');
    if (pop) pop.textContent = `${GAME.units.length}/${GAME.populationCap}`;
  }

  function toast(text) {
    const el = ui()?.querySelector('.rts-toast');
    if (!el) return;
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove('show'), 1800);
  }

  function nearestNode(unit) {
    let best = null, dist = Infinity;
    GAME.nodes.forEach(n => {
      if (n.amount <= 0) return;
      const d = Math.hypot(unit.mesh.position.x - n.mesh.position.x, unit.mesh.position.z - n.mesh.position.z);
      if (d < dist) { dist = d; best = n; }
    });
    return best;
  }

  function tick(dt) {
    if (GAME.paused) return;
    GAME.units.forEach(u => {
      if (u.job === 'idle') {
        const node = nearestNode(u);
        if (node) { u.target = node; u.job = 'gather'; u.carryType = node.type; }
      }
      if (u.job === 'gather' && u.target) {
        const n = u.target;
        const dx = n.mesh.position.x - u.mesh.position.x;
        const dz = n.mesh.position.z - u.mesh.position.z;
        const d = Math.hypot(dx,dz);
        if (d > 1.25) {
          const step = Math.min(d, dt * 2.2);
          u.mesh.position.x += dx / d * step;
          u.mesh.position.z += dz / d * step;
        } else if (n.amount > 0) {
          const rate = 5 * dt;
          n.amount -= rate;
          u.carry += rate;
          if (u.carry >= 25 || n.amount <= 0) {
            GAME.resources[n.type] += u.carry;
            u.carry = 0;
            if (n.amount <= 0) {
              n.mesh.visible = false;
              u.job = 'idle';
              u.target = null;
            }
          }
        }
      }
    });
    refreshUI();
  }

  function loop(now) {
    const dt = Math.min((now - GAME.last) / 1000, .05) * GAME.speed;
    GAME.last = now;
    tick(dt);
    requestAnimationFrame(loop);
  }

  function wireSceneInput() {
    if (!renderer?.domElement) return setTimeout(wireSceneInput, 250);
    const canvas = renderer.domElement;
    const ray = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    canvas.addEventListener('pointerdown', e => {
      const r = canvas.getBoundingClientRect();
      pointer.x = ((e.clientX-r.left)/r.width)*2-1;
      pointer.y = -((e.clientY-r.top)/r.height)*2+1;
      ray.setFromCamera(pointer, camera);
      const hits = ray.intersectObjects(scene.children, true);
      const hit = hits.find(h => h.object?.parent?.userData?.rtsUnit || h.object?.parent?.userData?.rtsNode || h.object?.parent?.userData?.rtsBuilding);
      if (hit) {
        const g = hit.object.parent;
        if (g.userData.rtsUnit) {
          const unit = GAME.units.find(u => u.mesh === g); select(unit); toast(`Villager #${unit.id} selected.`);
        } else if (g.userData.rtsNode) select(g.userData.rtsNode);
        else if (g.userData.rtsBuilding) select(g.userData.rtsBuilding);
        return;
      }
      if (GAME.mode.startsWith('build:')) {
        const ground = ray.intersectObjects(scene.children, true).find(h => h.point && h.point.y <= 1.15 && !h.object.userData.rtsUnit);
        if (ground) placeBuilding(GAME.mode.slice(6), ground.point.x, ground.point.z);
      }
    });
  }

  Object.defineProperty(window, 'ChatGPTWorldRTS', { value: GAME, configurable: false });
  const start = () => { boot(); wireSceneInput(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
