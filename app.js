const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const tourRouter = require('./Routes/tourRoutes');
const userRouter = require('./Routes/userRoutes');
const reviewRouter = require('./Routes/reviewRoutes');
const bookingRouter = require('./Routes/bookingRoutes');
const viewRouter = require('./Routes/viewRoutes');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utilities/appError');
/*********************************************************************/
//Start Express App
const app = express();

//Setting up Pug as the template engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));


/****************************************************************/
// 1) Global Middlewares

//accessing all static files inside public folder
app.use(express.static(path.join(__dirname, 'public')));

// Set Security HTTP Headers
// Further HELMET configuration for Security Policy (CSP)
const scriptSrcUrls = ['https://unpkg.com/', 'https://tile.openstreetmap.org'];
const styleSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://fonts.googleapis.com/'
];
const connectSrcUrls = ['https://unpkg.com', 'https://tile.openstreetmap.org'];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];
 
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'self'", ...scriptSrcUrls,  'data:', 'https://*.cloudflare.com', 'https://*.stripe.com'],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
      fontSrc: ["'self'", ...fontSrcUrls]
    }
  })
);

//Development Loging
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}

// Limit requests from same IP to application
const limiter = rateLimit({
	max: 100,
	windowMs: 2 * 60 * 60 * 1000,
	message: "Too many requests from this IP, please try again in a couple of hours!",
});
app.use('/api', limiter);

//----------------------------------------------------------
//Body Parser, reading data from body into req.body
app.use(express.json({limit: '50kb'})); //express.json() is an express middleware that permits using the request body

//Cookie Parser, reading data from sent cookie
app.use(cookieParser()); 

//formData Parsing, reading data sent from a submitted form
app.use(express.urlencoded({
	extended: true,
	limit: '10kb',
})); 
//----------------------------------------------------------

//Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

//Data Sanitization against XSS
app.use(xss());

//Prevent parameter Pollution
app.use(
	hpp({
		whitelist: [
			'name',
			'duration',
			'maxGroupSize',
			'ratingsAverage',
			'ratingsQuantity',
			'price',
		],
	}),
);


//Public Test middleware
app.use((req, res, next) => {
	req.requestTime = new Date().toString();
	// console.log(req.cookies);
	next();
});

/****************************************************************/
//3) Routes

//Mounting our Routers
app.use('/', viewRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
	next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
})

app.use(globalErrorHandler);

/****************************************************************/
//3) Starting server
module.exports = app;



// "watch:js": "parcel watch ./public/js/index.js --out-dir ./public/js --out-file bundle.js",
// "build:js": "parcel watch ./public/js/index.js --out-dir ./public/js --out-file bundle.js"