const threads = [
  {name:"Creative Studio",state:"working",x:-3,z:-1,progress:72,icon:"✦"},
  {name:"Career Planning",state:"waiting",x:2,z:-2,progress:48,icon:"◈"},
  {name:"Business School",state:"finished",x:-1,z:2,progress:100,icon:"◆"},
  {name:"Idea Lab",state:"idle",x:3,z:2,progress:26,icon:"✧"},
  {name:"Project Hub",state:"dormant",x:0,z:0,progress:12,icon:"◇"}
];

const colors={
  working:0x8f5cff,
  waiting:0xffc45c,
  finished:0x5fffc4,
  idle:0x62dfff,
  dormant:0x777080
};

let scene,camera,renderer,raycaster,mouse;
let selected=null;
const residents=[];

const world=document.getElementById("world");

function init(){
  scene=new THREE.Scene();
  scene.background=new THREE.Color(0x05030b);
  scene.fog=new THREE.FogExp2(0x080611,.045);

  camera=new THREE.PerspectiveCamera(
    42,
    innerWidth/innerHeight,
    .1,
    100
  );
  camera.position.set(8,8,10);
  camera.lookAt(0,0,0);

  renderer=new THREE.WebGLRenderer({
    antialias:true,
    alpha:false,
    powerPreference:"high-performance"
  });

  renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));
  renderer.setSize(innerWidth,innerHeight);
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  world.appendChild(renderer.domElement);

  raycaster=new THREE.Raycaster();
  mouse=new THREE.Vector2();

  addLights();
  addStars();
  createIsland();
  threads.forEach(createResident);

  setupTouch();
  setupUI();

  addEventListener("resize",resize);
  animate();
}

function addLights(){
  const ambient=new THREE.HemisphereLight(0x8d7cff,0x090611,1.8);
  scene.add(ambient);

  const moon=new THREE.DirectionalLight(0xb9b2ff,2.8);
  moon.position.set(-5,10,5);
  moon.castShadow=true;
  scene.add(moon);

  const glow=new THREE.PointLight(0x744cff,18,20);
  glow.position.set(0,2,0);
  scene.add(glow);
}

function addStars(){
  const geo=new THREE.BufferGeometry();
  const count=650;
  const pos=new Float32Array(count*3);

  for(let i=0;i<count;i++){
    pos[i*3]=(Math.random()-.5)*55;
    pos[i*3+1]=Math.random()*24+3;
    pos[i*3+2]=(Math.random()-.5)*55;
  }

  geo.setAttribute("position",new THREE.BufferAttribute(pos,3));

  const mat=new THREE.PointsMaterial({
    color:0xffffff,
    size:.055,
    transparent:true,
    opacity:.8
  });

  scene.add(new THREE.Points(geo,mat));
}

function createIsland(){
  const base=new THREE.Mesh(
    new THREE.CylinderGeometry(7,5.5,1.4,48),
    new THREE.MeshStandardMaterial({
      color:0x171226,
      roughness:.88,
      metalness:.08
    })
  );

  base.position.y=-.7;
  base.receiveShadow=true;
  scene.add(base);

  const grass=new THREE.Mesh(
    new THREE.CylinderGeometry(6.7,5.2,.42,48),
    new THREE.MeshStandardMaterial({
      color:0x263d38,
      roughness:1
    })
  );

  grass.position.y=.05;
  grass.receiveShadow=true;
  scene.add(grass);

  const ring=new THREE.Mesh(
    new THREE.TorusGeometry(6.75,.035,8,96),
    new THREE.MeshBasicMaterial({
      color:0x8f5cff,
      transparent:true,
      opacity:.55
    })
  );

  ring.rotation.x=Math.PI/2;
  ring.position.y=.28;
  scene.add(ring);

  for(let i=0;i<12;i++){
    const a=(i/12)*Math.PI*2;
    const r=5.4;

    const tree=new THREE.Group();

    const trunk=new THREE.Mesh(
      new THREE.CylinderGeometry(.08,.12,.65,8),
      new THREE.MeshStandardMaterial({color:0x392b31})
    );
    trunk.position.y=.45;

    const crown=new THREE.Mesh(
      new THREE.SphereGeometry(.42,10,8),
      new THREE.MeshStandardMaterial({
        color:0x315c51,
        roughness:1
      })
    );
    crown.position.y=.9;

    tree.add(trunk,crown);
    tree.position.set(Math.cos(a)*r,0,Math.sin(a)*r);
    scene.add(tree);
  }
}

function createResident(data){
  const group=new THREE.Group();

  const body=new THREE.Mesh(
    new THREE.CapsuleGeometry(.28,.42,5,10),
    new THREE.MeshStandardMaterial({
      color:0xddd9ee,
      roughness:.32,
      metalness:.35
    })
  );
  body.position.y=.72;
  body.castShadow=true;

  const head=new THREE.Mesh(
    new THREE.SphereGeometry(.31,16,12),
    new THREE.MeshStandardMaterial({
      color:0xeeeeff,
      roughness:.22,
      metalness:.25
    })
  );
  head.position.y=1.28;
  head.castShadow=true;

  const visor=new THREE.Mesh(
    new THREE.SphereGeometry(.205,16,10),
    new THREE.MeshBasicMaterial({
      color:colors[data.state]
    })
  );
  visor.scale.set(1,.48,.28);
  visor.position.set(0,1.29,.25);

  const glow=new THREE.PointLight(colors[data.state],2.4,2.5);
  glow.position.set(0,1.05,.2);

  group.add(body,head,visor,glow);

  const beacon=new THREE.Mesh(
    new THREE.SphereGeometry(.08,10,8),
    new THREE.MeshBasicMaterial({
      color:colors[data.state]
    })
  );
  beacon.position.y=1.72;

  if(data.state==="waiting"||data.state==="working"){
    group.add(beacon);
  }

  group.position.set(data.x,0,data.z);

  group.userData={
    ...data,
    baseX:data.x,
    baseZ:data.z,
    phase:Math.random()*Math.PI*2
  };

  scene.add(group);
  residents.push(group);
}

function selectResident(obj){
  selected=obj;

  document.getElementById("sheetTitle").textContent=obj.userData.name;
  document.getElementById("sheetState").textContent=
    obj.userData.state.toUpperCase();

  document.getElementById("sheetText").textContent=
    stateText(obj.userData.state);

  document.getElementById("progressFill").style.width=
    obj.userData.progress+"%";

  document.getElementById("sheet").classList.add("open");
}

function stateText(state){
  const text={
    working:"This conversation is actively working. Your resident is moving through the world.",
    waiting:"This conversation is waiting for your attention.",
    finished:"This conversation has completed its current task.",
    idle:"This conversation is available and resting.",
    dormant:"This conversation has been quiet for a while."
  };

  return text[state]||"Conversation status available.";
}

function setupTouch(){
  renderer.domElement.addEventListener("pointerdown",e=>{
    mouse.x=(e.clientX/innerWidth)*2-1;
    mouse.y=-(e.clientY/innerHeight)*2+1;

    raycaster.setFromCamera(mouse,camera);

    const hits=raycaster.intersectObjects(residents,true);

    if(hits.length){
      let obj=hits[0].object;

      while(obj.parent && !obj.userData.name){
        obj=obj.parent;
      }

      if(obj.userData.name)selectResident(obj);
    }
  });
}

let targetX=8,targetY=8,targetZ=10;

function setupUI(){
  document.getElementById("closeSheet").onclick=()=>{
    document.getElementById("sheet").classList.remove("open");
    selected=null;
  };

  let startX=0,startY=0;

  renderer.domElement.addEventListener("touchstart",e=>{
    if(e.touches.length===1){
      startX=e.touches[0].clientX;
      startY=e.touches[0].clientY;
    }
  },{passive:true});

  renderer.domElement.addEventListener("touchmove",e=>{
    if(e.touches.length===1){
      const dx=e.touches[0].clientX-startX;
      const dy=e.touches[0].clientY-startY;

      targetX-=dx*.018;
      targetZ+=dy*.018;

      startX=e.touches[0].clientX;
      startY=e.touches[0].clientY;
    }
  },{passive:true});

  renderer.domElement.addEventListener("wheel",e=>{
    targetY+=e.deltaY*.01;
    targetY=Math.max(4,Math.min(15,targetY));
  },{passive:true});
}

function animate(){
  requestAnimationFrame(animate);

  const t=performance.now()*.001;

  camera.position.x+=(targetX-camera.position.x)*.05;
  camera.position.y+=(targetY-camera.position.y)*.05;
  camera.position.z+=(targetZ-camera.position.z)*.05;
  camera.lookAt(0,0,0);

  residents.forEach((r,i)=>{
    const d=r.userData;

    if(d.state==="working"){
      r.position.x=d.baseX+Math.sin(t*1.5+d.phase)*.55;
      r.position.z=d.baseZ+Math.cos(t*1.2+d.phase)*.55;
      r.rotation.y+=.025;
    }else{
      r.position.y=Math.sin(t*1.2+d.phase)*.035;
    }

    if(d.state==="waiting"){
      r.children.forEach(c=>{
        if(c.isMesh && c.position.y>1.6){
          c.scale.setScalar(1+Math.sin(t*4+d.phase)*.35);
        }
      });
    }

    if(d.state==="finished"){
      r.rotation.y=Math.sin(t*.5+d.phase)*.12;
    }
  });

  renderer.render(scene,camera);
}

function resize(){
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(innerWidth,innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));
}

const script=document.createElement("script");
script.src="https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.min.js";
script.onload=init;
document.head.appendChild(script);
