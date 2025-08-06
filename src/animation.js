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
  
      // const allParts = Object.values(state.ironman_parts).map(part=>part.position)
      // console.log(allParts)

      Object.keys(state.ironman_parts).forEach(partname=>{
        const part = state.ironman_parts[partname]
        const originPosition = state.position[partname]
        const originrotation = state.roatatio[partname]

        tl.to(part.position,{
          x:originPosition.x,
          y:originPosition.y,
          z:originPosition.z,
          ease:'power1.inOut',
          stagger:{
              each:0.02,
              from:'random'
          }
        },0)

        tl.to(part.rotation,{
          x:originrotation._x,
          y:originrotation._y,
          z:originrotation._z,
          ease:'power1.inOut',
          stagger:{
              each:0.02,
              from:'random'
          }
        },0)
      })
      // tl.to(allParts,{
      //   x:0,
      //   y:0,
      //   z:0,
      //   ease:'power1.inOut',
      //   stagger:{
      //       each:0.02,
      //       from:'random'
      //   }
      // },0)

      // tl.to(state.ironman_model.position,{
      //   x:0,y:0,z:6
      // },0)

      // tl.to(state.ironman_model.rotation,{
      //   x:0
      // },0)
}