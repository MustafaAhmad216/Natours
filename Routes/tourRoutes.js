const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');
const reviewRouter = require('./reviewRoutes');
/****************************************************************/
//3) Routes

//Tours Routes
const router = express.Router();

//POST /tour/de4e56rf76rt8/reviews                      (nested route)
//GET /tour/de4e56rf76rt8/reviews                       (nested route)
//GET /tour/de4e56rf76rt8/reviews/au76ort76t87          (nested route)

// router
// 	.route('/:tourId/reviews')
// 	.post(
// 		authController.protect,
// 		authController.restrictTo('user'),
// 		reviewController.createReview
// 	);


router.use('/:tourId/reviews', reviewRouter);

//WON'T USE THIS FUNCTION ANY MORE
// router.param('id', tourController.checkID);

router.route('/tour-stats').get(tourController.getTourStats);
router
	.route('/monthly-plan/:year')
	.get(
		authController.protect,
		authController.restrictTo('admin', 'lead-guide', 'guide'),
		tourController.getMonthlyPlan,
	);

router
	.route('/top-5-cheap')
	.get(tourController.aliasTopTours, tourController.getAllTours);

router
	.route('/tours-within/:distance/center/:latlng/unit/:unit')
	.get(tourController.getToursWithin);

router
	.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

// router
// 	.route('/tours-within/:distance/center/:latlng/unit/:unit')
// 	.get(tourController.getToursWithin);

router
	.route('/')
	.get(tourController.getAllTours)
	.post(
		authController.protect,
		authController.restrictTo('admin', 'lead-guide'),
		tourController.createTour,
	);

router
	.route('/:id')
	.get(tourController.getTour)
	.patch(
		authController.protect,
		authController.restrictTo('admin', 'lead-guide'),
		tourController.uploadTourImages,
		tourController.resizeTourImages,
		tourController.updateTour,
	)
	.delete(
		authController.protect,
		authController.restrictTo('admin', 'lead-guide'),
		tourController.deleteTour,
	);



module.exports = router;