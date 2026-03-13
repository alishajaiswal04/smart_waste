/* PARTICLES BACKGROUND */

particlesJS("particles-js",{
particles:{
number:{value:60,density:{enable:true,value_area:900}},
color:{value:["#22c55e","#0ea5e9","#a3e635"]},
shape:{type:"circle"},
opacity:{value:0.4},
size:{value:3,random:true},
line_linked:{
enable:true,
distance:130,
color:"#a5b4fc",
opacity:0.3,
width:1
},
move:{
enable:true,
speed:1.3
}
},
interactivity:{
events:{
onhover:{enable:true,mode:"grab"}
},
modes:{
grab:{distance:150}
}
},
retina_detect:true
});


/* ANIME CARD ENTRANCE */

window.addEventListener("load",()=>{

anime({
targets:".card",
translateY:[30,0],
opacity:[0,1],
delay:anime.stagger(100),
easing:"easeOutQuad",
duration:650
});

});


/* SIDEBAR TOGGLE */

const sidebarToggle=document.getElementById("sidebarToggle");

if(sidebarToggle){
sidebarToggle.addEventListener("click",()=>{
document.body.classList.toggle("sidebar-collapsed");
});
}



/* CHARTS */

new Chart(document.getElementById("wasteChart"),{
type:"line",
data:{
labels:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
datasets:[{
label:"Waste Collected",
data:[210,190,250,230,280,300,270],
borderColor:"#167a42",
fill:false
}]
}
});


new Chart(document.getElementById("binChart"),{
type:"doughnut",
data:{
labels:["Empty","Half","Almost Full","Full"],
datasets:[{
data:[30,40,20,10],
backgroundColor:["#2ecc71","#f1c40f","#e67e22","#e74c3c"]
}]
}
});


new Chart(document.getElementById("truckChart"),{
type:"bar",
data:{
labels:["Truck A","Truck B","Truck C","Truck D"],
datasets:[{
label:"Waste Collected",
data:[120,150,100,180],
backgroundColor:"#167a42"
}]
}
});


/* REPORT DOWNLOAD */

function downloadReport(type){

let text="Smart Waste "+type+" report";

let blob=new Blob([text],{type:"text/plain"});

let link=document.createElement("a");

link.href=URL.createObjectURL(blob);

link.download=type+"_report.txt";

link.click();

}



/* THREE.JS SMART CITY BACKGROUND */

(function(){

const container=document.getElementById("three-bg");

if(!container || typeof THREE==="undefined") return;

const scene=new THREE.Scene();
scene.fog=new THREE.FogExp2(0xe0f2f1,0.02);

const camera=new THREE.PerspectiveCamera(
45,
window.innerWidth/window.innerHeight,
0.1,
1000
);

camera.position.set(25,30,40);
camera.lookAt(0,0,0);

const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});
renderer.setSize(window.innerWidth,window.innerHeight);

container.appendChild(renderer.domElement);

const ambient=new THREE.AmbientLight(0xffffff,0.7);
scene.add(ambient);

const dir=new THREE.DirectionalLight(0xffffff,0.7);
dir.position.set(20,40,20);
scene.add(dir);

const city=new THREE.Group();
scene.add(city);

const ground=new THREE.Mesh(
new THREE.PlaneGeometry(120,120),
new THREE.MeshPhongMaterial({color:0xe0f7fa})
);

ground.rotation.x=-Math.PI/2;
city.add(ground);


/* BUILDINGS */

function building(x,z,h){

const mesh=new THREE.Mesh(
new THREE.BoxGeometry(5, h, 5),
new THREE.MeshPhongMaterial({color:0x22c55e})
);

mesh.position.set(x,h/2,z);

city.add(mesh);

}

for(let x=-40;x<=40;x+=10){
for(let z=-40;z<=40;z+=10){

if(Math.random()<0.3) continue;

building(x,z,5+Math.random()*15);

}
}



/* TRUCKS */

const trucks=[];

function addTruck(z){

const mesh=new THREE.Mesh(
new THREE.BoxGeometry(2,1,1),
new THREE.MeshPhongMaterial({color:0xff7043})
);

mesh.position.set(-50,0.6,z);

mesh.userData.speed=0.08+Math.random()*0.04;

city.add(mesh);

trucks.push(mesh);

}

addTruck(-15);
addTruck(5);
addTruck(25);



function animate(){

requestAnimationFrame(animate);

city.rotation.y+=0.0005;

trucks.forEach(t=>{

t.position.x+=t.userData.speed;

if(t.position.x>50) t.position.x=-50;

});

renderer.render(scene,camera);

}

animate();

})();