/* ChatGPT World — RTS gameplay layer
 * Phase 4.1: browser-ready economy core.
 * Functional construction, population, farms, production, research and commands.
 */
(() => {
  const GAME = {
    resources: { wood: 120, food: 160, stone: 80, knowledge: 20 },
    units: [], nodes: [], buildings: [], selected: [],
    mode: 'select', nextUnitId: 1, nextBuildingId: 1,
    populationCap: 8, paused: false, speed: 1, last: performance.now(),
    production: [], research: null,
    techs: { logistics: false }, gatherMultiplier: 1
  };

  const COSTS = {
    house: { wood: 50 }, workshop: { wood: 90, stone: 30 },
    farm: { wood: 35 }, archive: { wood: 70, stone: 50 },
    villager: { food: 50 }, scout: { food: 60, wood: 20 },
    research: { knowledge: 10, food: 60 }
  };

  const root = () => document.getElementById('rtsGameLayer');
  const mat = (c, e = 0) => new THREE.MeshStandardMaterial({ color: c, emissive: e, emissiveIntensity: e ? .35 : 0, roughness: .72 });
  const title = s => s[0].toUpperCase() + s.slice(1);

  function boot() {
    if (root()) return;
    const r = document.createElement('div'); r.className = 'rts-game-layer'; r.id = 'rtsGameLayer';
    r.innerHTML = `<div class="rts-resourcebar">
      <span>🪵 <b data-r="wood">120</b></span><span>🌾 <b data-r="food">160</b></span>
      <span>🪨 <b data-r="stone">80</b></span><span>✦ <b data-r="knowledge">20</b></span>
      <span>👥 <b data-r="pop">3/8</b></span>
    </div>
    <div class="rts-actions">
      <button data-action="villager">Villager <small>50 food</small></button>
      <button data-action="house">House <small>50 wood</small></button>
      <button data-action="workshop">Workshop <small>90 wood · 30 stone</small></button>
      <button data-action="farm">Farm <small>35 wood</small></button>
      <button data-action="archive">Archive <small>70 wood · 50 stone</small></button>
      <button data-action="scout">Scout <small>60 food · 20 wood</small></button>
    </div>
    <div class="rts-selection" hidden><strong data-sel-title>Nothing selected</strong><span data-sel-detail>Select units or a building.</span></div>
    <div class="rts-commandbar">
      <button data-cmd="move">Move</button><button data-cmd="gather">Gather</button>
      <button data-cmd="build">Build</button><button data-cmd="work">Work Farm</button>
      <button data-cmd="stop">Stop</button><button data-cmd="research">Research</button>
      <span data-mode>SELECT</span>
    </div><div class="rts-toast" aria-live="polite"></div>`;
    document.body.appendChild(r);
    r.addEventListener('click', e => {
      const a = e.target.closest('[data-action]');
      if (a) { if (a.dataset.action === 'villager') queueVillager(); else if (a.dataset.action === 'scout') queueScout(); else enterBuildMode(a.dataset.action); return; }
      const c = e.target.closest('[data-cmd]'); if (c) command(c.dataset.cmd);
    });
    createNodes(); createTownCenter(); createStartingVillagers(); refreshUI();
    requestAnimationFrame(loop);
  }

  function createNodes() {
    [['wood', -8, -1, 700], ['wood', 7, -6, 700], ['food', -7, 6, 1000], ['food', 7, 5, 1000], ['stone', 8, 0, 600], ['stone', -8, -6, 600]].forEach(([type, x, z, amount]) => {
      const g = new THREE.Group();
      const color = type === 'wood' ? 0x4b8a52 : type === 'food' ? 0xd5a84c : 0x8d96a8;
      const geo = type === 'wood' ? new THREE.ConeGeometry(.6, 1.5, 7) : new THREE.DodecahedronGeometry(.65);
      const m = new THREE.Mesh(geo, mat(color)); m.position.y = type === 'wood' ? 1.6 : 1.45; g.add(m); g.position.set(x, 0, z);
      g.userData.rtsNode = { type };
      scene.add(g); GAME.nodes.push({ type, amount, mesh: g });
    });
  }

  function createTownCenter() {
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.2, 2.8), mat(0x55466e, 0x8e5cff)); base.position.y = 2.1;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2, 1.3, 4), mat(0x241d35, 0x8e5cff)); roof.position.y = 3.8; roof.rotation.y = Math.PI / 4;
    g.add(base, roof); g.position.set(0, 0, 0); g.userData.rtsBuilding = { type: 'towncenter', id: GAME.nextBuildingId++ };
    scene.add(g); GAME.buildings.push({ type: 'towncenter', mesh: g, hp: 1000, complete: true, progress: 100, rally: { x: 0, z: 3.5 } });
  }

  function createStartingVillagers() { [[-1.4, .8], [-.7, 1.1], [.1, .8]].forEach(p => spawnVillager(...p)); }

  function makeUnitMesh(type) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(type === 'scout' ? .24 : .22, type === 'scout' ? .7 : .55, 4, 8), mat(type === 'scout' ? 0xd8b85a : 0xc8d4e8, type === 'scout' ? 0x59460e : 0x25344f));
    const head = new THREE.Mesh(new THREE.SphereGeometry(.2, 10, 8), mat(0xe0b18a));
    body.position.y = 1.4; head.position.y = 1.9; g.add(body, head); g.userData.rtsUnit = true; scene.add(g); return g;
  }

  function spawnVillager(x, z) {
    if (GAME.units.length >= GAME.populationCap) return null;
    const g = makeUnitMesh('villager'); g.position.set(x, 0, z);
    const u = { id: GAME.nextUnitId++, type: 'villager', mesh: g, job: 'idle', target: null, carry: 0, carryType: null, hp: 100, speed: 2.6, command: 'idle' };
    GAME.units.push(u); return u;
  }

  function spawnScout(x, z) {
    if (GAME.units.length >= GAME.populationCap) return null;
    const g = makeUnitMesh('scout'); g.position.set(x, 0, z);
    const u = { id: GAME.nextUnitId++, type: 'scout', mesh: g, job: 'idle', target: null, carry: 0, carryType: null, hp: 80, speed: 3.8, command: 'idle' };
    GAME.units.push(u); return u;
  }

  function productionBuilding(type) { return GAME.buildings.find(b => b.type === type && b.complete); }

  function queueVillager() {
    if (!productionBuilding('towncenter')) return toast('Town Center unavailable.');
    if (GAME.units.length + GAME.production.length >= GAME.populationCap) return toast('Population cap reached — build a House.');
    if (!spend(COSTS.villager)) return toast('Not enough food.');
    GAME.production.push({ type: 'villager', time: 3, building: productionBuilding('towncenter') });
    toast('Villager queued at Town Center.'); refreshUI();
  }

  function queueScout() {
    if (!productionBuilding('workshop')) return toast('Complete a Workshop first.');
    if (GAME.units.length + GAME.production.length >= GAME.populationCap) return toast('Population cap reached.');
    if (!spend(COSTS.scout)) return toast('Not enough resources.');
    GAME.production.push({ type: 'scout', time: 5, building: productionBuilding('workshop') });
    toast('Scout queued at Workshop.'); refreshUI();
  }

  function enterBuildMode(type) { GAME.mode = 'build:' + type; updateMode(); toast(`Place ${title(type)} inside your territory.`); }

  function overlapping(x, z) { return GAME.buildings.some(b => Math.hypot(b.mesh.position.x - x, b.mesh.position.z - z) < (b.type === 'towncenter' ? 2.7 : 1.8)); }

  function placeBuilding(type, x, z) {
    if (GAME.mode !== 'build:' + type) return;
    if (Math.hypot(x, z) > 12.5) return toast('Outside your territory.');
    if (overlapping(x, z)) return toast('Too close to another building.');
    if (!spend(COSTS[type])) return toast('Not enough resources.');
    const s = { house: 1.15, workshop: 1.35, farm: .9, archive: 1.25 }[type];
    const c = { house: 0x6e4c82, workshop: 0x4b637d, farm: 0x718a43, archive: 0x5b4c91 }[type];
    const g = new THREE.Group();
    const b = new THREE.Mesh(new THREE.BoxGeometry(s * 1.7, s * 1.35, s * 1.7), mat(c)); b.position.y = 1.75 * s;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(s * 1.25, s * .8, 4), mat(0x2b2537, c)); roof.position.y = 2.75 * s; roof.rotation.y = Math.PI / 4;
    g.add(b, roof); g.position.set(x, 0, z); g.userData.rtsBuilding = { type, id: GAME.nextBuildingId++ }; scene.add(g);
    GAME.buildings.push({ type, mesh: g, hp: 100, progress: 0, complete: false, worker: null, food: type === 'farm' ? 300 : 0 });
    GAME.mode = 'select'; updateMode(); toast(`${title(type)} foundation placed. Select a villager, then Build.`); refreshUI();
  }

  function spend(cost) {
    for (const k in cost) if ((GAME.resources[k] || 0) < cost[k]) return false;
    for (const k in cost) GAME.resources[k] -= cost[k]; return true;
  }

  function selectedUnits() { return GAME.selected.filter(x => x && x.id); }
  function select(obj, add = false) { if (!add) GAME.selected = []; if (obj && !GAME.selected.includes(obj)) GAME.selected.push(obj); refreshSelection(); }

  function refreshSelection() {
    const p = root()?.querySelector('.rts-selection'); if (!p) return;
    p.hidden = !GAME.selected.length; if (!GAME.selected.length) return;
    const t = p.querySelector('[data-sel-title]'), d = p.querySelector('[data-sel-detail]');
    if (GAME.selected.length > 1) { t.textContent = `${GAME.selected.length} units selected`; d.textContent = 'Move, Gather, Build, Work Farm or Stop.'; return; }
    const x = GAME.selected[0];
    if (x.id) { t.textContent = `${title(x.type)} #${x.id}`; d.textContent = x.job === 'gather' ? `Gathering ${x.carryType}` : x.job === 'build' ? `Building ${title(x.target?.type || '')}` : x.job === 'farm' ? 'Working a farm' : 'Ready for orders.'; }
    else { t.textContent = title(x.type || 'building'); d.textContent = x.type === 'towncenter' ? 'Produces villagers.' : x.type === 'farm' ? `${Math.floor(x.progress)}% built · ${x.complete ? 'Ready for workers.' : 'Under construction.'}` : x.type === 'workshop' ? 'Produces scouts.' : x.type === 'archive' ? 'Researches technologies.' : `Population +4 when complete.`; }
  }

  function command(cmd) {
    if (cmd === 'research') return startResearch();
    const units = selectedUnits();
    if (cmd === 'build') return startBuild(units);
    if (cmd === 'work') return startFarmWork(units);
    if (!units.length) return toast('Select one or more villagers first.');
    if (cmd === 'stop') { units.forEach(u => clearJob(u)); toast('Orders stopped.'); return; }
    if (cmd === 'move' || cmd === 'gather') { GAME.mode = 'command:' + cmd; updateMode(); toast(cmd === 'move' ? 'Tap the ground to move selected units.' : 'Tap a resource to gather.'); }
  }

  function clearJob(u) { u.job = 'idle'; u.target = null; u.command = 'stop'; }

  function startBuild(units) {
    const building = GAME.selected.find(x => x && x.mesh && x.type && x.progress !== undefined && !x.complete);
    if (!building) return toast('Select an unfinished building, then a villager.');
    if (!units.length) return toast('Select a villager to build.');
    units.forEach(u => { if (u.type === 'villager') { u.job = 'build'; u.target = building; u.command = 'build'; building.worker = u; } });
    toast(`${title(building.type)} construction started.`); refreshSelection();
  }

  function startFarmWork(units) {
    const farm = GAME.selected.find(x => x && x.type === 'farm' && x.complete);
    if (!farm) return toast('Select a completed Farm.');
    if (!units.length) return toast('Select a villager to work the farm.');
    units.forEach(u => { if (u.type === 'villager') { u.job = 'farm'; u.target = farm; u.command = 'farm'; } });
    toast('Villager assigned to Farm.'); refreshSelection();
  }

  function issueAt(x, z) {
    const units = selectedUnits(); if (!units.length) return;
    if (GAME.mode === 'command:move') {
      units.forEach((u, i) => { u.job = 'move'; u.target = { x: x + (i % 3) * .55 - .55, z: z + Math.floor(i / 3) * .55 - .3 }; u.command = 'move'; });
      GAME.mode = 'select'; updateMode();
    } else if (GAME.mode === 'command:gather') {
      const n = GAME.nodes.find(n => n.amount > 0 && Math.hypot(n.mesh.position.x - x, n.mesh.position.z - z) < 1.8);
      if (!n) return toast('Tap directly on a resource.');
      units.forEach(u => assignGather(u, n)); GAME.mode = 'select'; updateMode();
    }
  }

  function assignGather(u, n) { u.job = 'gather'; u.target = n; u.carryType = n.type; u.command = 'gather'; }

  function startResearch() {
    if (!productionBuilding('archive')) return toast('Complete an Archive first.');
    if (GAME.techs.logistics || GAME.research) return toast(GAME.techs.logistics ? 'Efficient Logistics is already researched.' : 'Research already in progress.');
    if (!spend(COSTS.research)) return toast('Need 10 knowledge and 60 food.');
    GAME.research = { name: 'Efficient Logistics', time: 10 }; toast('Research started: Efficient Logistics.'); refreshUI();
  }

  function tick(dt) {
    if (GAME.paused) return;
    for (let i = GAME.production.length - 1; i >= 0; i--) {
      const q = GAME.production[i]; q.time -= dt;
      if (q.time <= 0) {
        const p = q.building?.rally || { x: 0, z: 3.5 };
        const u = q.type === 'scout' ? spawnScout(p.x, p.z) : spawnVillager(p.x, p.z);
        if (u) toast(`${title(q.type)} ready.`); GAME.production.splice(i, 1);
      }
    }
    if (GAME.research) { GAME.research.time -= dt; if (GAME.research.time <= 0) { GAME.research = null; GAME.techs.logistics = true; GAME.gatherMultiplier = 1.15; toast('Efficient Logistics complete: gathering +15%.'); } }

    GAME.buildings.forEach(b => {
      if (b.type === 'farm' && b.complete && b.food < 300) b.food = Math.min(300, b.food + dt * 1.2);
      if (b.type === 'farm' && b.complete && !GAME.units.some(u => u.job === 'farm' && u.target === b)) GAME.resources.food += dt * .15;
    });

    GAME.units.forEach(u => {
      if (u.job === 'idle') return;
      if (u.job === 'move' && u.target) moveTo(u, u.target, dt);
      else if (u.job === 'build' && u.target) doBuild(u, u.target, dt);
      else if (u.job === 'farm' && u.target) doFarm(u, u.target, dt);
      else if (u.job === 'gather' && u.target) doGather(u, u.target, dt);
    });
    refreshUI(); refreshSelection();
  }

  function doBuild(u, b, dt) {
    const d = Math.hypot(u.mesh.position.x - b.mesh.position.x, u.mesh.position.z - b.mesh.position.z);
    if (d > 1.5) return moveTo(u, b.mesh.position, dt);
    b.progress = Math.min(100, b.progress + dt * 22);
    if (b.progress >= 100) {
      b.complete = true; b.worker = null; clearJob(u);
      if (b.type === 'house') GAME.populationCap += 4;
      toast(`${title(b.type)} completed.`);
    }
  }

  function doFarm(u, farm, dt) {
    const d = Math.hypot(u.mesh.position.x - farm.mesh.position.x, u.mesh.position.z - farm.mesh.position.z);
    if (d > 1.25) return moveTo(u, farm.mesh.position, dt);
    if (farm.food <= 0) return;
    const harvest = Math.min(farm.food, 5 * dt * GAME.gatherMultiplier); farm.food -= harvest; GAME.resources.food += harvest;
  }

  function doGather(u, n, dt) {
    if (n.amount <= 0) { clearJob(u); n.mesh.visible = false; return; }
    const d = Math.hypot(u.mesh.position.x - n.mesh.position.x, u.mesh.position.z - n.mesh.position.z);
    if (d > 1.25) return moveTo(u, n.mesh.position, dt);
    const rate = 6 * dt * GAME.gatherMultiplier; n.amount = Math.max(0, n.amount - rate); u.carry += rate;
    if (u.carry >= 25 || n.amount <= 0) { GAME.resources[n.type] += u.carry; u.carry = 0; if (n.amount <= 0) { n.mesh.visible = false; clearJob(u); } }
  }

  function moveTo(u, p, dt) {
    const dx = p.x - u.mesh.position.x, dz = p.z - u.mesh.position.z, d = Math.hypot(dx, dz);
    if (d < .08) { u.job = 'idle'; u.target = null; return; }
    const s = Math.min(d, dt * u.speed); u.mesh.position.x += dx / d * s; u.mesh.position.z += dz / d * s; u.mesh.rotation.y = Math.atan2(dx, dz);
  }

  function refreshUI() {
    const r = root(); if (!r) return;
    Object.entries(GAME.resources).forEach(([k, v]) => { const x = r.querySelector(`[data-r="${k}"]`); if (x) x.textContent = Math.floor(v); });
    const p = r.querySelector('[data-r="pop"]'); if (p) p.textContent = `${GAME.units.length + GAME.production.length}/${GAME.populationCap}`;
    const v = r.querySelector('[data-action="villager"] small'); if (v) v.textContent = GAME.production.length ? `${GAME.production.length} queued` : '50 food';
    const s = r.querySelector('[data-action="scout"] small'); if (s) s.textContent = productionBuilding('workshop') ? '60 food · 20 wood' : 'Requires Workshop';
  }

  function updateMode() { const x = root()?.querySelector('[data-mode]'); if (x) x.textContent = GAME.mode.toUpperCase().replace(':', ' '); }
  function toast(t) { const x = root()?.querySelector('.rts-toast'); if (!x) return; x.textContent = t; x.classList.add('show'); clearTimeout(x._t); x._t = setTimeout(() => x.classList.remove('show'), 1900); }

  function wire() {
    if (!window.renderer?.domElement) return setTimeout(wire, 250);
    const canvas = renderer.domElement, ray = new THREE.Raycaster(), p = new THREE.Vector2();
    canvas.addEventListener('pointerdown', e => {
      const rect = canvas.getBoundingClientRect(); p.x = ((e.clientX - rect.left) / rect.width) * 2 - 1; p.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      ray.setFromCamera(p, camera); const hits = ray.intersectObjects(scene.children, true);
      const hit = hits.find(h => h.object?.parent?.userData?.rtsUnit || h.object?.parent?.userData?.rtsNode || h.object?.parent?.userData?.rtsBuilding);
      if (hit) {
        const g = hit.object.parent;
        if (g.userData.rtsUnit) { const u = GAME.units.find(u => u.mesh === g); if (u) select(u, e.shiftKey); return; }
        if (g.userData.rtsNode) { if (GAME.mode === 'command:gather') issueAt(g.position.x, g.position.z); else select(GAME.nodes.find(n => n.mesh === g)); return; }
        if (g.userData.rtsBuilding) { const b = GAME.buildings.find(b => b.mesh === g); if (b) select(b); return; }
      }
      if (GAME.mode.startsWith('build:')) { const h = hits.find(h => h.point && h.point.y <= 1.2); if (h) placeBuilding(GAME.mode.slice(6), h.point.x, h.point.z); }
      else if (GAME.mode.startsWith('command:')) { const h = hits.find(h => h.point); if (h) issueAt(h.point.x, h.point.z); }
      else if (GAME.selected.length) { GAME.selected = []; refreshSelection(); }
    });
  }

  function loop(now) { const dt = Math.min((now - GAME.last) / 1000, .05) * GAME.speed; GAME.last = now; tick(dt); requestAnimationFrame(loop); }
  Object.defineProperty(window, 'ChatGPTWorldRTS', { value: GAME, configurable: false });
  const start = () => { boot(); wire(); }; if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
