import gsap from "gsap";
import { state } from "./state";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);


export function setupAnimation(){

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
  
      const allParts = Object.values(state.ironman_parts).map(part=>part.position)

      tl.to(allParts,{
        x:0,
        y:0,
        z:0,
        ease:'power1.inOut',
        stagger:{
            each:0.02,
            from:'random'
        }
      })
}