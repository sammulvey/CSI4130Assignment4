// Sam Mulvey
// 300201795
// Assignment 2

import * as THREE from 'three';
import { GUI } from 'dat.gui';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let topCamera = 0;
let frontCamera = 0;
let renderer = 0;
let t = 0;
let dysonSphere = 0;
const loader = new GLTFLoader();

function init() {

    var scene = new THREE.Scene();
    frontCamera = new THREE.PerspectiveCamera(75, window.innerWidth / 2 / window.innerHeight, 0.1, 1000);
    topCamera = new THREE.PerspectiveCamera(75, window.innerWidth / 2 / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer: true });
    renderer.autoClearColor = false;
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    frontCamera.position.set(0, 0, 75);
    topCamera.position.set(0, 75, 0);
    topCamera.lookAt(scene.position);

    frontCamera.aspect = window.innerWidth / 2 / window.innerHeight;
    frontCamera.updateProjectionMatrix();
    topCamera.aspect = window.innerWidth / 2 / window.innerHeight;
    topCamera.updateProjectionMatrix();

    loader.load( 'scene.gltf', function ( gltf ) {
        dysonSphere = gltf.scene
        dysonSphere.scale.set(0.3, 0.3, 0.3);
        scene.add(dysonSphere);
    }, undefined, function ( error ) {
        console.error( error );
    } );

    renderer.setScissorTest(true);

    renderer.setScissor(0, 0, window.innerWidth / 2, window.innerHeight);
    renderer.setViewport(0, 0, window.innerWidth / 2, window.innerHeight);
    renderer.setClearColor(0x8EC8E8);
    renderer.clear();

    renderer.setScissor(window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight);
    renderer.setViewport(window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight);
    renderer.setClearColor(0x8E8E8E);
    renderer.clear();

    renderer.setScissorTest(false);

    const ambientLight = new THREE.AmbientLight(0xffffff, 10);
    scene.add(ambientLight);
  
    var params = {
        amplitudeX: 10, frequencyX: 2, phaseX: 0.0, dampingX: 0.9999,
        amplitudeY: 15, frequencyY: 3, phaseY: 0.0, dampingY: 0.9999,
        amplitudeZ: 5,  frequencyZ: 1.8, phaseZ: 0.5, dampingZ: 0.9999,
        amplitudeS: 5, frequencyS: 2, phaseS: 0.0, dampingS: 0.9999,
        toggleTrail: true,
        reset: function() {
            t = 0;
            this.amplitudeX = 10; this.frequencyX = 2; this.phaseX = 0.0; this.dampingX = 0.9999;
            this.amplitudeY = 15; this.frequencyY = 3; this.phaseY = 0.0; this.dampingY = 0.9999;
            this.amplitudeZ = 5;  this.frequencyZ = 1.8; this.phaseZ = 0.5; this.dampingZ = 0.9999;
            this.amplitudeS = 5;  this.frequencyS = 2; this.phaseS = 0.0; this.dampingS = 0.9999;
            this.toggleTrail = true;
            if (dysonSphere) {
                dysonSphere.position.set(0, 0, 0);
            }
            renderer.clear();

            updateGuiDisplay();
            toggleTrailControl.updateDisplay();
        }
    };

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

    var toggleTrailControl = gui.add(params, 'toggleTrail').name('Toggle Trail');
    gui.add(params, 'reset').name('Reset Animation');

    function animate() {

        requestAnimationFrame(animate);
        t += 0.01;

        let x = params.amplitudeX * Math.sin(params.frequencyX * t + params.phaseX) + params.amplitudeS * Math.sin(params.frequencyS * t + params.phaseS);
        let y = params.amplitudeY * Math.sin(params.frequencyY * t + params.phaseY);
        let z = params.amplitudeZ * Math.sin(params.frequencyZ * t + params.phaseZ);

        dysonSphere.position.set(x, y, z);

        params.amplitudeX *= params.dampingX;
        params.amplitudeS *= params.dampingS;
        params.amplitudeY *= params.dampingY;
        params.amplitudeZ *= params.dampingZ;
        
        if (!params.toggleTrail) {
            renderer.clear();
        }
    
        renderer.setScissorTest(true);

        renderer.setScissor(0, 0, window.innerWidth / 2, window.innerHeight);
        renderer.setViewport(0, 0, window.innerWidth / 2, window.innerHeight);
        if (!params.toggleTrail || t === 0.01) {
            renderer.setClearColor(0x8EC8E8);
            renderer.clear();
        }
        renderer.render(scene, frontCamera);

        renderer.setScissor(window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight);
        renderer.setViewport(window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight);
        if (!params.toggleTrail || t === 0.01) {
            renderer.setClearColor(0x8E8E8E);
            renderer.clear();
        }
        renderer.render(scene, topCamera);

        renderer.setScissorTest(false);

    }

    animate();

}

window.onload = init;


