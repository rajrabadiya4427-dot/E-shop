const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// @route   GET /api/products
// @desc    Get all products (with search & category filtering)
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = {};

    if (category && category !== 'all') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (search) {
      const words = search.split(/\s+/).filter(Boolean);
      if (words.length > 0) {
        query.$and = words.map(word => {
          const regex = { $regex: word, $options: 'i' };
          return {
            $or: [
              { name: regex },
              { description: regex },
              { category: regex }
            ]
          };
        });
      }
    }

    const products = await Product.find(query);
    
    // Map _id to id for frontend compatibility
    const mappedProducts = products.map(product => {
      const p = product.toObject();
      p.id = p._id.toString();
      return p;
    });

    res.json(mappedProducts);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving products', error: error.message });
  }
});

// @route   GET /api/products/:id
// @desc    Get a single product details
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const p = product.toObject();
    p.id = p._id.toString();
    res.json(p);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving product details', error: error.message });
  }
});

module.exports = router;
