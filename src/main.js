import * as THREE from 'three'
import { GLTFLoader, OrbitControls, RectAreaLightHelper } from 'three/examples/jsm/Addons.js'
// Import Theatre.js core first!
import '@theatre/core'
import studio from '@theatre/studio'
import { getProject, types } from '@theatre/core'

//theater
studio.initialize()
//creating a project for the animation
const project = getProject('MARK 1')
const sheet = project.sheet("scene")



// studio.ui.hide() // Uncomment if you want to hide the UI

//canvas
const canvas = document.getElementById('engine')

//scene
const scene = new THREE.Scene()

//fog 
scene.fog = new THREE.Fog('black',10,15)
const fog_contorler = sheet.object('fog',{
  near:types.number(5,{range:[0,1000],nudgeMultiplier:1}),
  far:types.number(15,{range:[0,1000],nudgeMultiplier:1})
})
fog_contorler.onValuesChange(value=>{
  scene.fog.near = value.near;
  scene.fog.far = value.far;
})

//camera
const camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight)
camera.position.set(-4.5,13,22.2)
camera.rotation.set(-0.4566054718924939,-0.23194744016787075,-0.11244388299728232)
camera.near = 5
scene.add(camera)

// const camera_controls = sheet.object("camera",{
//   fov:types.number(75,{range:[75,100],nudgeMultiplier:1}),
//   near:types.number(5,{range:[5,1000],nudgeMultiplier:1}),
//   far:types.number(100,{range:[10,1000],nudgeMultiplier:1})
// })

// camera_controls.onValuesChange(values=>{
//   camera.fov = values.fov;
//   camera.near = values.near;
//   camera.far = values.far
//   camera.updateProjectionMatrix()
// })


const capture = document.getElementById('capture')
capture.addEventListener('click',()=>{
  console.log(camera.position)
  console.log(camera.rotation)
})

//camera helper
const camerHelper = new THREE.CameraHelper(camera);
// scene.add(camerHelper)

//secondary CAmera
const scene_camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight);
scene_camera.position.set(0,5,50)
scene.add(scene_camera)

let active_camera = camera
window.addEventListener('keydown', function(event) {
  if (event.key === '1') {
    active_camera = camera;
    controls.object = active_camera;
  }
  if (event.key === '2') {
    active_camera = scene_camera
    controls.object = active_camera;
  }
});


//floor
const floor = new THREE.PlaneGeometry()

//floor textures 
const texture_loader = new THREE.TextureLoader();
const diffuseMap     = texture_loader.load('texture/diffuse.jpg');      // Albedo/base color
const normalMap      = texture_loader.load('texture/normal.jpg');       // Normal map
const aoMap          = texture_loader.load('texture/ao.jpg');           // Ambient occlusion
const roughnessMap   = texture_loader.load('texture/rough.jpg');    // Roughness
const metalnessMap   = texture_loader.load('texture/metal.jpg');        // Metalness
const displacementMap= texture_loader.load('texture/displacement.jpg'); // Displacement (height)
const material = new THREE.MeshStandardMaterial({
  map: diffuseMap,                // Diffuse (albedo)
  normalMap: normalMap,           // Normal details
  aoMap: aoMap,                   // Ambient occlusion
  roughnessMap: roughnessMap,     // Roughness
  metalnessMap: metalnessMap,     // Metalness
  displacementMap: displacementMap, // Displacement
  displacementScale: 0.05,        // Adjust for amount of height effect
  roughness: 1,                   // Use if you have a roughnessMap, set to 1
  metalness: 1,                   // Use if you have a metalnessMap, set to 1
});
const floor_mesh = new THREE.Mesh(floor,material)
floor_mesh.rotation.x = -Math.PI/2
floor_mesh.receiveShadow = true
// scene.add(floor_mesh)


const floor_controls = sheet.object("floor_controls",{
  position:{
    x:0,
    y:0,
    z:0
  },
  size:{
    height:types.number(5,{range:[0,100],nudgeMultiplier:1}),
    width:types.number(5,{range:[0,100],nudgeMultiplier:1})
  }
})

floor_controls.onValuesChange(value=>{
  const {x,y,z} = value.position
  const { width, height } = value.size;

  floor_mesh.position.set(x,y,z)
  floor_mesh.geometry.dispose();
  floor_mesh.geometry = new THREE.PlaneGeometry(width, height);
});



//iron man model
const loader = new GLTFLoader();
loader.load(
  'ironman.glb', // Path to the .glb file
  function (gltf) {
    const ironman = gltf.scene
    scene.add(ironman); 
    const ironMan_controler = sheet.object("ironman",{
      position:{
        x:types.number(0,{range:[-10,10],nudgeMultiplier:0.01}),
        y:types.number(0,{range:[-10,10],nudgeMultiplier:0.01}),
        z:types.number(0,{range:[-50,10],nudgeMultiplier:0.01}),
      }
    })
    ironMan_controler.onValuesChange(value=>{
      ironman.position.set(value.position.x,value.position.y,value.position.z)
    })
  },
  function (xhr) {
    // Called while loading is progressing
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },
  function (error) {
    // Called if loading has errors
    console.error('An error happened', error);
  })

//scene_model
const scene_loader = new GLTFLoader();
scene_loader.load('background.glb',(gltf)=>{
  const background = gltf.scene;
  background.position.set(0,0,0)
  background.rotation.y = -Math.PI/2
  background.scale.set(10,10,10)
  const darkMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.5,
    dithering: true
});
  background.traverse(child=>{
    console.log(child)
    if (child.isMesh) {
      child.material = darkMaterial;
      child.castShadow = true;
  }
  })
  scene.add(background)
})


//rendrer
const renderer = new THREE.WebGLRenderer({
  canvas:canvas,
  antialias:true
})
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping; // <<< ADD THIS LINE
renderer.toneMappingExposure = 1; 

renderer.setSize(window.innerWidth,window.innerHeight)

window.addEventListener('resize',()=>{
  renderer.setSize(window.innerWidth,window.innerHeight)
  active_camera.aspect = window.innerWidth/window.innerHeight
  active_camera.updateProjectionMatrix()
  renderer.render(scene,active_camera)
})

renderer.render(scene,active_camera)



//lights
//ambient light
const light = new THREE.AmbientLight()
light.intensity = 2
scene.add(light)

//keylight
const keyLight = new THREE.RectAreaLight(0xffffff)
keyLight.castShadow = true
scene.add(keyLight)
const keyLight_helper = new RectAreaLightHelper(keyLight)
keyLight.add(keyLight_helper)
const keylight_controls = sheet.object("keyLight",{
  size:{
    width:types.number(5,{range:[5,20],nudgeMultiplier:1}),
    height:types.number(5,{range:[5,20],nudgeMultiplier:1})
  },
  intensity:types.number(0,{range:[0,100],nudgeMultiplier:0.01}),
  position:{
    x:types.number(0,{range:[0,80],nudgeMultiplier:1}),
    y:types.number(0,{range:[0,80],nudgeMultiplier:1}),
    z:types.number(0,{range:[0,80],nudgeMultiplier:1}),
  },
  lookup:{
    xL:types.number(0,{range:[0,50],nudgeMultiplier:1}),
    yL:types.number(0,{range:[0,50],nudgeMultiplier:1}),
    zL:types.number(0,{range:[0,50],nudgeMultiplier:1}),
  },
  rotation:{
    xR:types.number(0,{range:[-50,50],nudgeMultiplier:0.01}),
    yR:types.number(0,{range:[-50,50],nudgeMultiplier:0.01}),
    zR:types.number(0,{range:[-50,50],nudgeMultiplier:0.01})
  }
})

keylight_controls.onValuesChange(value=>{
  keyLight.width = value.size.width;
  keyLight.height = value.size.height;
  keyLight.intensity = value.intensity;
  const {x,y,z} = value.position;
  const {xL,yL,zL} = value.lookup;
  keyLight.lookAt(xL,yL,zL)
  keyLight.position.set(x,y,z)
  keyLight.rotation.set(value.rotation.xR*Math.PI/2,value.rotation.yR*Math.PI/2,value.rotation.zR*Math.PI/2)
})

//directional light
const directionalLight = new THREE.DirectionalLight( 0xFF5F1F, 0.5 );
directionalLight.castShadow = true;
directionalLight.position.set(-18,26,20)
directionalLight.target.position.set(21,16,-50)
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add( directionalLight );


//directional light
const directionalLight2 = new THREE.DirectionalLight( 0xffffff, 1.5 );
directionalLight2.position.set(1,16,14)
directionalLight2.target.position.set(5,-12,-5)
directionalLight2.castShadow = true;
scene.add( directionalLight2 );

let minIntensity = 0.1;
let maxIntensity = 3;
let flickering = 15;

function flicker(){
  window.requestAnimationFrame(flicker)
  directionalLight.intensity = minIntensity + (Math.sin(Date.now() * flickering) + 1) / 2 * (maxIntensity - minIntensity);
  renderer.render(scene,active_camera)
}
flicker()


//oribit controls
const controls = new OrbitControls(active_camera,renderer.domElement)
controls.enableDamping = true
const clock = new THREE.Clock()
const animate = () =>{
    window.requestAnimationFrame(animate)
    renderer.render(scene, active_camera)
    controls.update()
}

animate()