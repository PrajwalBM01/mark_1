import gsap from "gsap";
import { state } from "./state";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);


export function setupAnimation(){

  const filtered_parts = state.ironman_parts.filter(part=>{
    if(part.mesh.isMesh){
      return part.mesh.position
    }
  })

  const tl = gsap.timeline({
      defaults:{duration:8, ease:'power4.inOut'},
      scrollTrigger: {
        trigger: '#section1',
        start: 'top top',    // When the top of the section hits the top of the viewport
        end: 'bottom top', // When the bottom of the section hits the top of the viewport
        scrub: true,         // Link animation progress directly to scroll progress
        markers: true,       // Show visual markers for debugging
      },
    });

    tl.to(filtered_parts.map(part=> part.mesh.position),{
      x:(index) => filtered_parts[index].originalPosition.x,
      y:(index) => filtered_parts[index].originalPosition.y,
      z:(index) => filtered_parts[index].originalPosition.z,
      stagger:{
        each:0.05,
        from:'random'
      }},
    )
}