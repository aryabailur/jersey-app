// api/delete-image.js

const cloudinary = require("cloudinary").v2;

// Load credentials from environment variables set on Vercel
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = async (req, res) => {
  // Add a handler to ensure the function correctly processes POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { publicId } = req.body;
    if (!publicId) {
      return res.status(400).json({ error: "Public ID is required." });
    }

    // Delete the image from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      res.status(200).json({ message: "Image deleted successfully." });
    } else {
      res
        .status(500)
        .json({ error: "Failed to delete image from Cloudinary." });
    }
  } catch (error) {
    console.error("Cloudinary deletion error:", error);
    res.status(500).json({ error: "Server error during deletion." });
  }
};
