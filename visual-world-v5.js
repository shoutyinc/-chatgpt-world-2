/* ChatGPT World — Spacious Village Layout v6 */
(() => {
  const wait=(fn,n=0)=>{if(typeof THREE!=='undefined'&&typeof scene!=='undefined'&&scene&&typeof camera!=='undefined'&&typeof renderer!=='undefined')return fn();if(n<180)setTimeout(()=>wait(fn,n+1),100);};
  const M=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:o.r??.8,metalness:o.m??0,emissive:o.e??0,emissiveIntensity:o.i??.2});
  const C={wood:0x674229,wood2:0x91613b,wall:0xb58960,wall2:0x8d694e,roof:0x31566b,stone:0x817a6b,gold:0xffcf70,cyan:0x72f7ff,teal:0x16d8cf,green:0x4e8b4e,green2:0x6fa255,blue:0x3e70c1};
  const add=(g,o,x=0,y=0,z=0)=>{o.position.set(x,y,z);g.add(o);return o;};const box=(w,h,d,m)=>new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);
  function roof(g,w,d,y,m){const r=add(g,new THREE.Mesh(new THREE.ConeGeometry(Math.max(w,d)*.70,.9+Math.max(w,d)*.14,4),m),0,y,0);r.rotation.y=Math.PI/4;return r;}
  function smallHouse(x,z,s=.72,rot=0){const g=new THREE.Group(),w=1.65*s,d=1.48*s,h=1.28*s,wall=M(Math.random()>.5?C.wall:C.wall2),rm=M(C.roof);add(g,box(w,h,d,wall),0,.82+h/2,0);add(g,box(w+.16,.20,d+.16,M(C.stone)),0,.74,0);roof(g,w,d,1.92+h*.30,rm);add(g,box(.10,h*.72,.10,M(C.wood2)),-w*.44,.96,d/2+.03);add(g,box(.10,h*.72,.10,M(C.wood2)),w*.44,.96,d/2+.03);add(g,box(w,.10,.10,M(C.wood2)),0,1.00+h*.36,d/2+.03);add(g,box(.42,.72,.10,M(0x2b1b15)),0,.86,d/2+.06);[-.30,.30].forEach(q=>add(g,box(.22,.30,.08,M(C.gold,{e:C.gold,i:1.4})),q,1.43+h*.12,d/2+.07));const flag=add(g,new THREE.Mesh(new THREE.PlaneGeometry(.34,.24),M(C.blue,{e:C.blue,i:.45})),-w*.58,1.52*s,.10);flag.rotation.y=Math.PI/2;g.position.set(x,1.58,z);g.rotation.y=rot;scene.add(g);}
  function garden(x,z,s=1){const g=new THREE.Group();add(g,box(1.65*s,.06,1.15*s,M(0x765033)),0,.05,0);for(let i=0;i<18;i++){const p=new THREE.Mesh(new THREE.ConeGeometry(.055*s,.28*s,5),M(i%3?C.green:C.green2));p.position.set(-.62*s+(i%6)*.25*s,.20*s,-.42*s+Math.floor(i/6)*.42*s);g.add(p);}g.position.set(x,1.58,z);scene.add(g);}
  function lantern(x,z){const g=new THREE.Group();add(g,new THREE.Mesh(new THREE.CylinderGeometry(.035,.045,.82,7),M(C.wood2)),0,.41,0);add(g,new THREE.Mesh(new THREE.SphereGeometry(.12,10,8),M(C.gold,{e:C.gold,i:2})),0,.86,0);g.position.set(x,1.58,z);scene.add(g);}
  function bridge(x,z,len=3){const g=new THREE.Group();add(g,box(.95,.16,len,M(C.wood2)),0,.18,0);for(let i=0;i<5;i++)add(g,box(.08,.34,.08,M(C.wood)),i%2?-.42:.42,.40,-len/2+i*len/4);g.position.set(x,1.58,z);scene.add(g);}
  function market(x,z){const g=new THREE.Group(),m=M(C.wood2);add(g,box(1.55,.08,1.05,M(0x765033)),0,.05,0);[-.65,.65].forEach(q=>add(g,new THREE.Mesh(new THREE.CylinderGeometry(.035,.045,1.65,7),m),q,.82,0));const rm=M(0xc64f42);const r=add(g,new THREE.Mesh(new THREE.ConeGeometry(1.05,.72,4),rm),0,1.72,0);r.rotation.y=Math.PI/4;g.position.set(x,1.58,z);scene.add(g);}
  function cart(x,z,rot=0){const g=new THREE.Group();add(g,box(1,.25,.6,M(C.wood2)),0,.45,0);[-.33,.33].forEach(q=>{const w=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,.1,12),M(0x302822));w.rotation.z=Math.PI/2;add(g,w,q,.25,-.3);});g.position.set(x,1.58,z);g.rotation.y=rot;scene.add(g);}
  function populate(){
    // Deliberately leave a generous ring around the central ChatGPT capital.
    const houses=[[-10.5,-6.5,.82,.12],[-7.0,-9.0,.70,-.2],[-2.8,-10.0,.80,.1],[2.8,-9.8,.74,-.1],[7.5,-8.2,.86,.2],[10.0,-4.2,.74,-.1],[10.5,.8,.82,.15],[8.8,5.0,.72,-.15],[4.6,8.0,.80,.1],[0,9.5,.74,-.2],[-4.8,8.3,.84,.1],[-8.8,5.4,.74,-.1],[-10.8,.7,.80,.2]];
    houses.forEach(h=>smallHouse(...h));
    [[-8.0,-5.0,1.1],[7.8,-4.7,.9],[-7.7,3.8,.9],[7.0,4.2,1.0],[.2,-8.6,.85],[-3.8,7.4,.8]].forEach(p=>garden(...p));
    [[-9.0,-2.0],[-6.5,-6.8],[-3.5,-8.6],[3.8,-8.2],[8.8,-5.2],[9.2,.1],[7.8,4.0],[3.0,7.5],[-2.0,8.0],[-6.8,5.0],[-9.3,1.8]].forEach(p=>lantern(...p));
    market(-3.8,-7.0);market(5.3,3.1);cart(-7.0,-5.2,.2);cart(8.0,.2,-.2);bridge(8.9,2.3,3.8);
    // A few decorative workers occupy the open roads, not the capital footprint.
    const spots=[[-8.0,-7.0],[-5.0,-7.0],[-2.0,-7.7],[4.8,-7.2],[7.8,-6.0],[8.7,-2.0],[8.2,2.8],[5.8,6.0],[2.0,7.2],[-3.0,6.8],[-6.8,3.8],[-8.0,.0],[5.8,-2.0]];
    spots.forEach(([x,z])=>{const g=new THREE.Group();add(g,new THREE.Mesh(new THREE.CylinderGeometry(.16,.2,.42,10),M(0xf0f2ee)),0,.55,0);add(g,new THREE.Mesh(new THREE.SphereGeometry(.17,12,10),M(0x172027)),0,.91,0);add(g,box(.22,.055,.06,M(C.cyan,{e:C.cyan,i:1.8})),0,.92,.15);g.position.set(x,1.58,z);scene.add(g);});
    // Wider view to match the open settlement composition.
    cameraRadius=50;cameraPhi=.98;if(typeof updateCamera==='function')updateCamera();
  }
  wait(populate);
})();
