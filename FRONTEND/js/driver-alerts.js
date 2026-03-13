// DATE
document.getElementById("date").innerText =
new Date().toLocaleString();

function resolveAlert(btn){

const row = btn.parentElement.parentElement;

btn.innerText = "Resolved";
btn.disabled = true;

row.style.background = "#e6ffe6";

}