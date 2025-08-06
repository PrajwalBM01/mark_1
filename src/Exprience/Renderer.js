import * as THREE from 'three'
import Exprience from './Experience'

export default class Renderer{
    constructor(){
        this.exprience = new Exprience();
        this.sizes = this.exprience.sizes;
        this.scene = this.exprience.scene;
        this.canvas = this.exprience.canvas;
        this.camera = this.exprience.camera;

        this.setIntstace()
    }

    setIntstace(){
        this.instance = new THREE.WebGLRenderer({
            canvas:this.canvas,
            antialias:true
        })
        // this.instance.outputEncoding = THREE.sRGBEncoding;
        // this.instance.toneMapping = THREE.ACESFilmicToneMapping;
        // this.instance.toneMappingExposure = 1;
        // this.instance.shadowMap.enabled = true;
        // this.instance.shadowMap.type = THREE.PCFSoftShadowMap;

        this.instance.setSize(this.sizes.width, this.sizes.height);
        this.instance.setPixelRatio(this.sizes.pixelRatio);
    }

    resize(){
        this.instance.setSize(this.sizes.width, this.sizes.height);
        this.instance.setPixelRatio(this.sizes.pixelRatio);
    }

    update(){
        this.instance.render(this.scene,this.camera.active_cam)
    }
}