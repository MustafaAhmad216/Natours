const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

//Reviews Routes
const router = express.Router({ mergeParams: true });

//POST /tour/de4e56rf76rt8/reviews
//GET /tour/de4e56rf76rt8/reviews

//All the coming routes will need authentication protection...
router.use(authController.protect);

router
	.route('/')
	.get(reviewController.getAllReviews)
	.post(
		authController.restrictTo('user'),
		reviewController.setTourUserIds,
		bookingController.checkIfBooked,
		reviewController.createReview,
	);

router
	.route('/:id')
	.get(reviewController.getReview)
	.patch(
		authController.restrictTo('user', 'admin'),
		reviewController.updateReview,
	)
	.delete(
		authController.restrictTo('admin', 'user'),
		reviewController.deleteReview,
	);

module.exports = router;
