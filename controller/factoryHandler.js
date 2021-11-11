const APIFeature = require('../utiles/apiFeature');
const AppError = require('../utiles/appError');
const catchAsync = require('../utiles/catchAsync');

const filterReqBody = (reqBody, fieldsToRemove) => {
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  const body = { ...reqBody };

  fieldsToRemove.forEach((ele) => delete body[ele]);

  return body;
};

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const data = await Model.findByIdAndDelete(req.params.id);

    if (!data) {
      return next(new AppError('No data found with given paramerter.', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model, ...removeFields) =>
  catchAsync(async (req, res, next) => {
    const value = filterReqBody(req.body, removeFields);

    const updateProduct = await Model.findByIdAndUpdate(req.params.id, value, {
      new: true,
      runValidators: true,
    });

    if (!updateProduct) {
      return next(new AppError('No data found with given paramerter.', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        updateProduct,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    if (popOptions) query = query.populate(popOptions);
    const data = await query;
    if (!data) {
      return next(new AppError('No data found with given paramerter.', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET Reviews
    let filter = {};

    if (req.params.productId) filter = { product: req.params.productId };

    const feature = new APIFeature(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();

    const alldata = await feature.query;
    const totDoc = await Model.estimatedDocumentCount();
    res.status(200).json({
      status: 'success',
      totDoc,
      results: alldata.length,
      data: {
        alldata,
      },
    });
  });

exports.createOne = (Model, ...removeFields) =>
  catchAsync(async (req, res, next) => {
    const value = filterReqBody(req.body, removeFields);

    const newDoc = await Model.create(value);
    res.status(201).json({
      status: 'success',
      data: {
        newDoc,
      },
    });
  });
