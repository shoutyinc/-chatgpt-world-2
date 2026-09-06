/* ChatGPT World — Visual Overhaul v1
 * Makes the world read like a living conversation-driven RTS.
 */
(() => {
  const wait = (fn, tries = 0) => {
    if (typeof THREE !== 'undefined' && typeof scene !== 'undefined' && scene && typeof renderer !== 'undefined' && renderer?.domElement) return fn();
    if (tries < 120) setTimeout(() => wait(fn, tries + 1), 100);
  };

  const colors = { teal: 0x10a7a0, cyan: 0x67f5ff, wood: 0x6e4329, stone: 0x756f6b, roof: 0x203b48, warm: 0xffc86b };
  const mat = (color, opts = {}) => new THREE.MeshStandardMaterial({ color, roughness: opts.roughness ?? .72, metalness: opts.metalness ?? 0, emissive: opts.emissive ?? 0, emissiveIntensity: opts.emissiveIntensity ?? .25 });
  const box = (w, h, d, material, y = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material); m.position.y = y; return m; };

  function addWindow(g, x, y, z, rotY = 0) {
    const frame = box(.34, .46, .08, mat(0x30241b), y); frame.position.x = x; frame.position.z = z; frame.rotation.y = rotY;
    const glow = box(.20, .30, .09, mat(colors.warm, { emissive: colors.warm, emissiveIntensity: 1.5 }), y); glow.position.x = x; glow.position.z = z + .01; glow.rotation.y = rotY; g.add(frame, glow);
  }
  function addDoor(g, z, scale = 1) { const d = box(.52 * scale, .85 * scale, .10 * scale, mat(0x2b1b16), .82 * scale); d.position.z = z; g.add(d); }
  function addChimney(g, x, z, scale = 1) { const c = box(.28 * scale, .65 * scale, .28 * scale, mat(0x4a4542), 2.05 * scale); c.position.x = x; c.position.z = z; g.add(c); const smoke = new THREE.Mesh(new THREE.SphereGeometry(.16 * scale, 8, 8), mat(0xc8c8c8, { emissive: 0x333333 })); smoke.position.set(x, 2.55 * scale, z); g.add(smoke); }
  function addBanner(g, x, z, color = colors.teal, scale = 1) { const pole = new THREE.Mesh(new THREE.CylinderGeometry(.025 * scale, .025 * scale, 1.05 * scale, 8), mat(0x3d2b20)); pole.position.set(x, 1.5 * scale, z); const flag = new THREE.Mesh(new THREE.PlaneGeometry(.42 * scale, .28 * scale), mat(color, { emissive: color, emissiveIntensity: .5 })); flag.position.set(x + .18 * scale, 1.72 * scale, z); flag.rotation.y = Math.PI / 2; g.add(pole, flag); }

  function makeHouse(thread, isMain = false) {
    const g = new THREE.Group();
    const p = Math.max(0, Math.min(100, thread.progress || 0));
    const level = isMain ? 1 + Math.floor(p / 25) : 1 + Math.floor(p / 22);
    const s = isMain ? 1.15 + level * .08 : .82 + level * .075;
    const w = 2.0 * s, h = 1.65 * s;
    const wall = mat(isMain ? 0x31515a : 0x6a5140), trim = mat(isMain ? colors.teal : 0x9d7651), roof = mat(isMain ? 0x173d46 : colors.roof);
    g.add(box(w, h, w, wall, .95 + h / 2));
    const roofMesh = new THREE.Mesh(new THREE.ConeGeometry(w * .82, .92 * s, 4), roof); roofMesh.position.y = 2.05 + h * .45; roofMesh.rotation.y = Math.PI / 4; g.add(roofMesh);
    const porch = box(w * .58, .16 * s, .62 * s, trim, .72); porch.position.z = w * .54; g.add(porch);
    addDoor(g, w * .54, s); addWindow(g, -w*.30, 1.25 + h*.35, w*.51); addWindow(g, w*.30, 1.25 + h*.35, w*.51); addWindow(g, -w*.51, 1.25 + h*.35, 0, Math.PI/2); addChimney(g, w*.28, -w*.22, s); addBanner(g, -w*.62, w*.18, isMain ? colors.teal : trim, s); addBanner(g, w*.62, w*.18, isMain ? colors.teal : trim, s);
    if (!isMain && p < 100) {
      const scaffold = mat(0x8f6a45);
      [[-w*.62,-w*.58],[w*.62,-w*.58],[-w*.62,w*.58],[w*.62,w*.58]].forEach(([x,z]) => { const post = new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,2.5*s,6), scaffold); post.position.set(x,1.35,z); g.add(post); });
      const beam = box(w*1.45,.06,.06,scaffold,2.25*s); beam.rotation.z=.18; g.add(beam);
    }
    if (isMain) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(.72,.07,10,48), mat(colors.cyan,{emissive:colors.cyan,emissiveIntensity:2})); ring.rotation.x=Math.PI/2; ring.position.y=3.65; g.add(ring);
      const orb = new THREE.Mesh(new THREE.SphereGeometry(.28,20,14), mat(colors.cyan,{emissive:colors.cyan,emissiveIntensity:2})); orb.position.y=3.65; g.add(orb);
    }
    g.userData.visualLevel = level; g.userData.chatProgress = p; return g;
  }

  function upgradeThreadBuildings() {
    if (typeof threads === 'undefined') return;
    scene.traverse(obj => {
      if (obj.userData?.threadIndex === undefined || !obj.isGroup) return;
      const thread = threads[obj.userData.threadIndex]; if (!thread) return;
      const oldPos = obj.position.clone(), oldIndex = obj.userData.threadIndex, isMain = thread.type === 'hub';
      const replacement = makeHouse(thread, isMain); obj.clear(); replacement.children.forEach(child => obj.add(child)); obj.position.copy(oldPos);
      obj.userData.threadIndex = oldIndex; obj.userData.chatBuilding = true; obj.userData.chatLevel = replacement.userData.visualLevel; obj.userData.chatProgress = replacement.userData.chatProgress;
    });
    scene.traverse(obj => { if (obj.userData?.rtsBuilding?.type === 'towncenter') obj.visible = false; });
  }

  function upgradeResources() {
    scene.traverse(obj => {
      if (!obj.userData?.rtsNode || !obj.isGroup) return;
      const type = obj.userData.rtsNode.type; obj.clear();
      if (type === 'wood') {
        for (let i=0;i<3;i++) { const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.10,.14,1.2,8),mat(colors.wood)); trunk.position.set((i-1)*.32,.95,(i%2)*.28-.14); obj.add(trunk); const crown=new THREE.Mesh(new THREE.SphereGeometry(.48,10,8),mat(0x2e6b42)); crown.position.set((i-1)*.32,1.75,(i%2)*.28-.14); obj.add(crown); }
      } else if (type === 'stone') {
        for (let i=0;i<5;i++) { const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(.35+(i%3)*.07),mat(colors.stone)); rock.position.set((i-2)*.32,.55+(i%2)*.18,((i%2)-.5)*.45); obj.add(rock); }
      } else {
        obj.add(box(1.3,.08,1.3,mat(0x5a3e27),.08));
        for(let i=0;i<9;i++){const plant=new THREE.Mesh(new THREE.ConeGeometry(.08,.35,5),mat(0x65a74a)); plant.position.set(-.5+(i%3)*.5,.28,-.5+Math.floor(i/3)*.5); obj.add(plant);}
      }
    });
  }

  function addWorldDetails() {
    for (let i=0;i<28;i++) { const a=(i/28)*Math.PI*2, r=8.8+(i%4)*.65; const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(.16+(i%3)*.06),mat(0x686660)); rock.position.set(Math.cos(a)*r,.98,Math.sin(a)*r); scene.add(rock); }
  }
  function boot(){ upgradeThreadBuildings(); upgradeResources(); addWorldDetails(); }
  wait(boot);
})();
