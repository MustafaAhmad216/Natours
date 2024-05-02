const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const bookingSchema = new Schema(
	{
		tour: {
			type: Schema.ObjectId,
			ref: 'Tour',
			required: [true, 'A Booking must belong to a tour!'],
		},
		user: {
			type: Schema.ObjectId,
			ref: 'User',
			required: [true, 'A Booking must belong to a customer!'],
		},
		price: {
			type: Number,
			required: [true, 'Each booking must have a booking price!'],
		},
		createdAt: {
			type: Date,
			default: Date.now(),
		},
		paid: {
			type: Boolean,
			default: true,
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

//------------------------------------------------------------------------
//Virtual Populate

//------------------------------------------------------------------------
//DOCUMENT MIDDLEWARE: runs before or after .save() and .create() but not on .insertMany({})
bookingSchema.pre(/^find/, function (next){
    this.populate([
        {
            path: 'tour',
            select: 'name ratingsAverage price'
        },
        {
            path: 'user',
            select: 'name email photo'
        }
    ])
    next(); 
})


//---------------------------------------------------------
const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
