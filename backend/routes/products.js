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
      const cleanSearch = search.trim();
      const escaped = cleanSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const words = cleanSearch.split(/\s+/).filter(Boolean).map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      
      if (words.length > 0) {
        query.$or = [
          { name: { $regex: escaped, $options: 'i' } },
          { category: { $regex: escaped, $options: 'i' } },
          { description: { $regex: escaped, $options: 'i' } },
          ...words.map(w => ({ name: { $regex: w, $options: 'i' } })),
          ...words.map(w => ({ category: { $regex: w, $options: 'i' } })),
          ...words.map(w => ({ description: { $regex: w, $options: 'i' } }))
        ];
      }
    }

    let products = await Product.find(query);

    // If search is active, rank products by relevance to product name
    if (search) {
      const lowerSearch = search.trim().toLowerCase();
      const searchWords = lowerSearch.split(/\s+/).filter(Boolean);

      products.sort((a, b) => {
        const aName = (a.name || '').toLowerCase();
        const bName = (b.name || '').toLowerCase();

        // Exact product name match
        if (aName === lowerSearch) return -1;
        if (bName === lowerSearch) return 1;

        // Name starts with full search query
        if (aName.startsWith(lowerSearch) && !bName.startsWith(lowerSearch)) return -1;
        if (!aName.startsWith(lowerSearch) && bName.startsWith(lowerSearch)) return 1;

        // Name contains full search query substring
        if (aName.includes(lowerSearch) && !bName.includes(lowerSearch)) return -1;
        if (!aName.includes(lowerSearch) && bName.includes(lowerSearch)) return 1;

        // Count how many search words appear in product name
        const aNameMatches = searchWords.filter(w => aName.includes(w)).length;
        const bNameMatches = searchWords.filter(w => bName.includes(w)).length;

        if (aNameMatches !== bNameMatches) {
          return bNameMatches - aNameMatches;
        }

        return 0;
      });
    }
    
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
