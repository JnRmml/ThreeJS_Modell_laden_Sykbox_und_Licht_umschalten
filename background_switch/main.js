import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
let backgroundMode = 0; // 0 = Farbe, 1 = Textur, 2 = Skybox

const skyColor = new THREE.Color(0x87ceeb); // Himmelblau

scene.background = skyColor;
const textureLoaderBG = new THREE.TextureLoader();
const backgroundTexture = textureLoaderBG.load('himmel_textur.jpg'); // Einfacher Himmel
//backgroundTexture.center.set(0.5, 0.5);
//backgroundTexture.rotation = Math.PI; // 180° drehen

const cubeTextureLoader = new THREE.CubeTextureLoader();
const skyboxTexture = cubeTextureLoader.load([
  'skycube5.jpg', 'skycube2.jpg',
  'skycube3.jpg', 'skycube1.jpg',
  'skycube4.jpg', 'skycube6.jpg'
]);
/*
      +----+
      | +Y |
+----+----+----+----+
| -X | +Z | +X | -Z |
+----+----+----+----+
      | -Y |
      +----+
const skyboxTexture = new THREE.CubeTextureLoader().load([
  'px.jpg', // +X
  'nx.jpg', // -X
  'py.jpg', // +Y
  'ny.jpg', // -Y
  'pz.jpg', // +Z
  'nz.jpg'  // -Z
]);
scene.background = skyboxTexture;
*/

const camera = new THREE.PerspectiveCamera(
  75, window.innerWidth / window.innerHeight, 0.1, 1000
);

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // optional für weichere Schatten

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// Licht hinzufügen
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 25, 10);
light.castShadow = true;
light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;

light.shadow.camera.near = 0.5;
light.shadow.camera.far = 50;
light.shadow.camera.left = -20;
light.shadow.camera.right = 20;
light.shadow.camera.top = 20;
light.shadow.camera.bottom = -20;

scene.add(light);
// Debug: Licht-Schattenkamera anzeigen
const helper = new THREE.CameraHelper(light.shadow.camera);
scene.add(helper);


// Boden erstellen
const planeGeometry = new THREE.PlaneGeometry(100, 100);
//const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x80ff80 });
//const plane = new THREE.Mesh(planeGeometry, planeMaterial);

const textureLoader = new THREE.TextureLoader();
const groundTexture = textureLoader.load('boden_textur.jpg');
groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
groundTexture.repeat.set(10, 10);

const texturedMaterial = new THREE.MeshStandardMaterial({ map: groundTexture });
const plane = new THREE.Mesh(planeGeometry, texturedMaterial);
// Boden rotieren, sodass er flach liegt (standardmäßig steht er senkrecht)
plane.rotation.x = -Math.PI / 2;
plane.position.y -= 5;

// Optional: Schatten empfangen
plane.receiveShadow = true;

scene.add(plane);

// Kamera-Position
camera.position.set(10, 10, 20);
camera.lookAt(0, 0, 0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 2;
controls.maxDistance = 10;
//controls.maxPolarAngle = Math.PI / 2;
controls.maxPolarAngle = Math.PI; // 180°
controls.minPolarAngle = 0;       // 0°

window.addEventListener('keydown', (event) => {
  switch(event.key) {
    case 'w': camera.position.z -= 0.1; break;
    case 's': camera.position.z += 0.1; break;
    case 'a': camera.position.x -= 0.1; break;
    case 'd': camera.position.x += 0.1; break;
    case 'b': switchBackground(); break; // Taste "b" für "background"
  }
});
function switchBackground() {
  backgroundMode = (backgroundMode + 1) % 3;

  switch (backgroundMode) {
    case 0:
      scene.background = skyColor;
      console.log('Hintergrund: Farbe');
      break;
    case 1:
      scene.background = backgroundTexture;
      console.log('Hintergrund: Textur');
      break;
    case 2:
      scene.background = skyboxTexture;
      console.log('Hintergrund: Skybox');
      break;
  }
}

const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // rot
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32); // Kugel statt Würfel
              
const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphereMesh.position.set(0,-2,0)
sphereMesh.castShadow = true; // <-- wirft Schatten
scene.add(sphereMesh);


function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
