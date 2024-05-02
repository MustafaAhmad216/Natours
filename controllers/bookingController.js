const stripe= require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('./../models/bookingModel');
const Tour = require('./../models/tourModel');
const AppError = require('./../utilities/appError');
const catchAsync = require('./../utilities/catchAsync');
const factory = require('./handlerFactory');


exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    //1) Get Currently Booked tour
    const tour = await Tour.findById(req.params.tourId);
    
    //2) Create Checkout Session
    const session = await stripe.checkout.sessions.create({
        expand: ['line_items'],     // a must

			payment_method_types: ['card'],
            mode: 'payment',
			success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
			cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
			customer_email: req.user.email,
			client_reference_id: req.params.tourId, //need to change
			line_items: [
				{
                    price_data: {
                        unit_amount: tour.price * 100, //amount expected in cents
						currency: 'usd',
                        product_data: {
                            name: `${tour.name} tour`,
                            description: `${tour.summary}`,
                            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`], //need to change
                        },
					},
                    quantity: 1,
				},
			],
            // line_items: [
            //     {
            //       name: `${tour.name} Tour`,
            //       description: tour.summary,
            //       images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
            //       amount: tour.price * 100,       //amount expected in cents
            //       currency: 'usd',
            //       quantity: 1,
            //     },
            //   ],
		});
 
    //3) Create session as a response
    res.status(200).json({
        status:'success',
        session,
    });
});

exports.createBookingCheckout =  catchAsync(async (req, res, next) =>{
    //This is only temporary, beacuse it's UNSECURE: everyone can make bookings without paying
    const {tour, user, price} = req.query;

    if(!tour && !user && !price) return next();
    await Booking.create({tour, user, price});

    res.redirect(req.originalUrl.split('?')[0]);
    // next();
});

exports.checkIfBooked =  catchAsync(async (req, res, next) =>{
    // Find bookings that have user and tour
    const bookings = await Booking.find({user: req.user, tour: req.body.tour});
    if(bookings.length === 0) return next(new AppError('You are trying to review a tour you haven\'t booked', 400));
    next();
});

exports.getAllBookings = factory.getAll(Booking);

exports.getBooking = factory.getOne(Booking);

exports.createBooking = factory.createOne(Booking);

exports.updateBooking = factory.updateOne(Booking);

exports.deleteBooking = factory.deleteOne(Booking);