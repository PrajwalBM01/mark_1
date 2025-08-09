import gsap from "gsap";
import { state } from "./state";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import * as THREE from 'three'

gsap.registerPlugin(ScrollTrigger);
const lenis = new Lenis({
  smoothWheel: true 
})

function raf(time) {
  lenis.raf(time) 
  requestAnimationFrame(raf)
}
requestAnimationFrame(raf)

lenis.on('scroll', ScrollTrigger.update)

gsap.registerPlugin(SplitText) 

export function setupAnimation(){

  console.log(state.scene)
  const filtered_parts = state.ironman_parts.filter(part=>{
    if(part.mesh.isMesh){
      return part.mesh.position
    }
  })

  const tl = gsap.timeline({
      defaults:{duration:8,ease:'power1.out'},
      scrollTrigger: {
        trigger: '#section1',
        start: 'top top',    // When the top of the section hits the top of the viewport
        end: 'bottom top', // When the bottom of the section hits the top of the viewport
        scrub: true,         // Link animation progress directly to scroll progress
        // markers: true,       // Show visual markers for debugging
      },
    });

    tl.to(filtered_parts.map(part=> part.mesh.position),{
      x:(index) => filtered_parts[index].originalPosition.x,
      y:(index) => filtered_parts[index].originalPosition.y,
      z:(index) => filtered_parts[index].originalPosition.z,
      stagger:{
        each:0.03,
        from:'start'
      }},
    )

    const studioTl = gsap.timeline({
      scrollTrigger:{
        trigger: '#studio',
        start: 'top top',
        end:'bottom top',
        scrub:true,
        markers:true
      }
    })


    studioTl.to(state.camera.position,{
      x:-0.1,
      y:12,
      z:18
    },0).to(state.camera.rotation,{
      x:-0.2532683858032268,
      y:0.001801610742417857,
      z:0.00046630400053345616
    },0).to(state.camera,{
      fov:50,
      onUpdate:()=>{
        state.camera.updateProjectionMatrix()
      }
    },0)
    .to(state.lights.headLight.position,{
      x:0.3,
      y:16.3,
      z:-0.3
    },0)
    .to(state.lights.headLight.target.position,{
      x:0.3,
      y:7.2,
      z:0.6,
      onUpdate:()=>{
        state.lights.headLight.target.updateMatrixWorld()
        state.lights.headlighthelper.update()
      }
    },0)
    .to(state.lights.keyLight.position,{
      x:5.3,
      y:9.8,
      z:15.4
    },0)
    .to(state.lights.keyLight.target.position,{
      x:-0.9,
      y:7,
      z:-2.7,
      onUpdate:()=>{
        state.lights.keyLight.target.updateMatrixWorld()
        state.lights.keylightHelper.update()
      }
    },0)
    .to(state.lights.fillLight.position,{
      x:-8.8,
      y:11.2,
      z:12.5
    },0)
    .to(state.lights.fillLight.target.position,{
      x:-0.1,
      y:7.1,
      z:-1.3,
      onUpdate:()=>{
        state.lights.fillLight.target.updateMatrixWorld()
        state.lights.filllighthelper.update()
      }
    },0)
    .to([state.lights.flateLight1,state.lights.flateLight2],{
      intensity:0
    },0)
    .to(state.lights.headLight,{
      intensity:5
    },0)
    .to(state.lights.fillLight,{
      intensity:1.5
    },0)
    .to(state.lights.keyLight,{
      intensity:2
    },0)
    .to(state.lights.fillLight.color,{
      r:1,
      g:1,
      b:1
    },0)
    .to(state,{
      onUpdate:()=>{
        state.scene.environment = null
      },
      onComplete:()=>{
        state.scene.environment = state.metalTexture
      }
    },0)
    .to(state.backdropMaterial.color,{
      r:0.8713671191959567,
      g:0.8713671191959567,
      b:0.8713671191959567
    })
    .to(state.scene.background,{
      r:0.913098651791473,
      g:0.913098651791473,
      b:0.913098651791473
    })
        .to(state.scene.fog,{
      far:200,
      ease:'power4.inOut'
    })





    const headingTl = gsap.timeline({
      scrollTrigger:{
        trigger:'#sns',
        start:'top top',
        end:'center top',
        scrub:true,
        // markers:true
      }
    })
    let split = SplitText.create('#sns',{type:'chars'})
    headingTl.to(split.chars,{
      opacity:0,
      stagger:{
        each:0.05,
        from:'random',
        ease:'power1.in'
      },
      onUpdate:()=>{
        document.getElementById('sns').style.display = "flex"
      },
      onComplete:()=>{
        document.getElementById('sns').style.display = "none"
      }
    })
}