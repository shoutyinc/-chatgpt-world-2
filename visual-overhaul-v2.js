/* ChatGPT World — Visual Overhaul v2
 * Corrects the visual hierarchy: ChatGPT is the permanent capital;
 * every other building represents an individual conversation and grows with it.
 */
(() => {
  const wait = (fn, tries = 0) => {
    if (typeof THREE !== 'undefined' && typeof scene !== 'undefined' && scene && typeof camera !== 'undefined' && camera) return fn();
    if (tries < 150) setTimeout(() => wait(fn, tries + 1), 100);
  };

  const C = {
    teal: 0x12b8ad,
    cyan: 0x6df7ff,
    blue: 0x2367b1,
    gold: 0xf0b35b,
    wood: 0x6a432b,
    roof: 0x203c49,
    wall: 0x76553f,
    stone: 0x77736b,
    grass: 0x365c39,
    path: 0x9c8667
  };

  const M = (color, emissive = 0, roughness = .75, metalness = 0) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness, emissive, emissiveIntensity: emissive ? .65 : 0 });

  const add = (g, mesh, x = 0, y = 0, z = 0) => { mesh.position.set(x, y, z); g.add(mesh); return mesh; };

  function chatHouse(thread) {
    const p = Math.max(0, Math.min(100, Number(thread.progress) || 0));
    const level = Math.max(1, Math.min(5, 1 + Math.floor(p / 23)));
    const s = .78 + level * .08;
    const g = new THREE.Group();
    const w = 1.85 * s;
    const h = 1.55 * s;

    add(g, new THREE.Mesh(new THREE.BoxGeometry(w, h, w), M(C.wall)), 0, .95 + h / 2, 0);
    add(g, new THREE.Mesh(new THREE.ConeGeometry(w * .82, .9 * s, 4), M(C.roof, 0x10252c)), 0, 2.08 + h * .38, 0).rotation.y = Math.PI / 4;
    add(g, new THREE.Mesh(new THREE.BoxGeometry(w * .58, .13, .58), M(C.gold)), 0, .76, w * .55);
    add(g, new THREE.Mesh(new THREE.BoxGeometry(.48 * s, .85 * s, .10), M(0x2b1c15)), 0, .82, w * .51);

    [[-.32, w*.51],[.32, w*.51],[-.32, -w*.51],[.32, -w*.51]].forEach(([x,z], i) => {
      const win = new THREE.Mesh(new THREE.BoxGeometry(.26*s,.34*s,.06), M(C.gold,C.gold));
      win.position.set(x,1.48+h*.25,z); if (z < 0) win.rotation.y = Math.PI; g.add(win);
    });

    const chimney = new THREE.Mesh(new THREE.BoxGeometry(.22*s,.58*s,.22*s), M(0x4c4640));
    chimney.position.set(w*.28,2.15*s,-w*.2); g.add(chimney);

    // Visible construction stages make conversation growth tangible.
    if (p < 100) {
      const scaffold = M(0x936b45);
      [-1,1].forEach(x => [-1,1].forEach(z => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,2.4*s,6), scaffold);
        post.position.set(x*w*.62,1.45,z*w*.62); g.add(post);
      }));
      const progress = new THREE.Mesh(new THREE.BoxGeometry(w*.9,.045,.045), M(C.teal,C.teal));
      progress.position.set(0,2.45*s,w*.61); g.add(progress);
    }

    // Chat-specific accent: every conversation gets its own banner.
    const banner = new THREE.Mesh(new THREE.PlaneGeometry(.42*s,.30*s), M(C.blue, C.blue));
    banner.position.set(-w*.66,1.62*s,w*.18); banner.rotation.y=Math.PI/2; g.add(banner);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(.022,.022,1.1*s,8),M(C.wood));
    pole.position.set(-w*.66,1.45*s,w*.18); g.add(pole);

    g.userData.chatLevel = level;
    g.userData.chatProgress = p;
    return g;
  }

  function chatCapital() {
    const g = new THREE.Group();
    const base = M(0x31545d), trim = M(C.teal,C.teal), roof = M(0x163e48,0x0c5b64);
    add(g,new THREE.Mesh(new THREE.CylinderGeometry(2.55,2.9,.55,32),M(0x4a5c5e)),0,1.08,0);
    add(g,new THREE.Mesh(new THREE.BoxGeometry(3.25,2.55,3.25),base),0,2.35,0);
    add(g,new THREE.Mesh(new THREE.ConeGeometry(2.65,1.55,6),roof),0,4.35,0);
    add(g,new THREE.Mesh(new THREE.ConeGeometry(.82,1.05,6),trim),0,5.55,0);
    add(g,new THREE.Mesh(new THREE.SphereGeometry(.38,20,16),M(C.cyan,C.cyan,0.3,0.2)),0,6.2,0);
    add(g,new THREE.Mesh(new THREE.TorusGeometry(.68,.07,10,48),M(C.cyan,C.cyan)),0,6.2,0).rotation.x=Math.PI/2;

    const door=add(g,new THREE.Mesh(new THREE.BoxGeometry(.62,1.05,.10),M(0x241712)),0,1.45,1.66);
    add(g,new THREE.Mesh(new THREE.BoxGeometry(.23,.30,.06),M(C.gold,C.gold)),0,2.55,1.66);
    [-1,1].forEach(x=>{
      const flag=add(g,new THREE.Mesh(new THREE.PlaneGeometry(.48,.34),M(C.blue,C.blue)),x*2.0,3.15,.1); flag.rotation.y=Math.PI/2;
      add(g,new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,1.35,8),M(C.wood)),x*2.0,3.0,.1);
    });
    for(let i=0;i<4;i++){
      const w=add(g,new THREE.Mesh(new THREE.BoxGeometry(.34,.48,.07),M(C.gold,C.gold)),i<2?-1.05:1.05,2.65,(i%2===0?1.66:-1.66));
      if(i%2)w.rotation.y=Math.PI;
    }
    g.userData.chatCapital=true;
    return g;
  }

  function paverPath(x1,z1,x2,z2,width=.65){
    const dx=x2-x1,dz=z2-z1,len=Math.hypot(dx,dz);
    const g=new THREE.Mesh(new THREE.BoxGeometry(width,.08,len),M(C.path,.0,.95));
    g.position.set((x1+x2)/2,1.04,(z1+z2)/2); g.rotation.y=Math.atan2(dx,dz); scene.add(g);
  }

  function addLantern(x,z){
    const g=new THREE.Group();
    add(g,new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.75,8),M(C.wood)),0,1.35,0);
    add(g,new THREE.Mesh(new THREE.SphereGeometry(.12,10,8),M(C.gold,C.gold)),0,1.78,0);
    g.position.set(x,0,z); scene.add(g);
  }

  function addFoliage(){
    for(let i=0;i<36;i++){
      const a=(i/36)*Math.PI*2, r=7.5+(i%5)*.9;
      const g=new THREE.Group();
      add(g,new THREE.Mesh(new THREE.CylinderGeometry(.07,.10,.75,7),M(C.wood)),0,.95,0);
      add(g,new THREE.Mesh(new THREE.SphereGeometry(.48+(i%3)*.08,10,8),M(0x2f6842)),0,1.55,0);
      g.position.set(Math.cos(a)*r,0,Math.sin(a)*r); scene.add(g);
    }
  }

  function rebuild(){
    if (typeof threads === 'undefined') return;

    // The old Project Hub is a normal conversation now, not the capital.
    scene.traverse(obj=>{
      if(obj.userData?.threadIndex===4 && obj.isGroup){
        obj.position.set(0,-5.0);
      }
    });

    // Rebuild every chat house as a proper conversation building.
    scene.traverse(obj=>{
      if(obj.userData?.threadIndex===undefined || !obj.isGroup) return;
      const thread=threads[obj.userData.threadIndex];
      if(!thread) return;
      const pos=obj.position.clone();
      obj.clear();
      const h=chatHouse(thread);
      h.children.forEach(c=>obj.add(c));
      obj.position.copy(pos);
      obj.userData.chatBuilding=true;
    });

    // Hide the old RTS Town Center mesh; the permanent ChatGPT capital replaces it visually.
    scene.traverse(obj=>{
      if(obj.userData?.rtsBuilding?.type==='towncenter') obj.visible=false;
    });

    const capital=chatCapital(); capital.position.set(0,0,0); scene.add(capital);

    const points=threads.filter(t=>t.type!=='hub');
    points.forEach(t=>paverPath(0,0,t.x,t.z,.72));
    paverPath(0,0,0,-5,.72);
    [[-3.8,-1.0],[3.8,-1.0],[-3.8,1.4],[3.8,1.4],[-1.8,-3.2],[1.8,-3.2]].forEach(p=>addLantern(...p));
    addFoliage();

    // Reframe the world so the settlement reads as a town instead of a close-up model.
    if(typeof cameraRadius!=='undefined') cameraRadius=29;
    if(typeof cameraPhi!=='undefined') cameraPhi=1.02;
    if(typeof updateCamera==='function') updateCamera();
  }

  wait(rebuild);
})();
