const stripe= require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('./../models/bookingModel');
const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const AppError = require('./../utilities/appError');
const catchAsync = require('./../utilities/catchAsync');
const factory = require('./handlerFactory');


exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    //1) Get Currently Booked tour
    const tour = await Tour.findById(req.params.tourId);
    
    //2) Create Checkout Session
    const session = await stripe.checkout.sessions.create({
			expand: ['line_items'], // a must

			payment_method_types: ['card'],
			mode: 'payment',
			// success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
			success_url: `${req.protocol}://${req.get('host')}/my-tours/`,
			cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
			customer_email: req.user.email,
			client_reference_id: req.params.tourId, //need to change
			line_items: [
				{
					description: `${tour.summary}`,
					price_data: {
						unit_amount: tour.price * 100, //amount expected in cents
						currency: 'usd',
						product_data: {
							name: `${tour.name} tour`,
							description: `${tour.summary}`,
							images: [
								`${req.protocol}://${req.get('host')}/img/tours/${
									tour.imageCover
								}`,
							], //need to change
						},
					},
					quantity: 1,
				},
			],
		});
 
    //3) Create session as a response
    res.status(200).json({
        status:'success',
        session,
    });
});

// exports.createBookingCheckout =  catchAsync(async (req, res, next) =>{
//     //This is only temporary, beacuse it's UNSECURE: everyone can make bookings without paying
//     const {tour, user, price} = req.query;

//     if(!tour && !user && !price) return next();
//     await Booking.create({tour, user, price});

//     res.redirect(req.originalUrl.split('?')[0]);
//     // next();
// });


const createBookingCheckout = async (session) => {
    const tour = session.client_reference_id;
    const user = (await User.findOne({email: session.customer_email}))._id;
    // const price = session.line_items[0].price_data.unit_amount / 100;
    const price = session.amount_total / 100;

    await Booking.create({tour, user, price});
}
exports.webhookCheckout = async (req, res, next) =>{
    const signature = req.headers['stripe-signature'];
    let event;

    try {    
        event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (error) {
        return res.status(400).json({
            status: 'error',
            message: `Webhook Error: ${error.message}`,
        });
    }
    if (event.type === 'checkout.session.completed')
		createBookingCheckout(event.data.object);

    res.status(200).json({
        received: true,
    });
};

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