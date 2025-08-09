// server.js

// Import required packages
const express = require("express");
const cloudinary = require("cloudinary").v2;
const bodyParser = require("body-parser");
require("dotenv").config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 3001;

// ==============================================
// 📦 Cloudinary Configuration
// ==============================================
// This configuration uses the API credentials from your .env file
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ==============================================
// 📦 Middleware
// ==============================================
// Use body-parser to parse incoming JSON requests
app.use(bodyParser.json());

// Set up a simple CORS policy to allow requests from your React app
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // Your React app URL
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// ==============================================
// ✍️ API Endpoint for Image Deletion
// ==============================================
app.post("/api/delete-image", async (req, res) => {
  try {
    const { publicId } = req.body;
    if (!publicId) {
      return res.status(400).json({ error: "Public ID is required." });
    }

    // Delete the image from Cloudinary using the secure API secret
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      res.status(200).json({ message: "Image deleted successfully." });
    } else {
      console.error("Cloudinary deletion failed:", result);
      res
        .status(500)
        .json({ error: "Failed to delete image from Cloudinary." });
    }
  } catch (error) {
    console.error("Cloudinary deletion error:", error);
    res.status(500).json({ error: "Server error during deletion." });
  }
});

// ==============================================
// 💻 Start the Server
// ==============================================
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
