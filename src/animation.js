import gsap from "gsap";
import { state } from "./state";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import * as THREE from 'three'
import { Draggable } from "gsap/Draggable";

gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(Draggable);

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

  const camera = state.camera
  const parts = state.ironman_model.children
  const mixer = new THREE.AnimationMixer(state.ironman_model)
  let disected = false

  const actionClips = state.animation.reduce((accumulator,animation)=>{
    const action = mixer.clipAction(animation)
    action.play()
    action.paused = true

    if(animation.name.includes("helmet")){
      accumulator.helmet.push(action) 
    }
    if(animation.name.includes("arm_left")){
      accumulator.leftArm.push(action)
    }
    if(animation.name.includes("arm_right")){
      accumulator.rightArm.push(action)
    }
    if(animation.name.includes("leg_left")){
      accumulator.leftleg.push(action)
    }
    if(animation.name.includes("leg_right")){
      accumulator.rightleg.push(action)
    }
    if(animation.name.includes("torso")){
      accumulator.torso.push(action)
    }
    return accumulator
  },{helmet:[],leftArm:[],rightArm:[],leftleg:[],rightleg:[],torso:[]})

  //finltering the parts
  const filtered_parts = state.ironman_parts.filter(part=>{
    if(part.mesh.isMesh){
      return part.mesh.position
    }
  })

  //random parts assemble animation
  const tl = gsap.timeline({
      defaults:{duration:8,ease:'power1.out'},
      scrollTrigger: {
        trigger: '#section1',
        start: 'top top',    
        end: 'bottom top', 
        scrub: true,         
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

    ScrollTrigger.create({
      trigger:'#studio1',
      start:"top top",
      end:'center top',
      onToggle:(self)=>{
        const brief = document.getElementById('studio1').firstElementChild
        if(self.isActive){
          gsap.to(brief,{
            display:'flex',
            opacity:1,
            ease:'power1'
          })
        }else{
          gsap.to(brief,{
            display:'none',
            opacity:0,
            ease:'power1'
          })
        }
      }
    })

  
    //R&D words animation
    const headingTl = gsap.timeline({
      scrollTrigger:{
        trigger:'#sns',
        start:'top top',
        end:'center top',
        scrub:true,
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

    //studio setup animation.
    const studio1Tl = gsap.timeline({
      scrollTrigger:{
        trigger: '#studio1',
        start: 'top top',
        end:'bottom top',
        scrub:true,
      }
    })

    studio1Tl.to(state.ironman_model.position,{
      y:0.3,
      z:0
    })
    .to(state.camera.position,{
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
        // state.lights.filllighthelper.update()
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
      far:500,
      duration:1,
      ease:'easeInOut'
    })

    let currentActiveHeader = null;
    let detailsToggle = false;
    const eventFunctions = new Map();


    const switchHeader = (newHeaderElement,partName)=>{
      detailsToggle = false
      const button  = document.getElementById('toggle')
      if(detailsToggle){
        button.textContent = 'X'
      }else{
        button.textContent = 'Details'
      }
      document.querySelectorAll('.fixed-header').forEach(header=>{
        header.classList.remove('active');
        header.classList.remove('toggle-active');
        header.style.pointerEvents = 'none'
      });

      if(newHeaderElement){
        newHeaderElement.classList.add('active');
        window.addEventListener
        newHeaderElement.style.pointerEvents = 'auto'
        
        // On screens ≤1024px, only show header when toggle is active
        if (window.innerWidth <= 1024) {
          if (detailsToggle) {
            newHeaderElement.classList.add('toggle-active');
            newHeaderElement.style.pointerEvents = 'auto';
          }
        } else {
          // Normal behavior for screens >1024px
          newHeaderElement.style.pointerEvents = 'auto'
        }
        
        currentActiveHeader = newHeaderElement
      }

      if(partName){
        if(!eventFunctions.has(partName)){
          const actions = actionClips[partName]
          const clickHandler = ()=>{
            disected = !disected;
            actions.forEach(action=>{
              action.paused = false
            })
            gsap.to(actions,{
              time:(index,target)=> disected? (target.getClip().duration):(0),
              ease:'expo.inOut',
              stagger:0.02,
              onUpdate:()=>{
                mixer.update(0)
              }
            })
          }
          eventFunctions.set(partName,clickHandler)
          newHeaderElement.addEventListener('click',clickHandler)
        }
    
      }
    
    }
  const toggleButton = document.getElementById('toggle');
  if (toggleButton) {
    toggleButton.addEventListener('click', () => {
      detailsToggle = !detailsToggle;
      
      if (detailsToggle) {
        toggleButton.textContent = 'X';
        if (currentActiveHeader) {
          currentActiveHeader.classList.add('toggle-active');
          currentActiveHeader.style.pointerEvents = 'auto';
        }
      } else {
        toggleButton.textContent = 'Details';
          currentActiveHeader.classList.remove('toggle-active');
      }
    });
  }
    
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024) {
        detailsToggle = false;
        if (toggleButton) {
          toggleButton.textContent = 'Details';
        }
        if (currentActiveHeader) {
          currentActiveHeader.classList.remove('toggle-active');
          currentActiveHeader.style.pointerEvents = 'auto';
        }
      } else {
        if (currentActiveHeader) {
          if (detailsToggle) {
            currentActiveHeader.classList.add('toggle-active');
            currentActiveHeader.style.pointerEvents = 'auto';
          } else {
            currentActiveHeader.classList.remove('toggle-active');
            currentActiveHeader.style.pointerEvents = 'auto';
          }
        }
      }
    });

    //progress 
    ScrollTrigger.create({
      trigger:'#wholeTimeline',
      start:'top top',
      end:"bottom top",
      onUpdate:(self)=>{
        gsap.to(document.getElementById('progressPointer'),{
          translateY: `${(self.progress * 400)}px`
        })
      }
    })

    ScrollTrigger.create({
      trigger:'#wholeTimeline',
      start:'top top',
      end:'bottom top',
      onToggle:(self)=>{
        if(self.isActive){
          gsap.to(document.getElementsByClassName('fixed-header-container'),{
            opacity:1,
            display:'flex',
            ease:'power1.inOut'
          })
        }else{
          gsap.to(document.getElementsByClassName('fixed-header-container'),{
            opacity:0,
            display:'none',
            ease:'power1.inOut'
          })
        }
      }
    }) 

    //model rotation
    const modelRotation = gsap.to(state.ironman_model.rotation,{
      y: '+=6.28',
      ease: 'none',
      duration:5,
      repeat:-1,
      paused:true
    })

    ScrollTrigger.create({
      trigger:'#allParts',
      start:'center bottom',
      end:'bottom top',
      animation:modelRotation,
      onEnter:()=>{
        switchHeader(document.querySelector(`.fixed-header[data-section="allParts"]`))
        modelRotation.restart()
      },
      onLeave:()=>{
        modelRotation.pause();
        gsap.to(state.ironman_model.rotation,{
          x:0,y:0,z:0,
          ease:'power2.inOut'
        })
      },
      onEnterBack:()=>{
        switchHeader(document.querySelector(`.fixed-header[data-section="allParts"]`))
        modelRotation.restart();
      },
      onLeaveBack:()=>{
        modelRotation.pause();
        gsap.to(state.ironman_model.rotation,{
          x:0,y:0,z:0,
          ease:'power2.inOut'
        })
      }
    })


    const enter = (
      part,
      partname,
      part_rotation,
      y,
      z,
      animation_name
    )=>{
      const currentElement = document.querySelector(`.fixed-header[data-section="${partname}"]`)
      switchHeader(currentElement,animation_name)
      gsap.to(camera.position,{
        x:part.position.x,
        y:part.position.y + y,
        z:part.position.z +z + state.extraZ ,
        ease:"power1.in"
      })
      parts.forEach(each=>{
        if(each.name != partname){
          each.visible = false
        }
      })
      part_rotation.restart()
      
    }


    const leave = (
      part,
      partname,
      part_rotation,
      animation_part
    )=>{
      gsap.to(camera.position,{
        x:-0.1,
        y:12,
        z:18,
        ease:"power1.in"
      })
      parts.forEach(each=>{
        if(each.name != partname){
          each.visible = true
          
        }
      })
      part_rotation.pause()
      gsap.to(part.rotation,{
        y:0,
      })
      disected = false
      actionClips[animation_part].forEach(action=>{
        action.paused = true
      })
      gsap.to(actionClips[animation_part],{
        time:(index,target)=> 0,
        ease:'expo.inOut',
        stagger:0.02,
        onUpdate:()=>{
          mixer.update(0)
        }
      })
    }

    //helmet animation
    const helmet = parts[0]
    const helmet_rotataion = gsap.to(helmet.rotation,{
      y: "+=6.28",
      ease:'none',
      duration:5,
      repeat:-1,
      paused:true
    })
    ScrollTrigger.create({
      trigger:"#helmet",
      start:"top top",
      end:"bottom top",
      fastScrollEnd: true,
      preventOverlaps: true,
      onEnter:()=>{
        enter(helmet,"helmet",helmet_rotataion,2,10,'helmet')
      },
      onLeave:()=>{
        leave(helmet,"helmet",helmet_rotataion,'helmet')
      },
      onEnterBack:()=>{
        enter(helmet,"helmet",helmet_rotataion,2,10,'helmet')
      },
      onLeaveBack:()=>{
        leave(helmet,"helmet",helmet_rotataion,'helmet')
      }
    })


    //leftarm animation
    const leftArm = parts[5]
    const leftArm_rotation = gsap.to(leftArm.rotation,{
      y:"+=6.28",
      ease:'none',
      duration:5,
      repeat:-1,
      paused:true
    })
    ScrollTrigger.create({
      trigger:"#leftArm",
      start:"top top",
      end:"bottom top",
      fastScrollEnd: true,
      preventOverlaps: true,
      onEnter:()=>{
        enter(leftArm,"arm_left",leftArm_rotation,3,10,'leftArm')
      },
      onLeave:()=>{
        leave(leftArm,"arm_left",leftArm_rotation,'leftArm')
      },
      onEnterBack:()=>{
        enter(leftArm,"arm_left",leftArm_rotation,3,10,'leftArm')
      },
      onLeaveBack:()=>{
        leave(leftArm,"arm_left",leftArm_rotation,'leftArm')
      }
    })

    //rightArm animation
    const rightArm = parts[4]
    const rightArm_rotation = gsap.to(rightArm.rotation,{
      y:"+=6.28",
      ease:'none',
      duration:5,
      repeat:-1,
      paused:true
    })
    ScrollTrigger.create({
      trigger:"#rightArm",
      start:"top top",
      end:"bottom top",
      fastScrollEnd: true,
      preventOverlaps: true,
      onEnter:()=>{
        enter(rightArm,"arm_right",rightArm_rotation,3.5,10,'rightArm')
      },
      onLeave:()=>{
        leave(rightArm,"arm_right",rightArm_rotation,'rightArm')
      },
      onEnterBack:()=>{
        enter(rightArm,"arm_right",rightArm_rotation,3.5,10,'rightArm')
      },
      onLeaveBack:()=>{
        leave(rightArm,"arm_right",rightArm_rotation,'rightArm')
      }
    })

    //leftLeg animation
    const leftLeg = parts[3]
    const leftLeg_rotation = gsap.to(leftLeg.rotation,{
      y:"+=6.28",
      ease:'none',
      duration:5,
      repeat:-1,
      paused:true
    })
    ScrollTrigger.create({
      trigger:"#leftleg",
      start:"top top",
      end:"bottom top",
      fastScrollEnd: true,
      preventOverlaps: true,
      onEnter:()=>{
        enter(leftLeg,"leg_left",leftLeg_rotation,3,12,'leftleg')
      },
      onLeave:()=>{
        leave(leftLeg,"leg_left",leftLeg_rotation,'leftleg')
      },
      onEnterBack:()=>{
        enter(leftLeg,"leg_left",leftLeg_rotation,3,12,'leftleg')
      },
      onLeaveBack:()=>{
        leave(leftLeg,"leg_left",leftLeg_rotation,'leftleg')
      }
    })

    //RightLeg animation
    const rightLeg = parts[2]
    const rightLeg_rotation = gsap.to(rightLeg.rotation,{
      y:"+=6.28",
      ease:'none',
      duration:5,
      repeat:-1,
      paused:true
    })
    ScrollTrigger.create({
      trigger:"#rightleg",
      start:"top top",
      end:"bottom top",
      fastScrollEnd: true,
      preventOverlaps: true,
      onEnter:()=>{
        enter(rightLeg,"leg_right",rightLeg_rotation,3,12,'rightleg')
      },
      onLeave:()=>{
        leave(rightLeg,"leg_right",rightLeg_rotation,'rightleg')
      },
      onEnterBack:()=>{
        enter(rightLeg,"leg_right",rightLeg_rotation,3,12,'rightleg')
      },
      onLeaveBack:()=>{
        leave(rightLeg,"leg_right",rightLeg_rotation,'rightleg')
      }
    })
    
    //torso animation
    const torso = parts[1]
    const torso_rotation = gsap.to(torso.rotation,{
      y:"+=6.28",
      ease:'none',
      duration:5,
      repeat:-1,
      paused:true
    })
    ScrollTrigger.create({
      trigger:"#torso",
      start:"top top",
      end:"bottom top",
      fastScrollEnd: true,
      preventOverlaps: true,
      onEnter:()=>{
        enter(torso,"torso",torso_rotation,3,15,'torso')
      },
      onLeave:()=>{
        leave(torso,"torso",torso_rotation,'torso')
      },
      onEnterBack:()=>{
        enter(torso,"torso",torso_rotation,3,15,'torso')
      },
      onLeaveBack:()=>{
        leave(torso,"torso",torso_rotation,'torso')
      }
    })

    ScrollTrigger.create({
      trigger:"#theEnd",
      start:'top top',
      end:"bottom top",
      fastScrollEnd: true,
      preventOverlaps: true,
      onEnter:()=>{
        switchHeader(document.querySelector(`.fixed-header[data-section="theEnd"]`))
  
      },
      onLeaveBack:()=>{
        switchHeader(document.querySelector(`.fixed-header[data-section="theEnd"]`))

      }
    })
}