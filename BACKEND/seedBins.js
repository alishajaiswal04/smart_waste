const mongoose = require("mongoose");
const Bin = require("./models/Bin");

async function connectDB() {
  await mongoose.connect("mongodb://127.0.0.1:27017/smartwaste");
  console.log("MongoDB Connected for Seeding");
}

const bins = [

{ binId:"B001", location:"Esplanade", latitude:22.5726, longitude:88.3639, fillLevel:85, waste_weight_kg:40, capacity_kg:60, status:"Critical" },
{ binId:"B002", location:"Esplanade", latitude:22.5730, longitude:88.3645, fillLevel:75, waste_weight_kg:35, capacity_kg:60, status:"Warning" },
{ binId:"B003", location:"Esplanade", latitude:22.5734, longitude:88.3651, fillLevel:80, waste_weight_kg:38, capacity_kg:60, status:"Critical" },
{ binId:"B004", location:"Esplanade", latitude:22.5728, longitude:88.3660, fillLevel:65, waste_weight_kg:30, capacity_kg:60, status:"Normal" },
{ binId:"B005", location:"Esplanade", latitude:22.5719, longitude:88.3640, fillLevel:90, waste_weight_kg:42, capacity_kg:60, status:"Critical" },

{ binId:"B006", location:"Park Street", latitude:22.5695, longitude:88.3690, fillLevel:82, waste_weight_kg:37, capacity_kg:60, status:"Critical" },
{ binId:"B007", location:"Park Street", latitude:22.5699, longitude:88.3696, fillLevel:78, waste_weight_kg:33, capacity_kg:60, status:"Warning" },
{ binId:"B008", location:"Park Street", latitude:22.5703, longitude:88.3702, fillLevel:72, waste_weight_kg:31, capacity_kg:60, status:"Warning" },
{ binId:"B009", location:"Park Street", latitude:22.5690, longitude:88.3685, fillLevel:88, waste_weight_kg:41, capacity_kg:60, status:"Critical" },
{ binId:"B010", location:"Park Street", latitude:22.5687, longitude:88.3679, fillLevel:67, waste_weight_kg:29, capacity_kg:60, status:"Normal" },

{ binId:"B011", location:"Sealdah", latitude:22.5750, longitude:88.3720, fillLevel:70, waste_weight_kg:32, capacity_kg:60, status:"Warning" },
{ binId:"B012", location:"Sealdah", latitude:22.5755, longitude:88.3726, fillLevel:85, waste_weight_kg:40, capacity_kg:60, status:"Critical" },
{ binId:"B013", location:"Sealdah", latitude:22.5760, longitude:88.3731, fillLevel:90, waste_weight_kg:43, capacity_kg:60, status:"Critical" },
{ binId:"B014", location:"Sealdah", latitude:22.5756, longitude:88.3738, fillLevel:77, waste_weight_kg:34, capacity_kg:60, status:"Warning" },
{ binId:"B015", location:"Sealdah", latitude:22.5748, longitude:88.3729, fillLevel:69, waste_weight_kg:30, capacity_kg:60, status:"Normal" },

{ binId:"B016", location:"Bhowanipore", latitude:22.5670, longitude:88.3620, fillLevel:88, waste_weight_kg:41, capacity_kg:60, status:"Critical" },
{ binId:"B017", location:"Bhowanipore", latitude:22.5674, longitude:88.3625, fillLevel:80, waste_weight_kg:37, capacity_kg:60, status:"Critical" },
{ binId:"B018", location:"Bhowanipore", latitude:22.5678, longitude:88.3630, fillLevel:74, waste_weight_kg:33, capacity_kg:60, status:"Warning" },
{ binId:"B019", location:"Bhowanipore", latitude:22.5682, longitude:88.3635, fillLevel:86, waste_weight_kg:39, capacity_kg:60, status:"Critical" },
{ binId:"B020", location:"Bhowanipore", latitude:22.5686, longitude:88.3640, fillLevel:65, waste_weight_kg:28, capacity_kg:60, status:"Normal" },

{ binId:"B021", location:"Shyambazar", latitude:22.5801, longitude:88.3705, fillLevel:82, waste_weight_kg:36, capacity_kg:60, status:"Critical" },
{ binId:"B022", location:"Shyambazar", latitude:22.5805, longitude:88.3710, fillLevel:78, waste_weight_kg:34, capacity_kg:60, status:"Warning" },
{ binId:"B023", location:"Shyambazar", latitude:22.5809, longitude:88.3715, fillLevel:90, waste_weight_kg:43, capacity_kg:60, status:"Critical" },
{ binId:"B024", location:"Shyambazar", latitude:22.5813, longitude:88.3720, fillLevel:87, waste_weight_kg:41, capacity_kg:60, status:"Critical" },
{ binId:"B025", location:"Shyambazar", latitude:22.5817, longitude:88.3725, fillLevel:76, waste_weight_kg:32, capacity_kg:60, status:"Warning" },

{ binId:"B026", location:"Kalighat", latitude:22.5630, longitude:88.3580, fillLevel:81, waste_weight_kg:36, capacity_kg:60, status:"Critical" },
{ binId:"B027", location:"Kalighat", latitude:22.5634, longitude:88.3586, fillLevel:73, waste_weight_kg:31, capacity_kg:60, status:"Warning" },
{ binId:"B028", location:"Kalighat", latitude:22.5638, longitude:88.3592, fillLevel:85, waste_weight_kg:40, capacity_kg:60, status:"Critical" },
{ binId:"B029", location:"Kalighat", latitude:22.5642, longitude:88.3598, fillLevel:68, waste_weight_kg:29, capacity_kg:60, status:"Normal" },
{ binId:"B030", location:"Kalighat", latitude:22.5646, longitude:88.3604, fillLevel:92, waste_weight_kg:44, capacity_kg:60, status:"Critical" }

];

async function seed() {
  await connectDB();

  await Bin.deleteMany();

  await Bin.insertMany(bins);

  console.log("30 Bins inserted successfully");

  process.exit();
}

seed();