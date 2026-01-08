import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import Stats from 'stats.js';

let scene, camera, renderer, controls, stats;
let cityModel;
let clock = new THREE.Clock();

const moveSpeed = 100;
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
    scene.fog = new THREE.Fog(0x87CEEB, 1000, 5000);

    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        1,
        10000
    );
    camera.position.set(500, 300, 500);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    stats = new Stats();
    stats.showPanel(0);
    stats.dom.style.position = 'absolute';
    stats.dom.style.top = '10px';
    stats.dom.style.right = '10px';
    stats.dom.style.left = 'auto';
    document.body.appendChild(stats.dom);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = true;
    controls.minDistance = 10;
    controls.maxDistance = 4000;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1000, 2000, 1000);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -2000;
    directionalLight.shadow.camera.right = 2000;
    directionalLight.shadow.camera.top = 2000;
    directionalLight.shadow.camera.bottom = -2000;
    directionalLight.shadow.camera.far = 5000;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x545454, 0.5);
    scene.add(hemisphereLight);

    const gridHelper = new THREE.GridHelper(5000, 100, 0x666666, 0x333333);
    scene.add(gridHelper);

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
                    let cameraDistance = Math.abs(maxDim / 2 / Math.tan(fov / 2));
                    cameraDistance *= 1.2;

                    camera.position.set(cameraDistance, cameraDistance * 0.6, cameraDistance);
                    camera.lookAt(0, 0, 0);
                    controls.target.set(0, 0, 0);
                    controls.update();

                    loadingElement.classList.add('hidden');
                    document.getElementById('info').classList.remove('hidden');

                    console.log('Ciudad cargada!', { size, center });
                },
                (xhr) => {
                    if (xhr.lengthComputable) {
                        const percentComplete = (xhr.loaded / xhr.total) * 100;
                        progressBar.style.width = percentComplete + '%';
                        loadingText.textContent = Math.round(percentComplete) + '%';
                    }
                },
                (error) => {
                    console.error('Error cargando el modelo OBJ:', error);
                    loadingElement.innerHTML = '<div style="color: red;">Error cargando el modelo. Revisa la consola.</div>';
                }
            );
        },
        null,
        (error) => {
            console.error('Error cargando materiales:', error);
            loadingElement.innerHTML = '<div style="color: red;">Error cargando materiales. Revisa la consola.</div>';
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

function animate() {
    requestAnimationFrame(animate);
    
    stats.begin();
    
    const delta = clock.getDelta();
    updateCameraMovement(delta);
    controls.update();
    renderer.render(scene, camera);
    
    stats.end();
}

init();
animate();
