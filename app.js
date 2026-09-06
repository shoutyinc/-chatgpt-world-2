import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const world = document.getElementById("world");

const threads = [
  {name:"Creative Studio", state:"working", x:-3, z:-1, progress:72, icon:"✦", building:"studio"},
  {name:"Career Planning", state:"waiting", x:2.7, z:-1.7, progress:48, icon:"◈", building:"office"},
  {name:"Business School", state:"finished", x:-1.8, z:2.4, progress:100, icon:"◆", building:"school"},
  {name:"Idea Lab", state:"idle", x:2.8, z:2.5, progress:26, icon:"✧", building:"lab"},
  {name:"Project Hub", state:"dormant", x:0, z:0, progress:12, icon:"◇", building:"hub"}
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
const labels = [];

let targetX = 8;
let targetY = 8;
let targetZ = 10;

let lastX = 0;
let lastY = 0;


/* =========================
   START
========================= */

function startWorld(){

  scene = new THREE.Scene();

  scene.background = new THREE.Color(0x05030b);

  scene.fog = new THREE.FogExp2(
    0x080611,
    0.025
  );

  camera = new THREE.PerspectiveCamera(
    45,
    innerWidth / innerHeight,
    0.1,
    100
  );

  camera.position.set(
    targetX,
    targetY,
    targetZ
  );

  camera.lookAt(0,0,0);

  renderer = new THREE.WebGLRenderer({
    antialias:true,
    powerPreference:"high-performance"
  });

  renderer.setPixelRatio(
    Math.min(devicePixelRatio || 1, 2)
  );

  renderer.setSize(
    innerWidth,
    innerHeight
  );

  renderer.shadowMap.enabled = true;

  world.innerHTML = "";

  world.appendChild(
    renderer.domElement
  );

  raycaster = new THREE.Raycaster();

  pointer = new THREE.Vector2();

  createSky();
  createLighting();
  createWater();
  createIsland();
  createPaths();
  createBuildings();
  createTrees();
  createResidents();

  setupTouch();
  setupSheet();

  addEventListener(
    "resize",
    resize
  );

  animate();
}


/* =========================
   SKY
========================= */

function createSky(){

  const geometry =
    new THREE.BufferGeometry();

  const count = 800;

  const positions =
    new Float32Array(count * 3);

  for(let i=0;i<count;i++){

    positions[i*3] =
      (Math.random()-0.5)*70;

    positions[i*3+1] =
      Math.random()*30+5;

    positions[i*3+2] =
      (Math.random()-0.5)*70;
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
      size:0.055,
      transparent:true,
      opacity:0.8
    });

  scene.add(
    new THREE.Points(
      geometry,
      material
    )
  );
}


/* =========================
   LIGHTING
========================= */

function createLighting(){

  const ambient =
    new THREE.HemisphereLight(
      0xa99cff,
      0x08050f,
      2.2
    );

  scene.add(ambient);

  const moon =
    new THREE.DirectionalLight(
      0xd9d3ff,
      3
    );

  moon.position.set(
    -6,
    12,
    7
  );

  moon.castShadow = true;

  scene.add(moon);

  const glow =
    new THREE.PointLight(
      0x8b4dff,
      30,
      30
    );

  glow.position.set(
    0,
    4,
    0
  );

  scene.add(glow);
}


/* =========================
   WATER
========================= */

function createWater(){

  const water =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        13,
        13,
        0.25,
        64
      ),
      new THREE.MeshStandardMaterial({
        color:0x130d2b,
        roughness:0.2,
        metalness:0.4
      })
    );

  water.position.y = -1.35;

  scene.add(water);

  const glowRing =
    new THREE.Mesh(
      new THREE.TorusGeometry(
        10.5,
        0.055,
        10,
        128
      ),
      new THREE.MeshBasicMaterial({
        color:0x7545ff,
        transparent:true,
        opacity:0.7
      })
    );

  glowRing.rotation.x =
    Math.PI / 2;

  glowRing.position.y =
    -1.15;

  scene.add(glowRing);
}


/* =========================
   ISLAND
========================= */

function createIsland(){

  const base =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        7.2,
        5.7,
        1.5,
        64
      ),
      new THREE.MeshStandardMaterial({
        color:0x191329,
        roughness:0.9
      })
    );

  base.position.y = -0.65;

  base.receiveShadow = true;

  scene.add(base);


  const grass =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        6.9,
        5.4,
        0.45,
        64
      ),
      new THREE.MeshStandardMaterial({
        color:0x314b40,
        roughness:1
      })
    );

  grass.position.y = 0;

  grass.receiveShadow = true;

  scene.add(grass);


  const edge =
    new THREE.Mesh(
      new THREE.TorusGeometry(
        6.9,
        0.045,
        8,
        128
      ),
      new THREE.MeshBasicMaterial({
        color:0x9b5cff
      })
    );

  edge.rotation.x =
    Math.PI / 2;

  edge.position.y =
    0.24;

  scene.add(edge);
}


/* =========================
   PATHS
========================= */

function createPaths(){

  threads.forEach((data)=>{

    const length =
      Math.sqrt(
        data.x*data.x +
        data.z*data.z
      );

    const path =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.28,
          0.025,
          length
        ),
        new THREE.MeshStandardMaterial({
          color:0x6b6274,
          roughness:0.9
        })
      );

    path.position.set(
      data.x/2,
      0.24,
      data.z/2
    );

    path.rotation.y =
      Math.atan2(
        data.x,
        data.z
      );

    scene.add(path);
  });
}


/* =========================
   BUILDINGS
========================= */

function createBuildings(){

  threads.forEach((data)=>{

    const building =
      new THREE.Group();

    const glowColor =
      colors[data.state];


    /* FOUNDATION */

    const foundation =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          1.05,
          1.15,
          0.18,
          16
        ),
        new THREE.MeshStandardMaterial({
          color:0x292237
        })
      );

    foundation.position.y =
      0.3;

    building.add(foundation);


    /* MAIN BUILDING */

    const body =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          1.35,
          1.15,
          1.15
        ),
        new THREE.MeshStandardMaterial({
          color:0x40384e,
          roughness:0.55,
          metalness:0.15
        })
      );

    body.position.y =
      0.9;

    body.castShadow = true;

    building.add(body);


    /* ROOF */

    const roof =
      new THREE.Mesh(
        new THREE.ConeGeometry(
          1.05,
          0.65,
          4
        ),
        new THREE.MeshStandardMaterial({
          color:0x21192d,
          roughness:0.65
        })
      );

    roof.position.y =
      1.8;

    roof.rotation.y =
      Math.PI / 4;

    roof.castShadow = true;

    building.add(roof);


    /* WINDOWS */

    for(let side=-1;side<=1;side+=2){

      const windowMesh =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            0.28,
            0.3,
            0.035
          ),
          new THREE.MeshBasicMaterial({
            color:glowColor
          })
        );

      windowMesh.position.set(
        side * 0.4,
        1.0,
        0.59
      );

      building.add(
        windowMesh
      );
    }


    /* BUILDING GLOW */

    const buildingLight =
      new THREE.PointLight(
        glowColor,
        data.state === "dormant"
          ? 0.4
          : 2.5,
        3
      );

    buildingLight.position.y =
      1.1;

    building.add(
      buildingLight
    );


    building.position.set(
      data.x,
      0,
      data.z
    );


    building.userData = data;

    scene.add(building);

  });
}


/* =========================
   TREES
========================= */

function createTrees(){

  const locations = [

    [-5.4,-1.5],
    [-4.7,2.8],
    [-3.7,4.5],
    [-1.0,5.0],
    [1.5,4.9],
    [4.7,3.6],
    [5.5,0.8],
    [5.0,-3.0],
    [-4.8,-3.8],
    [-2.2,-4.8],
    [1.0,-4.8],
    [4.0,-4.4]
  ];

  locations.forEach(
    ([x,z],index)=>{

      const tree =
        new THREE.Group();


      const trunk =
        new THREE.Mesh(
          new THREE.CylinderGeometry(
            0.07,
            0.12,
            0.65,
            8
          ),
          new THREE.MeshStandardMaterial({
            color:0x50372f
          })
        );

      trunk.position.y =
        0.45;


      const crown =
        new THREE.Mesh(
          new THREE.SphereGeometry(
            0.48,
            12,
            10
          ),
          new THREE.MeshStandardMaterial({
            color:
              index % 2
                ? 0x416f5c
                : 0x355d50
          })
        );

      crown.position.y =
        0.92;

      crown.castShadow = true;

      tree.add(
        trunk,
        crown
      );

      tree.position.set(
        x,
        0,
        z
      );

      scene.add(tree);
    }
  );
}


/* =========================
   NAME LABEL
========================= */

function createLabel(data){

  const canvas =
    document.createElement("canvas");

  canvas.width = 512;
  canvas.height = 128;

  const ctx =
    canvas.getContext("2d");

  ctx.clearRect(
    0,
    0,
    512,
    128
  );

  ctx.fillStyle =
    "rgba(10,7,18,0.88)";

  roundRect(
    ctx,
    20,
    20,
    472,
    88,
    30
  );

  ctx.fill();

  ctx.font =
    "bold 32px -apple-system, sans-serif";

  ctx.textAlign =
    "center";

  ctx.textBaseline =
    "middle";

  ctx.fillStyle =
    "#ffffff";

  ctx.fillText(
    data.name,
    256,
    64
  );

  const texture =
    new THREE.CanvasTexture(
      canvas
    );

  const material =
    new THREE.SpriteMaterial({
      map:texture,
      transparent:true
    });

  const sprite =
    new THREE.Sprite(
      material
    );

  sprite.scale.set(
    2.2,
    0.55,
    1
  );

  sprite.position.set(
    data.x,
    2.7,
    data.z
  );

  scene.add(sprite);

  labels.push(sprite);
}


function roundRect(
  ctx,
  x,
  y,
  w,
  h,
  r
){

  ctx.beginPath();

  ctx.moveTo(x+r,y);

  ctx.arcTo(
    x+w,
    y,
    x+w,
    y+h,
    r
  );

  ctx.arcTo(
    x+w,
    y+h,
    x,
    y+h,
    r
  );

  ctx.arcTo(
    x,
    y+h,
    x,
    y,
    r
  );

  ctx.arcTo(
    x,
    y,
    x+w,
    y,
    r
  );

  ctx.closePath();
}


/* =========================
   RESIDENTS
========================= */

function createResidents(){

  threads.forEach((data)=>{

    const robot =
      new THREE.Group();


    const body =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.31,
          16,
          12
        ),
        new THREE.MeshStandardMaterial({
          color:0xe6e1ef,
          metalness:0.35,
          roughness:0.28
        })
      );

    body.scale.y =
      1.25;

    body.position.y =
      0.72;

    body.castShadow = true;


    const head =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.35,
          16,
          12
        ),
        new THREE.MeshStandardMaterial({
          color:0xf4f0ff,
          metalness:0.25,
          roughness:0.22
        })
      );

    head.position.y =
      1.35;

    head.castShadow = true;


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
      0.48,
      0.3
    );

    visor.position.set(
      0,
      1.35,
      0.29
    );


    const light =
      new THREE.PointLight(
        colors[data.state],
        3,
        2.5
      );

    light.position.set(
      0,
      1.1,
      0.25
    );


    robot.add(
      body,
      head,
      visor,
      light
    );


    if(
      data.state === "working" ||
      data.state === "waiting"
    ){

      const beacon =
        new THREE.Mesh(
          new THREE.SphereGeometry(
            0.1,
            12,
            10
          ),
          new THREE.MeshBasicMaterial({
            color:colors[data.state]
          })
        );

      beacon.position.y =
        1.85;

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

    createLabel(data);
  });
}


/* =========================
   TOUCH / TAP
========================= */

function setupTouch(){

  renderer.domElement.addEventListener(
    "pointerdown",
    (event)=>{

      pointer.x =
        event.clientX /
        innerWidth * 2 - 1;

      pointer.y =
        -(event.clientY /
        innerHeight) * 2 + 1;

      raycaster.setFromCamera(
        pointer,
        camera
      );

      const hits =
        raycaster.intersectObjects(
          residents,
          true
        );

      if(!hits.length)
        return;

      let object =
        hits[0].object;

      while(
        object.parent &&
        !object.userData.name
      ){

        object =
          object.parent;
      }

      if(object.userData.name){

        openSheet(
          object.userData
        );
      }
    }
  );


  renderer.domElement.addEventListener(
    "touchstart",
    event=>{

      if(
        event.touches.length !== 1
      )
        return;

      lastX =
        event.touches[0].clientX;

      lastY =
        event.touches[0].clientY;
    },
    {passive:true}
  );


  renderer.domElement.addEventListener(
    "touchmove",
    event=>{

      if(
        event.touches.length !== 1
      )
        return;

      const x =
        event.touches[0].clientX;

      const y =
        event.touches[0].clientY;

      const dx =
        x-lastX;

      const dy =
        y-lastY;

      targetX -=
        dx * 0.018;

      targetZ +=
        dy * 0.018;

      targetX =
        Math.max(
          -13,
          Math.min(13,targetX)
        );

      targetZ =
        Math.max(
          -13,
          Math.min(13,targetZ)
        );

      lastX = x;
      lastY = y;
    },
    {passive:true}
  );
}


/* =========================
   SHEET
========================= */

function openSheet(data){

  document.getElementById(
    "sheetTitle"
  ).textContent =
    data.name;

  document.getElementById(
    "sheetState"
  ).textContent =
    data.state.toUpperCase();

  document.getElementById(
    "sheetText"
  ).textContent =
    stateText(data.state);

  document.getElementById(
    "progressFill"
  ).style.width =
    data.progress + "%";

  document.getElementById(
    "sheet"
  ).classList.add("open");
}


function stateText(state){

  const text = {

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

  return text[state];
}


function setupSheet(){

  const close =
    document.getElementById(
      "closeSheet"
    );

  if(close){

    close.onclick = ()=>{

      document.getElementById(
        "sheet"
      ).classList.remove("open");
    };
  }
}


/* =========================
   ANIMATION
========================= */

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
    robot=>{

      const data =
        robot.userData;


      if(
        data.state === "working"
      ){

        robot.position.x =
          data.baseX +
          Math.sin(
            time*1.4 +
            data.phase
          ) * 0.55;

        robot.position.z =
          data.baseZ +
          Math.cos(
            time*1.2 +
            data.phase
          ) * 0.55;

        robot.rotation.y +=
          0.018;

      }else{

        robot.position.y =
          Math.sin(
            time*1.5 +
            data.phase
          ) * 0.04;
      }


      if(
        data.state === "waiting"
      ){

        const beacon =
          robot.children[
            robot.children.length-1
          ];

        if(beacon){

          const pulse =
            1 +
            Math.sin(
              time*5 +
              data.phase
            ) * 0.4;

          beacon.scale.setScalar(
            pulse
          );
        }
      }


      if(
        data.state === "finished"
      ){

        robot.rotation.z =
          Math.sin(
            time*0.7 +
            data.phase
          ) * 0.08;
      }

    }
  );


  labels.forEach(
    label=>{

      label.material.opacity =
        0.85 +
        Math.sin(time*1.5) * 0.1;
    }
  );


  renderer.render(
    scene,
    camera
  );
}


/* =========================
   RESIZE
========================= */

function resize(){

  camera.aspect =
    innerWidth / innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(
    innerWidth,
    innerHeight
  );
}


/* =========================
   START ENGINE
========================= */

startWorld();
