const express = require('express');
const viewsController = require('./../controllers/viewsController');
const bookingController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');
// const userController = require('./../controllers/userController');

const router = express.Router();


//Every Pages Must Be Accessed By A LoggedIn User
router.get('/', authController.isLoggedIn, viewsController.getOverview);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/me', authController.protect, viewsController.getAccount);
router.get(
	'/my-tours',
	authController.protect, 
	// bookingController.createBookingCheckout,
	viewsController.getMyTours,
);



//WITHOUT API
// router.post('/submit-user-data', authController.protect, viewsController.updateUserData);

module.exports = router;