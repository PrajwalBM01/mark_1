import * as THREE from 'three';
import Exprience from './Experience';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

export default class Camera {
    constructor(){
        this.exprience = new Exprience();
        this.sizes = this.exprience.sizes;
        this.scene = this.exprience.scene;
        this.canvas = this.exprience.canvas;

        this.setInstance();
        this.setOrbitControls();
        this.setActivecam();
        

    }
    setInstance(){
        this.instance = new THREE.PerspectiveCamera(
            15,
            this.sizes.width/this.sizes.height,
        )
        this.instance.position.set(-4.8,15,20)
        this.instance.rotation.set(-0.4153098162087995,-0.24321319213437845,-0.10579628310791193)
        this.instance.near = 5
        this.scene.add(this.instance)

        this.scene_camera = new THREE.PerspectiveCamera(
            75,
            this.sizes.width/this.sizes.height
        )
        this.scene_camera.position.set(0,5,50)
        this.scene.add(this.scene_camera)

        this.active_cam = this.instance
    }

    setOrbitControls(){
        this.controls = new OrbitControls(this.active_cam, this.canvas)
        this.controls.enableDamping = true
    }

    resize(){
        this.instance.aspect = this.sizes.width/this.sizes.height
        this.instance.updateProjectionMatrix();


        this.scene_camera.aspect = this.sizes.width/this.sizes.height
        this.scene_camera.updateProjectionMatrix();

    }

    update(){
        this.controls.update()
    }

    setActivecam(){
        window.addEventListener('keydown',(e)=>{
            if(e.key==='1'){
                this.active_cam = this.instance
                this.controls.object = this.active_cam
            }
            if(e.key==='2'){
                this.active_cam = this.scene_camera
                this.controls.object = this.active_cam
            }
        })
    }
}