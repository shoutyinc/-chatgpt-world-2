/* ChatGPT World — Living Settlement Visuals v4
 * Detailed low-poly medieval village treatment without external assets.
 */
(() => {
  const wait=(fn,n=0)=>{if(typeof THREE!=='undefined'&&typeof scene!=='undefined'&&scene&&typeof camera!=='undefined'&&typeof renderer!=='undefined')return fn();if(n<160)setTimeout(()=>wait(fn,n+1),100);};
  const M=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:o.r??.78,metalness:o.m??0,emissive:o.e??0,emissiveIntensity:o.i??.25});
  const C={stone:0x817a6b,stone2:0xa0927d,wood:0x65402a,wood2:0x8a5b37,wall:0xb58b63,wall2:0x9b704f,roof:0x31566b,roof2:0x47728a,gold:0xffcf70,glass:0x9ce7df,teal:0x16d8cf,cyan:0x72f7ff,blue:0x386fc1,green:0x4e8a4b};
  const add=(g,o,x=0,y=0,z=0)=>{o.position.set(x,y,z);g.add(o);return o;};
  const box=(w,h,d,m)=>new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);
  function roof(g,w,d,y,mat){const r=add(g,new THREE.Mesh(new THREE.ConeGeometry(Math.max(w,d)*.72,.95+Math.max(w,d)*.12,4),mat),0,y,0);r.rotation.y=Math.PI/4;return r;}
  function window(g,x,y,z,s=.8,rot=0){const f=add(g,box(.40*s,.55*s,.09,M(0x38261d)),x,y,z);f.rotation.y=rot;const l=add(g,box(.26*s,.38*s,.10,M(C.gold,{e:C.gold,i:1.8})),x,y,z+.02);l.rotation.y=rot;}
  function timber(g,w,h,d,y,s){const m=M(C.wood2);add(g,box(.10*s,h,.10*s,m),-w/2+.06*s,y, d/2+.03*s);add(g,box(.10*s,h,.10*s,m),w/2-.06*s,y,d/2+.03*s);add(g,box(w,.10*s,.10*s,m),0,y+h/2,d/2+.03*s);}
  function cart(g,x,z){const m=M(C.wood2);add(g,box(.9,.28,.55,m),x,.38,z);[-.28,.28].forEach(wx=>{const wh=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,.10,12),M(0x302822));wh.rotation.z=Math.PI/2;add(g,wh,x+wx,.22,z-.28);});}
  function fence(x,z,len,rot=0){const g=new THREE.Group(),m=M(C.wood2);for(let i=0;i<=Math.ceil(len);i++)add(g,new THREE.Mesh(new THREE.CylinderGeometry(.035,.045,.72,7),m),i-len/2,.36,0);add(g,box(len,.07,.07,m),0,.62,0);g.position.set(x,1.58,z);g.rotation.y=rot;scene.add(g);}
  function workerMesh(){
    const g=new THREE.Group();g.userData.rtsUnit=true;
    add(g,new THREE.Mesh(new THREE.CylinderGeometry(.23,.27,.55,10),M(0xf0f2ed)),0,1.02,0);
    add(g,new THREE.SphereGeometry(.22,16,12),0,1.48,0).material=M(0x111c22,{e:0x071015,i:.2});
    const visor=add(g,box(.30,.09,.08,M(C.cyan,{e:C.cyan,i:1.8})),0,1.49,.20);
    add(g,new THREE.Mesh(new THREE.CylinderGeometry(.055,.055,.58,8),M(C.wood2)),.28,.92,0).rotation.z=-.55;
    return g;
  }
  function decorateWorkers(){
    scene.traverse(o=>{
      if(!o.userData?.rtsUnit||o.userData.visualWorker)return;
      o.userData.visualWorker=true;const old=o.children.slice();
      // Preserve gameplay transforms and replace only visible geometry.
      old.forEach(c=>c.visible=false);
      workerMesh().children.forEach(c=>o.add(c));
      o.scale.setScalar(1.0);
    });
  }
  function detailedHouse(t){
    const p=Math.max(0,Math.min(100,Number(t.progress)||0)),level=Math.min(5,1+Math.floor(p/21));
    const s=.95+level*.23,w=1.95*s,d=1.75*s,h=1.55*s,g=new THREE.Group();
    g.userData.chatBuilding=true;g.userData.chatLevel=level;g.userData.chatProgress=p;
    const wall=M(level>=4?0xc0966b:level>=2?C.wall:C.wall2),roofM=M(level>=4?C.roof2:C.roof),tim=M(C.wood2);
    add(g,box(w,h,d,wall),0,.82+h/2,0);
    // stone foundation
    add(g,box(w+.18,.24,d+.18,M(C.stone)),0,.78,0);
    roof(g,w,d,2.05+h*.30,roofM);
    timber(g,w,h*.72,d,.96,1);
    add(g,box(.62,.98,.13,M(0x2c1c15)),0,.84,d/2+.02);
    window(g,-w*.30,1.55+h*.15,d/2+.03,.9);window(g,w*.30,1.55+h*.15,d/2+.03,.9);
    window(g,-w*.50,1.55+h*.15,0,.9,Math.PI/2);window(g,w*.50,1.55+h*.15,0,.9,Math.PI/2);
    add(g,box(.28,.62,.28,M(C.stone)),w*.28,2.20,-d*.24);
    // flower boxes
    [-.34,.34].forEach(x=>add(g,box(.42,.10,.18,M(C.wood2)),x,1.30,d/2+.12));
    if(level>=2){
      const wingW=w*.52,wingD=d*.64;add(g,box(wingW,h*.76,wingD,wall),w*.68,.82+h*.38,0);const r=roof(g,wingW,wingD,1.78+h*.30,roofM);r.position.x=w*.68;window(g,w*.68,1.35,w*.32,.72);cart(g,w*.82,-d*.40);
    }
    if(level>=3){
      add(g,box(w*.42,h*1.05,w*.42,wall),-w*.60,1.02+h*.48,0);const tr=roof(g,w*.42,w*.42,2.40+h*.55,M(C.gold));tr.position.x=-w*.60;add(g,new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,1.2,7),tim),-w*.60,3.0,0);
    }
    if(level>=4){
      // visible scaffolding only on growing conversations
      const sm=M(0xb7834d);[-1,1].forEach(x=>[-1,1].forEach(z=>add(g,new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,2.8*s,7),sm),x*w*.66,1.45,z*d*.52)));add(g,box(w*1.45,.07,.07,sm),0,2.55,0);
    }
    // growth beacon: stronger activity = brighter, taller marker
    const beacon=add(g,new THREE.Mesh(new THREE.SphereGeometry(.09+.10*p/100,12,8),M(C.teal,{e:C.teal,i:1.8})),0,2.72+h*.20,0);beacon.userData.growthBeacon=true;
    return g;
  }
  function upgradeBuildings(){
    if(typeof threads==='undefined')return;
    const groups=[];scene.traverse(o=>{if(o.isGroup&&o.userData?.threadIndex!==undefined)groups.push(o);});
    groups.forEach(o=>{const t=threads[o.userData.threadIndex];if(!t||t.type==='hub')return;const pos=o.position.clone();const r=o.rotation.clone();o.clear();const h=detailedHouse(t);h.children.forEach(c=>o.add(c));o.position.copy(pos);o.rotation.copy(r);o.userData.chatBuilding=true;o.userData.chatLevel=h.userData.chatLevel;o.userData.chatProgress=h.userData.chatProgress;});
  }
  function capitalDetail(){
    const g=new THREE.Group();g.userData.chatCapital=true;
    add(g,new THREE.Mesh(new THREE.CylinderGeometry(3.3,3.65,.65,48),M(C.stone)),0,1.10,0);
    add(g,box(3.7,2.85,3.7,M(0x416d73)),0,2.58,0);
    // stepped stone front
    for(let i=0;i<5;i++)add(g,box(1.35-i*.18,.16,1.1-i*.10,M(C.stone2)),0,1.22+i*.16,2.05-i*.18);
    const r=add(g,new THREE.Mesh(new THREE.ConeGeometry(3.15,1.85,6),M(0x244f5e,{e:0x0b343d,i:.4})),0,4.72,0);r.rotation.y=Math.PI/6;
    add(g,new THREE.Mesh(new THREE.ConeGeometry(.85,1.15,6),M(C.teal,{e:C.teal,i:1.7})),0,5.94,0);
    add(g,new THREE.SphereGeometry(.39,24,16),0,6.62,0).material=M(C.cyan,{e:C.cyan,i:2.6,m:.2});
    const ring=add(g,new THREE.Mesh(new THREE.TorusGeometry(.72,.075,12,56),M(C.cyan,{e:C.cyan,i:2.4})),0,6.62,0);ring.rotation.x=Math.PI/2;
    add(g,box(.70,1.18,.12,M(0x2a1b16)),0,1.55,1.87);
    [-1,1].forEach(x=>{window(g,x*1.18,2.65,1.87,1.0);const tower=add(g,box(.64,2.15,.64,M(0x37626b)),x*1.95,2.25,0);const tr=add(g,new THREE.Mesh(new THREE.ConeGeometry(.55,.78,4),M(C.teal,{e:C.teal,i:1})),x*1.95,3.72,0);tr.rotation.y=Math.PI/4;});
    return g;
  }
  function addVillageLife(){
    fence(-4.9,-.8,3.0,.05);fence(4.8,-.9,3.2,-.04);fence(-4.8,3.8,2.7,.1);fence(4.5,3.5,2.8,-.1);
    [[-6,-3],[6,-3],[-6,3],[6,3],[-3,-6],[3,-6]].forEach(([x,z])=>{const g=new THREE.Group();for(let i=0;i<3;i++){const tr=new THREE.Mesh(new THREE.CylinderGeometry(.035,.06,.65,7),M(C.wood2));tr.position.set(i*.22-.22,.34,0);g.add(tr);}g.position.set(x,1.58,z);scene.add(g);});
  }
  function run(){
    // Hide the previous primitive presentation, but leave gameplay meshes alive.
    const hide=[];scene.children.forEach(o=>{if(o.userData?.rtsBuilding?.type==='towncenter')hide.push(o);});hide.forEach(o=>o.visible=false);
    upgradeBuildings();
    const oldCap=scene.children.find(o=>o.userData?.chatCapital);if(oldCap)oldCap.visible=false;const cap=capitalDetail();scene.add(cap);
    decorateWorkers();addVillageLife();
    // Camera stays wide enough to show the settlement, but buildings remain readable.
    cameraRadius=Math.max(38,Math.min(cameraRadius||42,48));cameraPhi=1.0;if(typeof updateCamera==='function')updateCamera();
  }
  wait(run);
})();
