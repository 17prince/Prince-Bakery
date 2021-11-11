const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A Product must have name.'],
      maxlength: [30, 'Maximum lenght of product name should be 30'],
      minlength: [4, 'Minimum lenght of product name must be greater than 6'],
    },
    price: {
      type: Number,
      required: [true, 'A product must have price'],
    },
    discountPrice: {
      type: Number,
      validate: {
        validator: function (value) {
          return value < this.price; // 240 < 400 : ture  && 530 < 400 : false
        },
        message: 'Discount price should be less then original price',
      },
    },
    topCategory: {
      type: String,
      default: 'other',
    },
    subCategory: {
      type: String,
      defalut: null,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [100, 'A Product must have maximun description length of 100'],
      minlength: [10, 'A Product must have minimun description length of 10'],
      defalut:
        'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Pariatur nostrum voluptatum tempora aliquid consequatur sunt dicta nemo, accusantium repudiandae. Totam ratione soluta exercitationem voluptas deserunt optio sed, vitae aspernatur ab corrupti dolores./n Harum molestias excepturi doloremque officiis magni, beatae voluptatem voluptate natus unde, maxime at perferendis mollitia eos quae adipisci reprehenderit facere dolor pariatur. Aperiam ipsum eius aliquam eum quia ea voluptatibus libero similique quas consequuntur, corporis atque nostrum perferendis, accusamus asperiores! Commodi neque, assumenda nesciunt fugiat est veritatis in expedita aperiam nam distinctio laborum ipsa, nihil tenetur tempora vel!',
    },
    image: {
      type: String,
      required: [true, 'A poduct must have an image'],
    },
    photos: {
      type: [String],
      min: [2, 'Minimum two images of product are required'],
      max: [5, 'Maximum five images of products can be upload'],
    },
    averageRatings: {
      type: Number,
      default: 4.5,
      min: [1, 'A Product must have minimun rating of 1'],
      max: [5, 'A Product must have maximum rating of 5'],
      set: (val) => Math.round((val * 10) / 10),
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    createdAt: Date,
    weight: {
      type: Number,
      validate: {
        validator: function (value) {
          if (this.topCategory === 'cakes') {
            this.weight = value;
          } else {
            this.weight = undefined;
          }
        },
      },
    },
    slug: String,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexs
productSchema.index({ topCategory: 1 }); //single index
productSchema.index({ price: 1, averageRatings: -1 }); // compound index

// VIRTUAL PROPERTY
// eslint-disable-next-line prefer-arrow-callback
productSchema.virtual('Stocks').get(function () {
  return 10;
});

// virtual populate for reviews
productSchema.virtual('reviews', {
  ref: 'Reviews',
  localField: '_id',
  foreignField: 'product',
});

// HOOKS OR MIDDLE WARE

// 1. DOCUMENT MEDDILE WARE
// eslint-disable-next-line prefer-arrow-callback
productSchema.pre('save', function (next) {
  this.slug = slugify(this.name, {
    replacement: '-',
    lower: true,
  });
  this.createdAt = Date.now();
  next();
});

// 2. QUERY MIDDLE WARE
// productSchema.pre(/^find/, function (next) {
//   this.select('-__v');
//   next();
// });

// 3. AGGREGATE MIDDLE WARE
// productSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { price: { $lt: 400 } } });
//   next();
// });

const Products = mongoose.model('Products', productSchema);

module.exports = Products;
