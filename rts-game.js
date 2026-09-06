/* ChatGPT World — RTS gameplay layer
 * Phase 3: multi-select, move commands, explicit gather commands,
 * construction work, production queues, and lightweight territory control.
 */
(() => {
  const GAME = {
    resources: { wood: 120, food: 160, stone: 80, knowledge: 20 },
    units: [], nodes: [], buildings: [], selected: [],
    mode: 'select', nextUnitId: 1, nextBuildingId: 1,
    populationCap: 8, paused: false, speed: 1, last: performance.now(),
    territory: 1, production: []
  };

  const COSTS = {
    house: { wood: 50 }, workshop: { wood: 90, stone: 30 },
    farm: { wood: 35 }, archive: { wood: 70, stone: 50, knowledge: 10 },
    villager: { food: 50 }
  };
  const root = () => document.getElementById('rtsGameLayer');
  const el = (tag, cls, text) => { const x=document.createElement(tag); if(cls)x.className=cls; if(text!==undefined)x.textContent=text; return x; };

  function boot() {
    if (root()) return;
    const r=el('div','rts-game-layer'); r.id='rtsGameLayer';
    r.innerHTML=`<div class="rts-resourcebar"><span>🪵 <b data-r="wood">120</b></span><span>🌾 <b data-r="food">160</b></span><span>🪨 <b data-r="stone">80</b></span><span>✦ <b data-r="knowledge">20</b></span><span>👥 <b data-r="pop">0/8</b></span></div>
      <div class="rts-actions"><button data-action="villager">Villager <small>50 food</small></button><button data-action="house">House <small>50 wood</small></button><button data-action="workshop">Workshop <small>90 wood · 30 stone</small></button><button data-action="farm">Farm <small>35 wood</small></button></div>
      <div class="rts-selection" hidden><strong data-sel-title>Nothing selected</strong><span data-sel-detail>Select units or a resource.</span></div>
      <div class="rts-commandbar"><button data-cmd="move">Move</button><button data-cmd="gather">Gather</button><button data-cmd="stop">Stop</button><span data-mode>SELECT</span></div><div class="rts-toast" aria-live="polite"></div>`;
    document.body.appendChild(r);
    r.addEventListener('click',e=>{const a=e.target.closest('[data-action]'); if(a){if(a.dataset.action==='villager') queueVillager(); else enterBuildMode(a.dataset.action); const c=e.target.closest('[data-cmd]'); if(c) command(c.dataset.cmd); return;} const c=e.target.closest('[data-cmd]'); if(c)command(c.dataset.cmd);});
    createNodes(); createStartingVillagers(); refreshUI(); requestAnimationFrame(loop);
  }
  const mat=(c,e=0)=>new THREE.MeshStandardMaterial({color:c,emissive:e,emissiveIntensity:e?.35:0,roughness:.72});
  function createNodes(){[['wood',-8,-1,700],['wood',7,-6,700],['food',-7,6,1000],['food',7,5,1000],['stone',8,0,600],['stone',-8,-6,600]].forEach(([type,x,z,amount])=>{const g=new THREE.Group(),color=type==='wood'?0x4b8a52:type==='food'?0xd5a84c:0x8d96a8,geo=type==='wood'?new THREE.ConeGeometry(.6,1.5,7):new THREE.DodecahedronGeometry(.65);const m=new THREE.Mesh(geo,mat(color));m.position.y=type==='wood'?1.6:1.45;g.add(m);g.position.set(x,0,z);g.userData.rtsNode={type,amount};scene.add(g);GAME.nodes.push({type,amount,mesh:g});});}
  function createStartingVillagers(){[[-1.4,.8],[-.7,1.1],[.1,.8]].forEach(p=>spawnVillager(...p));}
  function spawnVillager(x,z){if(GAME.units.length>=GAME.populationCap)return null;const g=new THREE.Group(),body=new THREE.Mesh(new THREE.CapsuleGeometry(.22,.55,4,8),mat(0xc8d4e8,0x25344f)),head=new THREE.Mesh(new THREE.SphereGeometry(.19,10,8),mat(0xe0b18a));body.position.y=1.35;head.position.y=1.85;g.add(body,head);g.position.set(x,0,z);g.userData.rtsUnit=true;scene.add(g);const u={id:GAME.nextUnitId++,mesh:g,job:'idle',target:null,carry:0,carryType:null,hp:100,speed:2.6,command:'idle',buildTarget:null};GAME.units.push(u);return u;}
  function queueVillager(){if(GAME.units.length+GAME.production.length>=GAME.populationCap)return toast('Population cap reached — build a House.');if(!spend(COSTS.villager))return toast('Not enough food.');GAME.production.push({type:'villager',time:3});toast('Villager queued.');refreshUI();}
  function enterBuildMode(type){GAME.mode='build:'+type;updateMode();toast(`Place ${type} on your territory.`);}
  function placeBuilding(type,x,z){if(GAME.mode!=='build:'+type)return;if(Math.hypot(x,z)>12.5)return toast('Outside your territory.');if(!spend(COSTS[type]))return toast('Not enough resources.');const s={house:1.15,workshop:1.35,farm:.9,archive:1.25}[type]||1,c={house:0x6e4c82,workshop:0x4b637d,farm:0x718a43,archive:0x5b4c91}[type];const g=new THREE.Group(),b=new THREE.Mesh(new THREE.BoxGeometry(s*1.7,s*1.35,s*1.7),mat(c));b.position.y=1.75*s;const roof=new THREE.Mesh(new THREE.ConeGeometry(s*1.25,s*.8,4),mat(0x2b2537,c));roof.position.y=2.75*s;roof.rotation.y=Math.PI/4;g.add(b,roof);g.position.set(x,0,z);g.userData.rtsBuilding={type,id:GAME.nextBuildingId++};scene.add(g);GAME.buildings.push({type,mesh:g,hp:100});if(type==='house')GAME.populationCap+=4;GAME.mode='select';updateMode();toast(`${type[0].toUpperCase()+type.slice(1)} constructed.`);refreshUI();}
  function spend(cost){for(const k in cost)if((GAME.resources[k]||0)<cost[k])return false;for(const k in cost)GAME.resources[k]-=cost[k];return true;}
  function select(obj,add=false){if(!add)GAME.selected=[];if(obj&&!GAME.selected.includes(obj))GAME.selected.push(obj);refreshSelection();}
  function refreshSelection(){const p=root()?.querySelector('.rts-selection');if(!p)return;p.hidden=!GAME.selected.length;const t=p.querySelector('[data-sel-title]'),d=p.querySelector('[data-sel-detail]');if(!GAME.selected.length)return;t.textContent=GAME.selected.length===1?(GAME.selected[0].id?`Villager #${GAME.selected[0].id}`:(GAME.selected[0].type||'Building')):`${GAME.selected.length} units selected`;d.textContent=GAME.selected.every(x=>x.id)?'Ready for orders. Use Move, Gather, or Stop.':'Resource or building selected.';}
  function command(cmd){const units=GAME.selected.filter(x=>x.id);if(!units.length)return toast('Select one or more villagers first.');if(cmd==='stop')units.forEach(u=>{u.job='idle';u.target=null;u.command='stop';});else{GAME.mode='command:'+cmd;updateMode();toast(cmd==='move'?'Tap the ground to move selected villagers.':'Tap a resource node to gather.');}}
  function issueAt(x,z){const units=GAME.selected.filter(x=>x.id);if(!units.length)return;if(GAME.mode==='command:move'){units.forEach((u,i)=>{u.job='move';u.target={x:x+(i%3)*.55-.55,z:z+Math.floor(i/3)*.55-.3};u.command='move';});GAME.mode='select';updateMode();}else if(GAME.mode==='command:gather'){const n=GAME.nodes.find(n=>n.amount>0&&Math.hypot(n.mesh.position.x-x,n.mesh.position.z-z)<1.8);if(!n)return toast('Tap directly on a resource.');units.forEach(u=>assignGather(u,n));GAME.mode='select';updateMode();}}
  function assignGather(u,n){u.job='gather';u.target=n;u.carryType=n.type;u.command='gather';}
  function nearestNode(u){let best=null,d=Infinity;GAME.nodes.forEach(n=>{if(n.amount<=0)return;const q=Math.hypot(u.mesh.position.x-n.mesh.position.x,u.mesh.position.z-n.mesh.position.z);if(q<d){d=q;best=n;}});return best;}
  function tick(dt){if(GAME.paused)return;for(let i=GAME.production.length-1;i>=0;i--){const q=GAME.production[i];q.time-=dt;if(q.time<=0){spawnVillager(0,1.5);GAME.production.splice(i,1);toast('Villager ready.');}}GAME.units.forEach(u=>{if(u.job==='idle')return;if(u.job==='move'&&u.target)moveTo(u,u.target,dt);else if(u.job==='gather'&&u.target){const n=u.target;if(n.amount<=0){u.job='idle';u.target=null;return;}const d=Math.hypot(u.mesh.position.x-n.mesh.position.x,u.mesh.position.z-n.mesh.position.z);if(d>1.25)moveTo(u,n.mesh.position,dt);else{const rate=6*dt;n.amount=Math.max(0,n.amount-rate);u.carry+=rate;if(u.carry>=25||n.amount<=0){GAME.resources[n.type]+=u.carry;u.carry=0;if(n.amount<=0){n.mesh.visible=false;u.job='idle';u.target=null;}}}}});refreshUI();}
  function moveTo(u,p,dt){const dx=p.x-u.mesh.position.x,dz=p.z-u.mesh.position.z,d=Math.hypot(dx,dz);if(d<.08){u.job='idle';u.target=null;return;}const s=Math.min(d,dt*u.speed);u.mesh.position.x+=dx/d*s;u.mesh.position.z+=dz/d*s;u.mesh.rotation.y=Math.atan2(dx,dz);}
  function refreshUI(){const r=root();if(!r)return;Object.entries(GAME.resources).forEach(([k,v])=>{const x=r.querySelector(`[data-r="${k}"]`);if(x)x.textContent=Math.floor(v);});const p=r.querySelector('[data-r="pop"]');if(p)p.textContent=`${GAME.units.length+GAME.production.length}/${GAME.populationCap}`;}
  function updateMode(){const x=root()?.querySelector('[data-mode]');if(x)x.textContent=GAME.mode.toUpperCase().replace(':',' ');}
  function toast(t){const x=root()?.querySelector('.rts-toast');if(!x)return;x.textContent=t;x.classList.add('show');clearTimeout(x._t);x._t=setTimeout(()=>x.classList.remove('show'),1800);}
  function wire(){if(!renderer?.domElement)return setTimeout(wire,250);const canvas=renderer.domElement,ray=new THREE.Raycaster(),p=new THREE.Vector2();canvas.addEventListener('pointerdown',e=>{const r=canvas.getBoundingClientRect();p.x=((e.clientX-r.left)/r.width)*2-1;p.y=-((e.clientY-r.top)/r.height)*2+1;ray.setFromCamera(p,camera);const hits=ray.intersectObjects(scene.children,true);const hit=hits.find(h=>h.object?.parent?.userData?.rtsUnit||h.object?.parent?.userData?.rtsNode||h.object?.parent?.userData?.rtsBuilding);if(hit){const g=hit.object.parent;if(g.userData.rtsUnit){const u=GAME.units.find(u=>u.mesh===g);select(u,e.shiftKey);toast(`Villager #${u.id} selected.`);}else if(g.userData.rtsNode){select(g.userData.rtsNode);if(GAME.mode==='command:gather')issueAt(g.position.x,g.position.z);}else if(g.userData.rtsBuilding)select(g.userData.rtsBuilding);return;}if(GAME.mode.startsWith('build:')){const h=hits.find(h=>h.point&&h.point.y<=1.2);if(h)placeBuilding(GAME.mode.slice(6),h.point.x,h.point.z);}else if(GAME.mode.startsWith('command:')){const h=hits.find(h=>h.point);if(h)issueAt(h.point.x,h.point.z);}});}
  function loop(now){const dt=Math.min((now-GAME.last)/1000,.05)*GAME.speed;GAME.last=now;tick(dt);requestAnimationFrame(loop);}
  Object.defineProperty(window,'ChatGPTWorldRTS',{value:GAME,configurable:false});const start=()=>{boot();wire();};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
