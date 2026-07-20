const express = require('express');
const router = express.Router();
const { User, Product, Order } = require('../models');
const { authMiddleware, adminOnly } = require('../middleware/auth');

router.use(authMiddleware);
router.use(adminOnly);

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer storage to frontend/public/img/
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', '..', 'frontend', 'public', 'img');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only image files (.jpg, .jpeg, .png, .webp, .gif) are allowed!"));
  }
});

// @route   POST /api/admin/upload
// @desc    Upload product image to frontend/public/img
router.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Copy the file to frontend/dist/img/ if the production build directory exists
    const devPath = req.file.path;
    const prodDir = path.join(__dirname, '..', '..', 'frontend', 'dist', 'img');
    if (fs.existsSync(path.join(__dirname, '..', '..', 'frontend', 'dist'))) {
      if (!fs.existsSync(prodDir)) {
        fs.mkdirSync(prodDir, { recursive: true });
      }
      fs.copyFileSync(devPath, path.join(prodDir, req.file.filename));
    }
    
    const fileUrl = `/img/${req.file.filename}`;
    res.json({ url: fileUrl });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
});

// Format helper to match frontend expectations
const formatOrder = (orderObj) => {
  if (!orderObj) return null;
  const formatted = { ...orderObj, id: orderObj._id.toString() };
  if (formatted.user) {
    formatted.user = {
      ...formatted.user,
      id: formatted.user._id.toString()
    };
  }
  if (formatted.items && Array.isArray(formatted.items)) {
    formatted.items = formatted.items.map((item) => {
      const formattedItem = { ...item, id: item._id?.toString() };
      if (formattedItem.product) {
        formattedItem.product = {
          ...formattedItem.product,
          id: formattedItem.product._id?.toString()
        };
      }
      return formattedItem;
    });
  }
  return formatted;
};

// @route   GET /api/admin/stats
// @desc    Retrieve system dashboard metrics
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalProducts = await Product.countDocuments();
    const orders = await Order.find();

    const totalOrders = orders.length;
    const totalSales = orders.reduce((acc, order) => {
      if (order.payment_status === 'Paid') {
        return acc + order.total_amount;
      }
      return acc;
    }, 0);

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalSales
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving admin statistics', error: error.message });
  }
});

// @route   POST /api/admin/products
// @desc    Add a new product
router.post('/products', async (req, res) => {
  const { name, description, price, category, image_url, stock } = req.body;
  try {
    if (!name || !description || price === undefined || !category || !image_url) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const product = await Product.create({
      name,
      description,
      price: parseFloat(price),
      category,
      image_url,
      stock: stock ? parseInt(stock) : 0
    });

    const p = product.toObject();
    p.id = p._id.toString();
    res.status(201).json(p);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating product', error: error.message });
  }
});

// @route   PUT /api/admin/products/:id
// @desc    Edit an existing product
router.put('/products/:id', async (req, res) => {
  const { name, description, price, category, image_url, stock } = req.body;
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = parseFloat(price);
    if (category !== undefined) product.category = category;
    if (image_url !== undefined) product.image_url = image_url;
    if (stock !== undefined) product.stock = parseInt(stock);

    await product.save();
    
    const p = product.toObject();
    p.id = p._id.toString();
    res.json(p);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating product', error: error.message });
  }
});

// @route   DELETE /api/admin/products/:id
// @desc    Delete a product
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting product', error: error.message });
  }
});

// @route   GET /api/admin/users
// @desc    Retrieve all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    const mappedUsers = users.map(user => {
      const u = user.toObject();
      u.id = u._id.toString();
      return u;
    });

    res.json(mappedUsers);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving users', error: error.message });
  }
});

// @route   GET /api/admin/orders
// @desc    Retrieve all orders from all users
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product')
      .sort({ createdAt: -1 });

    const formattedOrders = orders.map(order => formatOrder(order.toObject()));
    res.json(formattedOrders);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving all orders', error: error.message });
  }
});

// @route   PUT /api/admin/orders/:id/status
// @desc    Update order status
router.put('/orders/:id/status', async (req, res) => {
  const { status, payment_status } = req.body;
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (status !== undefined) order.status = status;
    if (payment_status !== undefined) order.payment_status = payment_status;

    await order.save();

    const updated = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('items.product');

    res.json(formatOrder(updated.toObject()));
  } catch (error) {
    res.status(500).json({ message: 'Server error updating order status', error: error.message });
  }
});

// @route   DELETE /api/admin/orders/:id
// @desc    Delete an order
router.delete('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting order', error: error.message });
  }
});

module.exports = router;
