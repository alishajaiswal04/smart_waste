require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const alertRoutes = require("./routes/alertRoutes");
const truckRoutes = require("./routes/truckRoutes");
const aiRoutes = require("./routes/aiRoutes");
app.use("/api/ai", aiRoutes);

const http = require("http");
const socket = require("./socket");


const binRoutes = require("./routes/binRoutes");
// connect database
connectDB();
// middleware
app.use(express.json());

// API routes
app.use("/api/trucks", truckRoutes);
app.use("/api/bins", binRoutes);
// auth routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/alerts", alertRoutes);


// serve frontend static files
app.use(express.static(path.join(__dirname, "../FRONTEND"), { index: false }));

// landing page route
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "../FRONTEND/landing.html"));
});

const PORT = 8080;

const server = http.createServer(app);

const io = socket.init(server);

io.on("connection", (socket) => {
  console.log("Admin dashboard connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});