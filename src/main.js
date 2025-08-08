import * as THREE from 'three';
import { GLTFLoader, OrbitControls, RectAreaLightHelper } from 'three/examples/jsm/Addons.js';

import '@theatre/core'
import studio from '@theatre/studio'
import { getProject, types } from '@theatre/core'
studio.initialize()
studio.ui.hide()
//creating a project for the animation
const project = getProject('MARK 1')
const sheet = project.sheet("scene")


import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { state } from './state';
import { setupAnimation } from './animation';

// 1. REGISTER THE PLUGIN - This is mandatory.
gsap.registerPlugin(ScrollTrigger);


//loading manager
const loadingManager = new THREE.LoadingManager();
// loadingManager.onProgress = ( url, itemsLoaded, itemsTotal ) => {
//   const percent = (itemsLoaded/itemsTotal)
//   document.getElementById('loading-bar').style.transform = `scaleX(${percent})`
// };

// loadingManager.onLoad = () => {
//   setTimeout(() => {
//     document.getElementById('screen').classList.remove('hidden')
//     const loader = document.getElementById('loader')
//     loader.style.opacity = '0'
//     loader.style.transition = 'opacity 1s ease-out'
//     setTimeout(() => {
//       loader.classList.replace('flex','hidden')
//       if (state.ironman_model) {
//         setupAnimation()
//       }
//     }, 1000)
//   }, 2000);
// }

/* canvas */
const canvas = document.getElementById('engine');
canvas.color



/* scene */
const scene = new THREE.Scene();
// scene.background = new THREE.Color(0x1a1a1a)

/* fog */
// scene.fog = new THREE.Fog('black',10,15)2



/* camera */
//main_cam
const main_cam = new THREE.PerspectiveCamera(
  75,
  window.innerWidth/window.innerHeight
)
main_cam.position.set(-4,12.5,14)
main_cam.rotation.set(-0.35885993397896615,-0.20114612999000137,-0.07480269320403296)
scene.add(main_cam)
const camerHelper = new THREE.CameraHelper(main_cam);
// scene.add(camerHelper)

//scenondary_cam
const scene_cam = new THREE.PerspectiveCamera(
  75,
  window.innerWidth/window.innerHeight
)
scene_cam.position.z = 50
scene.add(scene_cam)

let active_cam = main_cam
window.addEventListener('keydown',(e)=>{
  if(e.key === '1'){
    active_cam = main_cam
  }
  if(e.key === '2'){
    active_cam = scene_cam
    controls.object = scene_cam
  }
})


/* lights */

//ambientLight
const light = new THREE.AmbientLight()
light.intensity = 2
scene.add(light)

//keylight1
const keyLight = new THREE.RectAreaLight(0xffffff,5,10,16)
keyLight.position.set(0,10,20)
scene.add(keyLight)


const keyLight2 = new THREE.RectAreaLight(0xffffff,3,14,14)
keyLight2.position.set(0,5,12)
keyLight2.rotateX(-Math.PI/2)
scene.add(keyLight2)


const directionalLight = new THREE.DirectionalLight( 0xFF5F1F );
directionalLight.castShadow = true;
directionalLight.position.set(-16,0,18)
directionalLight.target.position.set(34,22,-18)
scene.add( directionalLight );


const directionalLight2 = new THREE.DirectionalLight( 0xffffff, 1.5 );
directionalLight2.position.set(11.5,13,13)
directionalLight2.target.position.set(-6.5,-10.5,-2)
directionalLight2.castShadow = true;
scene.add( directionalLight2 );


/* rendere */
const renderer = new THREE.WebGLRenderer({
  canvas:canvas,
  antialias:true
})
renderer.setSize(window.innerWidth,window.innerHeight)
renderer.render(scene,active_cam)
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

//resize
window.addEventListener('resize',()=>{
  renderer.setSize(window.innerWidth,window.innerHeight)
  active_cam.aspect = window.innerWidth/window.innerHeight
  active_cam.updateProjectionMatrix()
  renderer.render(scene,active_cam)
})

renderer.render(scene,active_cam)







/* objects */

//ironman
const loader = new GLTFLoader(loadingManager);
loader.load(
  '/finals/letsbegin.glb', 
  function (gltf) {
    const ironman = gltf.scene
    scene.add(ironman); 
    state.ironman_model = ironman
    ironman.traverse(child=>{
      child.castShadow = true
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
    setupAnimation()
  },
)

const scene_loader = new GLTFLoader(loadingManager);
scene_loader.load('background.glb',(gltf)=>{
  const background = gltf.scene;
  background.position.set(0,0,10)
  background.scale.set(10,10,10)
  const darkMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 1,
    dithering: true
});
  background.traverse(child=>{
    if (child) {
      child.material = darkMaterial;
      child.castShadow = true;
  }
  })
  scene.add(background)
})








const controls = new OrbitControls(scene_cam,renderer.domElement)
const animate = () =>{
  let minIntensity = 0.1;
  let maxIntensity = 8;
  let flickering = 15;
  directionalLight.intensity = minIntensity + (Math.sin(Date.now() * flickering) + 1) / 2 * (maxIntensity - minIntensity);
  window.requestAnimationFrame(animate)
  renderer.render(scene, active_cam)
  controls.update()
}

animate()




// javascript
const toggleON = document.getElementById('turnon')
const toggleOff = document.getElementById('turnoff')
const metalAudio = document.getElementById('metal')
const ts = document.getElementById('tonstark')
toggleON.addEventListener('click',()=>{
  state.mute = false
  metalAudio.muted = false;
  ts.muted = false
  ts.play()
  metalAudio.play()
  toggleON.classList.replace('text-blueprintGray','text-red-900')
  if(toggleOff.classList.contains('text-red-900')){
    toggleOff.classList.replace('text-red-900','text-blueprintGray')
  }
})

toggleOff.addEventListener('click',()=>{
  state.mute = true
  metalAudio.muted = true;
  toggleOff.classList.replace('text-blueprintGray','text-red-900')
  if(toggleON.classList.contains('text-red-900')){
    toggleON.classList.replace('text-red-900','text-blueprintGray')
  }
})

