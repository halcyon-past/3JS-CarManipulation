import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const orbit = new OrbitControls(camera, renderer.domElement);

const axesHelper = new THREE.AxesHelper(3);
scene.add(axesHelper);

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath(
  "https://www.gstatic.com/draco/versioned/decoders/1.5.6/"
);
dracoLoader.setDecoderConfig({ type: "js" });
dracoLoader.preload();

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

let importedModel;
loader.setPath("/models/");
const loadModelPromise = loader.loadAsync("FinalReady.gltf");

let leftDoor;
let rightDoor;

loadModelPromise.then((gltf) => {
  importedModel = gltf.scene;
  importedModel.position.set(0, 0, 0);
  importedModel.scale.set(3, 3, 3);
  scene.add(importedModel);
  importedModel.castShadow = true;

  const spotlight = new THREE.SpotLight(0xffffff);
  spotlight.position.set(0, 10, 0);
  spotlight.castShadow = true;
  scene.add(spotlight);

  spotlight.target = importedModel; // Set the car model as the target
  spotlight.angle = Math.PI / 4; // Set the angle of the spotlight
  spotlight.intensity = 100; // Adjust the intensity
  spotlight.distance = 100; // Set the distance the spotlight reaches

  leftDoor = importedModel.getObjectByName("Front_Door_Right");
  console.log(leftDoor);

  rightDoor = importedModel.getObjectByName("Front_Door_Left");
  console.log(rightDoor);

  function rotateModel(angle) {
    importedModel.rotation.y += angle;
  }

  function animate(time) {
    rotateModel(0.001);
    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(animate);
});

camera.position.set(-10, 30, 30);
orbit.update();

const planeGeometry = new THREE.PlaneGeometry(30, 30);
const planeMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);
plane.rotation.x = Math.PI / 2;
plane.receiveShadow = true;

const ambientLight = new THREE.AmbientLight(0x333333);
ambientLight.intensity = 20;
scene.add(ambientLight);

const gridHelper = new THREE.GridHelper(30);
scene.add(gridHelper);

function openDoor() {
  if (leftDoor && rightDoor) {
    leftDoor.rotation.y = 2 * Math.PI - Math.PI / 5;
    rightDoor.rotation.y = Math.PI / 5;
  }
}

function closeDoor() {
  if (leftDoor && rightDoor) {
    leftDoor.rotation.y = 0;
    rightDoor.rotation.y = 0;
  }
}

function processConsoleCommand(command) {
  if (command === "openDoor") {
    openDoor();
  } else if (command === "closeDoor") {
    closeDoor();
  } else {
    console.log("Command not recognized:", command);
  }
}

// Listen for console commands
window.addEventListener("message", (e) => {
  if (e.data && e.data.consoleCommand) {
    processConsoleCommand(e.data.consoleCommand);
  }
});

/*
const arrowKeyMap = {
  ArrowUp: { x: 0, y: 0, z: -0.1 },
  ArrowDown: { x: 0, y: 0, z: 0.1 },
  ArrowLeft: { x: -0.1, y: 0, z: 0 },
  ArrowRight: { x: 0.1, y: 0, z: 0 },
};

document.addEventListener("keydown", (event) => {
  const moveVector = arrowKeyMap[event.key];
  if (moveVector && importedModel) {
    importedModel.position.x += moveVector.x;
    importedModel.position.y += moveVector.y;
    importedModel.position.z += moveVector.z;
  }
});*/
