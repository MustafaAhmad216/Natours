const catchAsync = require('./../utilities/catchAsync');
const AppError = require('./../utilities/appError');
const ApiFeatures = require('./../utilities/apiFeatures');

exports.deleteOne = (Model) => catchAsync( async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

	if (!doc) {
		return next(new AppError(`No document found with that ID: ${req.params.id}`, 404));
	}

	res.status(204).json({
		status: 'success',
		data: null
	});
});

exports.updateOne = (Model) => catchAsync(async (req, res, next) => {
    //WORKS FINE BTW
	// const doc = await Model.findById(req.params.id);
	// const update = await Model.updateOne({ name: doc.name }, req.body);
	// const updatedModel = await Model.findOne({ name: req.body.name });

    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!doc) {
		return next(new AppError(`No document found with that ID: ${req.params.id}`, 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            data: doc,
        },
    });
});

exports.createOne = Model => catchAsync( async (req, res, next) => {
    
	const newDoc = await Model.create(req.body);
	res.status(201).json({
		status: 'Success',
		data: {
			data: newDoc,
		},
	});
});

exports.getOne = (Model, populateOptions) => catchAsync( async (req, res, next) => {
    let query  = Model.findById(req.params.id);
    if(populateOptions) query = query.populate(populateOptions);

    const doc = await query;

	if (!doc) {
		return next(new AppError(`No document found with that ID: ${req.params.id}`, 404));
	}
	res.status(200).json({
		status: 'Success',
		data: {
			data: doc,
		},
	});
});

exports.getAll = (Model) => catchAsync(async (req, res, next) => {
    //To allow for a nested Get Tour Reviews (hack)
    let filter = {};
    if(req.params.tourId) filter = {tour: req.params.tourId};

	// *EXECUTE QUERY*
	const featurs = new ApiFeatures(Model.find(filter), req.query)
		.filter()
		.sort()
		.limitFields()
		.paginate();
	const doc = await featurs.query;
	// const doc = await featurs.query.explain();
    
	// const query = Model.find()
	// 	.where('duration')
	// 	.equals(5)query
	// 	.where('ratingsAverage')
	// 	.lte(4.6);
	// const doc = await query;

	// *SEND RESPONSE*
	res.status(200).json({
		status: 'Success',
		results: `${doc.length} Documents`,
		data: {
			data: doc,
		},
	});
});