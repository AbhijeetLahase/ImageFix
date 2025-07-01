const axios = require('axios');
const fs = require('fs');
const { cloudinary } = require('../config/cloudinary');
const Image = require('../models/Image');
const FormData = require('form-data'); // ✅ Must be added
const path = require('path');   

exports.handleImageUpload = async (req, res) => {
  try {
    // 1. Prepare form-data to send to ML API
    const form = new FormData();
    form.append('file', fs.createReadStream(req.file.path));

    // 2. Call ML API
    const response = await axios.post(
      process.env.ML_API_URL,
      form,
      {
        headers: form.getHeaders(),
        responseType: 'stream', // 👈 VERY important
      }
    );

    // 3. Save the response stream to a temp file
    const enhancedPath = path.join('uploads', 'enhanced_' + Date.now() + '.jpg');
    const writer = fs.createWriteStream(enhancedPath);

    response.data.pipe(writer);

    writer.on('finish', async () => {
      // 4. Upload the enhanced image to Cloudinary
      const cloudinaryResult = await cloudinary.uploader.upload(enhancedPath);

      // 5. Cleanup temp files
      fs.unlinkSync(req.file.path);      // original
      fs.unlinkSync(enhancedPath);       // enhanced

      // 6. Respond to client
      res.json({ url: cloudinaryResult.secure_url });
    });

    writer.on('error', (err) => {
      throw err;
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Image processing failed' });
  }
};
