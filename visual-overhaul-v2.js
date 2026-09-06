/* ChatGPT World — Premium Isometric World
 * ChatGPT is the fixed capital. Every other building is a conversation.
 * Conversation buildings visibly grow as their conversations grow.
 */
(() => {
  const wait=(fn,n=0)=>{
    if(typeof THREE!=='undefined'&&typeof scene!=='undefined'&&scene&&typeof camera!=='undefined'&&camera&&typeof renderer!=='undefined') return fn();
    if(n<150)setTimeout(()=>wait(fn,n+1),100);
  };
  const M=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:o.r??.82,metalness:o.m??0,emissive:o.e??0,emissiveIntensity:o.i??.2});
  const C={grass:0x527a4c,grass2:0x71965a,dirt:0x9b7550,water:0x145b70,water2:0x1e7890,rock:0x6f706b,wood:0x70472d,roof:0x274858,roof2:0x3a5d69,gold:0xffcf72,teal:0x18d8d0,cyan:0x72f7ff,wall:0x74523d,wall2:0x806047,blue:0x2d6fc0};
  const add=(g,o,x=0,y=0,z=0)=>{o.position.set(x,y,z);g.add(o);return o;};
  const box=(w,h,d,m)=>new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);

  function tree(g,x,z,s=1){
    add(g,new THREE.Mesh(new THREE.CylinderGeometry(.09*s,.15*s,1.2*s,7),M(C.wood)),x,.62*s,z);
    add(g,new THREE.Mesh(new THREE.SphereGeometry(.46*s,10,8),M(0x3d7548)),x,1.38*s,z);
    add(g,new THREE.Mesh(new THREE.SphereGeometry(.34*s,9,7),M(0x588a50)),x+.22*s,1.62*s,z+.08*s);
  }
  function lantern(x,z){
    const g=new THREE.Group(); add(g,new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.78,7),M(C.wood)),0,1.35,0); add(g,new THREE.Mesh(new THREE.SphereGeometry(.12,10,8),M(C.gold,{e:C.gold,i:2})),0,1.78,0); g.position.set(x,0,z); scene.add(g);
  }

  function house(t){
    const p=Math.max(0,Math.min(100,Number(t.progress)||0));
    const level=Math.min(5,1+Math.floor(p/21));
    const s=.86+level*.19,w=1.85*s,h=1.45*s;
    const g=new THREE.Group();
    g.userData.chatLevel=level;g.userData.chatProgress=p;g.userData.chatBuilding=true;
    const wall=M(level>=4?C.wall2:C.wall), roof=M(level>=4?C.roof2:C.roof,{e:0x0b2027,i:.25});
    add(g,box(w,h,w,wall),0,.92+h/2,0);
    const roofMesh=add(g,new THREE.Mesh(new THREE.ConeGeometry(w*.84,.95*s,4),roof),0,2.02+h*.40,0);roofMesh.rotation.y=Math.PI/4;
    add(g,box(w*.58,.13,.64,M(C.gold)),0,.76,w*.55);
    add(g,box(.50*s,.90*s,.11,M(0x2c1d17)),0,.84,w*.51);
    [[-.31,w*.51],[.31,w*.51],[-.31,-w*.51],[.31,-w*.51]].forEach(([x,z])=>add(g,box(.27*s,.36*s,.07,M(C.gold,{e:C.gold,i:1.1})),x,1.55+h*.22,z));
    add(g,box(.23*s,.58*s,.23*s,M(0x514b45)),w*.28,2.15*s,-w*.22);
    // Each growing chat gets visible construction scaffolding.
    if(p<100){
      const sm=M(0xb88b57);
      [-1,1].forEach(x=>[-1,1].forEach(z=>add(g,new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,2.45*s,6),sm),x*w*.64,1.40,z*w*.64)));
      add(g,box(w*1.42,.06,.06,sm),0,2.22*s,0).rotation.z=.13;
      add(g,box(w*.72,.05,.05,M(C.teal,{e:C.teal,i:1.5})),0,2.40*s,w*.54);
    }
    const flag=add(g,new THREE.Mesh(new THREE.PlaneGeometry(.42*s,.30*s),M(level>=4?C.gold:C.blue,{e:level>=4?C.gold:C.blue,i:.55})),-w*.67,1.65*s,w*.16);flag.rotation.y=Math.PI/2;
    add(g,new THREE.Mesh(new THREE.CylinderGeometry(.022,.022,1.12*s,7),M(C.wood)),-w*.67,1.45*s,w*.16);
    // Larger conversations gain a side wing and tower rather than only scaling.
    if(level>=3){
      add(g,box(w*.48,h*.70,w*.60,wall),w*.66,.82+h*.35,0);
      const r=add(g,new THREE.Mesh(new THREE.ConeGeometry(w*.42,.60*s,4),roof),w*.66,1.75+h*.32,0);r.rotation.y=Math.PI/4;
    }
    if(level>=5){
      add(g,box(w*.40,h*1.1,w*.40,wall),-w*.55,1.08+h*.48,0);
      const r=add(g,new THREE.Mesh(new THREE.ConeGeometry(w*.31,.72*s,4),M(C.gold)), -w*.55,2.55+h*.58,0);r.rotation.y=Math.PI/4;
    }
    return g;
  }

  function capital(){
    const g=new THREE.Group();g.userData.chatCapital=true;
    add(g,new THREE.Mesh(new THREE.CylinderGeometry(2.8,3.2,.55,40),M(0x4b625f)),0,1.12,0);
    add(g,box(3.45,2.55,3.45,M(0x31545e)),0,2.50,0);
    const roof=add(g,new THREE.Mesh(new THREE.ConeGeometry(2.85,1.55,6),M(0x174652,{e:0x083943,i:.4})),0,4.45,0);roof.rotation.y=Math.PI/6;
    add(g,new THREE.Mesh(new THREE.ConeGeometry(.78,1.05,6),M(C.teal,{e:C.teal,i:1.5})),0,5.58,0);
    add(g,new THREE.Mesh(new THREE.SphereGeometry(.36,24,16),M(C.cyan,{e:C.cyan,i:2.3,m:.2})),0,6.18,0);
    const ring=add(g,new THREE.Mesh(new THREE.TorusGeometry(.68,.075,10,48),M(C.cyan,{e:C.cyan,i:2.2})),0,6.18,0);ring.rotation.x=Math.PI/2;
    add(g,box(.66,1.08,.11,M(0x261813)),0,1.45,1.77);
    [[-1.15,1.67],[1.15,1.67],[-1.15,-1.67],[1.15,-1.67]].forEach(([x,z])=>add(g,box(.34,.50,.08,M(C.gold,{e:C.gold,i:1})),x,2.62,z));
    [-1,1].forEach(x=>{const f=add(g,new THREE.Mesh(new THREE.PlaneGeometry(.48,.34),M(C.blue,{e:C.blue,i:.6})),x*2.02,3.18,.1);f.rotation.y=Math.PI/2;add(g,new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,1.4,8),M(C.wood)),x*2.02,3.0,.1);});
    return g;
  }

  function terrain(){
    // Replace the flat presentation with a broad layered plateau and water surround.
    const water=new THREE.Mesh(new THREE.CylinderGeometry(20.5,22,.65,72),M(0x0b3449,{r:.3,m:.2}));water.position.y=-1.05;scene.add(water);
    const land=new THREE.Mesh(new THREE.CylinderGeometry(15.0,15.5,1.05,72),M(C.grass,{r:1}));land.position.y=.92;scene.add(land);
    const meadow=new THREE.Mesh(new THREE.CylinderGeometry(14.55,14.55,.12,72),M(C.grass2,{r:1}));meadow.position.y=1.48;scene.add(meadow);
    const shore=new THREE.Mesh(new THREE.TorusGeometry(14.7,.38,8,100),M(0x395b48,{r:1}));shore.rotation.x=Math.PI/2;shore.position.y=1.50;scene.add(shore);
    // Main roads radiate from the capital and branch to conversations.
    const road=M(C.dirt,{r:1});
    (typeof threads!=='undefined'?threads:[]).filter(t=>t.type!=='hub').forEach(t=>{
      const dx=t.x,dz=t.z,len=Math.hypot(dx,dz);const p=box(.78,.07,len,road);p.position.set(dx/2,1.59,dz/2);p.rotation.y=Math.atan2(dx,dz);scene.add(p);
    });
    const plaza=new THREE.Mesh(new THREE.CylinderGeometry(3.45,3.45,.16,48),M(0x9d896d,{r:.9}));plaza.position.y=1.63;scene.add(plaza);
    const trees=[[-11,-7,1.2],[-9,-9,.9],[-5,-9,1.15],[-1,-10,.95],[4,-9,1.1],[9,-8,1.2],[11,-5,.95],[11,0,1.1],[10,5,1.2],[7,9,1.0],[2,10,1.15],[-3,9,.9],[-7,9,1.15],[-10,5,1.0],[-11,1,.9],[-9,-2,1.05]];
    trees.forEach(([x,z,s])=>{const g=new THREE.Group();tree(g,0,0,s);g.position.set(x,0,z);scene.add(g);});
    // Rocky mountain ring gives depth when zoomed out.
    for(let i=0;i<12;i++){const a=i*Math.PI*2/12,r=13.4+(i%2)*.7,h=2.8+(i%4)*.65;const m=new THREE.Mesh(new THREE.ConeGeometry(1.2+(i%3)*.35,h,7),M(i%2?0x596660:0x4d5b58,{r:1}));m.position.set(Math.cos(a)*r,1.55+h/2,Math.sin(a)*r);scene.add(m);}
    [[-4,-1],[4,-1],[-4,1.7],[4,1.7],[-1.8,-3.3],[1.8,-3.3]].forEach(p=>lantern(...p));
  }

  function resources(){
    scene.traverse(o=>{
      if(!o.isGroup||!o.userData?.rtsNode)return;
      const type=o.userData.rtsNode.type;o.clear();
      if(type==='wood'){
        for(let i=0;i<5;i++){const g=new THREE.Group();tree(g,0,0,1-(i%2)*.12);g.position.set((i-2)*.38,0,(i%2-.5)*.45);o.add(g);}
      } else if(type==='stone'){
        for(let i=0;i<8;i++){const r=new THREE.Mesh(new THREE.DodecahedronGeometry(.30+(i%3)*.08),M(C.rock,{r:1}));r.position.set((i-3.5)*.28,.45,(i%2-.5)*.48);o.add(r);}
      } else {
        o.add(box(1.55,.08,1.55,M(0x68492f,{r:1})),0,.05,0);
        for(let i=0;i<12;i++){const p=new THREE.Mesh(new THREE.ConeGeometry(.07,.34,5),M(0x6ca44c));p.position.set(-.55+(i%4)*.36,.27,-.55+Math.floor(i/4)*.5);o.add(p);}
      }
    });
  }

  function rebuild(){
    if(typeof threads==='undefined')return;
    terrain();
    const groups=[];scene.traverse(o=>{if(o.isGroup&&o.userData?.threadIndex!==undefined)groups.push(o);});
    groups.forEach(o=>{const t=threads[o.userData.threadIndex];if(!t)return;const pos=o.position.clone();o.clear();const h=house(t);h.children.forEach(c=>o.add(c));o.position.copy(pos);o.userData.chatBuilding=true;o.userData.chatLevel=h.userData.chatLevel;o.userData.chatProgress=h.userData.chatProgress;});
    scene.traverse(o=>{if(o.userData?.rtsBuilding?.type==='towncenter')o.visible=false;});
    const cap=capital();cap.position.set(0,0,0);scene.add(cap);
    resources();
    // Wide default view: show the entire settlement instead of a close-up.
    cameraRadius=42;cameraPhi=1.03;updateCamera();
    let pinch=null;
    renderer.domElement.addEventListener('wheel',e=>{cameraRadius+=e.deltaY*.05;cameraRadius=Math.max(22,Math.min(62,cameraRadius));updateCamera();},{passive:true});
    renderer.domElement.addEventListener('touchmove',e=>{if(e.touches.length!==2){pinch=null;return;}const dx=e.touches[0].clientX-e.touches[1].clientX,dy=e.touches[0].clientY-e.touches[1].clientY,d=Math.hypot(dx,dy);if(pinch!==null){cameraRadius-=(d-pinch)*.065;cameraRadius=Math.max(22,Math.min(62,cameraRadius));updateCamera();}pinch=d;},{passive:true});
    renderer.domElement.addEventListener('touchend',()=>pinch=null,{passive:true});
  }
  wait(rebuild);
})();
