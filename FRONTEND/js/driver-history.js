// BAR CHART

const barCtx = document.getElementById("barChart");

new Chart(barCtx, {

type: "bar",

data: {

labels: ["Mon","Tue","Wed","Thu","Fri","Sat"],

datasets: [{

label: "Bins Collected",

data: [5,7,6,8,4,9],

backgroundColor: "#22c55e"

}]

},

options: {

responsive:true,

plugins:{
legend:{display:false}
}

}

});


// PIE CHART

const pieCtx = document.getElementById("pieChart");

new Chart(pieCtx, {

type: "pie",

data: {

labels: ["Organic","Plastic","Metal","Other"],

datasets: [{

data: [45,25,15,15],

backgroundColor:[
"#22c55e",
"#3b82f6",
"#f59e0b",
"#ef4444"
]

}]

},

options:{
responsive:true
}

});



// PARTICLES BACKGROUND

particlesJS("particles-js", {

particles:{

number:{value:70},

color:{value:"#22c55e"},

shape:{type:"circle"},

opacity:{value:0.5},

size:{value:3},

line_linked:{
enable:true,
distance:150,
color:"#22c55e",
opacity:0.4,
width:1
},

move:{
enable:true,
speed:2
}

}

});