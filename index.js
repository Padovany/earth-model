import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js"
import { getFresnelMat } from "./src/getFresnelMat.js";
import getStarfield from "./src/getStarfield.js";

// Setting up the renderer
const w = window.innerWidth;
const h = window.innerHeight;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
const canvas = document.body.appendChild(renderer.domElement);
if(window.innerWidth <= 767) {
    
}

// Setting up the camera
const fov = 75;
const aspect = w / h;
const near = 0.1;
const far = 1000;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 3;

// Setting up the scene
const scene = new THREE.Scene();

// Setting up controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.03;

class Earth {
    constructor(radius, detail, rotation) {
        this.radius = radius;
        this.detail = detail;
        this.rotation = rotation;
        this.animationRotationRate = 0 //0.001;

        this.loader = new THREE.TextureLoader();
        this.earthGeometry = new THREE.IcosahedronGeometry(this.radius, this.detail);
        this.earthGroup = new THREE.Group()
        this.earthGroup.rotation.z = this.rotation;

        // -- Materials
        this.textureMaterial = new THREE.MeshPhongMaterial({
            map: this.loader.load("./textures/00_earthmap1k.jpg"),
            specularMap: this.loader.load("./textures/02_earthspec1k.jpg"),
            bumpMap: this.loader.load("./textures/01_earthbump1k.jpg"),
            bumpScale: 0.4
        });
        this.lightsMaterial = new THREE.MeshBasicMaterial({
            map: this.loader.load("./textures/03_earthlights1k.jpg"),
            blending: THREE.AdditiveBlending
        })
        this.cloudsMaterial = new THREE.MeshStandardMaterial({
            map: this.loader.load("./textures/04_earthcloudmap.jpg"),
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            alphaMap: this.loader.load("./textures/05_earthcloudmaptrans.jpg")
        })
        this.fresnelMat = getFresnelMat();

        // -- Meshes
        this.textureMesh = new THREE.Mesh(this.earthGeometry, this.textureMaterial);
        this.lightsMesh = new THREE.Mesh(this.earthGeometry, this.lightsMaterial);
        this.cloudsMesh = new THREE.Mesh(this.earthGeometry, this.cloudsMaterial);
        this.glowMesh = new THREE.Mesh(this.earthGeometry, this.fresnelMat);

        this.cloudsMesh.scale.setScalar(1.003)
        this.glowMesh.scale.setScalar(1.01);


        this.hasTexture = true;
        this.hasLights = true;
        this.hasClouds = true;
        this.hasGlow = true;

        this.earthGroup.add(this.textureMesh);
        this.earthGroup.add(this.lightsMesh);
        this.earthGroup.add(this.cloudsMesh);
        this.earthGroup.add(this.glowMesh);
    }

    toggleTexture() {
        if(this.hasTexture) {
            this.hasTexture = false;
            this.earthGroup.remove(this.textureMesh);
        } else {
            this.hasTexture = true;
            this.earthGroup.add(this.textureMesh);
        }
    }

    toggleLights() {
        if(this.hasLights) {
            this.hasLights = false;
            this.earthGroup.remove(this.lightsMesh);
        } else {
            this.hasLights = true;
            this.earthGroup.add(this.lightsMesh);
        }
    }

    toggleClouds() {
        if(this.hasClouds) {
            this.hasClouds = false;
            this.earthGroup.remove(this.cloudsMesh);
        } else {
            this.hasClouds = true;
            this.earthGroup.add(this.cloudsMesh);
        }
    }

    toggleGlow() {
        if(this.hasGlow) {
            this.hasGlow = false;
            this.earthGroup.remove(this.glowMesh);
        } else {
            this.hasGlow = true;
            this.earthGroup.add(this.glowMesh);
        }
    }

    animate() {
        this.textureMesh.rotation.y += this.animationRotationRate;
        this.lightsMesh.rotation.y += this.animationRotationRate;
        this.cloudsMesh.rotation.y += this.animationRotationRate + 0.0003;
        this.glowMesh.rotation.y += this.animationRotationRate;
    }

}

// Earth
const earth = new Earth(1, 12, 0)//-23.4 * Math.PI / 180)
scene.add(earth.earthGroup)

// Stars
const stars = getStarfield({ numStars: 10000 });
scene.add(stars);

// Sun
const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
sunLight.position.set(-2, 0.5, 1.5);
scene.add(sunLight);

// Controls
const controller = {
    texture: document.getElementById("texture-btn"),
    lights: document.getElementById("lights-btn"),
    clouds: document.getElementById("clouds-btn"),
    glow: document.getElementById("glow-btn")
}

controller.texture.addEventListener("click", () => earth.toggleTexture());
controller.lights.addEventListener("click", () => earth.toggleLights());
controller.clouds.addEventListener("click", () => earth.toggleClouds());
controller.glow.addEventListener("click", () => earth.toggleGlow());

function animate(t = 0) {
    requestAnimationFrame(animate);
    earth.animate()
    renderer.render(scene, camera);
    controls.update()
}

animate();
