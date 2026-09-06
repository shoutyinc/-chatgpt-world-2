/* ChatGPT World — Visual Fix v8
 * Finalizes a single visual presentation layer and prevents legacy scene objects
 * from drawing over the current settlement.
 */
(() => {
  const wait=(fn,n=0)=>{if(typeof THREE!=='undefined'&&typeof scene!=='undefined'&&scene&&typeof renderer!=='undefined'&&renderer?.domElement)return fn();if(n<180)setTimeout(()=>wait(fn,n+1),100);};
  function clean(){
    // Hide legacy presentation objects that create duplicate oversized houses,
    // dark terrain, and competing buildings beneath the current visual layer.
    scene.traverse(o=>{
      if(!o?.userData)return;
      if(o.userData.legacyPresentation||o.userData.legacyBuildingMesh)o.visible=false;
    });
    // Ensure every conversation building is static and retains a stable yaw.
    scene.traverse(o=>{
      if(o.userData?.chatBuilding||o.userData?.chatCapital||o.userData?.threadIndex!==undefined){
        if(typeof o.userData.worldYaw!=='number')o.userData.worldYaw=o.rotation.y||0;
        o.rotation.x=0;o.rotation.z=0;o.rotation.y=o.userData.worldYaw;
        o.userData.staticWorldObject=true;
      }
    });
  }
  function run(){clean();setTimeout(clean,400);setTimeout(clean,1000);}
  wait(run);
})();
