import * as THREE from 'three';
import { GLTFLoader, OrbitControls, RectAreaLightHelper, RGBELoader } from 'three/examples/jsm/Addons.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { state } from './state';
import { setupAnimation } from './animation';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { inject } from "@vercel/analytics"

inject()

//plugins
gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(ScrollToPlugin);

// audio setup
const audioUrl = 'https://dt703ibthl19f.cloudfront.net/backinback%20(1).mp3';
const audio = new Audio(audioUrl);

// The rest of your code is perfect and can stay the same
audio.loop = true;
audio.preload = 'auto';

const audioPrompt = document.getElementById('audioPrompt');
const audioYesBtn = document.getElementById('audioYes');
const audioNoBtn = document.getElementById('audioNo');

if (audioYesBtn && audioNoBtn && audioPrompt) {
  audioYesBtn.addEventListener('click', async () => {
    try {
      // It's a good practice to handle the promise returned by play()
      await audio.play();
    } catch (err) {
      console.warn('Audio play was blocked by the browser. This usually requires user interaction.', err);
    }
    audioPrompt.classList.add('hidden');
  });

  audioNoBtn.addEventListener('click', () => {
    audioPrompt.classList.add('hidden');
  });
}


//loading manager
const loadingManager = new THREE.LoadingManager();
loadingManager.onProgress = ( url, itemsLoaded, itemsTotal ) => {
  const percent = (itemsLoaded/itemsTotal)
  document.getElementById('loading-bar').style.transform = `scaleX(${percent})`
};

loadingManager.onLoad = () => {
  setTimeout(() => {
    document.getElementById('screen').classList.remove('hidden')
    const loader = document.getElementById('loader')
    loader.style.opacity = '0'
    loader.style.transition = 'opacity 1s ease-out'
    setTimeout(() => {
      loader.classList.replace('flex','hidden')
      if (state.ironman_model) {
        setupAnimation()
      }
    }, 1000)
  }, 2000);
}

/* canvas */
const canvas = document.getElementById('engine');


/* scene */
const scene = new THREE.Scene();
state.scene = scene
scene.background = new THREE.Color(0x000000)

/* fog */
scene.fog = new THREE.Fog('black',10,15)

const hdriloader = new RGBELoader(loadingManager);
hdriloader.load('https://dt703ibthl19f.cloudfront.net/studio_small_09_1k.hdr', function(texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  state.metalTexture = texture
});

/* camera */
//main_cam
const main_cam = new THREE.PerspectiveCamera(
  75,
  window.innerWidth/window.innerHeight
)
main_cam.position.set(-4,12.5,14)
main_cam.rotation.set(-0.35885993397896615,-0.20114612999000137,-0.07480269320403296)
scene.add(main_cam)
main_cam.far = 50
state.camera = main_cam


/* lights */
const lights = {}

//ambientLight
const light = new THREE.AmbientLight()
light.intensity = 2
scene.add(light)
lights['ambientLight'] = light

//keylight1
const flateLight1 = new THREE.RectAreaLight(0xffffff,5,10,16)
flateLight1.position.set(0,10,20)
scene.add(flateLight1)
lights['flateLight1'] = flateLight1


const flateLight2 = new THREE.RectAreaLight(0xffffff,3,14,14)
flateLight2.position.set(0,5,12)
flateLight2.rotateX(-Math.PI/2)
scene.add(flateLight2)
lights['flateLight2'] = flateLight2

const keyLight = new THREE.DirectionalLight( 0xffffff, 1.5 );
keyLight.position.set(11.5,13,13)
keyLight.target.position.set(-6.5,-10.5,-2)
// keyLight.castShadow = true;
scene.add( keyLight );
lights['keyLight'] = keyLight


const fillLight = new THREE.DirectionalLight( 0xFF5F1F,4 );
// fillLight.castShadow = true;
fillLight.position.set(-16,0,18)
fillLight.target.position.set(34,22,-18)
scene.add( fillLight );
lights['fillLight'] = fillLight


const headLight = new THREE.DirectionalLight(0xffffff,0)
headLight.castShadow = true;
scene.add(headLight)
lights['headLight'] = headLight


state.lights = lights

/* rendere */
const renderer = new THREE.WebGLRenderer({
  canvas:canvas,
  antialias:true
})
renderer.setSize(window.visualViewport.width, window.visualViewport.height)
renderer.render(scene,main_cam)
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

//resize
window.addEventListener('resize',()=>{
  state.extraZ = (window.innerWidth < 640)? 5: 0
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); 
  renderer.setSize(window.visualViewport.width, window.visualViewport.height)
  main_cam.aspect = window.innerWidth/window.innerHeight
  main_cam.updateProjectionMatrix()
  renderer.render(scene,main_cam)
})

renderer.render(scene,main_cam)



/* objects */

//ironman
const loader = new GLTFLoader(loadingManager);
loader.load(
  'https://dt703ibthl19f.cloudfront.net/ironman.glb', 
  function (gltf) {
    const ironman = gltf.scene
    state.animation = gltf.animations
    scene.add(ironman); 
    state.ironman_model = ironman
    ironman.position.y = 1
    ironman.traverse(child=>{
      child.castShadow = true
      child.receiveShadow = true
      if(child.isGroup) {
        return null
      } else {
        const partInfo = {
          mesh:child,
          originalPosition: child.position.clone(),
          uuid :child.uuid
        }
        state.ironman_parts.push(partInfo)
        if(child.isMesh){
          child.position.set(
            Math.floor(Math.random() * (10 - (-10)+1))+ (-10),
            Math.floor(Math.random() * (10 - 0 + 1))+ (0),
            Math.floor(Math.random() * (30 - 15 + 1))+ (15)
          )
        }
      }
    })
  },
)

const scene_loader = new GLTFLoader(loadingManager);
scene_loader.load('https://dt703ibthl19f.cloudfront.net/background.glb',(gltf)=>{
  const background = gltf.scene;
  background.position.set(0,0,20)
  background.scale.set(10,10,10)
  const backgroundMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.85,  
    metalness: 0.0, 
    dithering: true
});
state.backdropMaterial = backgroundMaterial
  background.traverse(child=>{
    if (child) {
      child.material = backgroundMaterial;
      child.castShadow = true;
      child.receiveShadow = true;
  }
  })
  scene.add(background)
})



const animate = () =>{
  window.requestAnimationFrame(animate)
  renderer.render(scene, main_cam)
}

animate()
