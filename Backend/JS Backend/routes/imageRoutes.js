const express = require('express');
const router = express.Router();
const multer = require('multer');
const verifyToken = require('../middlewares/authMiddleware');
const { handleImageUpload } = require('../controllers/imageController');

// Multer config
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// Single POST route
router.post('/enhance', verifyToken, upload.single('file'), handleImageUpload);

module.exports = router;
