const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  price: {
    type: Number,
    required: true
  }
});

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    default: 'Pending' // 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'
  },
  total_amount: {
    type: Number,
    required: true
  },
  shipping_address: {
    type: String,
    required: true
  },
  payment_method: {
    type: String,
    default: 'Card' // 'Card', 'UPI', 'NetBanking', 'COD'
  },
  payment_status: {
    type: String,
    default: 'Pending' // 'Pending', 'Paid', 'Failed', 'Pending Verification'
  },
  transaction_id: {
    type: String
  },
  items: [OrderItemSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', OrderSchema);
