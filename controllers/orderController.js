const Order = require('../models/Order');
const Product = require('../models/Product');
const { ErrorResponse } = require('../middleware/error');

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private/Customer
 */
exports.createOrder = async (req, res, next) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      taxPrice,
      shippingPrice,
      totalPrice
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      return next(new ErrorResponse('No order items', 400));
    }

    // Verify all products exist and have sufficient stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return next(new ErrorResponse(`Product not found with id of ${item.product}`, 404));
      }
      
      if (product.countInStock < item.qty) {
        return next(new ErrorResponse(`Product ${product.name} is out of stock`, 400));
      }
      
      // Update product with image and name
      item.image = product.image;
      item.name = product.name;
      item.price = product.price;
    }

    // Create order
    const order = await Order.create({
      user: req.user.id,
      orderItems,
      shippingAddress,
      paymentMethod,
      taxPrice,
      shippingPrice,
      totalPrice
    });

    // Update product stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      product.countInStock -= item.qty;
      await product.save();
    }

    res.status(201).json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate({
      path: 'user',
      select: 'name email'
    });

    if (!order) {
      return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is order owner or admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`User ${req.user.id} is not authorized to view this order`, 403));
    }

    res.status(200).json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order to paid
 * @route   PUT /api/orders/:id/pay
 * @access  Private
 */
exports.updateOrderToPaid = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is order owner or admin
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this order`, 403));
    }

    if (order.isPaid) {
      return next(new ErrorResponse('Order is already paid', 400));
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address
    };

    const updatedOrder = await order.save();

    res.status(200).json({
      status: 'success',
      data: { order: updatedOrder }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order to delivered
 * @route   PUT /api/orders/:id/deliver
 * @access  Private/Admin
 */
exports.updateOrderToDelivered = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
    }

    if (order.isDelivered) {
      return next(new ErrorResponse('Order is already delivered', 400));
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();

    res.status(200).json({
      status: 'success',
      data: { order: updatedOrder }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged in user orders
 * @route   GET /api/orders/myorders
 * @access  Private
 */
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id });

    res.status(200).json({
      status: 'success',
      count: orders.length,
      data: { orders }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all orders
 * @route   GET /api/orders
 * @access  Private/Admin
 */
exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({}).populate({
      path: 'user',
      select: 'id name'
    });

    res.status(200).json({
      status: 'success',
      count: orders.length,
      data: { orders }
    });
  } catch (error) {
    next(error);
  }
};