import * as THREE from 'three'
import Time from "./Utils/Time"
import Camera from './Camera'
import Renderer from './Renderer'
import Sizes from './Utils/Sizes'
import World from './World'

let instance = null;

export default class Exprience {
    constructor(canvas){
        if(instance){
            return instance
        }

        instance = this;

        window.exprience = this

        this.canvas = canvas
        this.sizes = new Sizes()
        this.scene = new THREE.Scene()
        // this.scene.fog = new THREE.Fog('black',10,15)
        this.time = new Time()
        this.camera = new Camera()
        this.renderer = new Renderer()
        this.world = new World()

        this.sizes.on('resize',()=>{
            this.resize()
        })

        this.time.on('ticktick',()=>{
            this.update();
        })
    }

    resize(){
        this.camera.resize();
        this.renderer.resize();
    }

    update(){
        this.camera.update();
        this.renderer.update()
    }
}