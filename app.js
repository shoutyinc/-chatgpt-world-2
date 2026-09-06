import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";const threads = [
  {name:"Creative Studio", state:"working", x:-3, z:-1, progress:72, icon:"✦"},
  {name:"Career Planning", state:"waiting", x:2, z:-2, progress:48, icon:"◈"},
  {name:"Business School", state:"finished", x:-1, z:2, progress:100, icon:"◆"},
  {name:"Idea Lab", state:"idle", x:3, z:2, progress:26, icon:"✧"},
  {name:"Project Hub", state:"dormant", x:0, z:0, progress:12, icon:"◇"}
];

const colors = {
  working:0x9b5cff,
  waiting:0xffc45c,
  finished:0x5fffc4,
  idle:0x62dfff,
  dormant:0x777080
};

let scene;
let camera;
let renderer;
let raycaster;
let pointer;

const residents = [];
const world = document.getElementById("world");

function startWorld(){

  scene = new THREE.Scene();

  scene.background = new THREE.Color(0x05030b);

  scene.fog = new THREE.FogExp2(
    0x080611,
    0.035
  );

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );

  camera.position.set(8,8,10);
  camera.lookAt(0,0,0);

  renderer = new THREE.WebGLRenderer({
    antialias:true,
    powerPreference:"high-performance"
  });

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, 2)
  );

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

  renderer.shadowMap.enabled = true;

  world.innerHTML = "";
  world.appendChild(renderer.domElement);

  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();

  createLighting();
  createStars();
  createIsland();
  createResidents();

  renderer.domElement.addEventListener(
    "pointerdown",
    selectObject
  );

  renderer.domElement.addEventListener(
    "touchstart",
    touchStart,
    {passive:true}
  );

  renderer.domElement.addEventListener(
    "touchmove",
    touchMove,
    {passive:true}
  );

  window.addEventListener("resize", resize);

  animate();
}


/* ---------- LIGHTING ---------- */

function createLighting(){

  const ambient = new THREE.HemisphereLight(
    0xb7a8ff,
    0x090611,
    2
  );

  scene.add(ambient);

  const moon = new THREE.DirectionalLight(
    0xffffff,
    3
  );

  moon.position.set(-5,10,6);
  moon.castShadow = true;

  scene.add(moon);

  const purpleGlow = new THREE.PointLight(
    0x8b4dff,
    25,
    25
  );

  purpleGlow.position.set(0,4,0);

  scene.add(purpleGlow);
}


/* ---------- STARS ---------- */

function createStars(){

  const geometry =
    new THREE.BufferGeometry();

  const count = 900;

  const positions =
    new Float32Array(count * 3);

  for(let i=0;i<count;i++){

    positions[i*3] =
      (Math.random()-0.5)*60;

    positions[i*3+1] =
      Math.random()*25+3;

    positions[i*3+2] =
      (Math.random()-0.5)*60;
  }

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
      positions,
      3
    )
  );

  const material =
    new THREE.PointsMaterial({
      color:0xffffff,
      size:0.06,
      transparent:true,
      opacity:0.85
    });

  const stars =
    new THREE.Points(
      geometry,
      material
    );

  scene.add(stars);
}


/* ---------- ISLAND ---------- */

function createIsland(){

  const base =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        7,
        5.5,
        1.4,
        48
      ),
      new THREE.MeshStandardMaterial({
        color:0x171226,
        roughness:0.9
      })
    );

  base.position.y = -0.7;
  base.receiveShadow = true;

  scene.add(base);


  const grass =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        6.7,
        5.2,
        0.45,
        48
      ),
      new THREE.MeshStandardMaterial({
        color:0x29463d,
        roughness:1
      })
    );

  grass.position.y = 0;

  grass.receiveShadow = true;

  scene.add(grass);


  const ring =
    new THREE.Mesh(
      new THREE.TorusGeometry(
        6.7,
        0.04,
        8,
        96
      ),
      new THREE.MeshBasicMaterial({
        color:0x9b5cff
      })
    );

  ring.rotation.x = Math.PI/2;
  ring.position.y = 0.25;

  scene.add(ring);


  /* TREES */

  for(let i=0;i<14;i++){

    const angle =
      (i/14)*Math.PI*2;

    const radius = 5.4;

    const tree =
      new THREE.Group();


    const trunk =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.08,
          0.13,
          0.7,
          8
        ),
        new THREE.MeshStandardMaterial({
          color:0x49332c
        })
      );

    trunk.position.y = 0.4;


    const crown =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.45,
          12,
          10
        ),
        new THREE.MeshStandardMaterial({
          color:0x3c725d
        })
      );

    crown.position.y = 0.9;


    tree.add(
      trunk,
      crown
    );


    tree.position.set(
      Math.cos(angle)*radius,
      0,
      Math.sin(angle)*radius
    );

    scene.add(tree);
  }
}


/* ---------- RESIDENTS ---------- */

function createResidents(){

  threads.forEach((data,index)=>{

    const robot =
      new THREE.Group();


    /* BODY */

    const body =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.32,
          16,
          12
        ),
        new THREE.MeshStandardMaterial({
          color:0xdedced,
          metalness:0.35,
          roughness:0.3
        })
      );

    body.scale.y = 1.25;
    body.position.y = 0.72;

    body.castShadow = true;


    /* HEAD */

    const head =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.35,
          16,
          12
        ),
        new THREE.MeshStandardMaterial({
          color:0xf2efff,
          metalness:0.25,
          roughness:0.25
        })
      );

    head.position.y = 1.35;

    head.castShadow = true;


    /* VISOR */

    const visor =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.22,
          16,
          10
        ),
        new THREE.MeshBasicMaterial({
          color:colors[data.state]
        })
      );

    visor.scale.set(
      1,
      0.5,
      0.3
    );

    visor.position.set(
      0,
      1.35,
      0.29
    );


    /* GLOW */

    const light =
      new THREE.PointLight(
        colors[data.state],
        3,
        2.5
      );

    light.position.set(
      0,
      1.2,
      0.25
    );


    robot.add(
      body,
      head,
      visor,
      light
    );


    /* ATTENTION BEACON */

    if(
      data.state === "working" ||
      data.state === "waiting"
    ){

      const beacon =
        new THREE.Mesh(
          new THREE.SphereGeometry(
            0.1,
            10,
            8
          ),
          new THREE.MeshBasicMaterial({
            color:colors[data.state]
          })
        );

      beacon.position.y = 1.85;

      robot.add(beacon);
    }


    robot.position.set(
      data.x,
      0,
      data.z
    );


    robot.userData = {
      ...data,
      baseX:data.x,
      baseZ:data.z,
      phase:Math.random()*Math.PI*2
    };


    scene.add(robot);

    residents.push(robot);
  });
}


/* ---------- TAP ---------- */

function selectObject(event){

  pointer.x =
    (event.clientX / window.innerWidth)*2-1;

  pointer.y =
    -(event.clientY / window.innerHeight)*2+1;

  raycaster.setFromCamera(
    pointer,
    camera
  );

  const hits =
    raycaster.intersectObjects(
      residents,
      true
    );

  if(!hits.length) return;

  let object = hits[0].object;

  while(
    object.parent &&
    !object.userData.name
  ){
    object = object.parent;
  }

  if(object.userData.name){

    const data =
      object.userData;

    document.getElementById(
      "sheetTitle"
    ).textContent = data.name;

    document.getElementById(
      "sheetState"
    ).textContent =
      data.state.toUpperCase();

    document.getElementById(
      "sheetText"
    ).textContent =
      getStateText(data.state);

    document.getElementById(
      "progressFill"
    ).style.width =
      data.progress + "%";

    document.getElementById(
      "sheet"
    ).classList.add("open");
  }
}


function getStateText(state){

  const descriptions = {

    working:
      "This conversation is actively working. Your resident is moving through the world.",

    waiting:
      "This conversation is waiting for your attention.",

    finished:
      "This conversation has completed its current task.",

    idle:
      "This conversation is available and resting.",

    dormant:
      "This conversation has been quiet for a while."
  };

  return descriptions[state];
}


/* ---------- CAMERA ---------- */

let targetX = 8;
let targetY = 8;
let targetZ = 10;

let lastTouchX = 0;
let lastTouchY = 0;


function touchStart(event){

  if(event.touches.length !== 1)
    return;

  lastTouchX =
    event.touches[0].clientX;

  lastTouchY =
    event.touches[0].clientY;
}


function touchMove(event){

  if(event.touches.length !== 1)
    return;

  const x =
    event.touches[0].clientX;

  const y =
    event.touches[0].clientY;

  const dx =
    x-lastTouchX;

  const dy =
    y-lastTouchY;

  targetX -= dx*0.025;
  targetZ += dy*0.025;

  lastTouchX = x;
  lastTouchY = y;
}


/* ---------- ANIMATION ---------- */

function animate(){

  requestAnimationFrame(
    animate
  );

  const time =
    performance.now()/1000;


  camera.position.x +=
    (targetX-camera.position.x)*0.05;

  camera.position.y +=
    (targetY-camera.position.y)*0.05;

  camera.position.z +=
    (targetZ-camera.position.z)*0.05;

  camera.lookAt(
    0,
    0,
    0
  );


  residents.forEach(
    (robot)=>{

      const data =
        robot.userData;


      if(data.state === "working"){

        robot.position.x =
          data.baseX +
          Math.sin(
            time*1.5 +
            data.phase
          )*0.5;

        robot.position.z =
          data.baseZ +
          Math.cos(
            time*1.2 +
            data.phase
          )*0.5;

        robot.rotation.y +=
          0.02;

      }else{

        robot.position.y =
          Math.sin(
            time*1.5 +
            data.phase
          )*0.04;
      }


      if(data.state === "waiting"){

        const beacon =
          robot.children[
            robot.children.length-1
          ];

        if(beacon){

          const pulse =
            1 +
            Math.sin(
              time*5+
              data.phase
            )*0.35;

          beacon.scale.setScalar(
            pulse
          );
        }
      }

    }
  );


  renderer.render(
    scene,
    camera
  );
}


/* ---------- RESIZE ---------- */

function resize(){

  if(!camera || !renderer)
    return;

  camera.aspect =
    window.innerWidth /
    window.innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );
}


/* ---------- CLOSE SHEET ---------- */

const closeButton =
  document.getElementById(
    "closeSheet"
  );

if(closeButton){

  closeButton.onclick = ()=>{

    document.getElementById(
      "sheet"
    ).classList.remove("open");
  };
}


/* ---------- LOAD THREE.JS ---------- */

startWorld();
