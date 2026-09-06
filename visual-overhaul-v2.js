/* ChatGPT World — Premium Isometric World v3
 * The visual hierarchy is intentional:
 * fixed ChatGPT capital + detailed conversation villages + living landscape.
 */
(() => {
  const wait=(fn,n=0)=>{
    if(typeof THREE!=='undefined'&&typeof scene!=='undefined'&&scene&&typeof camera!=='undefined'&&camera&&typeof renderer!=='undefined')return fn();
    if(n<180)setTimeout(()=>wait(fn,n+1),100);
  };
  const M=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:o.r??.82,metalness:o.m??0,emissive:o.e??0,emissiveIntensity:o.i??.2});
  const add=(g,o,x=0,y=0,z=0)=>{o.position.set(x,y,z);g.add(o);return o;};
  const box=(w,h,d,m)=>new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);
  const C={grass:0x527c50,grass2:0x719a60,dirt:0x9b7653,stone:0x77736a,wood:0x6e442b,water:0x155e78,water2:0x2383a0,wall:0x806047,wallLight:0x9a7657,roof:0x315463,roofDark:0x223f4b,gold:0xffd079,teal:0x16d7ce,cyan:0x73f7ff,blue:0x315fba,flower:0xe9a2b8};

  function hideOriginalPresentation(){
    // Keep gameplay objects, units, resource nodes and conversation groups.
    scene.children.forEach(o=>{
      const keep=o.userData?.threadIndex!==undefined||o.userData?.rtsNode||o.userData?.rtsBuilding||o.userData?.rtsUnit||o.isLight;
      if(!keep)o.visible=false;
    });
    scene.background=new THREE.Color(0xb8d9df);
    scene.fog=new THREE.Fog(0xb8d9df,32,58);
  }

  function sky(){
    const g=new THREE.SphereGeometry(55,32,16);
    const m=new THREE.MeshBasicMaterial({color:0xaed3db,side:THREE.BackSide,fog:false});
    const s=new THREE.Mesh(g,m);s.position.y=15;scene.add(s);
    // distant low mountain silhouettes, never giant cones in the playable foreground
    for(let i=0;i<18;i++){
      const a=(i/18)*Math.PI*2,r=24+(i%3)*2,h=3.5+(i%4)*1.2;
      const q=new THREE.Mesh(new THREE.ConeGeometry(3.0+(i%2),h,9),M(i%2?0x78929a:0x667f88,{r:1}));
      q.position.set(Math.cos(a)*r,2+h/2,Math.sin(a)*r);scene.add(q);
    }
  }

  function tree(g,x,z,s=1){
    add(g,new THREE.Mesh(new THREE.CylinderGeometry(.10*s,.16*s,1.2*s,8),M(C.wood)),x,.62*s,z);
    add(g,new THREE.Mesh(new THREE.SphereGeometry(.52*s,12,9),M(0x3f7549)),x,1.40*s,z);
    add(g,new THREE.Mesh(new THREE.SphereGeometry(.38*s,10,8),M(0x5a8b50)),x+.25*s,1.66*s,z+.08*s);
  }
  function lantern(x,z){const g=new THREE.Group();add(g,new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.82,8),M(C.wood)),0,1.36,0);add(g,new THREE.Mesh(new THREE.SphereGeometry(.12,10,8),M(C.gold,{e:C.gold,i:2})),0,1.80,0);g.position.set(x,0,z);scene.add(g);}
  function flowerPatch(x,z){const g=new THREE.Group();for(let i=0;i<10;i++){const p=new THREE.Mesh(new THREE.SphereGeometry(.055,7,6),M([C.flower,0xf3c36d,0xa9c9ef][i%3],{e:[C.flower,0xf3c36d,0xa9c9ef][i%3],i:.45}));p.position.set((i%5-.2)*.18,.18,((i%2)-.5)*.30);g.add(p);}g.position.set(x,1.55,z);scene.add(g);}

  function roof(g,w,s,mat){const r=add(g,new THREE.Mesh(new THREE.ConeGeometry(w*.86,.98*s,4),mat),0,2.02+s*.58,0);r.rotation.y=Math.PI/4;return r;}
  function window(g,x,z,s,rot=0){const f=add(g,box(.40*s,.54*s,.08,M(0x34261f)),x,1.55+s*.15,z);f.rotation.y=rot;const l=add(g,box(.25*s,.35*s,.09,M(C.gold,{e:C.gold,i:1.7})),x,1.55+s*.15,z+.025);l.rotation.y=rot;}

  function house(t){
    const p=Math.max(0,Math.min(100,Number(t.progress)||0));
    const level=Math.min(5,1+Math.floor(p/21));
    const s=.88+level*.18,w=1.82*s,h=1.45*s,g=new THREE.Group();
    g.userData.chatLevel=level;g.userData.chatProgress=p;g.userData.chatBuilding=true;
    const wall=M(level>=4?C.wallLight:C.wall),trim=M(level>=4?C.gold:0xb58b64),rm=M(level>=4?C.roof:C.roofDark);
    add(g,box(w,h,w,wall),0,.92+h/2,0);roof(g,w,s,rm);
    add(g,box(w*.60,.14,.72,trim),0,.77,w*.55);add(g,box(.52*s,.92*s,.12,M(0x2b1b15)),0,.84,w*.51);
    window(g,-w*.30,w*.51,s);window(g,w*.30,w*.51,s);window(g,-w*.51,0,s,Math.PI/2);window(g,w*.51,0,s,Math.PI/2);
    // Gable beam and chimney add recognizable medieval construction.
    add(g,box(.08,.65*s,w*.76,M(C.wood)),0,2.05*s,0);add(g,box(.25*s,.62*s,.25*s,M(0x514a43)),w*.28,2.25*s,-w*.22);
    const flag=add(g,new THREE.Mesh(new THREE.PlaneGeometry(.44*s,.32*s),M(level>=4?C.gold:C.blue,{e:level>=4?C.gold:C.blue,i:.55})),-w*.67,1.70*s,w*.16);flag.rotation.y=Math.PI/2;add(g,new THREE.Mesh(new THREE.CylinderGeometry(.022,.022,1.15*s,8),M(C.wood)),-w*.67,1.48*s,w*.16);
    // Higher conversation levels become architecture, not just a scale multiplier.
    if(level>=3){
      const wing=add(g,box(w*.50,h*.70,w*.62,wall),w*.68,.84+h*.36,0);roof(g,w*.52,s*.72,rm).position.x=w*.68;
      window(g,w*.68+w*.20,w*.31,s*.72); // visual accent
    }
    if(level>=4){
      const porchRoof=add(g,new THREE.Mesh(new THREE.ConeGeometry(w*.48,.55*s,4),rm),0,2.95+s*.1,w*.55);porchRoof.rotation.y=Math.PI/4;
      for(let i=0;i<3;i++)add(g,new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.85*s,7),M(C.wood)),(i-1)*.34*s,.95,w*.58);
    }
    if(level>=5){
      add(g,box(w*.40,h*1.08,w*.40,wall),-w*.58,1.05+h*.52,0);const tr=add(g,new THREE.Mesh(new THREE.ConeGeometry(w*.32,.72*s,4),trim),-w*.58,2.65+h*.58,0);tr.rotation.y=Math.PI/4;
    }
    if(p<100){
      const sc=M(0xb68a56);[-1,1].forEach(x=>[-1,1].forEach(z=>add(g,new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,2.55*s,6),sc),x*w*.66,1.42,z*w*.66)));
      add(g,box(w*1.46,.06,.06,sc),0,2.25*s,0).rotation.z=.13;
    }
    return g;
  }

  function capital(){
    const g=new THREE.Group();g.userData.chatCapital=true;
    add(g,new THREE.Mesh(new THREE.CylinderGeometry(3.15,3.45,.62,40),M(0x4c625e)),0,1.12,0);
    add(g,box(3.55,2.70,3.55,M(0x315761)),0,2.58,0);
    const roof1=add(g,new THREE.Mesh(new THREE.ConeGeometry(3.02,1.70,6),M(0x173f4c,{e:0x083843,i:.45})),0,4.58,0);roof1.rotation.y=Math.PI/6;
    add(g,new THREE.Mesh(new THREE.ConeGeometry(.82,1.05,6),M(C.teal,{e:C.teal,i:1.5})),0,5.78,0);
    add(g,new THREE.Mesh(new THREE.SphereGeometry(.38,24,16),M(C.cyan,{e:C.cyan,i:2.4,m:.2})),0,6.38,0);
    const ring=add(g,new THREE.Mesh(new THREE.TorusGeometry(.70,.075,10,48),M(C.cyan,{e:C.cyan,i:2.3})),0,6.38,0);ring.rotation.x=Math.PI/2;
    add(g,box(.68,1.12,.12,M(0x261813)),0,1.48,1.82);
    // ChatGPT capital windows and side towers.
    [-1.18,1.18].forEach(x=>{add(g,box(.36,.52,.08,M(C.gold,{e:C.gold,i:1.2})),x,2.62,1.82);add(g,box(.36,.52,.08,M(C.gold,{e:C.gold,i:1.2})),x,2.62,-1.82);});
    [-1,1].forEach(x=>{const tower=add(g,box(.62,2.10,.62,M(0x2b4d56)),x*1.88,2.18,0);const tr=add(g,new THREE.Mesh(new THREE.ConeGeometry(.54,.80,4),M(C.teal,{e:C.teal,i:.9})),x*1.88,3.62,0);tr.rotation.y=Math.PI/4;});
    [-1,1].forEach(x=>{const f=add(g,new THREE.Mesh(new THREE.PlaneGeometry(.52,.36),M(C.blue,{e:C.blue,i:.7})),x*2.15,3.25,.12);f.rotation.y=Math.PI/2;add(g,new THREE.Mesh(new THREE.CylinderGeometry(.026,.026,1.45,8),M(C.wood)),x*2.15,3.02,.12);});
    return g;
  }

  function terrain(){
    // Clean, daylight palette and a broad playable plateau.
    const water=new THREE.Mesh(new THREE.CylinderGeometry(21.5,23,.72,80),M(0x0b3c52,{r:.28,m:.18}));water.position.y=-1.02;scene.add(water);
    const land=new THREE.Mesh(new THREE.CylinderGeometry(15.2,15.8,1.10,80),M(C.grass,{r:1}));land.position.y=.92;scene.add(land);
    const meadow=new THREE.Mesh(new THREE.CylinderGeometry(14.78,14.78,.12,80),M(C.grass2,{r:1}));meadow.position.y=1.50;scene.add(meadow);
    const shore=new THREE.Mesh(new THREE.TorusGeometry(14.85,.34,8,110),M(0x3e624a,{r:1}));shore.rotation.x=Math.PI/2;shore.position.y=1.52;scene.add(shore);
    const road=M(C.dirt,{r:1});
    (typeof threads!=='undefined'?threads:[]).filter(t=>t.type!=='hub').forEach(t=>{const len=Math.hypot(t.x,t.z),p=box(.72,.075,len,road);p.position.set(t.x/2,1.60,t.z/2);p.rotation.y=Math.atan2(t.x,t.z);scene.add(p);});
    const plaza=new THREE.Mesh(new THREE.CylinderGeometry(3.65,3.65,.18,48),M(0xb29c7e,{r:.9}));plaza.position.y=1.64;scene.add(plaza);
    // Dense perimeter forest, but kept outside the core village.
    [[-11,-7,1.25],[-9,-9,.95],[-5,-9,1.15],[-1,-10,.9],[4,-9,1.1],[9,-8,1.2],[11,-5,1],[11,0,1.15],[10,5,1.25],[7,9,1], [2,10,1.2],[-3,9,.95],[-7,9,1.15],[-10,5,1.05],[-11,1,.9],[-9,-2,1.05]].forEach(([x,z,s])=>{const g=new THREE.Group();tree(g,0,0,s);g.position.set(x,0,z);scene.add(g);});
    [[-6,-5], [6,-5],[-6,5],[6,5],[-9,2],[9,2],[-2,7],[2,7]].forEach(p=>flowerPatch(...p));
    [[-3.8,-1.0],[3.8,-1.0],[-3.8,1.6],[3.8,1.6],[-1.8,-3.4],[1.8,-3.4]].forEach(p=>lantern(...p));
    // Small stream crossing the back of the settlement.
    const stream=box(1.15,.06,13,M(C.water2,{r:.22,m:.15}));stream.position.set(6.7,1.57,2.0);stream.rotation.y=.16;scene.add(stream);
    for(let i=0;i<7;i++){const r=new THREE.Mesh(new THREE.DodecahedronGeometry(.18+(i%2)*.08),M(C.stone,{r:1}));r.position.set(6.25+i*.22,1.66,1.2+i*.8);scene.add(r);}
  }

  function resources(){
    const nodes=[];scene.traverse(o=>{if(o.isGroup&&o.userData?.rtsNode)nodes.push(o);});
    nodes.forEach(o=>{const type=o.userData.rtsNode.type;o.clear();if(type==='wood'){for(let i=0;i<5;i++){const g=new THREE.Group();tree(g,0,0,.82+(i%2)*.08);g.position.set((i-2)*.38,0,(i%2-.5)*.50);o.add(g);}}else if(type==='stone'){for(let i=0;i<9;i++){const r=new THREE.Mesh(new THREE.DodecahedronGeometry(.30+(i%3)*.09),M(C.stone,{r:1}));r.position.set((i-4)*.27,.45,(i%2-.5)*.52);r.rotation.set(i*.25,i*.5,0);o.add(r);}}else{o.add(box(1.55,.08,1.55,M(0x68492f,{r:1})));for(let i=0;i<12;i++){const p=new THREE.Mesh(new THREE.ConeGeometry(.07,.34,5),M(0x6da84e));p.position.set(-.55+(i%4)*.36,.27,-.55+Math.floor(i/4)*.5);o.add(p);}}});
  }

  function replaceConversationBuildings(){
    if(typeof threads==='undefined')return;
    const groups=[];scene.traverse(o=>{if(o.isGroup&&o.userData?.threadIndex!==undefined)groups.push(o);});
    groups.forEach(o=>{const t=threads[o.userData.threadIndex];if(!t)return;const pos=o.position.clone();o.clear();const h=house(t);h.children.forEach(c=>o.add(c));o.position.copy(pos);o.userData.chatBuilding=true;o.userData.chatLevel=h.userData.chatLevel;o.userData.chatProgress=h.userData.chatProgress;});
  }

  function wideCamera(){
    cameraRadius=42;cameraPhi=1.02;updateCamera();
    renderer.domElement.addEventListener('wheel',e=>{cameraRadius+=e.deltaY*.055;cameraRadius=Math.max(23,Math.min(68,cameraRadius));updateCamera();},{passive:true});
    let pinch=null;renderer.domElement.addEventListener('touchmove',e=>{if(e.touches.length!==2){pinch=null;return;}const dx=e.touches[0].clientX-e.touches[1].clientX,dy=e.touches[0].clientY-e.touches[1].clientY,d=Math.hypot(dx,dy);if(pinch!==null){cameraRadius-=(d-pinch)*.065;cameraRadius=Math.max(23,Math.min(68,cameraRadius));updateCamera();}pinch=d;},{passive:true});renderer.domElement.addEventListener('touchend',()=>pinch=null,{passive:true});
  }

  function boot(){
    hideOriginalPresentation();
    sky();
    terrain();
    replaceConversationBuildings();
    scene.traverse(o=>{if(o.userData?.rtsBuilding?.type==='towncenter')o.visible=false;});
    const cap=capital();cap.position.set(0,0,0);scene.add(cap);
    resources();
    wideCamera();
  }
  wait(boot);
})();
