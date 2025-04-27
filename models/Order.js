const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       required:
 *         - user
 *         - orderItems
 *         - shippingAddress
 *         - paymentMethod
 *       properties:
 *         user:
 *           type: string
 *           description: ID of the user who placed the order
 *         orderItems:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               product:
 *                 type: string
 *                 description: ID of the product
 *               name:
 *                 type: string
 *                 description: Name of the product
 *               image:
 *                 type: string
 *                 description: URL to product image
 *               price:
 *                 type: number
 *                 description: Price of the product
 *               qty:
 *                 type: number
 *                 description: Quantity ordered
 *         shippingAddress:
 *           type: object
 *           properties:
 *             address:
 *               type: string
 *               description: Street address
 *             city:
 *               type: string
 *               description: City
 *             postalCode:
 *               type: string
 *               description: Postal code
 *             country:
 *               type: string
 *               description: Country
 *         paymentMethod:
 *           type: string
 *           description: Payment method
 *         paymentResult:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               description: Payment ID
 *             status:
 *               type: string
 *               description: Payment status
 *             update_time:
 *               type: string
 *               description: Payment update time
 *             email_address:
 *               type: string
 *               description: Email address used for payment
 *         taxPrice:
 *           type: number
 *           description: Tax amount
 *         shippingPrice:
 *           type: number
 *           description: Shipping cost
 *         totalPrice:
 *           type: number
 *           description: Total order price
 *         isPaid:
 *           type: boolean
 *           description: Whether the order has been paid
 *         paidAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the order was paid
 *         isDelivered:
 *           type: boolean
 *           description: Whether the order has been delivered
 *         deliveredAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the order was delivered
 */
const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  orderItems: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product'
      },
      name: {
        type: String,
        required: true
      },
      image: {
        type: String,
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      qty: {
        type: Number,
        required: true
      }
    }
  ],
  shippingAddress: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    postalCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    }
  },
  paymentMethod: {
    type: String,
    required: true
  },
  paymentResult: {
    id: { type: String },
    status: { type: String },
    update_time: { type: String },
    email_address: { type: String }
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    required: true,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', OrderSchema);