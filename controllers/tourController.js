const multer = require('multer');
const sharp = require('sharp');
const Tour = require('./../models/tourModel');
// const ApiFeatures = require('./../utilities/apiFeatures');
const AppError = require('./../utilities/appError');
const catchAsync = require('./../utilities/catchAsync');
const factory = require('./handlerFactory');

// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8'));

/****************************************************************/
//--Store the image as a buffer in memory to be saved later in diskstorage
//--(storing image after imageProcessing)
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
	// if(file.mimetype.startsWith('image')){
	if (file.mimetype.split('/')[0] === 'image') {
		cb(null, true);
	}
	else{
        cb(new AppError('Please Upload valid image!', 400), false);
    }
};

//passing the storage and filter variables in multer middleware function
const upload = multer({
	storage: multerStorage,
	fileFilter: multerFilter,
});

// exports.uploadTourImages = upload.array('images', 4);   //if passing one field only
exports.uploadTourImages = upload.fields([
	{name: 'imageCover', maxCount: 1},
	{name: 'images', maxCount: 3},
]);

//--imageProcessing applied on the buffer image in memory 
//--while if we stored the image directly to diskStorage then sharp middleware function is not needed
exports.resizeTourImages = catchAsync(async(req, res, next) => {
	if (!req.files.imageCover && !req.files.images) return next();

	//1) Cover Image
	//we're manipulating req.body because updating takes the req.body values
	req.body.imageCover = `tour-${req.params.id}${Date.now()}-cover.jpeg`
	await sharp(req.files.imageCover[0].buffer)
		.resize(2000, 1333, 'cover')
		.toFormat('jpeg')
		.jpeg({ quality: 90 })
		.toFile(`public/img/tours/${req.body.imageCover}`);
	
	
	//2) Images
	req.body.images = [];

	await Promise.all((req.files.images).map(async (image, i) => {
		const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
		
		await sharp(image.buffer)
			.resize(2000, 1333)
			.toFormat('jpeg')
			.jpeg({ quality: 90 })
			.toFile(`public/img/tours/${filename}`);
		
		req.body.images.push(filename);
	}));
	
	console.log(req.body.images);
	next();

});

/****************************************************************/
//Route Handling Methods

exports.aliasTopTours = async (req, res, next) => {
	try{
		req.query.limit = 5;
		req.query.sort = '-ratingsAverage,price';
		req.query.fields = 'name,price,ratingsAverage,difficulty,summary';
		next();
    }catch(err){
		console.log(err.message);
	}
}
exports.getAllTours = factory.getAll(Tour);

exports.getTour = factory.getOne(Tour, { path: 'reviews'});

exports.createTour = factory.createOne(Tour);

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
	const stats = await Tour.aggregate([
		{
			$match: { ratingsAverage: { $gte: 4.5 } },
		},
		{
			$group: {
				_id: {$toUpper: '$difficulty'},
				numTours: {$sum: 1},
				numRatings: {$sum: '$ratingsQuantity'},
				avgRating: { $avg: '$ratingsAverage' },
				avgPrice: { $avg: '$price' },
				minPrice: { $min: '$price' },
				maxPrice: { $max: '$price' },
			},
		},
		{
			$sort: {avgPrice: 1},
		},
		// {
		// 	$match: {
		// 		_id: {$ne: 'EASY'}
		// 	}
		// },
	]);
	res.status(200).json({
		status: 'success',
		data: {
			stats,
		},
	});
})


// const data = new Date('2021-07-20T08:00:00.000Z');
// console.log(data.getFullYear());
// console.log(data.toISOString().substring(0,10));

exports.getMonthlyPlan = catchAsync(async (req, res, next) =>{
	const year =+req.params.year;
	const plan = await Tour.aggregate([
		{
			$unwind: '$startDates',
		},
		{
			$match: {
				startDates: {
					$gte: new Date(`${year}-01-01`),
					$lte: new Date(`${year}-12-31`),
				},
			},
		},
		{
			$group: {
				_id: {
					$month: '$startDates',
				},
				toursCount: { $sum: 1 },
				tours: { $push: '$name' },
			},
		},
		{
			$addFields: {
				// month: '$_id',
				month: {
					// prettier-ignore
					$arrayElemAt: [
						["","January","February","March","April","May","June","July","August","September","October","November","December"], '$_id'],
				},
			},
		},
		{
			$project: {
				_id: 0,
			},
		},
		{
			$sort: {
				toursCount: -1,
			},
		},
		{
			$limit: 20
		},
	]);
	
	res.status(200).json({
		status: 'success',
		results: plan.length,
		data: {
			plan,
		},
	});
})

// '/tours-within/:distance/center/:latlng/unit/:unit'
// 34.069608, -118.330338

exports.getToursWithin = catchAsync(async function (req, res, next) {
	const {distance, latlng, unit} = req.params;
	const [lat, lng] = latlng.split(',');
	const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

	if(!lat || !lng) return next(new AppError(`Please provide Latitude and Longitude Values in the format lat,lng`, 404));
	
	//Note That the centerSphere operator's array takes the lng value then lat value in another array then specifies the radius in the radiant unit
	const tours = await Tour.find({
		startLocation: { $geoWithin: { $centerSphere: [[lng, lat],radius] } },
	});
	
	res.status(200).json({
		status:'success',
		results: tours.length,
        data: {
            data: tours
        },
	})
})


exports.getDistances = catchAsync(async function (req, res, next) {
	const {latlng, unit} = req.params;
	const [lat, lng] = latlng.split(',');
	const multiplier = unit === 'mi'? 0.000621371 : 0.001;
	
	if(!lat || !lng) return next(new AppError(`Please provide Latitude and Longitude Values in the format lat,lng`, 404));
	
	const distances = await Tour.aggregate([
		//In Geospatial aggregation $geonear needs to be always the first stage in the pipeline
		{
			$geoNear: {
				near: {
					type: "Point",
					coordinates: [+lng, +lat],
				},
				distanceField: 'distance',
				distanceMultiplier: multiplier,			//to convert distance field form M to KM or Mi
			}
		},
		{
			$project: {
                _id: 0,
                distance: 1,
				name: 1,
            },
		}
	])
	res.status(200).json({
		status:'success',
		results: `${distances.length} tours`,
        data: {
            data: distances
        },
	})
})

/*******************************************************************/
//WILL NOT NEED NOW
// exports.checkBody = (req, res, next) => {
// 	if (!req.body.name || !req.body.price) {
// 		return	res.status(400).json({
// 			status: 'Failure',
// 			message: 'some properties not found 🚫',
// 		});
// 	}
// 	next();
// }

// exports.checkID = function (req, res, next, val) {
// console.log(`Your id is ${val} 👍`);

// if (+req.params.id > tours.length)
// 	return res.status(404).json({
// 			status: 'Failed',
// 			message: 'Invalid ID ⚠️'
// 		});
// next();
// }
