import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';

import { 
    initSkybox, initLight, initSceneObjects, 
    animateFrame, earthObject, moonObject, sunLight,
    resetEarth, launchMeteor, toggleDoomsday
} from './render.js';
import { cameraTransform, minDistance, maxDistance, setEarthRotationSpeed, setMoonRotationSpeed } from './transform.js';
import { EarthHUD, MoonHUD } from './hud.js';
import { POIManager } from './poi.js';
import { initVRMenu, updateVRMenuCanvas, updateVRControllers } from './vr_menu.js';
import { VRHelpPanel } from './vr_help.js';
import { setTimeScale } from './time.js';
import { updateGamepad } from './control.js';

// ── Application State ────────────────────────────────────────────────────────
let renderer, scene, camera, controls;
let earthHUD, moonHUD, poiManager, vrHelp;

async function init() {
    // ── Renderer Setup ──
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true; // IMPORTANT for Quest 3
    document.body.appendChild(renderer.domElement);

    // ── Scene & Camera ──
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 20000);
    cameraTransform.init(camera);

    // ── Controls ──
    controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = minDistance;
    controls.maxDistance = maxDistance;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // ── VR Button ──
    document.getElementById('vr-button').appendChild(VRButton.createButton(renderer));

    // ── Initializations ──
    initSkybox(scene);
    initLight(scene);
    initSceneObjects(scene);

    earthHUD = new EarthHUD(camera);
    scene.add(earthHUD.plane);
    moonHUD = new MoonHUD(camera);
    scene.add(moonHUD.plane);

    poiManager = new POIManager(scene, earthObject, camera, renderer);
    poiManager.init();

    vrHelp = new VRHelpPanel(scene, camera);
    initVRMenu(scene, camera);

    // ── Global Exposures for HTML events ──
    window.launchMeteor = () => launchMeteor(scene);
    window.toggleDoomsday = () => toggleDoomsday(scene);
    window.resetEarth = resetEarth;
    window.syncTimeSpeed = (val) => setTimeScale(parseFloat(val));
    window.syncEarthSpeed = (val) => setEarthRotationSpeed(parseFloat(val));
    window.syncMoonSpeed = (val) => setMoonRotationSpeed(parseFloat(val));
    window.earthHUD = earthHUD;
    window.moonHUD = moonHUD;

    // ── Event Listeners ──
    window.addEventListener('resize', onWindowResize);
    
    // Start Animation Loop
    renderer.setAnimationLoop(animate);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

let lastTime = 0;
function animate(time) {
    const delta = Math.min(time - lastTime, 100);
    lastTime = time;

    // Update orbit controls only if not in VR
    if (!renderer.xr.isPresenting) {
        controls.update();
    }

    // Standard Gamepad (Desktop/Bluetooth)
    updateGamepad(earthHUD, moonHUD);

    // Main Simulation Frame
    animateFrame(
        delta, scene, camera, renderer, 
        [earthHUD, moonHUD], poiManager, 
        updateVRMenuCanvas, 
        () => updateVRControllers(renderer, scene, camera)
    );

    // VR Help panel logic
    if (vrHelp) vrHelp.update();

    renderer.render(scene, camera);
}

// Ensure DOM is ready
if (document.readyState === 'complete') {
    init();
} else {
    window.addEventListener('load', init);
}
