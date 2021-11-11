const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const AppError = require('../utiles/appError');
const catchAsync = require('../utiles/catchAsync');
const factory = require('./factoryHandler');

// Multer for storing user photo
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

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserImage = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;

  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/images/users/${req.file.filename}`);

  next();
});

const filterObj = (obj, ...fieldsToFilter) => {
  const newObj = {};
  Object.keys(obj).forEach((ele) => {
    if (fieldsToFilter.includes(ele)) newObj[ele] = obj[ele];
  });

  return newObj;
};
const shopAt = [22.74344, 75.893505];
// middleware for /getme route
exports.getme = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

exports.updateme = catchAsync(async (req, res, next) => {
  // 1. Check if the req.body contains password and confirmPassword field
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError(
        'Password can not be updated from this route, please use "/updatemypassword" route.',
        400
      )
    );
  }
  // 2. Filter the req.body
  const filteredBody = filterObj(
    req.body,
    'name',
    'email',
    'phone',
    'photo',
    'primaryAddress',
    'secondaryAddress'
  );

  // Updating User Photo
  if (req.file) filteredBody.photo = req.file.filename;

  // 3. update the current user data
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllUsers = factory.getAll(User);

exports.createUser = factory.createOne(User, 'secondaryAddress');

exports.getUser = factory.getOne(User);

exports.updateUser = factory.updateOne(
  User,
  'password',
  'name',
  'email',
  'phone',
  'photo',
  'primaryAddress',
  'secondaryAddress'
);

exports.deleteUser = factory.deleteOne(User);

exports.userWithIn = catchAsync(async (req, res, next) => {
  const { distance } = req.params;

  const radius = distance / 6378.1; // to find the radius in radian we need to divied distance byt the radius of earth (KM)

  const users = await User.find({
    primaryAddress: { $geoWithin: { $centerSphere: [[shopAt[1], shopAt[0]], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.userNearShop = catchAsync(async (req, res, next) => {
  const near = await User.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [shopAt[1], shopAt[0]],
        },
        distanceField: 'distance',
        distanceMultiplier: 0.001,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
        primaryAddress: { address: 1, description: 1 },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: near.length,
    data: {
      near,
    },
  });
});
