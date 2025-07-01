const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  originalName: String,
  cloudinaryUrl: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Image', imageSchema);
