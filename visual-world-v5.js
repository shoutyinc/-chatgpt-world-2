/* ChatGPT World — Dense Living Village v5
 * Adds the visual density seen in the target: more homes, gardens, market activity,
 * paths, bridges, lanterns and recognizable ChatGPT workers.
 */
(() => {
  const wait=(fn,n=0)=>{if(typeof THREE!=='undefined'&&typeof scene!=='undefined'&&scene&&typeof camera!=='undefined'&&typeof renderer!=='undefined')return fn();if(n<180)setTimeout(()=>wait(fn,n+1),100);};
  const M=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:o.r??.8,metalness:o.m??0,emissive:o.e??0,emissiveIntensity:o.i??.2});
  const C={wood:0x674229,wood2:0x91613b,wall:0xb58960,wall2:0x8d694e,roof:0x31566b,roof2:0x456f82,stone:0x817a6b,gold:0xffcf70,cyan:0x72f7ff,teal:0x16d8cf,green:0x4e8b4e,green2:0x6fa255,blue:0x3e70c1};
  const add=(g,o,x=0,y=0,z=0)=>{o.position.set(x,y,z);g.add(o);return o;};
  const box=(w,h,d,m)=>new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);
  function roof(g,w,d,y,m){const r=add(g,new THREE.Mesh(new THREE.ConeGeometry(Math.max(w,d)*.70,.9+Math.max(w,d)*.14,4),m),0,y,0);r.rotation.y=Math.PI/4;return r;}
  function smallHouse(x,z,s=.72,rot=0){
    const g=new THREE.Group(),w=1.65*s,d=1.48*s,h=1.28*s,wall=M(Math.random()>.5?C.wall:C.wall2),rm=M(C.roof);
    add(g,box(w,h,d,wall),0,.82+h/2,0);add(g,box(w+.16,.20,d+.16,M(C.stone)),0,.74,0);roof(g,w,d,1.92+h*.30,rm);
    add(g,box(.10,h*.72,.10,M(C.wood2)),-w*.44,.96,d/2+.03);add(g,box(.10,h*.72,.10,M(C.wood2)),w*.44,.96,d/2+.03);add(g,box(w,.10,.10,M(C.wood2)),0,1.00+h*.36,d/2+.03);
    add(g,box(.42,.72,.10,M(0x2b1b15)),0,.86,d/2+.06);
    [-.30,.30].forEach(q=>add(g,box(.22,.30,.08,M(C.gold,{e:C.gold,i:1.4})),q,1.43+h*.12,d/2+.07));
    const flag=add(g,new THREE.Mesh(new THREE.PlaneGeometry(.34,.24),M(C.blue,{e:C.blue,i:.45})),-w*.58,1.52*s,.10);flag.rotation.y=Math.PI/2;
    g.position.set(x,1.58,z);g.rotation.y=rot;scene.add(g);return g;
  }
  function garden(x,z,s=1){
    const g=new THREE.Group();add(g,box(1.65*s,.06,1.15*s,M(0x765033)),0,.05,0);
    for(let i=0;i<18;i++){const p=new THREE.Mesh(new THREE.ConeGeometry(.055*s,.28*s,5),M(i%3?C.green:C.green2));p.position.set(-.62*s+(i%6)*.25*s,.20*s,-.42*s+Math.floor(i/6)*.42*s);g.add(p);}
    for(let i=0;i<7;i++){const f=new THREE.Mesh(new THREE.SphereGeometry(.055*s,7,6),M([0xffa3b8,0xffcf70,0xa6cfff][i%3],{e:[0xffa3b8,0xffcf70,0xa6cfff][i%3],i:.5}));f.position.set(-.65*s+(i%4)*.43*s,.28,-.65*s+(i%2)*.65*s);g.add(f);}g.position.set(x,1.58,z);scene.add(g);
  }
  function lantern(x,z){const g=new THREE.Group();add(g,new THREE.Mesh(new THREE.CylinderGeometry(.035,.045,.82,7),M(C.wood2)),0,.41,0);add(g,new THREE.Mesh(new THREE.SphereGeometry(.12,10,8),M(C.gold,{e:C.gold,i:2})),0,.86,0);g.position.set(x,1.58,z);scene.add(g);}
  function bridge(x,z,len=3){const g=new THREE.Group();add(g,box(.95,.16,len,M(C.wood2)),0,.18,0);for(let i=0;i<5;i++)add(g,box(.08,.34,.08,M(C.wood)),i%2?-.42:.42,.40,-len/2+i*len/4);g.position.set(x,1.58,z);scene.add(g);}
  function market(x,z){const g=new THREE.Group(),m=M(C.wood2);add(g,box(1.55,.08,1.05,M(0x765033)),0,.05,0);[-.65,.65].forEach(q=>add(g,new THREE.Mesh(new THREE.CylinderGeometry(.035,.045,1.65,7),m),q,.82,0));const roofm=M(0xc64f42);add(g,new THREE.Mesh(new THREE.ConeGeometry(1.05,.72,4),roofm),0,1.72,0).rotation.y=Math.PI/4;for(let i=0;i<5;i++)add(g,box(.20,.12,.20,M([C.gold,0x78c6b0,0xd98954][i%3])), -.55+i*.27,.30,.1);g.position.set(x,1.58,z);scene.add(g);}
  function cart(x,z,rot=0){const g=new THREE.Group();add(g,box(1.0,.25,.60,M(C.wood2)),0,.45,0);[-.33,.33].forEach(q=>{const w=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,.10,12),M(0x302822));w.rotation.z=Math.PI/2;add(g,w,q,.25,-.30);});g.position.set(x,1.58,z);g.rotation.y=rot;scene.add(g);}
  function correctWorkers(){
    const units=[];scene.traverse(o=>{if(o.userData?.rtsUnit)units.push(o);});
    units.forEach(o=>{
      o.userData.visualWorker=true;
      o.children.forEach(c=>c.visible=false);
      const body=add(o,new THREE.Mesh(new THREE.CylinderGeometry(.22,.27,.55,12),M(0xf1f3ee)),0,1.02,0);
      add(o,new THREE.Mesh(new THREE.SphereGeometry(.23,16,12),M(0x172027,{e:0x061016,i:.2})),0,1.48,0);
      add(o,box(.30,.075,.08,M(C.cyan,{e:C.cyan,i:2})),0,1.49,.20);
      add(o,new THREE.Mesh(new THREE.CylinderGeometry(.055,.055,.56,8),M(C.wood2)),.26,.92,0).rotation.z=-.55;
      add(o,box(.10,.25,.18,M(C.gold)),.22,1.03,.02);
      body.scale.x=1.0;
    });
  }
  function populate(){
    // Keep the core clear around the capital, then build a real village ring.
    const houses=[[-7.2,-4.8,.80,.12],[-4.9,-6.4,.68,-.2],[-1.8,-7.0,.78,.1],[2.1,-6.8,.72,-.1],[5.3,-5.6,.84,.2],[7.1,-2.7,.72,-.1],[7.2,1.1,.80,.15],[5.8,4.4,.70,-.15],[3.0,6.2,.78,.1],[-.4,7.0,.72,-.2],[-4.0,6.2,.82,.1],[-6.7,4.2,.72,-.1],[-7.8,.8,.78,.2]];
    houses.forEach(h=>smallHouse(...h));
    [[-6.0,-2.7,1.1],[5.9,-2.0,.9],[-5.7,3.0,.9],[4.8,3.5,1.0],[.2,-6.2,.85],[-2.7,5.8,.8]].forEach(p=>garden(...p));
    [[-7.0,-1.0],[-5.8,-4.2],[-2.8,-6.3],[2.9,-5.8],[6.7,-3.5],[7.0,.2],[5.8,3.4],[1.8,5.8],[-2.0,6.0],[-5.5,4.0],[-7.2,1.8]].forEach(p=>lantern(...p));
    market(-2.0,-4.8);market(4.0,2.6);cart(-5.0,-3.2,.2);cart(5.5,.1,-.2);bridge(6.7,2.0,3.8);
    // Add visual villagers around homes and roads, independent of gameplay unit count.
    const spots=[[-5.8,-5.0],[-4.1,-5.3],[-2.8,-4.5],[3.5,-5.0],[5.0,-4.2],[6.0,-1.0],[5.2,2.8],[2.8,4.7],[-2.8,5.0],[-5.0,3.7],[-6.2,1.0],[-4.2,-1.8],[4.2,-1.6]];
    spots.forEach(([x,z],i)=>{const w=new THREE.Group();w.userData.decorWorker=true;const b=add(w,new THREE.Mesh(new THREE.CylinderGeometry(.16,.20,.42,10),M(0xf0f2ee)),0,.55,0);add(w,new THREE.Mesh(new THREE.SphereGeometry(.17,12,10),M(0x172027)),0,.91,0);add(w,box(.22,.055,.06,M(C.cyan,{e:C.cyan,i:1.8})),0,.92,.15);add(w,new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.40,7),M(C.wood2)),.20,.48,0).rotation.z=-.5;w.position.set(x,1.58,z);scene.add(w);});
    correctWorkers();
    cameraRadius=Math.max(cameraRadius||42,46);cameraRadius=Math.min(cameraRadius,52);if(typeof updateCamera==='function')updateCamera();
  }
  wait(populate);
})();
