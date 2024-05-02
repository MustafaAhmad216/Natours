const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { Schema } = require('mongoose');

const userSchema = new Schema({
	name: {
		type: String,
		required: [true, 'Each user must have a name!'],
		trim: true,
		// match: [/^[a-zA-Z0-9]+$/, 'is invalid'],
		maxlength: [40, "User's name should be shorter than 40 characters"],
		minlength: [5, "User's name should be longer than 5 characters"],
		// validate: [validator.isAlpha, 'Tour name should only contain characters']
	},
	email: {
		type: String,
		lowercase: true,
		required: [true, 'A user must have a valid email.'],
		unique: [true, 'This Email address is already registered!'],
		validate: [validator.isEmail, 'please, provide a valid email!'],
	},
	photo: {
		type: [String],
        default: 'default.jpg'
	},
    role: {
        type: String,
        enum: ['user', 'admin', 'guide', 'lead-guide'],
        default: 'user'
    },
	password: {
		type: String,
		required: [true, 'Please provide a valid password!'],
		minlength: [8, 'A password must be atleast 8 characters!'],
		maxlength: [25, "A password shouldn't be more than 25 characters!"],
        select: false,
		// validate: [validator.isStrongPassword, 'Please make your password stronger!'],
	},
	passwordConfirm: {
        type: String,
		required: [true, 'please confirm your password!'],
        select: false,
		validate: {
            // Only works on CREATE and SAVE!!
			validator: function (val) {
                return val === this.password;
			},
            message: "Passwords are not the same!",
		},
	},
	passwordChangedAt: {
        type: Date,
	},
	passwordResetToken: {
        type: String,
	},
	passwordResetExpires: {
        type: Date,
	},
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});

userSchema.pre(/^find/, function (next) {
    // 'this' points to the current query
    this.find({active: {$ne : false}});
    next();
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || this.isNew)    return next();
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.pre('save', async function (next) {
    //only run this function if password was modified...
    if (!this.isModified('password'))    return next();

    //Hash the password with cost of 14.
    this.password = await bcrypt.hash(this.password, 12);

    //Delete passwordConfirm feild
    this.passwordConfirm = undefined;
    next();
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
    if (this.passwordChangedAt) {
        const changedTimeStamp = +this.passwordChangedAt.getTime()/1000;

        return JWTTimeStamp < changedTimeStamp;   //return True if password changed
    }
    return false;
};
userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 600000;

    console.log(`Reset Token: `, {resetToken} , `Password Reset Token: ${this.passwordResetToken}`);
    return resetToken;
}

const User = mongoose.model('User', userSchema);
module.exports = User;