import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

let scene, camera, renderer, controls;
let cityModel;
let lastTime = performance.now();
let frameCount = 0;
let fps = 0;

const moveSpeed = 50;
const keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    space: false,
    shift: false
};

function init() {
    const container = document.getElementById('canvas-container');

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 500, 3000);

    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        5000
    );
    camera.position.set(500, 300, 500);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = true;
    controls.minDistance = 10;
    controls.maxDistance = 2000;
    controls.maxPolarAngle = Math.PI / 2;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(500, 1000, 500);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -1000;
    directionalLight.shadow.camera.right = 1000;
    directionalLight.shadow.camera.top = 1000;
    directionalLight.shadow.camera.bottom = -1000;
    directionalLight.shadow.camera.far = 2000;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x545454, 0.4);
    scene.add(hemisphereLight);

    const gridHelper = new THREE.GridHelper(2000, 50, 0x666666, 0x333333);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    const axesHelper = new THREE.AxesHelper(100);
    scene.add(axesHelper);

    loadCityModel();

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
}

function loadCityModel() {
    const loadingElement = document.getElementById('loading');
    const progressBar = document.getElementById('loading-progress');
    const loadingText = document.getElementById('loading-text');

    const mtlLoader = new MTLLoader();
    mtlLoader.setPath('assets/City Islands/');
    mtlLoader.setResourcePath('assets/City Islands/');
    
    mtlLoader.load(
        'City_Islands.mtl',
        (materials) => {
            materials.preload();

            const objLoader = new OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.setPath('assets/City Islands/');

            objLoader.load(
                'City Islands.obj',
                (object) => {
                    cityModel = object;
                    
                    const box = new THREE.Box3().setFromObject(cityModel);
                    const center = box.getCenter(new THREE.Vector3());
                    const size = box.getSize(new THREE.Vector3());
                    
                    cityModel.position.x = -center.x;
                    cityModel.position.y = -box.min.y;
                    cityModel.position.z = -center.z;

                    cityModel.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                            
                            if (child.material) {
                                child.material.side = THREE.FrontSide;
                            }
                        }
                    });

                    scene.add(cityModel);

                    const maxDim = Math.max(size.x, size.y, size.z);
                    const fov = camera.fov * (Math.PI / 180);
                    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
                    cameraZ *= 1.5;

                    camera.position.set(cameraZ * 0.8, cameraZ * 0.5, cameraZ * 0.8);
                    camera.lookAt(0, size.y / 3, 0);
                    controls.target.set(0, size.y / 3, 0);
                    controls.update();

                    loadingElement.classList.add('hidden');
                    document.getElementById('info').classList.remove('hidden');

                    console.log('Ciudad cargada!');
                    console.log('Tamaño:', size);
                    console.log('Centro:', center);
                },
                (xhr) => {
                    const percentComplete = (xhr.loaded / xhr.total) * 100;
                    progressBar.style.width = percentComplete + '%';
                    loadingText.textContent = Math.round(percentComplete) + '%';
                    console.log('Cargando modelo: ' + Math.round(percentComplete) + '%');
                },
                (error) => {
                    console.error('Error cargando el modelo OBJ:', error);
                    loadingElement.innerHTML = '<div style="color: red;">Error cargando el modelo. Por favor revise la consola.</div>';
                }
            );
        },
        (xhr) => {
            console.log('Cargando materiales: ' + Math.round((xhr.loaded / xhr.total) * 100) + '%');
        },
        (error) => {
            console.error('Error cargando materiales:', error);
            loadingElement.innerHTML = '<div style="color: red;">Error cargando materiales. Por favor revise la consola.</div>';
        }
    );
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onKeyDown(event) {
    const key = event.key.toLowerCase();
    if (key === 'w') keys.w = true;
    if (key === 'a') keys.a = true;
    if (key === 's') keys.s = true;
    if (key === 'd') keys.d = true;
    if (key === ' ') keys.space = true;
    if (event.shiftKey) keys.shift = true;
}

function onKeyUp(event) {
    const key = event.key.toLowerCase();
    if (key === 'w') keys.w = false;
    if (key === 'a') keys.a = false;
    if (key === 's') keys.s = false;
    if (key === 'd') keys.d = false;
    if (key === ' ') keys.space = false;
    if (!event.shiftKey) keys.shift = false;
}

function updateCameraMovement(delta) {
    const moveDistance = moveSpeed * delta;

    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(forward, camera.up).normalize();

    if (keys.w) {
        camera.position.addScaledVector(forward, moveDistance);
        controls.target.addScaledVector(forward, moveDistance);
    }
    if (keys.s) {
        camera.position.addScaledVector(forward, -moveDistance);
        controls.target.addScaledVector(forward, -moveDistance);
    }
    if (keys.a) {
        camera.position.addScaledVector(right, -moveDistance);
        controls.target.addScaledVector(right, -moveDistance);
    }
    if (keys.d) {
        camera.position.addScaledVector(right, moveDistance);
        controls.target.addScaledVector(right, moveDistance);
    }
    if (keys.space) {
        camera.position.y += moveDistance;
        controls.target.y += moveDistance;
    }
    if (keys.shift) {
        camera.position.y -= moveDistance;
        controls.target.y -= moveDistance;
    }
}

function updateFPS() {
    frameCount++;
    const currentTime = performance.now();
    
    if (currentTime >= lastTime + 1000) {
        fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        document.getElementById('fps').textContent = fps;
        frameCount = 0;
        lastTime = currentTime;
    }
}

function animate() {
    requestAnimationFrame(animate);

    const delta = 0.016;
    
    updateCameraMovement(delta);
    controls.update();
    updateFPS();
    
    renderer.render(scene, camera);
}

init();
animate();
