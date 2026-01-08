import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { USDZLoader } from 'three/examples/jsm/loaders/USDZLoader.js';
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
    shift: false,
    alt: false
};

let caveCharacter;
let caveVisual;
let caveMixer;
let caveActions;
let caveActiveAction;
let caveIsJumpAnimating = false;
let caveJumpRequested = false;
let caveVelocityY = 0;
let caveIsGrounded = true;
const caveGroundY = 0;

const caveMovement = {
    walkSpeed: 220,
    runSpeed: 360,
    turnSpeed: 2.6,
    gravity: -900,
    jumpVelocity: 360
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

                    cityModel.traverse((child) => {
                        if (child.isMesh && child.name) {
                            const childNameLower = child.name.toLowerCase();
                            const carKeywords = ['car', 'truck', 'vehicle', 'auto', 'tire', 'rim', 'van', 'coche', 'carro'];
                            const isCar = carKeywords.some(keyword => childNameLower.includes(keyword));

                            if (isCar) {
                                child.visible = false;
                                console.log('Removed car/vehicle:', child.name);
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

                    loadCaveCharacter();

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

function loadCaveCharacter() {
    const usdzLoader = new USDZLoader();
    const caveUrl = new URL('../Cave.usdz', import.meta.url);

    usdzLoader.load(
        caveUrl.href,
        (object) => {
            caveCharacter = new THREE.Group();
            caveCharacter.name = 'CaveCharacter';

            caveVisual = new THREE.Group();
            caveVisual.name = 'CaveVisual';
            caveCharacter.add(caveVisual);

            const model = object;
            model.name = 'CaveModel';

            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());

            const targetHeight = 180;
            const height = Math.max(size.y, 0.0001);
            const scale = targetHeight / height;
            model.scale.setScalar(scale);

            const boxScaled = new THREE.Box3().setFromObject(model);
            const centerScaled = boxScaled.getCenter(new THREE.Vector3());

            model.position.set(-centerScaled.x, -boxScaled.min.y, -centerScaled.z);

            caveVisual.add(model);

            caveCharacter.position.set(0, caveGroundY, 0);
            caveCharacter.rotation.y = Math.PI;

            scene.add(caveCharacter);

            setupCaveAnimations();

            console.log('Cave cargado!', { scale, size });
        },
        undefined,
        (error) => {
            console.error('Error cargando Cave.usdz:', error);
        }
    );
}

function setupCaveAnimations() {
    caveMixer = new THREE.AnimationMixer(caveVisual);
    caveActions = {};

    const idleTimes = [0, 0.8, 1.6];
    const idleBob = [0, 1.1, 0];
    const idleTilt = [0, 0.015, 0];

    const walkTimes = [0, 0.25, 0.5, 0.75, 1.0];
    const walkBob = [0, 2.2, 0, 2.2, 0];
    const walkTilt = [0, 0.05, 0, -0.05, 0];

    const runTimes = [0, 0.15, 0.3, 0.45, 0.6];
    const runBob = [0, 3.6, 0, 3.6, 0];
    const runTilt = [0, 0.08, 0, -0.08, 0];

    const jumpTimes = [0, 0.12, 0.22, 0.55];
    const jumpSquash = [1, 0.85, 1.1, 1];
    const jumpWide = [1, 1.12, 0.95, 1];
    const jumpBob = [0, -1.4, 2.8, 0];

    const idleClip = new THREE.AnimationClip('Idle', idleTimes[idleTimes.length - 1], [
        new THREE.NumberKeyframeTrack('.position[y]', idleTimes, idleBob),
        new THREE.NumberKeyframeTrack('.rotation[z]', idleTimes, idleTilt)
    ]);

    const walkClip = new THREE.AnimationClip('Walk', walkTimes[walkTimes.length - 1], [
        new THREE.NumberKeyframeTrack('.position[y]', walkTimes, walkBob),
        new THREE.NumberKeyframeTrack('.rotation[z]', walkTimes, walkTilt)
    ]);

    const runClip = new THREE.AnimationClip('Run', runTimes[runTimes.length - 1], [
        new THREE.NumberKeyframeTrack('.position[y]', runTimes, runBob),
        new THREE.NumberKeyframeTrack('.rotation[z]', runTimes, runTilt)
    ]);

    const jumpClip = new THREE.AnimationClip('Jump', jumpTimes[jumpTimes.length - 1], [
        new THREE.NumberKeyframeTrack('.scale[y]', jumpTimes, jumpSquash),
        new THREE.NumberKeyframeTrack('.scale[x]', jumpTimes, jumpWide),
        new THREE.NumberKeyframeTrack('.scale[z]', jumpTimes, jumpWide),
        new THREE.NumberKeyframeTrack('.position[y]', jumpTimes, jumpBob)
    ]);

    caveActions.idle = caveMixer.clipAction(idleClip);
    caveActions.walk = caveMixer.clipAction(walkClip);
    caveActions.run = caveMixer.clipAction(runClip);
    caveActions.jump = caveMixer.clipAction(jumpClip);

    caveActions.jump.loop = THREE.LoopOnce;
    caveActions.jump.clampWhenFinished = true;

    caveMixer.addEventListener('finished', (e) => {
        if (e.action === caveActions.jump) {
            caveIsJumpAnimating = false;
        }
    });

    playCaveAction('idle', 0);
}

function playCaveAction(name, fadeDuration = 0.2, forceRestart = false) {
    if (!caveActions) return;

    const nextAction = caveActions[name];
    if (!nextAction) return;

    if (caveActiveAction === nextAction && !forceRestart) return;

    nextAction.reset();
    nextAction.enabled = true;
    nextAction.setEffectiveTimeScale(1);
    nextAction.setEffectiveWeight(1);

    if (caveActiveAction) {
        nextAction.crossFadeFrom(caveActiveAction, fadeDuration, true);
    }

    nextAction.play();
    caveActiveAction = nextAction;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onKeyDown(event) {
    const key = event.key.toLowerCase();

    const preventKeys = ['w', 'a', 's', 'd', ' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];
    if (preventKeys.includes(key)) event.preventDefault();

    if (key === 'w') keys.w = true;
    if (key === 'a') keys.a = true;
    if (key === 's') keys.s = true;
    if (key === 'd') keys.d = true;

    if (key === ' ') {
        if (!event.repeat && !event.altKey) {
            caveJumpRequested = true;
        }
        keys.space = true;
    }

    if (key === 'alt') keys.alt = true;
    if (event.altKey) keys.alt = true;

    if (key === 'shift') keys.shift = true;
    if (event.shiftKey) keys.shift = true;
}

function onKeyUp(event) {
    const key = event.key.toLowerCase();

    if (key === 'w') keys.w = false;
    if (key === 'a') keys.a = false;
    if (key === 's') keys.s = false;
    if (key === 'd') keys.d = false;
    if (key === ' ') keys.space = false;

    if (key === 'alt') keys.alt = false;
    if (!event.altKey && key !== 'alt') keys.alt = false;

    if (key === 'shift') keys.shift = false;
    if (!event.shiftKey && key !== 'shift') keys.shift = false;
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

function updateCaveCharacter(delta, inputEnabled = true) {
    if (!caveCharacter || !caveMixer) return;

    const aPressed = inputEnabled && keys.a;
    const dPressed = inputEnabled && keys.d;
    const wPressed = inputEnabled && keys.w;
    const sPressed = inputEnabled && keys.s;

    const turnAmount = (aPressed ? 1 : 0) - (dPressed ? 1 : 0);
    if (turnAmount !== 0) {
        caveCharacter.rotation.y += turnAmount * caveMovement.turnSpeed * delta;
    }

    let moveInput = 0;
    if (wPressed) moveInput += 1;
    if (sPressed) moveInput -= 1;

    const isMoving = moveInput !== 0;
    const isRunning = isMoving && (aPressed || dPressed);

    if (inputEnabled && caveJumpRequested && caveIsGrounded) {
        caveJumpRequested = false;
        caveIsGrounded = false;
        caveVelocityY = caveMovement.jumpVelocity;
        caveIsJumpAnimating = true;
        playCaveAction('jump', 0.05, true);
    } else {
        caveJumpRequested = false;
    }

    if (isMoving) {
        const speed = isRunning ? caveMovement.runSpeed : caveMovement.walkSpeed;
        const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(caveCharacter.quaternion);
        direction.y = 0;
        direction.normalize();
        caveCharacter.position.addScaledVector(direction, moveInput * speed * delta);
    }

    if (!caveIsGrounded) {
        caveVelocityY += caveMovement.gravity * delta;
        caveCharacter.position.y += caveVelocityY * delta;

        if (caveCharacter.position.y <= caveGroundY) {
            caveCharacter.position.y = caveGroundY;
            caveVelocityY = 0;
            caveIsGrounded = true;
        }
    }

    if (!caveIsJumpAnimating) {
        if (isMoving) {
            playCaveAction(isRunning ? 'run' : 'walk', 0.12);
        } else {
            playCaveAction('idle', 0.12);
        }
    }

    caveMixer.update(delta);
}

function animate() {
    requestAnimationFrame(animate);

    stats.begin();

    const delta = clock.getDelta();

    updateCaveCharacter(delta, !keys.alt);

    if (keys.alt) {
        updateCameraMovement(delta);
    }

    controls.update();
    renderer.render(scene, camera);

    stats.end();
}

init();
animate();
