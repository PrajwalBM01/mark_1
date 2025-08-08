import gsap from "gsap";
import { state } from "./state";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

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

    studioTl.to(state.ironman_model.position,{
      z:-10
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
      }
    })
}