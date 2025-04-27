const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - price
 *         - vendor
 *       properties:
 *         name:
 *           type: string
 *           description: Product name
 *         description:
 *           type: string
 *           description: Product description
 *         price:
 *           type: number
 *           description: Product price
 *         category:
 *           type: string
 *           description: Product category
 *         image:
 *           type: string
 *           description: URL to product image
 *         countInStock:
 *           type: number
 *           description: Number of items in stock
 *         vendor:
 *           type: string
 *           description: ID of the vendor who uploaded the product
 *         rating:
 *           type: number
 *           description: Average product rating
 *         numReviews:
 *           type: number
 *           description: Number of product reviews
 */
const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a product description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please provide a product price'],
    min: [0, 'Price must be a positive number']
  },
  category: {
    type: String,
    required: [true, 'Please provide a product category']
  },
  image: {
    type: String,
    default: 'no-image.jpg'
  },
  countInStock: {
    type: Number,
    required: [true, 'Please provide count in stock'],
    min: [0, 'Count in stock must be a non-negative number'],
    default: 0
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide a vendor']
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating must be at least 0'],
    max: [5, 'Rating cannot be more than 5']
  },
  numReviews: {
    type: Number,
    default: 0,
    min: [0, 'Number of reviews must be a non-negative number']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for search functionality
ProductSchema.index({ name: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Product', ProductSchema);