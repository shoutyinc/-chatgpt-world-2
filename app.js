import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const world = document.getElementById("world");

const threads = [
  {
    name:"Creative Studio",
    state:"working",
    x:-3.2,z:-1.8,
    progress:72,
    type:"studio"
  },
  {
    name:"Career Planning",
    state:"waiting",
    x:3.0,z:-1.8,
    progress:48,
    type:"office"
  },
  {
    name:"Business School",
    state:"finished",
    x:-2.5,z:2.5,
    progress:100,
    type:"school"
  },
  {
    name:"Idea Lab",
    state:"idle",
    x:2.5,z:2.6,
    progress:26,
    type:"lab"
  },
  {
    name:"Project Hub",
    state:"dormant",
    x:0,z:0,
    progress:12,
    type:"hub"
  }
];

const colors = {
  working:0x9b5cff,
  waiting:0xffb84d,
  finished:0x5fffc4,
  idle:0x62dfff,
  dormant:0x777080
};

let scene;
let camera;
let renderer;
let raycaster;
let pointer;

const residents=[];
const labels=[];
const effects=[];

let radius=13;
let theta=.65;
let phi=.92;

let lastX=0;
let lastY=0;
let moved=false;
let pinchDistance=0;


/* =========================
   START
========================= */

function startWorld(){

  scene=new THREE.Scene();

  scene.background=
    new THREE.Color(0x05030b);

  scene.fog=
    new THREE.FogExp2(
      0x080611,
      .018
    );

  camera=
    new THREE.PerspectiveCamera(
      42,
      innerWidth/innerHeight,
      .1,
      100
    );

  renderer=
    new THREE.WebGLRenderer({
      antialias:true,
      powerPreference:"high-performance"
    });

  renderer.setPixelRatio(
    Math.min(devicePixelRatio||1,2)
  );

  renderer.setSize(
    innerWidth,
    innerHeight
  );

  renderer.shadowMap.enabled=true;

  world.innerHTML="";
  world.appendChild(
    renderer.domElement
  );

  raycaster=new THREE.Raycaster();
  pointer=new THREE.Vector2();

  createLighting();
  createStars();
  createWater();
  createIsland();
  createCentralPlaza();
  createPaths();
  createStreetLights();
  createBuildings();
  createTrees();
  createResidents();

  setupControls();
  setupSheet();

  addEventListener(
    "resize",
    resize
  );

  animate();
}


/* =========================
   LIGHTING
========================= */

function createLighting(){

  scene.add(
    new THREE.HemisphereLight(
      0xb9adff,
      0x08050f,
      2.3
    )
  );

  const moon=
    new THREE.DirectionalLight(
      0xe8e2ff,
      3.2
    );

  moon.position.set(
    -8,14,8
  );

  moon.castShadow=true;

  scene.add(moon);

  const glow=
    new THREE.PointLight(
      0x8b4dff,
      35,
      30
    );

  glow.position.set(
    0,4,0
  );

  scene.add(glow);
}


/* =========================
   STARS
========================= */

function createStars(){

  const geo=
    new THREE.BufferGeometry();

  const positions=
    new Float32Array(
      1000*3
    );

  for(let i=0;i<1000;i++){

    positions[i*3]=
      (Math.random()-.5)*70;

    positions[i*3+1]=
      Math.random()*35+4;

    positions[i*3+2]=
      (Math.random()-.5)*70;
  }

  geo.setAttribute(
    "position",
    new THREE.BufferAttribute(
      positions,3
    )
  );

  scene.add(
    new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        color:0xffffff,
        size:.055,
        transparent:true,
        opacity:.85
      })
    )
  );
}


/* =========================
   WATER
========================= */

function createWater(){

  const water=
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        14,14,.3,64
      ),
      new THREE.MeshStandardMaterial({
        color:0x100b25,
        roughness:.12,
        metalness:.6
      })
    );

  water.position.y=-1.45;

  scene.add(water);

  const ring=
    new THREE.Mesh(
      new THREE.TorusGeometry(
        11,.055,10,128
      ),
      new THREE.MeshBasicMaterial({
        color:0x824cff,
        transparent:true,
        opacity:.8
      })
    );

  ring.rotation.x=Math.PI/2;
  ring.position.y=-1.25;

  scene.add(ring);
}


/* =========================
   ISLAND
========================= */

function createIsland(){

  const base=
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        7.5,6,1.6,64
      ),
      new THREE.MeshStandardMaterial({
        color:0x171226,
        roughness:.92
      })
    );

  base.position.y=-.65;
  base.receiveShadow=true;

  scene.add(base);

  const grass=
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        7.15,5.7,.48,64
      ),
      new THREE.MeshStandardMaterial({
        color:0x314d40,
        roughness:1
      })
    );

  grass.receiveShadow=true;

  scene.add(grass);

  const edge=
    new THREE.Mesh(
      new THREE.TorusGeometry(
        7.15,.05,8,128
      ),
      new THREE.MeshBasicMaterial({
        color:0xb15cff
      })
    );

  edge.rotation.x=Math.PI/2;
  edge.position.y=.26;

  scene.add(edge);
}


/* =========================
   CENTRAL PLAZA
========================= */

function createCentralPlaza(){

  const plaza=
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        1.45,1.45,.08,32
      ),
      new THREE.MeshStandardMaterial({
        color:0x453b50,
        roughness:.7
      })
    );

  plaza.position.y=.27;

  scene.add(plaza);

  const core=
    new THREE.Mesh(
      new THREE.SphereGeometry(
        .25,16,12
      ),
      new THREE.MeshBasicMaterial({
        color:0x9b5cff
      })
    );

  core.position.y=.65;

  scene.add(core);

  const light=
    new THREE.PointLight(
      0x9b5cff,
      5,
      5
    );

  light.position.y=.7;

  scene.add(light);
}


/* =========================
   PATHS
========================= */

function createPaths(){

  threads.forEach(data=>{

    const length=
      Math.sqrt(
        data.x*data.x+
        data.z*data.z
      );

    const path=
      new THREE.Mesh(
        new THREE.BoxGeometry(
          .32,.035,length
        ),
        new THREE.MeshStandardMaterial({
          color:0x665c70,
          roughness:.9
        })
      );

    path.position.set(
      data.x/2,
      .25,
      data.z/2
    );

    path.rotation.y=
      Math.atan2(
        data.x,
        data.z
      );

    scene.add(path);
  });
}


/* =========================
   STREET LIGHTS
========================= */

function createStreetLights(){

  threads.forEach(data=>{

    const steps=3;

    for(let i=1;i<=steps;i++){

      const amount=i/(steps+1);

      const x=data.x*amount;
      const z=data.z*amount;

      const pole=
        new THREE.Mesh(
          new THREE.CylinderGeometry(
            .025,.035,.55,8
          ),
          new THREE.MeshStandardMaterial({
            color:0x292332,
            metalness:.5
          })
        );

      pole.position.set(
        x+.22,
        .52,
        z-.22
      );

      scene.add(pole);

      const lamp=
        new THREE.Mesh(
          new THREE.SphereGeometry(
            .065,10,8
          ),
          new THREE.MeshBasicMaterial({
            color:0x8f7cff
          })
        );

      lamp.position.set(
        x+.22,
        .82,
        z-.22
      );

      scene.add(lamp);

      const light=
        new THREE.PointLight(
          0x7c65ff,
          .7,
          1.6
        );

      light.position.copy(
        lamp.position
      );

      scene.add(light);
    }
  });
}


/* =========================
   BUILDINGS
========================= */

function createBuildings(){

  threads.forEach(data=>{

    const group=
      new THREE.Group();

    const glow=colors[data.state];


    /* FOUNDATION */

    const foundation=
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          1.05,1.18,.2,20
        ),
        new THREE.MeshStandardMaterial({
          color:0x282034,
          roughness:.8
        })
      );

    foundation.position.y=.28;

    group.add(foundation);


    let width=1.3;
    let height=1.15;
    let depth=1.15;


    /* DIFFERENT ARCHITECTURE */

    if(data.type==="hub"){
      width=1.75;
      height=1.5;
      depth=1.75;
    }

    if(data.type==="lab"){
      width=1.4;
      height=1.35;
      depth=1.4;
    }

    if(data.type==="school"){
      width=1.55;
      height=1.25;
      depth=1.4;
    }


    const body=
      new THREE.Mesh(
        new THREE.BoxGeometry(
          width,
          height,
          depth
        ),
        new THREE.MeshStandardMaterial({
          color:
            data.type==="hub"
              ?0x514362
              :0x40384e,
          roughness:.45,
          metalness:.2
        })
      );

    body.position.y=.9;
    body.castShadow=true;

    group.add(body);


    /* ROOF */

    let roof;

    if(data.type==="lab"){

      roof=
        new THREE.Mesh(
          new THREE.ConeGeometry(
            1.15,.5,8
          ),
          new THREE.MeshStandardMaterial({
            color:0x241a35,
            roughness:.5
          })
        );

    }else if(data.type==="school"){

      roof=
        new THREE.Mesh(
          new THREE.BoxGeometry(
            1.75,.22,1.6
          ),
          new THREE.MeshStandardMaterial({
            color:0x21182f,
            roughness:.55
          })
        );

      roof.rotation.z=.04;

    }else if(data.type==="hub"){

      roof=
        new THREE.Mesh(
          new THREE.CylinderGeometry(
            .95,.95,.35,8
          ),
          new THREE.MeshStandardMaterial({
            color:0x241a35,
            roughness:.5
          })
        );

    }else{

      roof=
        new THREE.Mesh(
          new THREE.ConeGeometry(
            1.05,.7,4
          ),
          new THREE.MeshStandardMaterial({
            color:0x21182f,
            roughness:.6
          })
        );

      roof.rotation.y=Math.PI/4;
    }

    roof.position.y=
      data.type==="hub"
        ?1.85
        :1.8;

    group.add(roof);


    /* WINDOWS */

    const windowPositions=[
      [-.4,1,.59],
      [.4,1,.59]
    ];

    windowPositions.forEach(
      ([x,y,z])=>{

        const win=
          new THREE.Mesh(
            new THREE.BoxGeometry(
              .27,.32,.04
            ),
            new THREE.MeshBasicMaterial({
              color:glow
            })
          );

        win.position.set(
          x,y,z
        );

        group.add(win);
      }
    );


    /* DOOR */

    const door=
      new THREE.Mesh(
        new THREE.BoxGeometry(
          .25,.48,.04
        ),
        new THREE.MeshBasicMaterial({
          color:0x120d19
        })
      );

    door.position.set(
      0,.58,.59
    );

    group.add(door);


    /* BUILDING SIGN */

    const sign=
      new THREE.Mesh(
        new THREE.BoxGeometry(
          .7,.16,.04
        ),
        new THREE.MeshBasicMaterial({
          color:glow
        })
      );

    sign.position.set(
      0,1.35,.62
    );

    group.add(sign);


    /* BUILDING LIGHT */

    const buildingLight=
      new THREE.PointLight(
        glow,
        data.state==="dormant"
          ?0.25
          :2.3,
        3
      );

    buildingLight.position.y=1.15;

    group.add(
      buildingLight
    );


    group.position.set(
      data.x,
      0,
      data.z
    );

    scene.add(group);
  });
}


/* =========================
   TREES
========================= */

function createTrees(){

  const locations=[
    [-5.6,-3.4],
    [-5.7,1],
    [-4.8,4.1],
    [-1.2,5.2],
    [2,5],
    [5.2,3.5],
    [5.6,.5],
    [5,-3.7],
    [2,-5],
    [-2.2,-5]
  ];

  locations.forEach(([x,z])=>{

    const tree=
      new THREE.Group();

    const trunk=
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          .07,.12,.65,8
        ),
        new THREE.MeshStandardMaterial({
          color:0x50352c
        })
      );

    trunk.position.y=.43;

    const crown=
      new THREE.Mesh(
        new THREE.SphereGeometry(
          .48,12,10
        ),
        new THREE.MeshStandardMaterial({
          color:0x416b57,
          roughness:1
        })
      );

    crown.position.y=.9;
    crown.castShadow=true;

    tree.add(
      trunk,
      crown
    );

    tree.position.set(
      x,0,z
    );

    scene.add(tree);
  });
}


/* =========================
   RESIDENTS
========================= */

function createResidents(){

  threads.forEach(data=>{

    const robot=
      new THREE.Group();

    /*
      Resident stands beside
      its own building.
    */

    robot.position.set(
      data.x+.95,
      0,
      data.z+.7
    );

    const body=
      new THREE.Mesh(
        new THREE.SphereGeometry(
          .3,16,12
        ),
        new THREE.MeshStandardMaterial({
          color:0xe7e2f0,
          metalness:.38,
          roughness:.27
        })
      );

    body.scale.y=1.2;
    body.position.y=.7;
    body.castShadow=true;


    const head=
      new THREE.Mesh(
        new THREE.SphereGeometry(
          .34,16,12
        ),
        new THREE.MeshStandardMaterial({
          color:0xf5f0ff,
          metalness:.25,
          roughness:.22
        })
      );

    head.position.y=1.3;
    head.castShadow=true;


    const visor=
      new THREE.Mesh(
        new THREE.SphereGeometry(
          .22,16,10
        ),
        new THREE.MeshBasicMaterial({
          color:colors[data.state]
        })
      );

    visor.scale.set(
      1,.48,.3
    );

    visor.position.set(
      0,1.3,.29
    );


    const light=
      new THREE.PointLight(
        colors[data.state],
        3,
        2.5
      );

    light.position.set(
      0,1.1,.2
    );

    robot.add(
      body,
      head,
      visor,
      light
    );


    /* STATE BEACON */

    if(
      data.state==="working"||
      data.state==="waiting"
    ){

      const beacon=
        new THREE.Mesh(
          new THREE.SphereGeometry(
            .1,12,10
          ),
          new THREE.MeshBasicMaterial({
            color:colors[data.state]
          })
        );

      beacon.position.y=1.82;

      robot.add(beacon);
    }


    robot.userData={
      ...data,
      baseX:robot.position.x,
      baseZ:robot.position.z,
      phase:Math.random()*Math.PI*2
    };

    scene.add(robot);

    residents.push(robot);

    createLabel(data);
  });
}


/* =========================
   LABELS
========================= */

function createLabel(data){

  const canvas=
    document.createElement("canvas");

  canvas.width=512;
  canvas.height=110;

  const ctx=
    canvas.getContext("2d");

  ctx.fillStyle=
    "rgba(12,8,22,.9)";

  roundRect(
    ctx,
    15,15,
    482,80,
    28
  );

  ctx.fill();

  ctx.font=
    "bold 30px sans-serif";

  ctx.textAlign="center";
  ctx.textBaseline="middle";
  ctx.fillStyle="#ffffff";

  ctx.fillText(
    data.name,
    256,55
  );

  const texture=
    new THREE.CanvasTexture(
      canvas
    );

  const sprite=
    new THREE.Sprite(
      new THREE.SpriteMaterial({
        map:texture,
        transparent:true
      })
    );

  sprite.scale.set(
    2.15,.46,1
  );

  sprite.position.set(
    data.x,
    2.75,
    data.z
  );

  scene.add(sprite);

  labels.push(sprite);
}


function roundRect(
  ctx,x,y,w,h,r
){

  ctx.beginPath();

  ctx.moveTo(x+r,y);

  ctx.arcTo(
    x+w,y,
    x+w,y+h,r
  );

  ctx.arcTo(
    x+w,y+h,
    x,y+h,r
  );

  ctx.arcTo(
    x,y+h,
    x,y,r
  );

  ctx.arcTo(
    x,y,
    x+w,y,r
  );

  ctx.closePath();
}


/* =========================
   CONTROLS
========================= */

function setupControls(){

  renderer.domElement.addEventListener(
    "pointerdown",
    event=>{

      pointer.x=
        event.clientX/
        innerWidth*2-1;

      pointer.y=
        -(event.clientY/
        innerHeight)*2+1;

      raycaster.setFromCamera(
        pointer,
        camera
      );

      const hits=
        raycaster.intersectObjects(
          residents,true
        );

      if(!hits.length)
        return;

      let obj=hits[0].object;

      while(
        obj.parent &&
        !obj.userData.name
      ){
        obj=obj.parent;
      }

      if(obj.userData.name){
        openSheet(
          obj.userData
        );
      }
    }
  );


  renderer.domElement.addEventListener(
    "touchstart",
    event=>{

      moved=false;

      if(event.touches.length===1){

        lastX=
          event.touches[0].clientX;

        lastY=
          event.touches[0].clientY;
      }

      if(event.touches.length===2){

        pinchDistance=
          distance(
            event.touches[0],
            event.touches[1]
          );
      }

    },
    {passive:true}
  );


  renderer.domElement.addEventListener(
    "touchmove",
    event=>{

      if(event.touches.length===1){

        const x=
          event.touches[0].clientX;

        const y=
          event.touches[0].clientY;

        const dx=x-lastX;
        const dy=y-lastY;

        if(
          Math.abs(dx)>3||
          Math.abs(dy)>3
        ){
          moved=true;
        }

        theta-=dx*.008;
        phi+=dy*.006;

        phi=
          Math.max(
            .55,
            Math.min(1.25,phi)
          );

        lastX=x;
        lastY=y;
      }


      if(event.touches.length===2){

        const current=
          distance(
            event.touches[0],
            event.touches[1]
          );

        const delta=
          current-pinchDistance;

        radius-=delta*.018;

        radius=
          Math.max(
            8,
            Math.min(18,radius)
          );

        pinchDistance=current;
        moved=true;
      }

    },
    {passive:true}
  );
}


function distance(a,b){

  const dx=
    a.clientX-b.clientX;

  const dy=
    a.clientY-b.clientY;

  return Math.sqrt(
    dx*dx+dy*dy
  );
}


/* =========================
   CAMERA
========================= */

function updateCamera(){

  camera.position.x=
    radius*
    Math.sin(phi)*
    Math.sin(theta);

  camera.position.y=
    radius*
    Math.cos(phi);

  camera.position.z=
    radius*
    Math.sin(phi)*
    Math.cos(theta);

  camera.lookAt(
    0,.35,0
  );
}


/* =========================
   SHEET
========================= */

function openSheet(data){

  document.getElementById(
    "sheetTitle"
  ).textContent=data.name;

  document.getElementById(
    "sheetState"
  ).textContent=
    data.state.toUpperCase();

  document.getElementById(
    "sheetText"
  ).textContent=
    stateText(data.state);

  document.getElementById(
    "progressFill"
  ).style.width=
    data.progress+"%";

  document.getElementById(
    "sheet"
  ).classList.add("open");
}


function stateText(state){

  return {

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

  }[state];
}


function setupSheet(){

  const close=
    document.getElementById(
      "closeSheet"
    );

  if(close){

    close.onclick=()=>{

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

  const time=
    performance.now()/1000;

  updateCamera();


  residents.forEach(robot=>{

    const data=
      robot.userData;


    if(data.state==="working"){

      robot.position.x=
        data.baseX+
        Math.sin(
          time*1.3+
          data.phase
        )*.5;

      robot.position.z=
        data.baseZ+
        Math.cos(
          time*1.1+
          data.phase
        )*.4;

      robot.rotation.y+=.018;

    }else{

      robot.position.y=
        Math.sin(
          time*1.5+
          data.phase
        )*.04;
    }


    if(data.state==="waiting"){

      const beacon=
        robot.children[
          robot.children.length-1
        ];

      if(beacon){

        beacon.scale.setScalar(
          1+
          Math.sin(
            time*5+
            data.phase
          )*.4
        );
      }
    }


    if(data.state==="finished"){

      robot.rotation.z=
        Math.sin(
          time*.8+
          data.phase
        )*.08;
    }

  });


  labels.forEach(label=>{

    label.material.opacity=
      .82+
      Math.sin(time*1.4)*.08;
  });


  renderer.render(
    scene,
    camera
  );
}


/* =========================
   RESIZE
========================= */

function resize(){

  camera.aspect=
    innerWidth/innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(
    innerWidth,
    innerHeight
  );
}


/* =========================
   LAUNCH
========================= */

startWorld();
