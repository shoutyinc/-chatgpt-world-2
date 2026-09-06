/* ChatGPT World — Visual Fix v6
 * Conversation structures are static world objects. Lock their orientation
 * so camera/input updates can never turn a building into a spinning prop.
 */
(() => {
  const wait=(fn,n=0)=>{if(typeof scene!=='undefined'&&scene&&typeof renderer!=='undefined')return fn();if(n<120)setTimeout(()=>wait(fn,n+1),100);};
  function lock(){
    scene.traverse(o=>{
      if(!o||!o.userData)return;
      if(o.userData.chatBuilding||o.userData.chatCapital||o.userData.threadIndex!==undefined){
        o.userData.staticWorldObject=true;
        o.userData.lockedRotationY=o.rotation.y;
      }
    });
    // The gameplay layer owns commands/animation, but buildings themselves never rotate.
    if(typeof GAME==='undefined'){
      const original=typeof updateCamera==='function'?updateCamera:null;
      if(original&&!window.__chatWorldCameraGuard){
        window.__chatWorldCameraGuard=true;
        window.__chatWorldUpdateCamera=original;
        window.updateCamera=function(){
          original();
          scene.traverse(o=>{
            if(o.userData?.staticWorldObject)o.rotation.y=o.userData.lockedRotationY;
          });
        };
      }
    }
    scene.traverse(o=>{
      if(o.userData?.staticWorldObject)o.rotation.y=o.userData.lockedRotationY;
    });
  }
  wait(lock);
})();
