const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new Schema(
	{
		review: {
			type: String,
			required: [true, 'A review can not be empty!'],
			minlength: [3, 'A review Should be at least 3 characters'],
		},
		rating: {
			type: Number,
			required: [true, 'A review must have a rating'],
			min: [1, 'A review should have a rating between 1 and 5'],
			max: [5, 'A review should have a rating between 1 and 5'],
		},
		createdAt: {
			type: Date,
			default: Date.now(),
		},
		tour: {
			type: Schema.ObjectId,
			ref: 'Tour',
			required: [true, 'A review must belong to a tour!'],
		},
		user: {
			type: Schema.ObjectId,
			ref: 'User',
			required: [true, 'A review must belong to an author!'],
		},
	},
	{
		//Options
		toJSON: {
			virtuals: true,
		},
		toObject: {
			virtuals: true,
		},
	},
);
/************************************************************************/
//Indexing
reviewSchema.index({tour: 1, user: 1}, {
    unique: true,
    // dropDups: true,
});

//------------------------------------------------------------------------
reviewSchema.pre(/^find/, function (next) {
    this.populate([
		{
			path: 'tour',
			select: 'name ratingsAverage price',
		},
		{
			path: 'user',
			select: 'name email photo',
		},
	]);
	next();
});

// Using Static method to calculate AverageRating because (static methods' {this} keyword refers to the entire Model while instance mehods refers to curr document).
reviewSchema.statics.calcAverageRatings = async function (tourId) {
	const stats = await this.aggregate([
		{
			$match: { tour: tourId },
		},
		{
			$group: {
				_id: '$tour',
				numRatings: { $sum: 1 },
				avgRating: { $avg: '$rating' },
			},
		},
	]);
	console.log(stats);

    if(stats.length > 0){
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].numRatings,
            ratingsAverage: stats[0].avgRating,
        });
    }
    else{
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4,
        });
    }
};

reviewSchema.post('save', function (){
    //this points to current review..
    this.constructor.calcAverageRatings(this.tour);
});

//Doesn't need this as Post hook already access the doc
// reviewSchema.pre(/^findOneAnd/, async function(next){
//     this.rev = await this.clone().findOne();
//     console.log(this.rev);
//     next();
// });

reviewSchema.post(/^findOneAnd/, async function(doc){
    if(doc) await doc.constructor.calcAverageRatings(doc.tour._id);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;