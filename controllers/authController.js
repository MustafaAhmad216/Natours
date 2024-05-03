const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('./../models/userModel');
const catchAsync = require('./../utilities/catchAsync');
const AppError = require('./../utilities/appError');
const Email = require('./../utilities/emailHandler');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});
}

const createSendToken = (user, statusCode, req, res) =>{
	const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(
            Date.now() +
            process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
        ),
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    }
    // if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    //Sending cookie to webServer
    res.cookie('jwt', token, cookieOptions);

    //Remove the password from the response body
    user.password = undefined;

    res.status(statusCode).json({
        status: 'Success',
        token,
        data: {
            user,
        },
    });
}

exports.signup = catchAsync(async (req, res, next) => {
	const newUser = await User.create({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
        role: req.body.role,
        active: req.body.active,
		passwordConfirm: req.body.passwordConfirm,
		passwordChangedAt: req.body.passwordChangedAt,
		passwordResetToken: req.body.passwordResetToken,
		passwordResetExpires: req.body.passwordResetExpires,
	});

    // Send an email to the new registered user
    const url = `${req.protocol}://${req.get('host')}/me`;
    console.log(url);
    await new Email(newUser, url).sendWelcome();

    createSendToken(newUser, 201, req, res);
	next();
});

// let user;
exports.login = catchAsync( async (req, res, next) => {
    const {email, password} = req.body;

    //1) check if email and password exist
    if(!email || !password){
        return next(new AppError('Please, enter a valid email and password', 400));
    }
    
    //2) check if user exists and password is correct
    const user = await User.findOne({"email": email}).select('+password').select('+active');
    if (!user || !await user.correctPassword(password, user.password)) {
        return next(new AppError('Please, check if your Email and Password are correct', 401));
    }
    user.active = true;
    await user.save({ validateBeforeSave: false });

    //3) if everything is alright, send token to the client
    createSendToken(user, 200, req, res);
});

exports.logout = catchAsync( async (req, res, next) => {
    res.cookie('jwt', '', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(200).json({
        status: 'Success',
    });
});

exports.protect = catchAsync (async (req, res, next) =>{
    let token;

    //1) Check if token exists and get it.
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = await req.headers.authorization.split(' ')[1];
    }
    else if(req.cookies.jwt){
        token = await req.cookies.jwt;
    }
    if (!token) {
        return next(new AppError('You\'re not logged in! Please, log in to get access to this page.',401));
    }

    //2) Verify the token.
    const decodedPayload = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    //3) Check if user still exists.
    const currentUser = await User.findById(decodedPayload.id);
    if (!currentUser) {
        return next(new AppError('The User owning this token is no longer exixts!'));
    }
    
    //4) Check if user changed password after the token was issued.
    // console.log('current user:',await User.findById(decodedPayload.id).select('+password'));
    if (currentUser.changedPasswordAfter(decodedPayload.iat)) {
        return next(new AppError('You have changed your password! Please, log in again.', 401));
    }
    
    //Grant Access to protected route
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
});

//ONLY for Rendered pages, No Errors
exports.isLoggedIn = catchAsync (async (req, res, next) =>{

    if(req.cookies.jwt){

        //1) Verify the token.
        const decodedPayload = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
        
        //2) Check if user still exists.
        const currentUser = await User.findById(decodedPayload.id);
        if (!currentUser) 
            return next();
        
        //3) Check if user changed password after the token was issued.
        if (currentUser.changedPasswordAfter(decodedPayload.iat)) 
            return next();
        
        //There is a loggedIn user
        res.locals.user = currentUser;
        return next();
    }
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles ['admin' , 'lead-guide'],    role = 'user'
        if(!roles.includes(req.user.role)){
            return next(new AppError("You don't have permission to perform this action", 403))
        }
        next();
    }
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
	// 1) Get user based on POSTed Email
	const user = await User.findOne({ email: req.body.email });
	if (!user) {
		return next(new AppError(`No User found with the email ${req.body.email}`),404);
	}
	// 2) Generate the random reset token
	const resetToken = user.createPasswordResetToken();
	await user.save({ validateBeforeSave: false });

    
	// 3) Send the token to user's email
	const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    try {
		await new Email(user, resetURL).sendPasswordReset();

		res.status(200).json({
			status: 'Success',
			message: 'Token sent to your email!',
		});

	} catch (err) {
		user.passwordResetToken = undefined;
		user.passwordResetExpires = undefined;
		await user.save({ validateBeforeSave: false });

		return next(new AppError('There is an problem sending your email, PLease try again later!'), 500);
	}
});

exports.resetPassword = catchAsync( async (req, res, next) => {
    // 1) Get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({passwordResetToken: hashedToken, passwordResetExpires: {$gt: Date.now()}});

    // 2) If token hasn't expired, and there is user, set the new password
    if (!user) {
		return next(new AppError('Token is invalid or has expired', 400));
	}

    // 3) Update the changedPasswordAt property for the user
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordExpiresAt = undefined;

    await user.save();

    // 4) log the user in, send JWT 
    createSendToken(user, 200, req, res);

});

exports.updatePassword = catchAsync( async (req, res, next) => {
    //1) Get the user from collection
    // const user = await User.findOne({ email: req.body.email }).select('+password');
    const user = await User.findById(req.user.id).select('+password');
    if(!user) return next(new AppError('There is no user with the same email address!', 404));

    //2) Check if POSTed current password is correct
    if (!req.body.currentPassword || !await user.correctPassword(req.body.currentPassword, user.password)) {
        return next(new AppError('Please enter a valid current password',400));
    }
    //3) If so, update password
    if(req.body.newPassword !== req.body.confirmNewPassword){
        return next(new AppError('New passwords do not match',400));
    }
    // await User.findOneAndUpdate() will not work

    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.confirmNewPassword;
    user.passwordResetToken = undefined;
    user.passwordExpiresAt = undefined;
    await user.save();

    //4) Log user in, send JWT
    createSendToken(user, 200, req, res);

})