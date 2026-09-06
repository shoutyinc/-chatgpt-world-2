/* ChatGPT World — Visual Master v10
 * One renderer layer. No stacked visual-overhaul scripts.
 * Goal: polished isometric fantasy village with ChatGPT HQ, conversation estates,
 * expressive robot workers, roads, gardens, markets, rivers and readable spacing.
 */
(() => {
  const wait=(fn,n=0)=>{if(typeof THREE!=='undefined'&&typeof scene!=='undefined'&&scene&&typeof camera!=='undefined'&&renderer)return fn();if(n<180)setTimeout(()=>wait(fn,n+1),100);};
  const C={grass:0x6f9956,grassLight:0x86aa67,grassDark:0x3e6b47,soil:0x9b704c,stone:0x9b9482,stoneDark:0x615e59,wood:0x71472c,woodLight:0x9b6840,wall:0xd0ad7b,wall2:0xb98c61,roof:0x31566d,roofLight:0x4e7890,water:0x2c91ad,waterDark:0x145b76,cream:0xffe5a3,teal:0x18d8d0,cyan:0x7df9ff,chat:0x38aee8,ink:0x1a2630,white:0xf1f3ed,black:0x172027,leaf:0x4d8b50,leaf2:0x6ca35a,flower:0xffd6e5};
  const M=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:o.r??.76,metalness:o.m??0,emissive:o.e??0,emissiveIntensity:o.i??.18});
  const add=(g,o,x=0,y=0,z=0)=>{o.position.set(x,y,z);g.add(o);return o;};
  const box=(w,h,d,m)=>new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);
  const cyl=(r,h,m,seg=10)=>new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,seg),m);
  function roof(g,w,d,y,m){const r=add(g,new THREE.Mesh(new THREE.ConeGeometry(Math.max(w,d)*.72,Math.max(1.0,Math.max(w,d)*.55),4),m),0,y,0);r.rotation.y=Math.PI/4;return r;}
  function label(text,color=0xffffff){const c=document.createElement('canvas');c.width=420;c.height=92;const x=c.getContext('2d');x.clearRect(0,0,420,92);x.fillStyle='rgba(20,22,22,.88)';roundRect(x,6,8,408,76,18);x.fill();x.strokeStyle='rgba(255,224,151,.65)';x.lineWidth=3;x.stroke();x.fillStyle='#fff';x.font='700 27px -apple-system,BlinkMacSystemFont,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(text,210,46);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthTest:false}));s.scale.set(2.7,.59,1);return s;}
  function roundRect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}

  function hideLegacy(){scene.children.slice().forEach(o=>{o.visible=false;});}
  function terrain(){
    const water=new THREE.Mesh(new THREE.CylinderGeometry(22,24,.75,96),M(C.waterDark,{r:.32,m:.18}));water.position.y=-1.05;water.visible=true;scene.add(water);
    const island=new THREE.Mesh(new THREE.CylinderGeometry(15.5,16.1,1.2,96),M(C.grass,{r:1}));island.position.y=.82;island.visible=true;scene.add(island);
    const top=new THREE.Mesh(new THREE.CylinderGeometry(15.15,15.15,.12,96),M(C.grassLight,{r:1}));top.position.y=1.48;top.visible=true;scene.add(top);
    const shore=new THREE.Mesh(new THREE.TorusGeometry(15.25,.34,8,120),M(0x416f4e,{r:1}));shore.rotation.x=Math.PI/2;shore.position.y=1.51;shore.visible=true;scene.add(shore);
    // Distant mountains are deliberately beyond the settlement so they never block the town.
    for(let i=0;i<13;i++){const a=-Math.PI*.05+i*Math.PI/12,r=19.2,h=3.5+(i%4)*.65;const m=new THREE.Mesh(new THREE.ConeGeometry(1.3+(i%3)*.45,h,8),M(i%2?0x71817c:0x65736f,{r:1}));m.position.set(Math.cos(a)*r,1.45+h/2,Math.sin(a)*r+4);m.visible=true;scene.add(m);}
    // Central plaza and broad radial paths.
    const plaza=new THREE.Mesh(new THREE.CylinderGeometry(3.65,3.65,.18,64),M(0xc5ad88,{r:1}));plaza.position.y=1.62;plaza.visible=true;scene.add(plaza);
    const road=M(C.soil,{r:1});
    const pts=(typeof threads!=='undefined'?threads:[]).filter(t=>t.type!=='hub');
    pts.forEach(t=>{const len=Math.hypot(t.x,t.z),p=box(.72,.065,len,road);p.position.set(t.x/2,1.64,t.z/2);p.rotation.y=Math.atan2(t.x,t.z);p.visible=true;scene.add(p);});
    // Water channel with a small bridge on the east side.
    const stream=new THREE.Mesh(new THREE.BoxGeometry(2.1,.08,8.2),M(C.water,{r:.25,m:.2}));stream.position.set(10.3,1.55,2.8);stream.rotation.y=-.12;stream.visible=true;scene.add(stream);
    const bridge=new THREE.Group();add(bridge,box(2.8,.18,1.3,M(C.woodLight)),0,1.72,0);for(let i=-1;i<=1;i++)add(bridge,cyl(.07,1.0,M(C.wood),8),i*1.0,.52,0);bridge.position.set(10.25,0,2.75);bridge.visible=true;scene.add(bridge);
    // Perimeter trees.
    const spots=[[-12,-8,1.25],[-9,-10,.9],[-5,-11,1.1],[0,-11,.95],[5,-10,1.15],[10,-8,1.1],[12,-4,1.2],[12,1,.95],[11,6,1.2],[7,10,1.0],[2,11,1.15],[-3,10,.9],[-8,9,1.2],[-11,5,1.05],[-12,0,.9]];
    spots.forEach(([x,z,s])=>tree(x,z,s));
  }
  function tree(x,z,s=1){const g=new THREE.Group();add(g,cyl(.12*s,1.0*s,M(C.wood),8),0,.5,0);for(let i=0;i<3;i++)add(g,new THREE.Mesh(new THREE.SphereGeometry((.52-i*.07)*s,12,9),M(i===1?C.leaf2:C.leaf)),(i-1)*.22*s,1.18*s+i*.20,(i%2)*.12*s);g.position.set(x,1.55,z);g.visible=true;scene.add(g);}
  function flowerPatch(x,z){const g=new THREE.Group();add(g,box(1.3,.04,1.0,M(C.soil)),0,.02,0);for(let i=0;i<12;i++){const stem=add(g,cyl(.018,.18,M(C.leaf),5),-.48+(i%4)*.32,.13,-.35+Math.floor(i/4)*.32);add(g,new THREE.SphereGeometry(.055,7,6),stem.position.x,.25,stem.position.z).material=M(i%2?C.flower:C.cream,{e:i%2?C.flower:C.cream,i:.5});}g.position.set(x,1.58,z);g.visible=true;scene.add(g);}
  function lantern(x,z){const g=new THREE.Group();add(g,cyl(.035,.72,M(C.wood),7),0,.36,0);add(g,new THREE.SphereGeometry(.11,10,8),0,.78,0).material=M(C.cream,{e:C.cream,i:1.8});g.position.set(x,1.58,z);g.visible=true;scene.add(g);}
  function house(t){
    const p=Math.max(0,Math.min(100,Number(t.progress)||0)),lvl=Math.min(5,1+Math.floor(p/21)),s=.88+lvl*.18,w=1.75*s,d=1.62*s,h=1.45*s,g=new THREE.Group();g.userData.chatBuilding=true;g.userData.threadIndex=threads.indexOf(t);g.userData.visualMaster=true;
    const wall=M(lvl>=4?C.wall:lvl>=2?C.wall2:C.wall),rm=M(lvl>=4?C.roofLight:C.roof),trim=M(C.woodLight);
    add(g,box(w,h,d,wall),0,.82+h/2,0);add(g,box(w+.16,.22,d+.16,M(C.stone)),0,.75,0);roof(g,w,d,2.03+h*.30,rm);
    // Timber frame and windows.
    [-w*.43,w*.43].forEach(x=>add(g,box(.09,h*.72,.09,trim),x,1.0,d/2+.04));add(g,box(w,.09,.09,trim),0,1.03+h*.35,d/2+.04);
    add(g,box(.48,.82,.10,M(C.wood)),0,.86,d/2+.06);[-.30,.30].forEach(x=>add(g,box(.25,.34,.07,M(C.cream,{e:C.cream,i:1.1})),x,1.52,d/2+.07));
    add(g,box(.22,.56,.22,M(C.stone)),w*.28,2.12,-d*.22);
    // Growth additions make bigger chats architecturally larger, not just scaled.
    if(lvl>=2){const ww=w*.48,dd=d*.62;add(g,box(ww,h*.74,dd,wall),w*.64,.83+h*.37,0);roof(g,ww,dd,1.78+h*.27,rm).position.x=w*.64;flowerPatchLocal(g,w*.62,-d*.42,s);}
    if(lvl>=3){add(g,box(w*.40,h*1.0,w*.40,wall),-w*.57,1.0+h*.46,0);const tr=roof(g,w*.40,w*.40,2.42+h*.55,rm);tr.position.x=-w*.57;}
    if(lvl>=4&&p<100){const sm=M(0xb9854f);[-1,1].forEach(x=>[-1,1].forEach(z=>add(g,cyl(.028,2.55*s,sm,7),x*w*.66,1.38,z*d*.52)));add(g,box(w*1.42,.06,.06,sm),0,2.42,0);}
    const beacon=add(g,new THREE.Mesh(new THREE.SphereGeometry(.08+.11*p/100,10,8),M(C.teal,{e:C.teal,i:2})),0,2.66+h*.2,0);beacon.userData.growthBeacon=true;
    return g;
  }
  function flowerPatchLocal(g,x,z,s){add(g,box(.58*s,.035,.42*s,M(C.soil)),x,.04,z);for(let i=0;i<5;i++)add(g,new THREE.Mesh(new THREE.SphereGeometry(.035,6,5),M(i%2?C.flower:C.cream,{e:C.flower,i:.4})),x-.2+i*.1,.15,z-.1+(i%2)*.1);}
  function capital(){const g=new THREE.Group();g.userData.chatCapital=true;add(g,new THREE.Mesh(new THREE.CylinderGeometry(3.3,3.7,.62,48),M(C.stone)),0,1.12,0);add(g,box(3.65,2.65,3.65,M(0x416e73)),0,2.56,0);for(let i=0;i<5;i++)add(g,box(1.25-i*.16,.14,1.05-i*.08,M(C.stone)),0,1.22+i*.15,2.02-i*.17);const r=roof(g,3.65,3.65,4.35,M(0x27586a));r.scale.set(1.05,1.12,1.05);add(g,new THREE.Mesh(new THREE.ConeGeometry(.84,1.18,6),M(C.teal,{e:C.teal,i:1.8})),0,5.78,0);add(g,new THREE.Mesh(new THREE.SphereGeometry(.40,24,16),M(C.cyan,{e:C.cyan,i:2.5,m:.2})),0,6.48,0);const ring=add(g,new THREE.Mesh(new THREE.TorusGeometry(.76,.075,12,56),M(C.cyan,{e:C.cyan,i:2.3})),0,6.48,0);ring.rotation.x=Math.PI/2;add(g,box(.72,1.18,.12,M(C.wood)),0,1.55,1.87);[-1,1].forEach(x=>{const tw=add(g,box(.62,2.1,.62,M(0x3e6e74)),x*1.95,2.25,0);const tr=add(g,new THREE.Mesh(new THREE.ConeGeometry(.55,.78,4),M(C.teal,{e:C.teal,i:.8})),x*1.95,3.72,0);tr.rotation.y=Math.PI/4;});return g;}
  function market(x,z){const g=new THREE.Group();[-.65,.65].forEach(q=>add(g,cyl(.035,1.65,M(C.wood),7),q,.82,0));const r=add(g,new THREE.Mesh(new THREE.ConeGeometry(1.0,.65,4),M(0xc85d45)),0,1.72,0);r.rotation.y=Math.PI/4;add(g,box(1.45,.10,1.0,M(C.woodLight)),0,.18,0);g.position.set(x,1.58,z);g.visible=true;scene.add(g);}
  function cart(x,z,rot=0){const g=new THREE.Group();add(g,box(1.0,.24,.58,M(C.woodLight)),0,.45,0);[-.34,.34].forEach(q=>{const w=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,.10,12),M(0x302822));w.rotation.z=Math.PI/2;add(g,w,q,.24,-.30);});g.position.set(x,1.58,z);g.rotation.y=rot;g.visible=true;scene.add(g);}
  function bot(x,z,job='worker',scale=1){const g=new THREE.Group();g.userData.visualBot=true;add(g,new THREE.Mesh(new THREE.CapsuleGeometry(.20,.42,5,10),M(C.white,{m:.2,r:.42})),0,.68,0);add(g,new THREE.SphereGeometry(.21,16,12),0,1.18,0).material=M(C.black,{m:.35,r:.35});add(g,box(.28,.065,.055,M(C.cyan,{e:C.cyan,i:2})),0,1.19,.19);add(g,box(.10,.34,.10,M(C.wood)),.29,.68,0).rotation.z=-.55;add(g,box(.18,.22,.10,M(C.chat,{e:C.chat,i:.6})),-.28,.75,-.03);if(job==='builder')add(g,box(.24,.10,.24,M(C.woodLight)),.39,.55,0);if(job==='farmer')add(g,box(.22,.07,.22,M(C.green,{e:C.green,i:.3})),.34,.55,0);g.position.set(x,1.58,z);g.scale.setScalar(scale);g.visible=true;scene.add(g);return g;}
  function threadVisuals(){
    if(typeof threads==='undefined')return;
    threads.forEach(t=>{if(t.type==='hub')return;const g=house(t);g.position.set(t.x,0,t.z);scene.add(g);const l=label(t.name);l.position.set(t.x,5.0,t.z);l.visible=true;scene.add(l);});
    const cap=capital();scene.add(cap);const l=label('ChatGPT');l.scale.set(3.1,.68,1);l.position.set(0,7.45,0);l.visible=true;scene.add(l);
    // Give each conversation its own nearby workers. Growth-heavy conversations get more activity.
    threads.filter(t=>t.type!=='hub').forEach(t=>{const n=1+Math.floor((Number(t.progress)||0)/40);for(let i=0;i<n;i++)bot(t.x-.75+i*.55,t.z+.85+(i%2)*.45,i%2?'builder':'worker',.82);});
  }
  function village(){
    [[-9,-4],[-7,-7],[7,-6],[9,-3],[-8,3],[-7,7],[7,7],[9,4],[-2,-8],[3,-8],[3,8],[-3,8]].forEach(([x,z])=>{const g=house({progress:100});g.position.set(x,0,z);scene.add(g);});
    [[-8.4,-5.0],[8.0,-5.0],[-7.2,5.1],[7.2,4.8],[-3.8,-7.0],[4.3,6.7]].forEach(p=>flowerPatch(...p));
    [[-8,-2],[-6,-6],[-3,-7],[4,-7],[8,-5],[9,-1],[8,3],[5,6],[1,7],[-3,7],[-7,5],[-9,2]].forEach(p=>lantern(...p));
    market(-4.7,-6.2);market(5.2,5.0);cart(-7.0,-4.6,.15);cart(7.2,2.0,-.2);
    [[-7,-8],[-4,-7],[4,-8],[7,-6],[9,-2],[7,3],[4,7],[-1,7],[-5,6],[-8,2]].forEach(([x,z],i)=>bot(x,z,i%3===0?'farmer':'worker',.76));
  }
  function syncGame(){
    // Keep visual proxies aligned with gameplay units/buildings without allowing gameplay meshes to render.
    scene.traverse(o=>{if(o.userData?.rtsBuilding&&!o.userData.visualMaster)o.visible=false;if(o.userData?.rtsUnit&&!o.userData.visualMaster)o.visible=false;if(o.userData?.rtsNode&&!o.userData.visualMaster)o.visible=false;});
  }
  function run(){
    hideLegacy();scene.fog=null;scene.background=new THREE.Color(0x9bc9d3);
    // Daylight lighting; legacy purple/night lights are hidden by the reset.
    scene.add(new THREE.HemisphereLight(0xf7f2df,0x45634b,2.8));const sun=new THREE.DirectionalLight(0xfff4d6,3.3);sun.position.set(-10,22,12);scene.add(sun);const fill=new THREE.DirectionalLight(0xb8e7ff,1.2);fill.position.set(12,10,-8);scene.add(fill);
    terrain();threadVisuals();village();syncGame();
    cameraRadius=48;cameraPhi=.96;if(typeof updateCamera==='function')updateCamera();
    let last=0;function frame(t){if(t-last>500){syncGame();last=t;}requestAnimationFrame(frame);}requestAnimationFrame(frame);
  }
  wait(run);
})();
