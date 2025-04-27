const Product = require('../models/Product');
const { ErrorResponse } = require('../middleware/error');

/**
 * @desc    Get all products
 * @route   GET /api/products
 * @access  Public
 */
exports.getProducts = async (req, res, next) => {
  try {
    // Build query
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search', 'minPrice', 'maxPrice', 'category'];
    excludedFields.forEach(field => delete queryObj[field]);

    // Advanced filtering
    let filterObj = { ...queryObj };
    
    // Price range filtering
    if (req.query.minPrice || req.query.maxPrice) {
      filterObj.price = {};
      if (req.query.minPrice) {
        filterObj.price.$gte = parseFloat(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        filterObj.price.$lte = parseFloat(req.query.maxPrice);
      }
    }
    
    // Category filtering
    if (req.query.category) {
      filterObj.category = req.query.category;
    }

    // Search functionality
    let query;
    if (req.query.search) {
      // Use text search for search parameter
      query = Product.find({
        $text: { $search: req.query.search },
        ...filterObj
      });
    } else {
      query = Product.find(filterObj);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Product.countDocuments(query.getQuery());

    query = query.skip(startIndex).limit(limit);

    // Execute query
    const products = await query.populate({
      path: 'vendor',
      select: 'name email'
    });

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    pagination.total = total;
    pagination.pages = Math.ceil(total / limit);
    pagination.page = page;
    pagination.limit = limit;

    res.status(200).json({
      status: 'success',
      count: products.length,
      pagination,
      data: { products }
    });
  } catch (error) {
    console.error('Error getting products:', error);
    next(error);
  }
};

/**
 * @desc    Get single product
 * @route   GET /api/products/:id
 * @access  Public
 */
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate({
      path: 'vendor',
      select: 'name email'
    });

    if (!product) {
      return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      status: 'success',
      data: { product }
    });
  } catch (error) {
    console.error('Error getting product:', error);
    next(error);
  }
};

/**
 * @desc    Create new product
 * @route   POST /api/products
 * @access  Private/Vendor/Customer
 */
exports.createProduct = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.vendor = req.user.id;

    // Validate required fields
    const { name, description, price, category, countInStock } = req.body;
    
    if (!name || !description || !price || !category || countInStock === undefined) {
      return next(new ErrorResponse('Please provide all required fields', 400));
    }

    const product = await Product.create(req.body);

    res.status(201).json({
      status: 'success',
      data: { product }
    });
  } catch (error) {
    console.error('Error creating product:', error);
    next(error);
  }
};

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Private/Vendor
 */
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is product vendor or admin
    if (product.vendor.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this product`, 403));
    }

    // Validate price if provided
    if (req.body.price && req.body.price < 0) {
      return next(new ErrorResponse('Price must be a positive number', 400));
    }

    // Validate countInStock if provided
    if (req.body.countInStock !== undefined && req.body.countInStock < 0) {
      return next(new ErrorResponse('Count in stock must be a non-negative number', 400));
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: { product }
    });
  } catch (error) {
    console.error('Error updating product:', error);
    next(error);
  }
};

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Private/Vendor
 */
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is product vendor or admin
    if (product.vendor.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this product`, 403));
    }

    await product.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'Product deleted successfully',
      data: {}
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    next(error);
  }
};

/**
 * @desc    Get vendor products
 * @route   GET /api/products/vendor
 * @access  Private/Vendor
 */
exports.getVendorProducts = async (req, res, next) => {
  try {
    // Apply pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Get total count
    const total = await Product.countDocuments({ vendor: req.user.id });
    
    // Get products with pagination
    const products = await Product.find({ vendor: req.user.id })
      .sort('-createdAt')
      .skip(startIndex)
      .limit(limit);

    // Pagination info
    const pagination = {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit
    };
    
    if (page > 1) {
      pagination.prev = page - 1;
    }
    
    if (page < Math.ceil(total / limit)) {
      pagination.next = page + 1;
    }

    res.status(200).json({
      status: 'success',
      count: products.length,
      pagination,
      data: { products }
    });
  } catch (error) {
    console.error('Error getting vendor products:', error);
    next(error);
  }
};




