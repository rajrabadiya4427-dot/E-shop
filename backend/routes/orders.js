const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { Order, Product } = require('../models');
const { authMiddleware } = require('../middleware/auth');

const rzpKeyId = process.env.RAZORPAY_KEY_ID;
const rzpKeySecret = process.env.RAZORPAY_KEY_SECRET;

let razorpay = null;
let MOCK_MODE = true;

if (rzpKeyId && rzpKeySecret) {
  try {
    razorpay = new Razorpay({
      key_id: rzpKeyId.trim(),
      key_secret: rzpKeySecret.trim()
    });
    MOCK_MODE = false;
    console.log('[Payment] Razorpay configured successfully.');
  } catch (err) {
    console.error('[Payment] Error initializing Razorpay, falling back to mock mode:', err.message);
  }
} else {
  console.log('[Payment] Razorpay key ID or Secret is not configured in .env. Running in MOCK Mode.');
}

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
// @desc    Place a new order (creates order in db and generates Razorpay payment session)
router.post('/', authMiddleware, async (req, res) => {
  const { shipping_address, payment_method, items } = req.body;

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

    // Create Order in DB
    let order = await Order.create({
      user: req.user._id,
      total_amount,
      shipping_address,
      payment_method,
      payment_status: payment_method === 'COD' ? 'Pending' : 'Pending Payment',
      status: 'Pending',
      items: validatedItems
    });

    let orderObj = order.toObject();

    // If payment method is UPI/Online, generate payment session
    if (payment_method === 'UPI') {
      let pgOrder = null;
      if (MOCK_MODE) {
        pgOrder = {
          id: 'mock_order_' + Math.random().toString(36).substr(2, 9),
          amount: Math.round(total_amount * 100),
          currency: 'INR',
          isMock: true
        };
      } else {
        try {
          pgOrder = await razorpay.orders.create({
            amount: Math.round(total_amount * 100), // in paise
            currency: 'INR',
            receipt: order._id.toString()
          });
        } catch (err) {
          // Rollback order and stock in case of payment gateway communication failure
          await Order.findByIdAndDelete(order._id);
          for (const pUpdate of productsToUpdate) {
            pUpdate.product.stock += pUpdate.quantity;
            await pUpdate.product.save();
          }
          return res.status(500).json({ message: 'Failed to create payment session with Razorpay.', error: err.message });
        }
      }

      // Save order ID to transaction_id initially
      order.transaction_id = pgOrder.id;
      await order.save();

      orderObj = order.toObject();
      orderObj.payment_session = {
        id: pgOrder.id,
        amount: pgOrder.amount,
        currency: pgOrder.currency,
        key_id: rzpKeyId || 'mock_key_id',
        isMock: pgOrder.isMock || false
      };
    }

    orderObj = await Order.findById(order._id).populate('items.product');
    const finalOrder = orderObj.toObject();
    if (payment_method === 'UPI') {
      finalOrder.payment_session = {
        id: order.transaction_id,
        amount: Math.round(total_amount * 100),
        currency: 'INR',
        key_id: rzpKeyId || 'mock_key_id',
        isMock: MOCK_MODE
      };
    }

    res.status(201).json(formatOrder(finalOrder));
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

// @route   POST /api/orders/verify
// @desc    Verify Razorpay payment signature
router.post('/verify', authMiddleware, async (req, res) => {
  const { order_id, razorpay_payment_id, razorpay_order_id, razorpay_signature, is_mock } = req.body;

  try {
    const order = await Order.findOne({ _id: order_id, user: req.user._id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found or access denied.' });
    }

    if (is_mock || MOCK_MODE) {
      // In mock mode, mark order as Paid immediately without signature validation
      order.payment_status = 'Paid';
      order.status = 'Processing';
      order.transaction_id = razorpay_payment_id || ('mock_pay_' + Math.random().toString(36).substr(2, 9));
      await order.save();

      const updated = await Order.findById(order._id).populate('items.product');
      return res.json({ success: true, order: formatOrder(updated.toObject()) });
    }

    // Live Signature verification
    const text = razorpay_order_id + "|" + razorpay_payment_id;
    const generated_signature = crypto
      .createHmac('sha256', rzpKeySecret)
      .update(text)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      order.payment_status = 'Paid';
      order.status = 'Processing';
      order.transaction_id = razorpay_payment_id;
      await order.save();

      const updated = await Order.findById(order._id).populate('items.product');
      return res.json({ success: true, order: formatOrder(updated.toObject()) });
    } else {
      order.payment_status = 'Failed';
      await order.save();
      return res.status(400).json({ message: 'Signature verification failed. Payment details are invalid.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error verifying payment', error: error.message });
  }
});

// @route   POST /api/orders/:id/cancel-payment
// @desc    Cancel order and restore stock if payment is cancelled or closed
router.post('/:id/cancel-payment', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (order.payment_status === 'Pending Payment') {
      order.payment_status = 'Failed';
      order.status = 'Cancelled';
      await order.save();

      // Restore stock
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
      return res.json({ success: true, message: 'Payment session cancelled, stock successfully restored.' });
    }
    res.status(400).json({ message: 'Order is not in a pending payment state.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error cancelling payment session', error: error.message });
  }
});

module.exports = router;
