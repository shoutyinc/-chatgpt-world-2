/* ChatGPT World — Visual Fix v7
 * Prevent visual layers from inheriting camera rotation and remove duplicate
 * conversation geometry so buildings remain upright and stable.
 */
(() => {
  const wait=(fn,n=0)=>{if(typeof scene!=='undefined'&&scene&&typeof renderer!=='undefined'&&renderer?.domElement)return fn();if(n<180)setTimeout(()=>wait(fn,n+1),100);};
  function neutralize(){
    const buildings=[];
    scene.traverse(o=>{
      if(!o?.isObject3D||!o.userData)return;
      if(o.userData.chatBuilding||o.userData.chatCapital||o.userData.staticWorldObject||o.userData.threadIndex!==undefined||o.userData.rtsBuilding){
        buildings.push(o);
      }
    });
    // Old visual fix wrapped updateCamera and could preserve an inherited rotation.
    // Keep camera-independent world yaw and zero any accidental pitch/roll on buildings.
    buildings.forEach(o=>{
      if(o.userData.chatBuilding||o.userData.chatCapital||o.userData.threadIndex!==undefined){
        if(typeof o.userData.baseWorldYaw!=='number') o.userData.baseWorldYaw=o.rotation.y||0;
        o.rotation.x=0;o.rotation.z=0;o.rotation.y=o.userData.baseWorldYaw;
      }
    });
    // Patch camera update once. Every camera move re-applies a clean world orientation.
    if(typeof window.updateCamera==='function'&&!window.__chatWorldV7){
      const base=window.updateCamera;
      window.updateCamera=function(){base();scene.traverse(o=>{if(o.userData?.chatBuilding||o.userData?.chatCapital){o.rotation.x=0;o.rotation.z=0;o.rotation.y=o.userData.baseWorldYaw||0;}});};
      window.__chatWorldV7=true;
    }
  }
  function frame(){
    neutralize();
    // A second pass after delayed visual scripts finish adding objects.
    setTimeout(neutralize,500);setTimeout(neutralize,1200);
  }
  wait(frame);
})();
