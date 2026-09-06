/* ChatGPT World — Visual Overhaul v2
 * A real isometric RTS presentation: broader map, richer terrain,
 * readable conversation buildings, fixed ChatGPT HQ, and wide camera.
 */
(() => {
  const wait = (fn, tries = 0) => {
    if (typeof THREE !== 'undefined' && typeof scene !== 'undefined' && scene && typeof renderer !== 'undefined' && renderer?.domElement) return fn();
    if (tries < 120) setTimeout(() => wait(fn, tries + 1), 100);
  };

  const C = {
    grass: 0x4d7448, grass2: 0x638b52, dirt: 0x8b6748,
    water: 0x145b72, deepWater: 0x0a344b, stone: 0x6e6b64,
    wood: 0x70462d, roof: 0x294654, roof2: 0x3d5662,
    warm: 0xffd27a, teal: 0x14d8cf, cyan: 0x75f7ff,
    gold: 0xd8a84e, white: 0xf4f1e8, dark: 0x17242a
  };
  const material = (color, opts = {}) => new THREE.MeshStandardMaterial({
    color, roughness: opts.roughness ?? .78, metalness: opts.metalness ?? 0,
    emissive: opts.emissive ?? 0, emissiveIntensity: opts.emissiveIntensity ?? .15
  });
  const meshBox = (w,h,d,m,y=0) => { const x=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); x.position.y=y; return x; };

  function addWindow(g,x,y,z,rot=0) {
    const frame=meshBox(.42,.52,.09,material(0x241d19),y); frame.position.set(x,0,z); frame.rotation.y=rot;
    const glow=meshBox(.26,.34,.10,material(C.warm,{emissive:C.warm,emissiveIntensity:1.8}),y); glow.position.set(x,0,z+.02); glow.rotation.y=rot;
    g.add(frame,glow);
  }
  function addDoor(g,z,w=.55) { const d=meshBox(w,.95,.12,material(0x2c211d),.82); d.position.z=z; g.add(d); }
  function addChimney(g,x,z,s) { const c=meshBox(.28*s,.62*s,.28*s,material(0x57504a),2.2*s); c.position.x=x; c.position.z=z; g.add(c); }
  function addBanner(g,x,z,color,s) {
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(.028*s,.028*s,1.35*s,7),material(0x493526)); pole.position.set(x,1.55*s,z);
    const flag=new THREE.Mesh(new THREE.PlaneGeometry(.48*s,.34*s),material(color,{emissive:color,emissiveIntensity:.45})); flag.position.set(x+.20*s,1.82*s,z); flag.rotation.y=Math.PI/2; g.add(pole,flag);
  }

  function makeChatHouse(thread) {
    const p=Math.max(0,Math.min(100,Number(thread.progress)||0));
    const level=Math.min(5,1+Math.floor(p/20));
    const s=.82+level*.18;
    const w=1.8*s, h=1.35*s;
    const g=new THREE.Group();
    g.userData.chatBuilding=true; g.userData.chatLevel=level; g.userData.chatProgress=p;

    const wallColor=level>=4?0x74553e:level>=3?0x694d3b:0x5b473b;
    g.add(meshBox(w,h,w,material(wallColor),.95+h/2));

    const trim=material(level>=5?C.gold:0xb58b61);
    const roofMat=material(level>=4?C.roof2:C.roof);
    const roof=new THREE.Mesh(new THREE.ConeGeometry(w*.82,.95*s,4),roofMat);
    roof.position.y=2.03+h*.46; roof.rotation.y=Math.PI/4; g.add(roof);

    // Level-based wings make a busy conversation visibly become a larger building.
    if(level>=3){
      const wing=meshBox(w*.48,h*.72,w*.62,material(wallColor),.82+h*.36); wing.position.x=w*.66; g.add(wing);
      const wingRoof=new THREE.Mesh(new THREE.ConeGeometry(w*.43,.62*s,4),roofMat); wingRoof.position.set(w*.66,1.72+h*.36,0); wingRoof.rotation.y=Math.PI/4; g.add(wingRoof);
    }
    if(level>=5){
      const tower=meshBox(w*.42,h*1.15,w*.42,material(wallColor),1.1+h*.52); tower.position.x=-w*.55; g.add(tower);
      const towerRoof=new THREE.Mesh(new THREE.ConeGeometry(w*.32,.75*s,4),trim); towerRoof.position.set(-w*.55,2.35+h*.62,0); towerRoof.rotation.y=Math.PI/4; g.add(towerRoof);
    }

    const front=w*.51;
    addDoor(g,front,.56*s);
    addWindow(g,-w*.30,1.25+h*.35,front);
    addWindow(g,w*.30,1.25+h*.35,front);
    addWindow(g,-front,1.25+h*.35,0,Math.PI/2);
    addWindow(g,front,1.25+h*.35,0,Math.PI/2);
    addChimney(g,w*.28,-w*.24,s);
    addBanner(g,-w*.62,w*.20,level>=4?C.gold:0x8f6a4b,s);
    addBanner(g,w*.62,w*.20,level>=4?C.gold:0x8f6a4b,s);

    // Construction only belongs to this conversation house.
    if(p<100){
      const sc=material(0xb28755);
      [-w*.68,w*.68].forEach(x=>{ const post=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,2.8*s,6),sc); post.position.set(x,1.35,0); g.add(post); });
      const beam=meshBox(w*1.55,.07,.07,sc,2.25*s); beam.rotation.z=.16; g.add(beam);
      const progress=new THREE.Mesh(new THREE.BoxGeometry(w*.85,.055,.055),material(C.teal,{emissive:C.teal,emissiveIntensity:1.2})); progress.position.set(0,2.38*s,.04); g.add(progress);
    }
    return g;
  }

  function makeHQ(thread) {
    const g=makeChatHouse({...thread,progress:100});
    g.userData.chatHQ=true;
    // Fixed HQ identity: large, stable, unmistakable ChatGPT centerpiece.
    const w=3.05;
    const facade=meshBox(2.9,2.05,2.9,material(0x284953),2.05); g.add(facade);
    const roof=new THREE.Mesh(new THREE.ConeGeometry(2.45,1.25,4),material(0x1d4e5b)); roof.position.y=3.45; roof.rotation.y=Math.PI/4; g.add(roof);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.72,.085,12,64),material(C.cyan,{emissive:C.cyan,emissiveIntensity:2.2})); ring.rotation.x=Math.PI/2; ring.position.y=5.05; g.add(ring);
    const orb=new THREE.Mesh(new THREE.SphereGeometry(.30,24,16),material(C.cyan,{emissive:C.cyan,emissiveIntensity:2.5})); orb.position.y=5.05; g.add(orb);
    const emblem=new THREE.Mesh(new THREE.CircleGeometry(.52,32),material(C.teal,{emissive:C.teal,emissiveIntensity:1.4})); emblem.position.set(0,2.55,1.48); emblem.rotation.x=0; g.add(emblem);
    return g;
  }

  function rebuildBuildings() {
    if(typeof threads==='undefined') return;
    const old=[];
    scene.traverse(o=>{ if(o.isGroup && o.userData?.threadIndex!==undefined) old.push(o); });
    old.forEach(o=>{
      const t=threads[o.userData.threadIndex]; if(!t) return;
      const pos=o.position.clone(); const replacement=t.type==='hub'?makeHQ(t):makeChatHouse(t);
      replacement.position.copy(pos); replacement.userData.threadIndex=o.userData.threadIndex; replacement.userData.chatBuilding=true;
      scene.add(replacement); o.visible=false;
    });
    scene.traverse(o=>{ if(o.userData?.rtsBuilding?.type==='towncenter') o.visible=false; });
  }

  function makeTree(x,z,s=1) {
    const g=new THREE.Group();
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.10*s,.17*s,1.35*s,7),material(C.wood)); trunk.position.y=.68*s; g.add(trunk);
    for(let i=0;i<3;i++) { const c=new THREE.Mesh(new THREE.SphereGeometry((.48-i*.04)*s,10,8),material(i===0?0x3f7445:0x4f8150)); c.position.set((i-1)*.22*s,1.55*s+i*.18,.05*s); g.add(c); }
    g.position.set(x,.98,z); scene.add(g);
  }
  function addLandscape() {
    // Broad grassy plateau above the original dark island, with layered shoreline.
    const land=new THREE.Mesh(new THREE.CylinderGeometry(14.4,14.9,1.0,64),material(C.grass,{roughness:1})); land.position.y=.98; scene.add(land);
    const meadow=new THREE.Mesh(new THREE.CylinderGeometry(13.9,13.9,.10,64),material(C.grass2,{roughness:1})); meadow.position.y=1.50; scene.add(meadow);
    const shore=new THREE.Mesh(new THREE.TorusGeometry(14.1,.32,8,96),material(0x314f3e)); shore.rotation.x=Math.PI/2; shore.position.y=1.53; scene.add(shore);

    // Radial dirt roads and central stone plaza.
    const roadMat=material(C.dirt,{roughness:1});
    for(let i=0;i<8;i++){
      const a=i*Math.PI/4; const road=meshBox(.72, .06, 12.0, roadMat,1.59); road.position.set(Math.sin(a)*6.0,0,Math.cos(a)*6.0); road.rotation.y=a; scene.add(road);
    }
    const plaza=new THREE.Mesh(new THREE.CylinderGeometry(3.4,3.4,.16,48),material(0x9b876c,{roughness:.9})); plaza.position.y=1.65; scene.add(plaza);

    // Forest perimeter.
    const trees=[[-10,-7,1.2],[-8,-8,.9],[-6,-9,1.05],[-3,-9,.9],[2,-9,1.15],[7,-8,1.1],[10,-6,1.25],[11,-2,.95],[10,4,1.2],[8,8,1.0],[3,9,1.2],[-2,9,.95],[-7,8,1.15],[-10,5,1.1],[-11,1,.9],[-9,-2,1.0]];
    trees.forEach(t=>makeTree(t[0],t[1],t[2]));

    // Mountains/rocky highlands at the far edge make the map read as a real world.
    for(let i=0;i<10;i++){
      const a=(i/10)*Math.PI*2+.2, r=13.2+(i%2)*.7;
      const h=3.0+(i%4)*.9, m=new THREE.Mesh(new THREE.ConeGeometry(1.5+(i%3)*.35,h,7),material(i%2?0x596761:0x4c5b58,{roughness:1}));
      m.position.set(Math.cos(a)*r,1.5+h/2,Math.sin(a)*r); scene.add(m);
    }

    // Water channels around the settlement.
    const water=new THREE.Mesh(new THREE.CylinderGeometry(18.5,19.5,.45,64),material(C.deepWater,{roughness:.25,metalness:.25})); water.position.y=-.92; scene.add(water);
    const inner=new THREE.Mesh(new THREE.TorusGeometry(15.2,.42,10,96),material(C.water,{roughness:.22,metalness:.25})); inner.rotation.x=Math.PI/2; inner.position.y=.05; scene.add(inner);
  }

  function addResourceDecoration() {
    scene.traverse(o=>{
      if(!o.userData?.rtsNode || !o.isGroup) return;
      const type=o.userData.rtsNode.type; o.clear();
      if(type==='wood') for(let i=0;i<5;i++) makeTreeLocal(o,(i-2)*.36,.0,1-(i%2)*.1);
      else if(type==='stone') for(let i=0;i<7;i++){ const r=new THREE.Mesh(new THREE.DodecahedronGeometry(.30+(i%3)*.08),material(C.stone,{roughness:1})); r.position.set((i-3)*.28,.45,(i%2-.5)*.5); r.rotation.set(i*.3,i*.5,0); o.add(r); }
      else { o.add(meshBox(1.5,.08,1.5,material(0x684a2f),.06)); for(let i=0;i<12;i++){ const p=new THREE.Mesh(new THREE.ConeGeometry(.07,.34,5),material(0x6ea94c)); p.position.set(-.55+(i%4)*.36,.25,-.55+Math.floor(i/4)*.5); o.add(p); } }
    });
  }
  function makeTreeLocal(g,x,z,s=1){ const tr=new THREE.Mesh(new THREE.CylinderGeometry(.08*s,.12*s,.9*s,7),material(C.wood)); tr.position.set(x,.45,z); g.add(tr); const c=new THREE.Mesh(new THREE.SphereGeometry(.4*s,9,7),material(0x3f7445)); c.position.set(x,.95*s,z); g.add(c); }

  function widenCamera() {
    cameraRadius=Math.max(cameraRadius||22,38);
    camera.position.set(0,0,0);
    if(typeof updateCamera==='function') updateCamera();
    // Extra wide scroll range on desktop.
    renderer.domElement.addEventListener('wheel',e=>{
      cameraRadius += e.deltaY*.045;
      cameraRadius=Math.max(20,Math.min(55,cameraRadius));
      updateCamera();
    },{passive:true});
    // Two-finger pinch zoom for mobile.
    let lastDist=null;
    renderer.domElement.addEventListener('touchmove',e=>{
      if(e.touches.length!==2){lastDist=null;return;}
      const dx=e.touches[0].clientX-e.touches[1].clientX, dy=e.touches[0].clientY-e.touches[1].clientY;
      const d=Math.hypot(dx,dy); if(lastDist!==null){ cameraRadius-=(d-lastDist)*.055; cameraRadius=Math.max(20,Math.min(55,cameraRadius)); updateCamera(); }
      lastDist=d;
    },{passive:true});
    renderer.domElement.addEventListener('touchend',()=>{lastDist=null;},{passive:true});
  }

  function boot(){
    // Let the existing gameplay layer remain functional while replacing its primitive presentation.
    addLandscape();
    rebuildBuildings();
    addResourceDecoration();
    widenCamera();
  }
  wait(boot);
})();
