const multer = require('multer');
const sharp = require('sharp');
const AppError = require('../utiles/appError');
const catchAsync = require('../utiles/catchAsync');
const Products = require('../models/productModel');

const factory = require('./factoryHandler');

// Multer for storing product photos
const multerStorage = multer.memoryStorage();

// Filtering file: only image format are accepted
const multerFileFilter = (req, file, cb) => {
  // accepting file if :
  if (file.mimetype.split('/')[0] === 'image') {
    cb(null, true);
  }
  // reject file
  else {
    cb(new AppError('Please provide a valid formate of imgae like .jpg, .jpeg, .png', 400), false);
  }
};

// This multer function will automatically add file object to req
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFileFilter,
});

exports.uploadPorductImages = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'photos', maxCount: 5 },
]);
// Resizing product images
exports.resizeProductImages = catchAsync(async (req, res, next) => {
  if (!req.files.image || !req.files.photos) return next();

  // 1. Processing image of products
  req.body.image = `product${req.params.id}-${Date.now()}-cover.jpeg`;

  sharp(req.files.image[0].buffer)
    .resize(1000, 750)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/images/${req.body.image}`);

  // 2. Processing phoots of products
  req.body.photos = [];
  await Promise.all(
    req.files.photos.map(async (file, i) => {
      const filename = `product-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(1000, 750)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/images/${filename}`);

      req.body.photos.push(filename);
    })
  );
});
exports.getAllProducts = factory.getAll(Products);

exports.createProduct = factory.createOne(
  Products,
  'slug',
  'createdAt',
  'averageRatings',
  'ratingsQuantity'
);

exports.getProduct = factory.getOne(Products, {
  path: 'review',
  options: { sort: '-createdAt' },
});

exports.updateProduct = factory.updateOne(Products, 'averageRatings', 'ratingsQuantity');

exports.deleteProduct = factory.deleteOne(Products);
