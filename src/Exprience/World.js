import * as THREE from 'three'
import Exprience from "./Experience";
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

export default class World {
    constructor(){
        this.exprience = new Exprience()
        this.scene = this.exprience.scene

        const textMesh = new THREE.Mesh(
            new THREE.BoxGeometry(1,1,1),
            new THREE.MeshBasicMaterial({wireframe:true})
        )
        this.scene.add(textMesh)
        
        
    }
}