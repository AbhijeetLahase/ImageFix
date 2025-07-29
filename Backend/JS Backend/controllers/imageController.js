const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const cloudinary = require('cloudinary').v2;
const Image = require('../models/Image'); // Import Image model

exports.handleImageUpload = async (req, res) => {
  try {
    const imagePath = req.file.path;
    const userId = req.userId; // Injected by verifyToken

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized user' });
    }

    // 1. Send to FastAPI for enhancement
    const form = new FormData();
    form.append('file', fs.createReadStream(imagePath));

    const response = await axios.post('http://localhost:8001/enhance', form, {
      headers: form.getHeaders(),
      responseType: 'arraybuffer',
    });

    // 2. Save enhanced image to temp
    const enhancedPath = `uploads/${Date.now()}_enhanced.png`;
    fs.writeFileSync(enhancedPath, response.data);

    // 3. Upload to Cloudinary
    const cloudinaryResult = await cloudinary.uploader.upload(enhancedPath, {
      folder: `enhanced_images/${userId}`,
    });

    // 4. Save image info to MongoDB
    await Image.create({
      originalName: req.file.originalname,
      cloudinaryUrl: cloudinaryResult.secure_url,
      userId: userId,
    });

    // 5. Cleanup temp files
    fs.unlinkSync(imagePath);
    fs.unlinkSync(enhancedPath);

    // 6. Respond to client
    res.json({ cloudinaryUrl: cloudinaryResult.secure_url });

  } catch (error) {
    console.error('Image enhancement error:', error.message);
    res.status(500).json({ error: 'Image enhancement failed' });
  }
};


// const Image = require('../models/Image');
function extractPublicId(cloudinaryUrl) {
  const urlParts = cloudinaryUrl.split('/');
  const versionIndex = urlParts.findIndex(part => /^v\d+/.test(part));

  // Get everything after the version number
  const publicIdWithExt = urlParts.slice(versionIndex + 1).join('/');
  
  // Remove the file extension (.jpg, .png, etc.)
  const lastDot = publicIdWithExt.lastIndexOf('.');
  const publicId = lastDot !== -1 ? publicIdWithExt.substring(0, lastDot) : publicIdWithExt;

  return publicId;
}


exports.getUserImages = async (req, res) => {
  try {
    const userId = req.userId;

    const images = await Image.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json(images);
  } catch (error) {
    console.error('Error fetching user images:', error.message);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
};

exports.handleImageDelete = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    const publicId = extractPublicId(image.cloudinaryUrl);

    await cloudinary.uploader.destroy(publicId);
    await Image.deleteOne(image._id);

    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (err) {
    console.error('Error deleting image:', err);
    res.status(500).json({ message: 'Server error' });
  }
}