const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const cloudinary = require('cloudinary').v2;


const { handleImageUpload } = require('../controllers/imageController');

// Move this block to the top, before any route uses `upload`
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

router.post('/enhance', upload.single('file'), async (req, res) => {
    console.log('POST /enhance called');
  console.log('File:', req.file);
  console.log('User ID:', req.body.userId);
  try {
    const imagePath = req.file.path;
    const userId = req.body.userId || 'anonymous'; // Get userId from form-data

    // 1. Send to FastAPI for enhancement
    const form = new FormData();
    form.append('file', fs.createReadStream(imagePath));
    const response = await axios.post('http://localhost:8001/enhance', form, {
      headers: form.getHeaders(),
      responseType: 'arraybuffer',
    });

    // 2. Save enhanced image to a temp file
    const enhancedPath = 'uploads/' + Date.now() + '_enhanced.png';
    fs.writeFileSync(enhancedPath, response.data);

    // 3. Upload to Cloudinary in user-specific folder
    const cloudinaryResult = await cloudinary.uploader.upload(enhancedPath, {
      folder: `enhanced_images/${userId}`,
    });

    // 4. Clean up temp files
    fs.unlinkSync(imagePath);
    fs.unlinkSync(enhancedPath);

    // 5. Return Cloudinary URL
    res.json({ cloudinaryUrl: cloudinaryResult.secure_url });
  } catch (error) {
    console.error('Error enhancing image:', error.message);
    res.status(500).json({ error: 'Failed to enhance image' });
  }
});

router.post('/upload', upload.single('image'), handleImageUpload);

module.exports = router;