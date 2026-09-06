const world=document.getElementById("world");

const threads=[
{name:"Creative Studio",state:"working",x:-3.2,z:-1.8,progress:72,type:"studio"},
{name:"Career Planning",state:"waiting",x:3,z:-1.8,progress:48,type:"office"},
{name:"Business School",state:"finished",x:-2.5,z:2.5,progress:100,type:"school"},
{name:"Idea Lab",state:"idle",x:2.5,z:2.6,progress:26,type:"lab"},
{name:"Project Hub",state:"dormant",x:0,z:0,progress:12,type:"hub"}
];

const colors={
working:0xa45cff,
waiting:0xffb84d,
finished:0x5fffc4,
idle:0x62dfff,
dormant:0x777080
};

let scene,camera,renderer,raycaster,pointer;
const residents=[],labels=[],fireflies=[];
let radius=13,theta=.65,phi=.92;
let lastX=0,lastY=0,pinchDistance=0;

function startWorld(){

scene=new THREE.Scene();

scene.background=new THREE.Color(0x05030b);

scene.fog=new THREE.FogExp2(
0x080611,.018
);

camera=new THREE.PerspectiveCamera(
42,innerWidth/innerHeight,.1,100
);

renderer=new THREE.WebGLRenderer({
antialias:true,
powerPreference:"high-performance"
});

renderer.setPixelRatio(
Math.min(devicePixelRatio||1,2)
);

renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;

world.innerHTML="";
world.appendChild(renderer.domElement);

raycaster=new THREE.Raycaster();
pointer=new THREE.Vector2();

lighting();
stars();
water();
island();
plaza();
paths();
streetLights();
buildings();
trees();
fireflyLights();
residents();

controls();

addEventListener("resize",resize);

animate();
}


/* LIGHTING */

function lighting(){

scene.add(
new THREE.HemisphereLight(
0xb9adff,0x08050f,2.4
)
);

const moon=new THREE.DirectionalLight(
0xe8e2ff,3.2
);

moon.position.set(-8,14,8);
moon.castShadow=true;
scene.add(moon);

const glow=new THREE.PointLight(
0x8b4dff,30,30
);

glow.position.set(0,4,0);
scene.add(glow);
}


/* STARS */

function stars(){

const geo=new THREE.BufferGeometry();
const p=new Float32Array(900*3);

for(let i=0;i<900;i++){

p[i*3]=(Math.random()-.5)*70;
p[i*3+1]=Math.random()*32+5;
p[i*3+2]=(Math.random()-.5)*70;

}

geo.setAttribute(
"position",
new THREE.BufferAttribute(p,3)
);

scene.add(
new THREE.Points(
geo,
new THREE.PointsMaterial({
color:0xffffff,
size:.055,
transparent:true,
opacity:.8
})
)
);
}


/* WATER */

function water(){

const w=new THREE.Mesh(
new THREE.CylinderGeometry(14,14,.3,64),
new THREE.MeshStandardMaterial({
color:0x100b25,
roughness:.12,
metalness:.6
})
);

w.position.y=-1.45;
scene.add(w);

const ring=new THREE.Mesh(
new THREE.TorusGeometry(11,.055,10,128),
new THREE.MeshBasicMaterial({
color:0x824cff,
transparent:true,
opacity:.8
})
);

ring.rotation.x=Math.PI/2;
ring.position.y=-1.25;
scene.add(ring);
}


/* ISLAND */

function island(){

const base=new THREE.Mesh(
new THREE.CylinderGeometry(7.5,6,1.6,64),
new THREE.MeshStandardMaterial({
color:0x171226,
roughness:.92
})
);

base.position.y=-.65;
base.receiveShadow=true;
scene.add(base);

const grass=new THREE.Mesh(
new THREE.CylinderGeometry(7.15,5.7,.48,64),
new THREE.MeshStandardMaterial({
color:0x314d40,
roughness:1
})
);

grass.receiveShadow=true;
scene.add(grass);

const edge=new THREE.Mesh(
new THREE.TorusGeometry(7.15,.05,8,128),
new THREE.MeshBasicMaterial({
color:0xb15cff
})
);

edge.rotation.x=Math.PI/2;
edge.position.y=.26;
scene.add(edge);
}


/* PLAZA */

function plaza(){

const p=new THREE.Mesh(
new THREE.CylinderGeometry(1.35,1.35,.1,32),
new THREE.MeshStandardMaterial({
color:0x44394e,
roughness:.7
})
);

p.position.y=.27;
scene.add(p);

const orb=new THREE.Mesh(
new THREE.SphereGeometry(.24,16,12),
new THREE.MeshBasicMaterial({
color:0xa45cff
})
);

orb.position.y=.7;
scene.add(orb);

const light=new THREE.PointLight(
0xa45cff,5,5
);

light.position.y=.7;
scene.add(light);
}


/* PATHS */

function paths(){

threads.forEach(d=>{

const length=Math.sqrt(
d.x*d.x+d.z*d.z
);

const path=new THREE.Mesh(
new THREE.BoxGeometry(.32,.035,length),
new THREE.MeshStandardMaterial({
color:0x665c70,
roughness:.9
})
);

path.position.set(
d.x/2,.25,d.z/2
);

path.rotation.y=Math.atan2(d.x,d.z);

scene.add(path);

});
}


/* STREET LIGHTS */

function streetLights(){

threads.forEach(d=>{

for(let i=1;i<=3;i++){

const a=i/4;
const x=d.x*a;
const z=d.z*a;

const pole=new THREE.Mesh(
new THREE.CylinderGeometry(
.025,.035,.55,8
),
new THREE.MeshStandardMaterial({
color:0x292332,
metalness:.5
})
);

pole.position.set(
x+.23,.52,z-.23
);

scene.add(pole);

const lamp=new THREE.Mesh(
new THREE.SphereGeometry(.065,10,8),
new THREE.MeshBasicMaterial({
color:0x8f7cff
})
);

lamp.position.set(
x+.23,.82,z-.23
);

scene.add(lamp);

const light=new THREE.PointLight(
0x7c65ff,.65,1.8
);

light.position.copy(lamp.position);
scene.add(light);

}

});
}


/* BUILDINGS */

function buildings(){

threads.forEach(d=>{

const g=new THREE.Group();
const glow=colors[d.state];

let w=1.3,h=1.15,dep=1.15;

if(d.type==="hub"){
w=1.7;h=1.5;dep=1.7;
}

if(d.type==="lab"){
w=1.45;h=1.35;dep=1.45;
}

if(d.type==="school"){
w=1.55;h=1.3;dep=1.4;
}

const base=new THREE.Mesh(
new THREE.CylinderGeometry(1.05,1.18,.2,20),
new THREE.MeshStandardMaterial({
color:0x282034,
roughness:.8
})
);

base.position.y=.28;
g.add(base);

const body=new THREE.Mesh(
new THREE.BoxGeometry(w,h,dep),
new THREE.MeshStandardMaterial({
color:d.type==="hub"
?0x554565
:0x40384e,
roughness:.43,
metalness:.2
})
);

body.position.y=.9;
body.castShadow=true;
g.add(body);

let roof;

if(d.type==="lab"){

roof=new THREE.Mesh(
new THREE.ConeGeometry(1.15,.55,8),
new THREE.MeshStandardMaterial({
color:0x21172f,
roughness:.5
})
);

}else if(d.type==="school"){

roof=new THREE.Mesh(
new THREE.BoxGeometry(1.75,.22,1.55),
new THREE.MeshStandardMaterial({
color:0x21182f,
roughness:.55
})
);

roof.rotation.z=.035;

}else if(d.type==="hub"){

roof=new THREE.Mesh(
new THREE.CylinderGeometry(1,.85,.4,8),
new THREE.MeshStandardMaterial({
color:0x21172f,
roughness:.5
})
);

}else{

roof=new THREE.Mesh(
new THREE.ConeGeometry(1.05,.7,4),
new THREE.MeshStandardMaterial({
color:0x21182f,
roughness:.6
})
);

roof.rotation.y=Math.PI/4;

}

roof.position.y=d.type==="hub"?1.9:1.8;
g.add(roof);


/* WINDOWS */

[-.4,.4].forEach(x=>{

const win=new THREE.Mesh(
new THREE.BoxGeometry(.27,.32,.04),
new THREE.MeshBasicMaterial({
color:glow
})
);

win.position.set(x,1,.59);
g.add(win);

});


/* DOOR */

const door=new THREE.Mesh(
new THREE.BoxGeometry(.25,.48,.04),
new THREE.MeshBasicMaterial({
color:0x120d19
})
);

door.position.set(0,.58,.59);
g.add(door);


/* SIGN */

const sign=new THREE.Mesh(
new THREE.BoxGeometry(.72,.16,.04),
new THREE.MeshBasicMaterial({
color:glow
})
);

sign.position.set(0,1.34,.62);
g.add(sign);


/* UNIQUE DETAILS */

if(d.type==="studio"){

const chimney=new THREE.Mesh(
new THREE.CylinderGeometry(.12,.14,.5,8),
new THREE.MeshStandardMaterial({
color:0x30273a
})
);

chimney.position.set(.45,2.05,-.25);
g.add(chimney);

}

if(d.type==="office"){

const antenna=new THREE.Mesh(
new THREE.CylinderGeometry(.025,.025,.55,8),
new THREE.MeshStandardMaterial({
color:0x6f6678,
metalness:.7
})
);

antenna.position.y=2.15;
g.add(antenna);

}

if(d.type==="lab"){

const r=new THREE.Mesh(
new THREE.TorusGeometry(.32,.035,8,32),
new THREE.MeshBasicMaterial({
color:glow
})
);

r.rotation.x=Math.PI/2;
r.position.y=2.05;
g.add(r);

}

if(d.type==="school"){

const flag=new THREE.Mesh(
new THREE.BoxGeometry(.42,.25,.025),
new THREE.MeshBasicMaterial({
color:glow
})
);

flag.position.set(.35,2.05,0);
g.add(flag);

}

if(d.type==="hub"){

const crown=new THREE.Mesh(
new THREE.SphereGeometry(.16,12,10),
new THREE.MeshBasicMaterial({
color:glow
})
);

crown.position.y=2.25;
g.add(crown);

}

const light=new THREE.PointLight(
glow,
d.state==="dormant"?0.25:2.5,
3.2
);

light.position.y=1.15;
g.add(light);

g.position.set(d.x,0,d.z);

scene.add(g);

});
}


/* TREES */

function trees(){

[
[-5.6,-3.5],
[-5.8,.8],
[-4.8,4.1],
[-1.3,5.2],
[2,5],
[5.2,3.5],
[5.6,.6],
[5,-3.7],
[2,-5],
[-2.3,-5]
].forEach(([x,z],i)=>{

const tree=new THREE.Group();

const trunk=new THREE.Mesh(
new THREE.CylinderGeometry(.07,.12,.65,8),
new THREE.MeshStandardMaterial({
color:0x50352c
})
);

trunk.position.y=.43;

const crown=new THREE.Mesh(
new THREE.SphereGeometry(.48,12,10),
new THREE.MeshStandardMaterial({
color:i%2?0x416b57:0x365f50,
roughness:1
})
);

crown.position.y=.9;
crown.castShadow=true;

tree.add(trunk,crown);
tree.position.set(x,0,z);

scene.add(tree);

});
}


/* FIREFLY LIGHTS */

function fireflyLights(){

for(let i=0;i<24;i++){

const light=new THREE.PointLight(
i%2?0x62dfff:0xa45cff,
.8,
1.5
);

const x=(Math.random()-.5)*11;
const y=.7+Math.random()*2.5;
const z=(Math.random()-.5)*11;

light.position.set(x,y,z);
scene.add(light);

fireflies.push({
light,
x,y,z,
phase:Math.random()*Math.PI*2
});

}
}


/* =========================
   CHARACTERS
========================= */

function residents(){

threads.forEach(d=>{

const r=new THREE.Group();

r.position.set(
d.x+1,
0,
d.z+.72
);


/* BODY */

const body=new THREE.Mesh(
new THREE.SphereGeometry(.3,18,14),
new THREE.MeshStandardMaterial({
color:0xe7e2f0,
metalness:.4,
roughness:.23
})
);

body.scale.y=1.2;
body.position.y=.7;
body.castShadow=true;


/* HEAD */

const head=new THREE.Mesh(
new THREE.SphereGeometry(.34,18,14),
new THREE.MeshStandardMaterial({
color:0xf5f0ff,
metalness:.25,
roughness:.2
})
);

head.position.y=1.3;
head.castShadow=true;


/* VISOR */

const visor=new THREE.Mesh(
new THREE.SphereGeometry(.22,16,10),
new THREE.MeshBasicMaterial({
color:colors[d.state]
})
);

visor.scale.set(1,.48,.3);
visor.position.set(0,1.3,.29);


/* EYES */

const eyeMat=new THREE.MeshBasicMaterial({
color:0xffffff
});

const eye1=new THREE.Mesh(
new THREE.SphereGeometry(.025,8,8),
eyeMat
);

const eye2=eye1.clone();

eye1.position.set(-.07,1.32,.36);
eye2.position.set(.07,1.32,.36);


/* GLOW */

const glow=new THREE.PointLight(
colors[d.state],3,2.5
);

glow.position.set(0,1.1,.2);

r.add(
body,
head,
visor,
eye1,
eye2,
glow
);


/* CHARACTER ACCESSORIES */

if(d.state==="working"){

const pack=new THREE.Mesh(
new THREE.BoxGeometry(.34,.42,.16),
new THREE.MeshStandardMaterial({
color:0x33264c,
metalness:.25
})
);

pack.position.set(0,.78,-.27);
r.add(pack);


/* TOOL */

const tool=new THREE.Mesh(
new THREE.CylinderGeometry(.035,.05,.45,8),
new THREE.MeshStandardMaterial({
color:0xa99db7,
metalness:.7
})
);

tool.rotation.z=Math.PI/2;
tool.position.set(.38,.72,.08);

r.add(tool);

}


if(d.state==="waiting"){

/* CLIPBOARD */

const board=new THREE.Mesh(
new THREE.BoxGeometry(.28,.34,.035),
new THREE.MeshStandardMaterial({
color:0x8a6530,
roughness:.5
})
);

board.position.set(.38,.75,.1);
board.rotation.z=-.12;

r.add(board);

}


if(d.state==="finished"){

/* GRADUATION CAP */

const cap=new THREE.Mesh(
new THREE.BoxGeometry(.48,.07,.48),
new THREE.MeshStandardMaterial({
color:0x272033,
roughness:.4
})
);

cap.position.y=1.67;
r.add(cap);

const tassel=new THREE.Mesh(
new THREE.CylinderGeometry(.025,.025,.25,6),
new THREE.MeshBasicMaterial({
color:colors.finished
})
);

tassel.position.set(
.18,1.52,.05
);

r.add(tassel);

}


if(d.state==="idle"){

/* IDEA ORB */

const idea=new THREE.Mesh(
new THREE.SphereGeometry(.1,12,10),
new THREE.MeshBasicMaterial({
color:colors.idle
})
);

idea.position.set(
0,1.85,0
);

r.add(idea);

}


if(d.state==="dormant"){

/* SLEEP Z */

const z=new THREE.Mesh(
new THREE.SphereGeometry(.08,10,8),
new THREE.MeshBasicMaterial({
color:0xaaa3b5
})
);

z.position.set(
.28,1.72,0
);

r.add(z);

}


/* ACTIVE BEACON */

if(
d.state==="working"||
d.state==="waiting"
){

const beacon=new THREE.Mesh(
new THREE.SphereGeometry(.1,12,10),
new THREE.MeshBasicMaterial({
color:colors[d.state]
})
);

beacon.position.y=1.82;

r.add(beacon);

}


r.userData={
...d,
baseX:r.position.x,
baseZ:r.position.z,
phase:Math.random()*Math.PI*2
};

scene.add(r);
residents.push(r);

label(d);

});
}


/* LABEL */

function label(d){

const canvas=document.createElement("canvas");

canvas.width=512;
canvas.height=110;

const ctx=canvas.getContext("2d");

ctx.fillStyle="rgba(12,8,22,.9)";

ctx.beginPath();
ctx.roundRect(15,15,482,80,28);
ctx.fill();

ctx.font="bold 30px sans-serif";
ctx.textAlign="center";
ctx.textBaseline="middle";
ctx.fillStyle="#fff";

ctx.fillText(
d.name,
256,55
);

const texture=new THREE.CanvasTexture(canvas);

const sprite=new THREE.Sprite(
new THREE.SpriteMaterial({
map:texture,
transparent:true
})
);

sprite.scale.set(2.15,.46,1);

sprite.position.set(
d.x,
2.48,
d.z
);

scene.add(sprite);
labels.push(sprite);
}


/* CONTROLS */

function controls(){

renderer.domElement.addEventListener(
"pointerdown",
e=>{

pointer.x=e.clientX/innerWidth*2-1;
pointer.y=-(e.clientY/innerHeight)*2+1;

raycaster.setFromCamera(
pointer,
camera
);

const hits=raycaster.intersectObjects(
residents,true
);

if(!hits.length)return;

let obj=hits[0].object;

while(
obj.parent&&!obj.userData.name
){
obj=obj.parent;
}

if(obj.userData.name){
openSheet(obj.userData);
}

}
);


renderer.domElement.addEventListener(
"touchstart",
e=>{

if(e.touches.length===1){

lastX=e.touches[0].clientX;
lastY=e.touches[0].clientY;

}

if(e.touches.length===2){

pinchDistance=distance(
e.touches[0],
e.touches[1]
);

}

},
{passive:true}
);


renderer.domElement.addEventListener(
"touchmove",
e=>{

if(e.touches.length===1){

const x=e.touches[0].clientX;
const y=e.touches[0].clientY;

theta-=(x-lastX)*.008;
phi+=(y-lastY)*.006;

phi=Math.max(
.55,
Math.min(1.25,phi)
);

lastX=x;
lastY=y;

}

if(e.touches.length===2){

const current=distance(
e.touches[0],
e.touches[1]
);

radius-=(current-pinchDistance)*.018;

radius=Math.max(
8,
Math.min(18,radius)
);

pinchDistance=current;

}

},
{passive:true}
);

}


function distance(a,b){

const dx=a.clientX-b.clientX;
const dy=a.clientY-b.clientY;

return Math.sqrt(dx*dx+dy*dy);
}


/* CAMERA */

function cameraMove(){

camera.position.x=
radius*Math.sin(phi)*Math.sin(theta);

camera.position.y=
radius*Math.cos(phi);

camera.position.z=
radius*Math.sin(phi)*Math.cos(theta);

camera.lookAt(0,.35,0);
}


/* SHEET */

function openSheet(d){

document.getElementById(
"sheetTitle"
).textContent=d.name;

document.getElementById(
"sheetState"
).textContent=
d.state.toUpperCase();

document.getElementById(
"sheetText"
).textContent=
stateText(d.state);

document.getElementById(
"progressFill"
).style.width=
d.progress+"%";

const sheet=
document.getElementById("sheet");

sheet.style.bottom="145px";

sheet.classList.add("open");
}


function stateText(s){

return{

working:
"This conversation is actively working. Your resident is moving through the world.",

waiting:
"This conversation is waiting for your attention.",

finished:
"This conversation has completed its current task.",

idle:
"This conversation is available and resting.",

dormant:
"This conversation has been quiet for a while."

}[s];

}


function sheet(){

const close=
document.getElementById("closeSheet");

if(close){

close.onclick=()=>{

document.getElementById(
"sheet"
).classList.remove("open");

};

}

}


/* ANIMATION */

function animate(){

requestAnimationFrame(animate);

const t=performance.now()/1000;

cameraMove();


residents.forEach(r=>{

const d=r.userData;


/* WORKING */

if(d.state==="working"){

r.position.x=
d.baseX+
Math.sin(t*1.3+d.phase)*.55;

r.position.z=
d.baseZ+
Math.cos(t*1.1+d.phase)*.42;

r.rotation.y+=.018;

}


/* WAITING */

if(d.state==="waiting"){

r.rotation.y=
Math.sin(t*.8+d.phase)*.35;

}


/* FINISHED */

if(d.state==="finished"){

r.position.y=
Math.abs(
Math.sin(t*2+d.phase)
)*.12;

r.rotation.z=
Math.sin(t*1.5+d.phase)*.1;

}


/* IDLE */

if(d.state==="idle"){

r.position.x=
d.baseX+
Math.sin(t*.35+d.phase)*.18;

r.position.z=
d.baseZ+
Math.cos(t*.3+d.phase)*.15;

r.position.y=
Math.sin(t*1.1+d.phase)*.035;

}


/* DORMANT */

if(d.state==="dormant"){

r.position.y=
Math.sin(t*.7+d.phase)*.015;

}


/* ACTIVE BEACON */

if(
d.state==="working"||
d.state==="waiting"
){

const beacon=
r.children[r.children.length-1];

if(beacon){

beacon.scale.setScalar(
1+
Math.sin(t*5+d.phase)*.4
);

}

}

});


/* FIREFLIES */

fireflies.forEach(f=>{

f.light.position.y=
f.y+
Math.sin(t*1.2+f.phase)*.35;

f.light.position.x=
f.x+
Math.sin(t*.5+f.phase)*.5;

f.light.position.z=
f.z+
Math.cos(t*.6+f.phase)*.5;

f.light.intensity=
.35+
Math.abs(
Math.sin(t*2+f.phase)
)*.9;

});


labels.forEach(l=>{

l.material.opacity=
.82+
Math.sin(t*1.4)*.08;

});


renderer.render(
scene,
camera
);

}


/* RESIZE */

function resize(){

camera.aspect=
innerWidth/innerHeight;

camera.updateProjectionMatrix();

renderer.setSize(
innerWidth,
innerHeight
);

}


/* START */

startWorld();
