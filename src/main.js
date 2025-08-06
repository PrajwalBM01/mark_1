import * as THREE from 'three';
import { GLTFLoader, OrbitControls, RectAreaLightHelper } from 'three/examples/jsm/Addons.js';

import '@theatre/core'
import studio from '@theatre/studio'
import { getProject, types } from '@theatre/core'
studio.initialize()
//creating a project for the animation
const project = getProject('MARK 1')
const sheet = project.sheet("scene")


import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { moved_position, moved_rotation, state } from './state';
import { setupAnimation } from './animation';

// 1. REGISTER THE PLUGIN - This is mandatory.
gsap.registerPlugin(ScrollTrigger);


//loading manager
const loadingManager = new THREE.LoadingManager(
  ()=>{
    // console.log("on load")
  },
  ()=>{
    // console.log("progress")
  },
  ()=>{
    // console.log('error')
  }
);

/* canvas */
const canvas = document.getElementById('engine');
canvas.color



/* scene */
const scene = new THREE.Scene();
// scene.background = new THREE.Color(0x1a1a1a)

/* fog */
// scene.fog = new THREE.Fog('black',10,15)



/* camera */
//main_cam
const main_cam = new THREE.PerspectiveCamera(
  75,
  window.innerWidth/window.innerHeight
)
main_cam.position.set(-4,12.5,20)
main_cam.rotation.set(-0.35885993397896615,-0.20114612999000137,-0.07480269320403296)
scene.add(main_cam)
const camerHelper = new THREE.CameraHelper(main_cam);
scene.add(camerHelper)

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
  'organised.glb', 
  function (gltf) {
    const ironman = gltf.scene
    scene.add(ironman); 
    state.ironman_model = ironman
    let x=0
    ironman.traverse(child=>{
      state.ironman_parts[child.name] = child
      state.position[child.name] = child.position.clone()
      state.roatatio[child.name] = child.rotation.clone()
      const position = moved_position[x]
      const rotatation = moved_rotation[x]
      child.position.set(position.x,position.y,position.z)
      child.rotation.set(rotatation._x,rotatation._y,rotatation._z)
      x +=1
      
    })
    // console.log(state.position)
    // ironman.position.set(0,1.5,3)
    // ironman.rotation.set(-Math.PI/2,0,0)
    // console.log(ironman)
    // console.log(ironman.children)
    // const ironMan_controler = sheet.object("ironman",{
    //   position:{
    //     x:types.number(0,{range:[-10,50],nudgeMultiplier:0.01}),
    //     y:types.number(0,{range:[-10,50],nudgeMultiplier:0.01}),
    //     z:types.number(0,{range:[-50,50],nudgeMultiplier:0.01}),
    //   },
    //   rotation:{
    //         xR:types.number(0,{range:[-50,50],nudgeMultiplier:0.01}),
    //         yR:types.number(0,{range:[-50,50],nudgeMultiplier:0.01}),
    //         zR:types.number(0,{range:[-50,50],nudgeMultiplier:0.01})
    //       }
    // })
    // ironMan_controler.onValuesChange(value=>{
    //   ironman.position.set(value.position.x,value.position.y,value.position.z)
    //   ironman.rotation.set(value.rotation.xR*Math.PI/2,value.rotation.yR*Math.PI/2,value.rotation.zR*Math.PI/2)
    // })
    setupAnimation()
  },
  function (xhr) {
    // Called while loading is progressing
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },
  function (error) {
    // Called if loading has errors
    console.error('An error happened', error);
  })

const scene_loader = new GLTFLoader(loadingManager);
scene_loader.load('background.glb',(gltf)=>{
  const background = gltf.scene;
  background.position.set(0,0,20)
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