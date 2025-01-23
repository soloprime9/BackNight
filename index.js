const express = require("express");

const axios = require("axios");

const app = express();


// Middleware
const cors = require("cors");

app.use(cors({
    origin: "https://nightf-qn3y.vercel.app", // Replace with your frontend URL
    methods: ["GET", "POST", "OPTIONS"],      // Allow these HTTP methods
    allowedHeaders: ["Content-Type"],         // Allow these headers
    credentials: false                         // Allow credentials (if required)
}));
app.use(express.json());

// Helper function to extract video ID from URL
const extractVideoId = (url) => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

app.get("/", (req, res) => {
  res.send("Hello World Bro");
});

// API endpoint to generate thumbnail URLs
app.post("/api/get-thumbnails", (req, res) => {
  

  const { videoUrl } = req.body;

  if (!videoUrl) {
    return res.status(400).json({ error: "Video URL is required" });
  }

  const videoId = extractVideoId(videoUrl);
  if (!videoId) {
    return res.status(400).json({ error: "Invalid YouTube URL" });
  }

  // Generate thumbnail URLs
  const thumbnails = {
    default: `https://img.youtube.com/vi/${videoId}/default.jpg`,
    medium: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    high: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    maxRes: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
  };

  res.json({ videoId, thumbnails });
});


// Proxy endpoint for downloading images
app.get("/api/download", async (req, res) => {
  const { url } = req.query;

  try {
    // Fetch the thumbnail without cookies
    const response = await axios.get(url, {
      responseType: "arraybuffer", // Ensure the response is treated as binary
      withCredentials: false      // Prevent cookies from being sent
    });

    const contentType = response.headers["content-type"];

    // Set headers for the downloaded image
    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=thumbnail-${Date.now()}.jpg`
    );

    res.send(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to download image" });
  }
});

// Start server
// API endpoints...
module.exports = app; // Export the app for Vercel
