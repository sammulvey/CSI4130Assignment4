// Sam Mulvey, Alexander Hawke
// 300201795, 300194736
// Assignment 4

import * as THREE from 'three';
import { GUI } from 'dat.gui';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let camera = 0;
let renderer = 0;
let t = 0;
let santa = 0;
var bounds = 2000;
const loader = new GLTFLoader();

function init() {

    // Camera setup
    var scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
    renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer: true });
    renderer.autoClearColor = false;
    renderer.setClearColor(0x8EC8E8);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    camera.position.set(0, 110, 150);
    camera.lookAt(scene.position);

    // Initialize OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);

    camera.aspect = window.innerWidth / 2 / window.innerHeight;
    camera.updateProjectionMatrix();

    // Loading Santaclause from santa_claus folder
    loader.load( './santa_claus/scene.gltf', function ( gltf ) {
        santa = gltf.scene
        santa.scale.set(5, 5, 5);
        scene.add(santa);
    }, undefined, function ( error ) {
        console.error( error );
    } );

    // Add light so everything is not black
    const ambientLight = new THREE.AmbientLight(0x404040); // A bit brighter than before
    scene.add(ambientLight);

    // Added moonlight directional lighting
    const moonLight = new THREE.DirectionalLight(0x9999bb, 1); // Brighter and slightly more blue
    moonLight.position.set(-1, 1, 1);
    scene.add(moonLight);

    // Adding a fog effect to the scene as you get futher away from santa
    scene.fog = new THREE.FogExp2(0x10101, 0.0013); // Exponential fog, very subtle

    // Adding a nightsky background
    function addSkybox(scene) {
        const skyboxSize = bounds;
        const skyboxGeometry = new THREE.BoxGeometry(skyboxSize, skyboxSize, skyboxSize);
        const loader = new THREE.TextureLoader();
    
        // Load a single image for all sides with error handling
        loader.load(
            'nightsky.jpg', // Ensure this path is correct
            function (texture) {
                const materials = [];
                for (let i = 0; i < 6; i++) {
                    materials.push(new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide }));
                }
                const skybox = new THREE.Mesh(skyboxGeometry, materials);
                scene.add(skybox);
            },
            undefined, // onProgress callback not needed here
            function (error) {
                console.error('There was an error loading the texture:', error);
            }
        );
    }
    addSkybox(scene);
    
    // Creating Ground
    function createSnowyGround() {
        const geometry = new THREE.PlaneGeometry(bounds, bounds); // Large enough to cover the camera's view
        const material = new THREE.MeshLambertMaterial({ color: 0xf0f8ff }); // Soft white color
        const ground = new THREE.Mesh(geometry, material);
        ground.rotation.x = -Math.PI / 2; // Rotate the plane to be horizontal
        return ground;
    }
    const snowyGround = createSnowyGround();
    scene.add(snowyGround);

    // Creating Tree
    function createTree() {
        const leavesGeometry = new THREE.ConeGeometry(5, 20, 32); // Cone for the leaves
        const snowGeometry = new THREE.ConeGeometry(5, 20, 32); // Cone for the snow on top of the leaves
        const trunkGeometry = new THREE.CylinderGeometry(2, 2, 30, 32); // Cylinder for the trunk
        const leafMaterial = new THREE.MeshLambertMaterial({ color: 0x006400 }); // Dark green
        const snowMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF }); // White
        const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 }); // Brown
        
        const leaves = new THREE.Mesh(leavesGeometry, leafMaterial);
        leaves.position.y = 15; // Halfway up the trunk
        
        const snow = new THREE.Mesh(snowGeometry, snowMaterial);
        snow.position.y = 17;

        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        
        const tree = new THREE.Group();
        tree.add(leaves);
        tree.add(snow);
        tree.add(trunk);
        
        tree.isTree = true;

        return tree;
    }

    // Tree position randomizer, allows for manipulation of number of trees
    function addTrees(scene, numberOfTrees) {
        for (let i = 0; i < numberOfTrees; i++) {
            const tree = createTree();
            tree.position.y = Math.random() * 15;
            tree.position.x = Math.random() * bounds - bounds/2; // Random position within bounds
            tree.position.z = Math.random() * bounds - bounds/2;
            scene.add(tree);
        }
    }
    addTrees(scene, bounds);

    function createSnowman() {
        const bottomSphereGeometry = new THREE.SphereGeometry(10, 32, 32); 
        const middleSphereGeometry = new THREE.SphereGeometry(10 * 0.66, 32, 32); 
        const topSphereGeometry = new THREE.SphereGeometry(10 * 0.33, 32, 32); 
        const material = new THREE.MeshLambertMaterial({ color: 0xFFFFFF }); 
    
        const bottomSphere = new THREE.Mesh(bottomSphereGeometry, material);
        bottomSphere.position.y = 10;
        
        const middleSphere = new THREE.Mesh(middleSphereGeometry, material);
        middleSphere.position.y = 20;
        
        const topSphere = new THREE.Mesh(topSphereGeometry, material);
        topSphere.position.y = 28;
    
        // Carrot nose
        const noseGeometry = new THREE.CylinderGeometry(0.4, 1.5, 6, 32);
        const noseMaterial = new THREE.MeshLambertMaterial({ color: 0xFF8C00 }); 
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.y = 28; 
        nose.position.z = 10 * 0.33 + 3;
        nose.rotation.x = Math.PI / 2;
    
        // Top hat brim
        const hatBrimGeometry = new THREE.CylinderGeometry(5, 5, 1, 32);
        const hatMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const hatBrim = new THREE.Mesh(hatBrimGeometry, hatMaterial);
        hatBrim.position.y = 31;
    
        // Top hat body
        const hatBodyGeometry = new THREE.CylinderGeometry(3, 3, 7, 32);
        const hatBody = new THREE.Mesh(hatBodyGeometry, hatMaterial);
        hatBody.position.y = 35;

        // Left arm
        const armGeometry = new THREE.CylinderGeometry(0.2, 0.2, 12, 32);
        const armMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-8, 18, 0);
        leftArm.rotation.z = Math.PI / 4;

        // Right arm
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(8, 18, 0);
        rightArm.rotation.z = -Math.PI / 4; 

        const buttonMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        const buttonRadius = 0.75; 
        const buttonGeometry = new THREE.SphereGeometry(buttonRadius, 32, 32);

        const buttonPositions = [
            { x: 0, y: 25, z: 4 }, // Top button on the middle sphere
            { x: 0, y: 20, z: 6.5 }, // Middle button on the middle sphere
            { x: 0, y: 15, z: 8.5 }, // Bottom button on the middle sphere
            { x: 0, y: 10, z: 9.75 }, // Top button on the bottom sphere
            { x: 0, y: 5, z: 8.75 }   // Bottom button on the bottom sphere
        ];

        const buttons = buttonPositions.map(pos => {
            const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
            button.position.set(pos.x, pos.y, pos.z);
            return button;
        });
    
        const snowman = new THREE.Group();
        snowman.add(bottomSphere);
        snowman.add(middleSphere);
        snowman.add(topSphere);
        snowman.add(nose);
        snowman.add(hatBrim);
        snowman.add(hatBody);
        snowman.add(leftArm);
        snowman.add(rightArm);
        buttons.forEach(button => snowman.add(button));

        snowman.isSnowman = true;
    
        return snowman;
    }
    
    function addSnowmen(scene, numberOfSnowmen) {
        for (let i = 0; i < numberOfSnowmen; i++) {
                const snowman = createSnowman();
                snowman.position.y = 0;
                snowman.position.x = Math.random() * bounds - bounds/2; 
                snowman.position.z = Math.random() * bounds - bounds/2;
                scene.add(snowman);
        }
    }
    addSnowmen(scene, 100);

    // Creating snowfall
    function createSnowfall(scene) {
        const particleCount = 10000; // Number of particles
        const positions = new Float32Array(particleCount * 3); // Each particle has an x, y, and z coordinate
    
        // Bounds of the snowfall area
        const height = 200;
    
        // Randomize initial positions
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = Math.random() * bounds - bounds / 2; // x
            positions[i * 3 + 1] = Math.random() * height; // y
            positions[i * 3 + 2] = Math.random() * bounds - bounds / 2; // z
        }
    
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
        const material = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 1.5, sizeAttenuation: true });
        
        const snowfall = new THREE.Points(geometry, material);
        scene.add(snowfall);
    
        return snowfall;
    }
    let snowfall = createSnowfall(scene);

    function animateSnowfall(snowfall) {
        const positions = snowfall.geometry.attributes.position.array;
        const count = positions.length / 3;
    
        for (let i = 0; i < count; i++) {
            positions[i * 3 + 1] -= 1; // Move each snowflake down along the y-axis
    
            if (positions[i * 3 + 1] < 0) {
                positions[i * 3 + 1] = 200; // Reset snowflake to top of the scene if it falls below 0
            }
        }
    
        snowfall.geometry.attributes.position.needsUpdate = true; // Important for updating the particles' positions
    }

    // GUI Parameters
    var params = {
        amplitudeX: 10, frequencyX: 2, phaseX: 0.0, dampingX: 0.9999,
        amplitudeY: 15, frequencyY: 3, phaseY: 0.0, dampingY: 0.9999,
        amplitudeZ: 5,  frequencyZ: 1.8, phaseZ: 0.5, dampingZ: 0.9999,
        amplitudeS: 5, frequencyS: 2, phaseS: 0.0, dampingS: 0.9999,
        sceneSpeed: 0.5,
        reset: function() {
            t = 0;
            this.amplitudeX = 10; this.frequencyX = 2; this.phaseX = 0.0; this.dampingX = 0.9999;
            this.amplitudeY = 15; this.frequencyY = 3; this.phaseY = 0.0; this.dampingY = 0.9999;
            this.amplitudeZ = 5;  this.frequencyZ = 1.8; this.phaseZ = 0.5; this.dampingZ = 0.9999;
            this.amplitudeS = 5;  this.frequencyS = 2; this.phaseS = 0.0; this.dampingS = 0.9999;
            if (santa) {
                santa.position.set(0, 0, 0);
            }
            renderer.clear();

            updateGuiDisplay();
        }
    };

    // GUI initialization and controls
    var gui = new GUI();

    var amplitudeFolder = gui.addFolder('Amplitude');
    var frequencyFolder = gui.addFolder('Frequency');
    var dampingFolder = gui.addFolder('Damping');
    var phaseFolder = gui.addFolder('Phase');

    amplitudeFolder.add(params, 'amplitudeX', 0, 20).name('Amplitude X');
    amplitudeFolder.add(params, 'amplitudeY', 0, 20).name('Amplitude Y');
    amplitudeFolder.add(params, 'amplitudeZ', 0, 20).name('Amplitude Z');
    amplitudeFolder.add(params, 'amplitudeS', 0, 20).name('Amplitude S');

    frequencyFolder.add(params, 'frequencyX', 0, 5).name('Frequency X');
    frequencyFolder.add(params, 'frequencyY', 0, 5).name('Frequency Y');
    frequencyFolder.add(params, 'frequencyZ', 0, 5).name('Frequency Z');
    frequencyFolder.add(params, 'frequencyS', 0, 5).name('Frequency S');

    dampingFolder.add(params, 'dampingX', 0.97, 1.0).name('Damping X');
    dampingFolder.add(params, 'dampingY', 0.97, 1.0).name('Damping Y');
    dampingFolder.add(params, 'dampingZ', 0.97, 1.0).name('Damping Z');
    dampingFolder.add(params, 'dampingS', 0.97, 1.0).name('Damping S');

    phaseFolder.add(params, 'phaseX', 0, Math.PI * 2).name('Phase X');
    phaseFolder.add(params, 'phaseY', 0, Math.PI * 2).name('Phase Y');
    phaseFolder.add(params, 'phaseZ', 0, Math.PI * 2).name('Phase Z');
    phaseFolder.add(params, 'phaseS', 0, Math.PI * 2).name('Phase S');

    function updateGuiDisplay() {
        [amplitudeFolder, frequencyFolder, dampingFolder, phaseFolder].forEach(folder => {
            folder.__controllers.forEach(controller => {
                controller.updateDisplay();
            });
        });
    }

    gui.add(params, 'reset').name('Reset Animation');
    gui.add(params, 'sceneSpeed', 0, 1).name('Scene Speed');

    function animate() {

        requestAnimationFrame(animate);

        controls.update();

        animateSnowfall(snowfall);

        // Move trees to simulate Santa moving forward
        scene.traverse(function(object) {
            if (object.isTree || object.isSnowman) { // Check for both trees and snowmen
                object.position.x += 1 * params.sceneSpeed; // Now affected by the slider
                if (object.position.x > bounds/2) {
                    object.position.x = -bounds/2;
                }
            }
        });

        t += 0.01;

        let x = params.amplitudeX * Math.sin(params.frequencyX * t + params.phaseX) + params.amplitudeS * Math.sin(params.frequencyS * t + params.phaseS);
        let y = params.amplitudeY * Math.sin(params.frequencyY * t + params.phaseY);
        let z = params.amplitudeZ * Math.sin(params.frequencyZ * t + params.phaseZ);

        santa.position.set(x, y+80, z);

        params.amplitudeX *= params.dampingX;
        params.amplitudeS *= params.dampingS;
        params.amplitudeY *= params.dampingY;
        params.amplitudeZ *= params.dampingZ;

        renderer.clear();

        renderer.render(scene, camera);
    }
    animate();
}

window.onload = init;


