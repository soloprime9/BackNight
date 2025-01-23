const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to extract video ID from URL
const extractVideoId = (url) => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

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
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const contentType = response.headers["content-type"];

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
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
