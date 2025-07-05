const express = require('express');
const router = express.Router();
const multer = require('multer');

const { handleImageUpload } = require('../controllers/imageController');

router.post('/enhance', upload.single('image'), async (req, res) => {
  try {
    const imagePath = req.file.path;

    const form = new FormData();
    form.append('file', fs.createReadStream(imagePath));

    const response = await axios.post('http://localhost:8001/enhance', form, {
      headers: form.getHeaders(),
      responseType: 'arraybuffer', // So we get raw image bytes
    });

    // Optional: Set correct content type based on the returned file
    res.set('Content-Type', 'image/jpeg');
    res.send(response.data);

    // Clean up temp file
    fs.unlinkSync(imagePath);
  } catch (error) {
    console.error('Error enhancing image:', error.message);
    res.status(500).json({ error: 'Failed to enhance image' });
  }
});


const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const upload = multer({ storage });

router.post('/upload', upload.single('image'), handleImageUpload);

module.exports = router;
