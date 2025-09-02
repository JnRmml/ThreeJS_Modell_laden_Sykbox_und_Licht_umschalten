import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { PLYLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/PLYLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // optional für weichere Schatten

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(-0.5, 1.5, 1.5);
camera.lookAt(0,1,4)

const skyColor = new THREE.Color(0x87ceeb); // Himmelblau
//scene.background = skyColor;

// Licht
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1).normalize();
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;

directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -20;
directionalLight.shadow.camera.right = 20;
directionalLight.shadow.camera.top = 20;
directionalLight.shadow.camera.bottom = -20;

  scene.add(directionalLight);

  let lightOn = true;
  let lightMode = 0;
  let lightAngle = 0;


// Boden erstellen
const planeGeometry = new THREE.PlaneGeometry(100, 100);
//const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x80ff80 });
//const plane = new THREE.Mesh(planeGeometry, planeMaterial);

//const textureLoader = new THREE.TextureLoader();
//const groundTexture = textureLoader.load('boden_fliese.jpg');
//groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
//groundTexture.repeat.set(10, 10);

//const texturedMaterial = new THREE.MeshStandardMaterial({ map: groundTexture });
//const plane = new THREE.Mesh(planeGeometry, texturedMaterial);
// Boden rotieren, sodass er flach liegt (standardmäßig steht er senkrecht)
//plane.rotation.x = -Math.PI / 2;
//plane.position.y -= 0;

// Optional: Schatten empfangen
//plane.receiveShadow = true;

//scene.add(plane);


function updateLightMode() {
  lightMode = (lightMode + 1) % 5;

  switch (lightMode) {
    case 0: // Licht aus
      ambientLight.visible = false;
      directionalLight.visible = false;
      break;
    case 1: // Normales weißes Licht
      ambientLight.visible = true;
      directionalLight.visible = true;
      directionalLight.color.set(0xffffff);
      directionalLight.intensity = 1;
      break;
    case 2: // Warmes Licht
      ambientLight.visible = true;
      directionalLight.visible = true;
      directionalLight.color.set(0xffccaa);
      directionalLight.intensity = 0.8;
      break;
    case 3: // Kaltes Licht
      ambientLight.visible = true;
      directionalLight.visible = true;
      directionalLight.color.set(0xaaaaff);
      directionalLight.intensity = 0.5;
      break;
    case 4: // Bewegliches Licht
      ambientLight.visible = true;
      directionalLight.visible = true;
      directionalLight.color.set(0xffffff);
      directionalLight.intensity = 1;
      break;
  }
}

  // Modell-Liste
  const models = [
    'bunny/data/bun000.ply',
    'bunny/data/bun045.ply',
    'bunny/data/bun090.ply',
    'bunny/data/bun180.ply',
    'bunny/reconstruction/bun_zipper.ply'
  ];

  let currentModelIndex = 0;
  let currentObject = null;
  const loader = new PLYLoader();

  function loadModel(index) {
    const path = models[index];
    loader.load(path, (geometry) => {
      // Entferne vorheriges Modell
      if (currentObject) {
        scene.remove(currentObject);
        currentObject.geometry.dispose();
        currentObject.material.dispose();
      }

      let object;

      if (path.includes('zipper')) {
        geometry.computeVertexNormals();
        const material = new THREE.MeshStandardMaterial({
          color: 0xcccccc,
          flatShading: false,
          metalness: 0.1,
          roughness: 0.8,
        });
        object = new THREE.Mesh(geometry, material);
        object.castShadow = true;
      } else {
        const material = new THREE.PointsMaterial({
          size: 0.002,
          vertexColors: false,
          color: 0xffffff
        });
        object = new THREE.Points(geometry, material);
      }

      object.scale.set(10, 10, 10);
      currentObject = object;
      scene.add(currentObject);
    });
  }

  // Initiales Modell laden
  loadModel(currentModelIndex);

window.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'Space':
      currentModelIndex = (currentModelIndex + 1) % models.length;
      loadModel(currentModelIndex);
      break;

    case 'KeyL':
      updateLightMode();
      break;

    case 'ArrowUp':
      directionalLight.intensity = Math.min(directionalLight.intensity + 0.1, 2);
      break;

    case 'ArrowDown':
      directionalLight.intensity = Math.max(directionalLight.intensity - 0.1, 0);
      break;

    // optional: weitere Tasten hier hinzufügen
  }
});

const colors = [0xffffff, 0xffccaa, 0xaaaaff, 0xccffcc];
let colorIndex = 0;

function cycleLightColor() {
  colorIndex = (colorIndex + 1) % colors.length;
  directionalLight.color.set(colors[colorIndex]);
}


  // Responsiveness
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
function animate() {
  requestAnimationFrame(animate);

  if (lightMode === 4) {
    lightAngle += 0.01;
    const radius = 2;
    directionalLight.position.set(
      Math.cos(lightAngle) * radius,
      1,
      Math.sin(lightAngle) * radius
    );
  }

  controls.update();
  renderer.render(scene, camera);
}

  animate();

