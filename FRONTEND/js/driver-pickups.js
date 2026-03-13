// DATE
document.getElementById("date").innerText =
new Date().toLocaleString();

let collected = 0;
let total = 5;

function collect(btn){

const row = btn.parentElement.parentElement;

const statusCell = row.querySelector(".status");

statusCell.innerText = "Collected";

btn.innerText = "Done";
btn.disabled = true;

collected++;

document.getElementById("collectedBins").innerText = collected;

document.getElementById("pendingBins").innerText = total - collected;

}