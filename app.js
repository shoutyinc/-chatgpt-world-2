const world = document.getElementById("world");

const threads = [
  {
    name: "Creative Studio",
    state: "working",
    x: -4.2,
    z: -2.4,
    progress: 72,
    type: "studio",
    description: "An active creative conversation with work currently in progress."
  },
  {
    name: "Career Planning",
    state: "waiting",
    x: 4.0,
    z: -2.5,
    progress: 48,
    type: "office",
    description: "This conversation is waiting for your next decision or response."
  },
  {
    name: "Business School",
    state: "finished",
    x: -3.5,
    z: 3.2,
    progress: 100,
    type: "school",
    description: "A completed conversation with a successful outcome."
  },
  {
    name: "Idea Lab",
    state: "idle",
    x: 3.4,
    z: 3.0,
    progress: 26,
    type: "lab",
    description: "An idea that is still developing and has not been recently active."
  },
  {
    name: "Project Hub",
    state: "dormant",
    x: 0,
    z: 0,
    progress: 12,
    type: "hub",
    description: "A quiet conversation that has not been touched recently."
  }
];

const stateColors = {
  working: 0xa45cff,
  waiting: 0xffb84d,
  finished: 0x5fffc4,
  idle: 0x62dfff,
  dormant: 0x777080
};

let scene;
let camera;
let renderer;
let raycaster;
let pointer;

let residents = [];
let labels = [];

let cameraRadius = 22;
let cameraTheta = 0.7;
let cameraPhi = 0.95;

let dragging = false;
let moved = false;
let startX = 0;
let startY = 0;
let lastX = 0;
let lastY = 0;

function startWorld() {

  if (typeof THREE === "undefined") {
    world.innerHTML = `
      <div style="
        position:absolute;
        inset:0;
        display:grid;
        place-items:center;
        padding:30px;
        text-align:center;
        color:#fff;
        font-family:-apple-system,BlinkMacSystemFont,sans-serif;
      ">
        <div>
          <div style="font-size:40px;margin-bottom:12px">⚠️</div>
          <strong>3D engine failed to load.</strong>
          <div style="color:#aaa;margin-top:8px;font-size:13px">
            Please check the Three.js script in index.html.
          </div>
        </div>
      </div>
    `;
    return;
  }

  try {

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05030b);
    scene.fog = new THREE.FogExp2(0x080611, 0.018);

    camera = new THREE.PerspectiveCamera(
      42,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );

    camera.position.set(15, 13, 15);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance"
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 2)
    );

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    if ("outputColorSpace" in renderer) {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    }

    renderer.setClearColor(0x05030b);

    world.innerHTML = "";
    world.appendChild(renderer.domElement);

    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();

    createLighting();
    createStars();
    createWater();
    createIsland();
    createPaths();
    createPlaza();
    createBuildings();
    createTrees();
    createResidents();

    setupControls();
    setupSheet();

    window.addEventListener("resize", resize);

    updateCamera();
    animate();

  } catch (error) {

    console.error("ChatGPT World error:", error);

    world.innerHTML = `
      <div style="
        position:absolute;
        inset:0;
        display:grid;
        place-items:center;
        padding:30px;
        text-align:center;
        color:#fff;
        font-family:-apple-system,BlinkMacSystemFont,sans-serif;
      ">
        <div>
          <div style="font-size:40px;margin-bottom:12px">⚠️</div>
          <strong>The world could not start.</strong>
          <div style="color:#aaa;margin-top:8px;font-size:13px">
            Check the browser console for details.
          </div>
        </div>
      </div>
    `;
  }
}


/* ---------- LIGHTING ---------- */

function createLighting() {

  const hemi = new THREE.HemisphereLight(
    0xb7a8ff,
    0x08050e,
    2.4
  );

  scene.add(hemi);

  const moon = new THREE.DirectionalLight(
    0xffffff,
    2.2
  );

  moon.position.set(8, 18, 6);
  scene.add(moon);

  const purple = new THREE.PointLight(
    0x8c4dff,
    35,
    30
  );

  purple.position.set(0, 4, 0);
  scene.add(purple);

  const cyan = new THREE.PointLight(
    0x32dfff,
    18,
    24
  );

  cyan.position.set(-8, 3, 6);
  scene.add(cyan);
}


/* ---------- STARS ---------- */

function createStars() {

  const geometry = new THREE.BufferGeometry();
  const positions = [];

  for (let i = 0; i < 700; i++) {

    const x = (Math.random() - 0.5) * 80;
    const y = Math.random() * 45 + 8;
    const z = (Math.random() - 0.5) * 80;

    positions.push(x, y, z);
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.08,
    transparent: true,
    opacity: 0.85
  });

  scene.add(
    new THREE.Points(geometry, material)
  );
}


/* ---------- WATER ---------- */

function createWater() {

  const geometry = new THREE.CylinderGeometry(
    19,
    21,
    0.7,
    64
  );

  const material = new THREE.MeshStandardMaterial({
    color: 0x080b20,
    metalness: 0.35,
    roughness: 0.25
  });

  const water = new THREE.Mesh(
    geometry,
    material
  );

  water.position.y = -1.2;

  scene.add(water);

  const ringGeometry = new THREE.TorusGeometry(
    17.8,
    0.18,
    12,
    96
  );

  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0x8e4cff,
    transparent: true,
    opacity: 0.7
  });

  const ring = new THREE.Mesh(
    ringGeometry,
    ringMaterial
  );

  ring.rotation.x = Math.PI / 2;
  ring.position.y = -0.78;

  scene.add(ring);
}


/* ---------- ISLAND ---------- */

function createIsland() {

  const geometry = new THREE.CylinderGeometry(
    14,
    12,
    2.0,
    64
  );

  const material = new THREE.MeshStandardMaterial({
    color: 0x171b2a,
    roughness: 0.9
  });

  const island = new THREE.Mesh(
    geometry,
    material
  );

  island.position.y = -0.2;

  scene.add(island);

  const topGeometry = new THREE.CylinderGeometry(
    13.7,
    13.7,
    0.35,
    64
  );

  const topMaterial = new THREE.MeshStandardMaterial({
    color: 0x243326,
    roughness: 1
  });

  const top = new THREE.Mesh(
    topGeometry,
    topMaterial
  );

  top.position.y = 0.82;

  scene.add(top);
}


/* ---------- PATHS ---------- */

function createPaths() {

  const material = new THREE.MeshStandardMaterial({
    color: 0x65546b,
    roughness: 1
  });

  const paths = [
    [0, 0, 0, 1.0],
    [-4.2, -2.4, 0, 0.7],
    [4.0, -2.5, 0, 0.7],
    [-3.5, 3.2, 0, 0.7],
    [3.4, 3.0, 0, 0.7]
  ];

  paths.forEach(p => {

    const geometry = new THREE.CylinderGeometry(
      p[3],
      p[3],
      0.08,
      24
    );

    const path = new THREE.Mesh(
      geometry,
      material
    );

    path.rotation.x = Math.PI / 2;
    path.position.set(p[0], 1.0, p[1]);

    scene.add(path);
  });
}


/* ---------- PLAZA ---------- */

function createPlaza() {

  const geometry = new THREE.CylinderGeometry(
    3.0,
    3.0,
    0.25,
    48
  );

  const material = new THREE.MeshStandardMaterial({
    color: 0x30253c,
    roughness: 0.6,
    metalness: 0.2
  });

  const plaza = new THREE.Mesh(
    geometry,
    material
  );

  plaza.position.y = 1.12;

  scene.add(plaza);

  const inner = new THREE.PointLight(
    0xa85cff,
    18,
    10
  );

  inner.position.set(0, 2.4, 0);

  scene.add(inner);
}


/* ---------- BUILDINGS ---------- */

function createBuildings() {

  threads.forEach((thread, index) => {

    const group = new THREE.Group();

    const buildingHeight =
      thread.type === "hub" ? 2.6 :
      thread.type === "school" ? 2.5 :
      thread.type === "studio" ? 2.2 :
      2.0;

    const width =
      thread.type === "hub" ? 2.5 :
      2.0;

    const baseGeometry =
      new THREE.BoxGeometry(
        width,
        buildingHeight,
        width
      );

    const baseMaterial =
      new THREE.MeshStandardMaterial({
        color:
          thread.type === "school"
            ? 0x403050
            : 0x29243a,
        roughness: 0.7
      });

    const base = new THREE.Mesh(
      baseGeometry,
      baseMaterial
    );

    base.position.y =
      1.15 + buildingHeight / 2;

    group.add(base);

    const roofGeometry =
      new THREE.ConeGeometry(
        width * 0.82,
        1.0,
        4
      );

    const roofMaterial =
      new THREE.MeshStandardMaterial({
        color: stateColors[thread.state],
        roughness: 0.55,
        metalness: 0.15
      });

    const roof = new THREE.Mesh(
      roofGeometry,
      roofMaterial
    );

    roof.position.y =
      1.15 + buildingHeight + 0.5;

    roof.rotation.y = Math.PI / 4;

    group.add(roof);

    addWindows(
      group,
      width,
      buildingHeight,
      stateColors[thread.state]
    );

    group.position.set(
      thread.x,
      0,
      thread.z
    );

    group.userData.threadIndex = index;

    scene.add(group);

    addLabel(
      thread.name,
      thread.x,
      thread.z,
      stateColors[thread.state]
    );
  });
}


function addWindows(
  group,
  width,
  height,
  color
) {

  const material = new THREE.MeshBasicMaterial({
    color: color
  });

  const windowGeometry =
    new THREE.BoxGeometry(
      0.32,
      0.38,
      0.05
    );

  const positions = [
    [-0.55, 1.45, width / 2 + 0.03],
    [0.55, 1.45, width / 2 + 0.03],
    [-0.55, 2.05, width / 2 + 0.03],
    [0.55, 2.05, width / 2 + 0.03]
  ];

  positions.forEach(pos => {

    const win = new THREE.Mesh(
      windowGeometry,
      material
    );

    win.position.set(
      pos[0],
      pos[1],
      pos[2]
    );

    group.add(win);
  });
}


/* ---------- TREES ---------- */

function createTrees() {

  const locations = [
    [-8, -6],
    [-7, 5],
    [7, 6],
    [8, -5],
    [-1, 7],
    [6, 1],
    [-6, 1]
  ];

  locations.forEach(([x, z]) => {

    const tree = new THREE.Group();

    const trunkGeometry =
      new THREE.CylinderGeometry(
        0.12,
        0.16,
        1.2,
        8
      );

    const trunkMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x513927
      });

    const trunk = new THREE.Mesh(
      trunkGeometry,
      trunkMaterial
    );

    trunk.position.y = 1.5;

    tree.add(trunk);

    const crownGeometry =
      new THREE.SphereGeometry(
        0.75,
        12,
        10
      );

    const crownMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x28513d,
        roughness: 1
      });

    const crown = new THREE.Mesh(
      crownGeometry,
      crownMaterial
    );

    crown.position.y = 2.35;

    tree.add(crown);

    tree.position.set(x, 0, z);

    scene.add(tree);
  });
}


/* ---------- ROBOTS ---------- */

function createResidents() {

  threads.forEach((thread, index) => {

    const robot = new THREE.Group();

    const bodyMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xd9d7e5,
        metalness: 0.55,
        roughness: 0.32
      });

    const darkMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x181522,
        metalness: 0.5,
        roughness: 0.3
      });

    const stateMaterial =
      new THREE.MeshBasicMaterial({
        color: stateColors[thread.state]
      });

    const body = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 20, 16),
      bodyMaterial
    );

    body.scale.y = 1.15;
    body.position.y = 2.0;

    robot.add(body);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.48, 20, 16),
      bodyMaterial
    );

    head.position.y = 2.9;

    robot.add(head);

    const eyeGeometry =
      new THREE.SphereGeometry(
        0.07,
        10,
        10
      );

    [-0.16, 0.16].forEach(x => {

      const eye = new THREE.Mesh(
        eyeGeometry,
        stateMaterial
      );

      eye.position.set(
        x,
        2.96,
        0.43
      );

      robot.add(eye);
    });

    const antennaGeometry =
      new THREE.CylinderGeometry(
        0.035,
        0.035,
        0.35,
        8
      );

    const antenna = new THREE.Mesh(
      antennaGeometry,
      darkMaterial
    );

    antenna.position.y = 3.55;

    robot.add(antenna);

    const light = new THREE.Mesh(
      new THREE.SphereGeometry(
        0.09,
        12,
        12
      ),
      stateMaterial
    );

    light.position.y = 3.75;

    robot.add(light);

    robot.position.set(
      thread.x + 0.9,
      0,
      thread.z + 0.8
    );

    robot.userData.threadIndex = index;

    scene.add(robot);
    residents.push(robot);
  });
}


/* ---------- LABELS ---------- */

function addLabel(text, x, z, color) {

  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;

  const ctx = canvas.getContext("2d");

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  ctx.fillStyle = "rgba(12,9,20,0.9)";

  roundRect(
    ctx,
    8,
    20,
    496,
    88,
    30
  );

  ctx.fill();

  ctx.strokeStyle = "#" +
    color.toString(16).padStart(6, "0");

  ctx.lineWidth = 4;

  roundRect(
    ctx,
    8,
    20,
    496,
    88,
    30
  );

  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 34px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText(
    text,
    256,
    64
  );

  const texture =
    new THREE.CanvasTexture(canvas);

  const material =
    new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false
    });

  const sprite =
    new THREE.Sprite(material);

  sprite.scale.set(3.4, 0.85, 1);

  sprite.position.set(
    x,
    4.8,
    z
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
) {

  ctx.beginPath();

  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(
    x + w,
    y,
    x + w,
    y + r
  );

  ctx.lineTo(
    x + w,
    y + h - r
  );

  ctx.quadraticCurveTo(
    x + w,
    y + h,
    x + w - r,
    y + h
  );

  ctx.lineTo(
    x + r,
    y + h
  );

  ctx.quadraticCurveTo(
    x,
    y + h,
    x,
    y + h - r
  );

  ctx.lineTo(
    x,
    y + r
  );

  ctx.quadraticCurveTo(
    x,
    y,
    x + r,
    y
  );

  ctx.closePath();
}


/* ---------- CONTROLS ---------- */

function setupControls() {

  const canvas = renderer.domElement;

  canvas.addEventListener(
    "pointerdown",
    event => {

      dragging = true;
      moved = false;

      startX = event.clientX;
      startY = event.clientY;

      lastX = event.clientX;
      lastY = event.clientY;

      canvas.setPointerCapture(event.pointerId);
    }
  );

  canvas.addEventListener(
    "pointermove",
    event => {

      if (!dragging) return;

      const dx =
        event.clientX - lastX;

      const dy =
        event.clientY - lastY;

      if (
        Math.abs(event.clientX - startX) > 8 ||
        Math.abs(event.clientY - startY) > 8
      ) {
        moved = true;
      }

      cameraTheta -= dx * 0.006;

      cameraPhi -= dy * 0.004;

      cameraPhi = Math.max(
        0.55,
        Math.min(1.35, cameraPhi)
      );

      lastX = event.clientX;
      lastY = event.clientY;

      updateCamera();
    }
  );

  canvas.addEventListener(
    "pointerup",
    event => {

      dragging = false;

      if (!moved) {
        selectResident(
          event.clientX,
          event.clientY
        );
      }
    }
  );

  canvas.addEventListener(
    "pointercancel",
    () => {
      dragging = false;
    }
  );

  canvas.addEventListener(
    "wheel",
    event => {

      event.preventDefault();

      cameraRadius += event.deltaY * 0.015;

      cameraRadius = Math.max(
        14,
        Math.min(32, cameraRadius)
      );

      updateCamera();
    },
    { passive: false }
  );
}


function updateCamera() {

  const sinPhi =
    Math.sin(cameraPhi);

  camera.position.x =
    cameraRadius *
    sinPhi *
    Math.sin(cameraTheta);

  camera.position.z =
    cameraRadius *
    sinPhi *
    Math.cos(cameraTheta);

  camera.position.y =
    cameraRadius *
    Math.cos(cameraPhi);

  camera.lookAt(
    0,
    1.2,
    0
  );
}


/* ---------- SELECTION ---------- */

function selectResident(x, y) {

  const rect =
    renderer.domElement.getBoundingClientRect();

  pointer.x =
    ((x - rect.left) / rect.width) * 2 - 1;

  pointer.y =
    -((y - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(
    pointer,
    camera
  );

  const objects = [];

  residents.forEach(robot => {
    robot.traverse(child => {
      if (child.isMesh) objects.push(child);
    });
  });

  const hits =
    raycaster.intersectObjects(
      objects,
      false
    );

  if (!hits.length) return;

  let object = hits[0].object;

  while (
    object.parent &&
    object.userData.threadIndex === undefined
  ) {
    object = object.parent;
  }

  const index =
    object.userData.threadIndex;

  if (index !== undefined) {
    openSheet(index);
  }
}


/* ---------- SHEET ---------- */

function setupSheet() {

  const close =
    document.getElementById("closeSheet");

  if (close) {
    close.addEventListener(
      "click",
      () => {

        const sheet =
          document.getElementById("sheet");

        if (sheet) {
          sheet.classList.remove("open");
        }
      }
    );
  }
}


function openSheet(index) {

  const thread = threads[index];

  const sheet =
    document.getElementById("sheet");

  const title =
    document.getElementById("sheetTitle");

  const state =
    document.getElementById("sheetState");

  const text =
    document.getElementById("sheetText");

  const progress =
    document.getElementById("progressFill");

  if (!sheet) return;

  title.textContent =
    thread.name;

  state.textContent =
    thread.state.toUpperCase();

  text.textContent =
    thread.description;

  progress.style.width =
    thread.progress + "%";

  progress.style.background =
    "linear-gradient(90deg,#9b5cff,#3bdcff)";

  sheet.classList.add("open");
}


/* ---------- ANIMATION ---------- */

function animate() {

  requestAnimationFrame(animate);

  const time =
    performance.now() * 0.001;

  residents.forEach(
    (robot, index) => {

      const thread =
        threads[index];

      const state =
        thread.state;

      if (state === "working") {

        robot.position.y =
          Math.sin(time * 3 + index) * 0.08;

        robot.rotation.y =
          time * 0.8;
      }

      else if (state === "waiting") {

        robot.position.y =
          Math.sin(time * 1.5 + index) * 0.04;

        robot.rotation.y =
          Math.sin(time * 0.8) * 0.2;
      }

      else if (state === "finished") {

        robot.position.y =
          Math.sin(time * 2 + index) * 0.05;

        robot.rotation.y =
          Math.sin(time * 0.7) * 0.15;
      }

      else {

        robot.position.y =
          Math.sin(time * 0.8 + index) * 0.025;
      }
    }
  );

  labels.forEach(label => {
    label.quaternion.copy(
      camera.quaternion
    );
  });

  renderer.render(
    scene,
    camera
  );
}


/* ---------- RESIZE ---------- */

function resize() {

  if (!camera || !renderer) return;

  camera.aspect =
    window.innerWidth /
    window.innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );
}


/* ---------- START ---------- */

startWorld();
