const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  originalName: String,
  cloudinaryUrl: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Image', imageSchema);
