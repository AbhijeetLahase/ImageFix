const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const cloudinary = require('cloudinary').v2;

exports.handleImageUpload = async (req, res) => {
  try {
    const imagePath = req.file.path;
    const userId = req.userId || 'anonymous'; // From token

    // 1. Send to FastAPI for enhancement
    const form = new FormData();
    form.append('file', fs.createReadStream(imagePath));

    const response = await axios.post('http://localhost:8001/enhance', form, {
      headers: form.getHeaders(),
      responseType: 'arraybuffer',
    });

    // 2. Save enhanced image to temp
    const enhancedPath = 'uploads/' + Date.now() + '_enhanced.png';
    fs.writeFileSync(enhancedPath, response.data);

    // 3. Upload to Cloudinary
    const cloudinaryResult = await cloudinary.uploader.upload(enhancedPath, {
      folder: `enhanced_images/${userId}`,
    });

    // 4. Cleanup
    fs.unlinkSync(imagePath);
    fs.unlinkSync(enhancedPath);

    // 5. Respond with Cloudinary URL
    res.json({ cloudinaryUrl: cloudinaryResult.secure_url });
  } catch (error) {
    console.error('Error enhancing image:', error.message);
    res.status(500).json({ error: 'Failed to enhance image' });
  }
};
