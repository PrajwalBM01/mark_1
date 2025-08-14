import * as THREE from 'three';
import { GLTFLoader, OrbitControls, RectAreaLightHelper, RGBELoader } from 'three/examples/jsm/Addons.js';

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
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

// 1. REGISTER THE PLUGIN - This is mandatory.
gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(ScrollToPlugin);


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
state.scene = scene
scene.background = new THREE.Color(0x000000)

/* fog */
scene.fog = new THREE.Fog('black',10,15)

const hdriloader = new RGBELoader(loadingManager);
hdriloader.load('/finals/studio_small_09_1k.hdr', function(texture) {
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
const camerHelper = new THREE.CameraHelper(main_cam);
// scene.add(camerHelper)

//scenondary_cam
const scene_cam = new THREE.PerspectiveCamera(
  75,
  window.innerWidth/window.innerHeight
)
scene_cam.position.set(0,10,40)
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

const keyLightHelper = new THREE.DirectionalLightHelper(keyLight,5);
// scene.add(keyLightHelper)
// lights['keylightHelper'] = keyLightHelper


const fillLight = new THREE.DirectionalLight( 0xFF5F1F,4 );
// fillLight.castShadow = true;
fillLight.position.set(-16,0,18)
fillLight.target.position.set(34,22,-18)
scene.add( fillLight );
lights['fillLight'] = fillLight
const fillLightHelper = new THREE.DirectionalLightHelper(fillLight,5);
// scene.add(fillLightHelper)
// lights['filllighthelper'] = fillLightHelper


const headLight = new THREE.DirectionalLight(0xffffff,0)
headLight.castShadow = true;
scene.add(headLight)
lights['headLight'] = headLight
const headLightHelper = new THREE.DirectionalLightHelper(headLight,5);
// scene.add(headLightHelper)
// lights['headlighthelper'] = headLightHelper


state.lights = lights

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
  state.extraZ = (window.innerWidth < 640)? 5: 0
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
  '/finals/animated.glb', 
  function (gltf) {
    const ironman = gltf.scene
    state.animation = gltf.animations
    scene.add(ironman); 
    console.log(ironman)
    state.ironman_model = ironman
    ironman.position.y = 1
    // ironman.position.z = 1
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
    // const ironMan_controler = sheet.object("ironman",{
    //   position:{
    //     x:types.number(0,{range:[-10,10],nudgeMultiplier:0.01}),
    //     y:types.number(0,{range:[-10,10],nudgeMultiplier:0.01}),
    //     z:types.number(0,{range:[-50,10],nudgeMultiplier:0.01}),
    //   }
    // })
    // ironMan_controler.onValuesChange(value=>{
    //   ironman.position.set(value.position.x,value.position.y,value.position.z)
    // })
    setupAnimation()
  },
)

const scene_loader = new GLTFLoader(loadingManager);
scene_loader.load('background.glb',(gltf)=>{
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



const controls = new OrbitControls(scene_cam,renderer.domElement)
const animate = () =>{
  window.requestAnimationFrame(animate)
  renderer.render(scene, active_cam)
  controls.update()
}

animate()



// javascript
// const toggleON = document.getElementById('turnon')
// const toggleOff = document.getElementById('turnoff')
// const metalAudio = document.getElementById('metal')
// toggleON.addEventListener('click',()=>{
//   metalAudio.muted = false;
//   metalAudio.play()
//   toggleON.classList.replace('text-blueprintGray','text-red-900')
//   if(toggleOff.classList.contains('text-red-900')){
//     toggleOff.classList.replace('text-red-900','text-blueprintGray')
//   }
// })

// toggleOff.addEventListener('click',()=>{
//   metalAudio.muted = true;
//   toggleOff.classList.replace('text-blueprintGray','text-red-900')
//   if(toggleON.classList.contains('text-red-900')){
//     toggleON.classList.replace('text-red-900','text-blueprintGray')
//   }
// })

// const scrollLinks = document.querySelectorAll('.scroll-link');

// scrollLinks.forEach(link=>{
//  link.addEventListener('click',(e=>{
//   e.preventDefault()
//   const targetElement = link.getAttribute('href');
//   if(targetElement){
//     gsap.to(window, {
//       ease: "power2.inOut", 
//       scrollTo: {
//         y: targetElement, 
//         offsetY: -1 
//       }
//     });
//   }
//  }))
// })

// window.onbeforeunload = () => {
//   window.scrollTo(0, 0);
// };

// window.addEventListener('load', () => {
//   window.scrollTo(0, 0);
// });

// document.querySelectorAll('.fixed-header').forEach(header=>{
//   header.addEventListener('dblclick',()=>{
//     console.log('clikced',header.dataset.section)
//   })
//   console.log(header)

// });


// const navbar = document.getElementById('navbar')
// console.log('Navbar element:', navbar)

// // Get and log the bounding rectangle
// const navbarRect = navbar.getBoundingClientRect()
// console.log('Navbar getBoundingClientRect():', navbarRect)

// // Log the dimensions and position
// console.log('Navbar dimensions:', {
//   width: navbarRect.width,
//   height: navbarRect.height,
//   top: navbarRect.top,
//   left: navbarRect.left,
//   right: navbarRect.right,
//   bottom: navbarRect.bottom
// })