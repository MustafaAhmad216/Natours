const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const Booking = require('./../models/bookingModel');
const Review = require('./../models/reviewModel');
const catchAsync = require('./../utilities/catchAsync');
const AppError = require('./../utilities/appError');
const { ObjectId } = require('mongodb');

exports.getOverview = catchAsync(async (req, res, next) => {
	//1) Get tour data from collection
	const tours = await Tour.find();

	//2) Build Template (in pug file)

	//3)Render that template using tour data from <1>

	res.status(200).render('overview', {
		testFunc: function () {
			return 'Test func';
		},
		tour: 'All Tours',
		tours,
	});
});

exports.getTour = catchAsync(async (req, res, next) => {
   	//1) Get data for requested tour (including reviews and guides)
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
			path: 'reviews',
			fields: 'review, rating, user',
		});
	if(!tour) next(new AppError('No tour found with the same name!', 404));
    // const review = await Review.findOne({tour: tour._id});
    // console.log(review);

	//2) Build Template
	//3)Render that template using tour data from <1>

	res.status(200).render('tour', {
		title: `${tour.name}`,
        tour,
	});
})

exports.getLoginForm = catchAsync(async (req, res, next) => {
	res.status(200)
		.set(
			'Content-Security-Policy',
			"connect-src 'self' https://cdnjs.cloudflare.com",
		)

		.render('login', {
			title: 'Log into your account',
		});
});

exports.getAccount = catchAsync(async (req, res, next) => {
	res.status(200)
		.render('account', {
			title: 'Your account',
		});
});

//Without implementing virtual population in tour model.
exports.getMyTours = catchAsync(async (req, res, next) => {
	//1) find all bookings
	const bookings = await Booking.find({ user: req.user.id });
	
	//2) Find tours with the returned IDs
	const tourIds = bookings.map((el) => el.tour);
	const tours = await Tour.find({ _id: { $in: tourIds } });
	
	res.status(200).render('overview', {
		title: 'Your Bookings',
		tours,
	});
});


//--WITHOUT API
// exports.updateUserData = catchAsync(async (req, res, next) => {
// 	const updatedUser = await User.findByIdAndUpdate(
// 		req.user.id,
// 		{
// 			name: req.body.name,
// 			email: req.body.email,
// 		},
// 		{
// 			new: true,
// 			runValidators: true,
// 		},
// 	);

// 	res.status(200).render('account', {
// 		title: 'Your account',
// 		user: updatedUser
// 	});
// });