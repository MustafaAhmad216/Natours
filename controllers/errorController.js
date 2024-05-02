const AppError = require("./../utilities/appError");

const handleCastErrorDB = (err) => {
	const message = `Invalid ${err.path} format: ${err.value}`;
	return new AppError(message, 400)
}

const handleDuplicateFieldsDB = (err) => {
	const value = err.keyValue['name'];
	const message = `Duplicate field value: "${value}", Please use another value`;
	return new AppError(message, 400)
}

const handleValidationErrorDB = (err) => {
	const errorMessages = Object.values(err.errors).map(el => {
		return `${el.properties.message}`;
	});

	const message = `Invalid Input data: ${errorMessages.join('.  ')}`;
	return new AppError(message, 400)
}

const handleJWTError = () =>  new AppError('Invalid Token, Please try again!', 401);
const handleExpiredJWTError = () =>  new AppError('Expired Token, Please Log in again', 401);

const sendErrorDev = function (err, req, res) {
	//A) API
	if (req.originalUrl.startsWith('/api')) {
		return res.status(err.statusCode).json({
			status: err.status,
			message: err.message,
			error: err,
			stack: err.stack,
			name: err.name,
		});
	}
	//B) Rendered Website
	console.error('ERROR 💥', err);
	return res.status(err.statusCode).render('error', {
		title: 'Something went wrong',
		msg: err.message,
	});
};
const sendErrorProd = function (err, req, res) {
	//A) API
	if (req.originalUrl.startsWith('/api')) {
		// A) Operational, trusted error: send message for the client
		if (err.isOperational) {
			return res.status(err.statusCode).json({
				status: err.status,
				message: err.message,
			});
		}
		//B) programming or unknown error: don't leak error details

		//1) Log error.
		console.error('ERROR 💥', err);
		//2) Send generic message
		return res.status(500).json({
			status: 'error',
			message: 'Something Went Wrong!',
		});
	}
	// B) Rendered Website
	if (err.isOperational) {
		return res.status(err.statusCode).render('error', {
			title: 'Something went wrong',
			msg: err.message,
		});
	}
	//programming or unknown error: don't leak error details
	//1) Log error.
	console.error('ERROR 💥', err);

	//2) Send generic response page
	return res.status(err.statusCode).render('error', {
		title: 'Something went wrong',
		msg: 'Please Try again Later!',
	});
};

module.exports = (err, req, res, next) => {
	// console.log(err.stack);

	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';

	if (process.env.NODE_ENV === 'development') {
		sendErrorDev(err, req, res);
	}
	else if (process.env.NODE_ENV === 'production') {
		let error = { ...err, name: err.name, message: err.message};

		if (error.name === 'CastError')	error = handleCastErrorDB(error);
		if (error.code === 11000)	error = handleDuplicateFieldsDB(error);
		if (error.name === 'ValidationError')	error = handleValidationErrorDB(error);
		if (error.name === 'JsonWebTokenError')	 error = handleJWTError();
		if (error.name === 'TokenExpiredError')	 error = handleExpiredJWTError();
		
		sendErrorProd(error, req, res);
	}
	next();
};