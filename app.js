import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const world = document.getElementById("world");

try {

  const canvas = document.createElement("canvas");
  canvas.style.position = "absolute";
  canvas.style.inset = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";

  world.appendChild(canvas);

  const gl = canvas.getContext("webgl2");

  if (!gl) {
    throw new Error("WebGL 2 is NOT available on this device/browser.");
  }

  const scene = new THREE.Scene();

  scene.background = new THREE.Color(0x12051f);

  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );

  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
  });

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, 2)
  );

  const geometry = new THREE.BoxGeometry(2, 2, 2);

  const material = new THREE.MeshBasicMaterial({
    color: 0x9b5cff
  });

  const cube = new THREE.Mesh(
    geometry,
    material
  );

  scene.add(cube);

  function animate() {

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.015;

    renderer.render(
      scene,
      camera
    );

    requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener("resize", () => {

    camera.aspect =
      window.innerWidth /
      window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );
  });

}
catch(error) {

  world.innerHTML = `
    <div style="
      position:absolute;
      inset:0;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:30px;
      text-align:center;
      color:white;
      font-family:-apple-system,BlinkMacSystemFont,sans-serif;
    ">
      <div>
        <div style="
          font-size:50px;
          margin-bottom:15px;
        ">⚠️</div>

        <h2>3D Engine Test</h2>

        <p style="
          color:#aaa;
          line-height:1.5;
        ">
          ${error.message}
        </p>
      </div>
    </div>
  `;

  console.error(error);
}
