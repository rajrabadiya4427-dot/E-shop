const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  image_url: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    default: 0
  },
  tag: {
    type: String,
    default: 'none' // 'none', 'offer', 'trending', 'new'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema);
