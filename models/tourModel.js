const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const { Schema } = require('mongoose');
// const User = require('./userModel');
// const Review = require('./reviewModel');
const { promises } = require('nodemailer/lib/xoauth2');

const tourSchema = new Schema(
	{
		name: {
			type: String,
			unique: true,
			required: [true, 'A tour Must have a Name'],
			trim: true,
			maxlength: [40, 'A tour name should be shorter than 40 characters'],
			minlength: [10, 'A tour name should be longer than 10 characters'],
			// validate: [validator.isAlpha, 'Tour name should only contain characters']
		},
		slug: String,
		duration: {
			type: Number,
			required: [true, 'A tour Must have a Duration'],
		},
		maxGroupSize: {
			type: Number,
			required: [true, 'A tour Must have a Group Size'],
		},
		ratingsAverage: {
			type: Number,
			default: 4.3,
			min: [1, 'Rating must be above 1.0'],
			max: [5, 'Rating must be below 5.0'],
			set: val =>	val.toFixed(2),
		},
		ratingsQuantity: {
			type: Number,
			default: 0,
		},
		price: {
			type: Number,
			required: [true, 'A tour Must have a Price'],
		},
		priceDiscount: {
			type: Number,
			validate: {
				validator: function (val) {
					return val <= this.price;
				},
				message: `Discount price ({VALUE}) should be less than or equal the original price`,
			},
		},
		summary: {
			type: String,
			required: [true, 'A tour must have a summary'],
			trim: true,
		},
		difficulty: {
			type: String,
			required: [true, 'A tour must have a difficulty'],
			default: 'easy',
			enum: {
				values: ['easy', 'medium', 'difficult'],
				message: 'Difficulty is either easy, medium, difficult',
			},
		},
		description: {
			type: String,
			default: 'Easy',
		},
		imageCover: {
			type: String,
			required: [true, 'A tour must have an image cover'],
		},
		images: {
			type: [String],
		},
		createdAt: {
			type: Date,
			default: Date.now(),
			select: false, // hide field from the schema results
		},
		startDates: {
			type: [Date],
		},
		secretTour: {
			type: Boolean,
			default: false,
			// select: false, // hide field from the schema results
		},
		startLocation: {
			type: {
				type: String,
				enume: ['Point'],
				default: 'Point',
			},
			coordinates: [Number],
			address: String,
			description: String,
		},
		locations: [
			{
				type: {
					type: String,
					enum: ['Point'],
					default: 'Point',
				},
				coordinates: [Number],
				address: String,
				description: String,
				day: Number,
			},
		],
		guides: [
			{
				type: Schema.ObjectId,
				ref: 'User',
			},
		],
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
//------------------------------------------------------------------------
//Indexing
// tourSchema.index({price: 1});
tourSchema.index({price: 1, ratingsAverage: 1});
tourSchema.index({slug: 1});
tourSchema.index({startLocation: '2dsphere'});

//------------------------------------------------------------------------
//Virtual Elements
tourSchema.virtual('durationWeeks').get(function () {
	return `${Math.floor(this.duration / 7)} week(s) ${this.duration % 7 > 0 ? `and ${this.duration % 7} days` : ''} }`;
});

//Virtual Populate
tourSchema.virtual('reviews', {
	ref: 'Review',
	foreignField: 'tour',
	localField: '_id',
});
//------------------------------------------------------------------------
//DOCUMENT MIDDLEWARE: runs before or after .save() and .create() but not on .insertMany({})
tourSchema.pre('save', function (next) {
	this.slug = slugify(this.name, { lower: true });
	next();
});

//-->Responsible for Referencing guides data.
//Check 'guides' property.

//--> Responsible for embedding guides data.  WHILE  (guides: Array)
// tourSchema.pre('save', async function (next) {
// 	const guidesPromises = this.guides.map( async (id) => {
// 		return await User.findById(id);
// 	});
// 	this.guides= await Promise.all(guidesPromises);
// 	next();
// });

// tourSchema.pre('save', function(next){
// 	console.log('Will Save Document Pre');
// 	next();
// })

// tourSchema.post('save', function(doc, next){
// 	console.log(doc);
// 	next();
// })

//------------------------------------------------------------------------
//QUERY MIDDLEWARE: runs before .find() methods
// tourSchema.pre('find', function (next) {

tourSchema.pre(/^find/, function (next) {
	this.find({ secretTour: { $ne: true } }).select('-secretTour');
	this.start = Date.now();
	next();
});

tourSchema.pre(/^find/, function (next) {
	this.populate({
		path: 'guides',
		select: '-__v -passwordChangedAt',
	});
	next();
});

tourSchema.post(/^find/, function (doc, next) {
	console.log(`Query Took ${Date.now() - this.start} milliseconds`);
	next();
});


//---------------------------------------------------------
//AGGREGATION MIDDLEWARE: runs before .find() methods
// tourSchema.pre('aggregate', function (next) {
// 	this.pipeline().unshift({
// 		$match: { secretTour: { $ne: true } },
// 	});
// 	// console.log(this.pipeline());
// 	next();
// });

//---------------------------------------------------------



const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
