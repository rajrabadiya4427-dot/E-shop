const express = require('express');
const router = express.Router();
const { Order, Product } = require('../models');
const { authMiddleware } = require('../middleware/auth');

// Helper to format Order object to match Sequelize schema expected by React frontend
const formatOrder = (orderObj) => {
  if (!orderObj) return null;
  const formatted = { ...orderObj, id: orderObj._id.toString() };
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

// @route   POST /api/orders
// @desc    Place a new order
router.post('/', authMiddleware, async (req, res) => {
  const { shipping_address, payment_method, transaction_id, items } = req.body;

  try {
    if (!shipping_address || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Please provide shipping address and order items.' });
    }

    let total_amount = 0;
    const validatedItems = [];

    const productsToUpdate = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product: ${product.name}` });
      }

      productsToUpdate.push({ product, quantity: item.quantity });
      total_amount += product.price * item.quantity;

      validatedItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });
    }

    // Process stock decrements
    for (const pUpdate of productsToUpdate) {
      pUpdate.product.stock -= pUpdate.quantity;
      await pUpdate.product.save();
    }

    // Create Order
    let order = await Order.create({
      user: req.user._id,
      total_amount,
      shipping_address,
      payment_method,
      payment_status: payment_method === 'COD' ? 'Pending' : (payment_method === 'UPI' ? 'Pending Verification' : 'Paid'),
      transaction_id: payment_method === 'UPI' ? transaction_id : undefined,
      status: 'Pending',
      items: validatedItems
    });

    order = await Order.findById(order._id).populate('items.product');

    res.status(201).json(formatOrder(order.toObject()));
  } catch (error) {
    res.status(500).json({ message: 'Server error processing your order', error: error.message });
  }
});

// @route   GET /api/orders
// @desc    Get user orders
router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product')
      .sort({ createdAt: -1 });

    const formattedOrders = orders.map(order => formatOrder(order.toObject()));
    res.json(formattedOrders);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving orders', error: error.message });
  }
});

// @route   GET /api/orders/:id
// @desc    Get user order by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
      .populate('items.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(formatOrder(order.toObject()));
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving order details', error: error.message });
  }
});

module.exports = router;
