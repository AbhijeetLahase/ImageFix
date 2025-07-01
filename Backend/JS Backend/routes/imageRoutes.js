const express = require('express');
const router = express.Router();
const multer = require('multer');
const { handleImageUpload } = require('../controllers/imageController');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const upload = multer({ storage });

router.post('/upload', upload.single('image'), handleImageUpload);

module.exports = router;
