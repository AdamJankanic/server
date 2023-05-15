const express = require("express");
const appRoute = require("./route.js");
const cors = require("cors");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const fs = require("fs");

const bodyParser = require("body-parser");
const { sequelize } = require("./models");
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));
app.use(cookieParser());

var PORT = process.env.PORT || 5000;

const corsOptions = {
  // origin: "http://127.0.0.1:3000",
  origin: [
    "https://client-production-ab49.up.railway.app",
    "http://127.0.0.1:3000",
  ],
  credentials: true,
};

//cors options for cookies
app.use(cors(corsOptions));

app.use(express.json());

// access to images
app.use(express.static(path.join(__dirname, "public")));

app.get("/images", (req, res) => {
  // Read the "public/images" directory and get the list of files
  const imageDir = path.join(__dirname, "public/images");
  fs.readdir(imageDir, (err, files) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to retrieve images" });
    }

    // Filter out non-image files (if needed)
    const imageFiles = files.filter((file) => {
      const fileExtension = path.extname(file).toLowerCase();
      return [".jpg", ".jpeg", ".png", ".gif"].includes(fileExtension);
    });

    // Create an array of image URLs
    const imageUrls = imageFiles.map((file) => `/images/${file}`);

    // Send the image URLs as a response
    res.json({ images: imageUrls });
  });
});

app.use(bodyParser.json());

app.use("/api", appRoute);

/* web sockets */
const http = require("http");
const server = http.createServer(app);
const { initializeWebSocket } = require("./websocket.js");
// Initialize WebSocket

const io = initializeWebSocket(server);
app.set("websocketIO", io);

async function main() {
  await sequelize.sync({ alter: true });
  console.log("Database & tables created!");
  console.log("Everything is ready!");
}

main();

server.listen(PORT, "0.0.0.0", (error) => {
  if (!error)
    console.log(
      "Server is Successfully Running	and App is listening on port " + PORT
    );
  else console.log("Error occurred, server can't start", error);
});
