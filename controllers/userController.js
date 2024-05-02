const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require('../utilities/catchAsync');
const User = require('../models/userModel');
const AppError = require('../utilities/appError');
const factory = require('./handlerFactory');

/****************************************************************/
//--Store image directly in diskStorage without imageProcessing
// const multerStorage = multer.diskStorage({
// 	destination: (req, file, cb) => {
// 		cb(null, 'public/img/users/');
// 	},
// 	filename: (req, file, cb) => {
// 		const ext = file.mimetype.split('/')[1];
// 		cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
// 	},
// });

//--Store the image as a buffer in memory to be saved later in diskstorage
//--(storing image after imageProcessing)
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
	// if(file.mimetype.startsWith('image')){
	if (file.mimetype.split('/')[0] === 'image') {
		cb(null, true);
	}
	else{
        cb(new AppError('Please Upload valid image!', 400), false);
    }
};

//passing the storage and filter variables in multer middleware function
const upload = multer({
	storage: multerStorage,
	fileFilter: multerFilter,
});
exports.uploadUserPhoto = upload.single('photo');

//--imageProcessing applied on the buffer image in memory 
//--while if we stored the image directly to diskStorage then sharp middleware function is not needed
exports.resizeUserPhoto = catchAsync(async(req, res, next) => {
	if (!req.file) return next();

	req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

	await sharp(req.file.buffer)
		.resize(500, 500, 'cover')
		.toFormat('jpeg')
		.jpeg({ quality: 90 })
		.toFile(`public/img/users/${req.file.filename}`);
	next();
});

/****************************************************************/
// 1) Helper functions
const filterObj = (obj, ...allowedFields)=>{
	const newObj = {};
	Object.keys(obj).forEach(el => {
		if(allowedFields.includes(el))	newObj[el] = obj[el];		
	});
	return newObj;
}

// 2) Route Handling Methods

exports.getMe = (req, res, next) => {
	req.params.id = req.user.id;	
	next();
}

exports.updateMe = catchAsync(async(req, res, next) => {
	const inputData = Object.keys(req.body).join(' ').toLowerCase();
	
	// 1) Create error if user Post Password data	
	if(RegExp("password").test(inputData)){
		return next (new AppError('This route is not for password update, please use /updatePassword',400))
	}
	
	//2) Filter unwanted fields names that are not allowed to be updated
	const filteredData = filterObj(req.body, 'name', 'email');
	if (req.file) filteredData.photo = req.file.filename;
	
	// 2) Update user document
	const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredData , {
		new: true,
        runValidators: true,
	});
	
	res.status(200).json({
		status: 'Success',
		data: {
			user: updatedUser
		},
	});
});

exports.deleteMe = catchAsync(async(req, res, next) => {
	
	await User.findByIdAndUpdate(req.user.id, {active: false});
	
	res.status(204).json({
		status: 'Success',
		message: 'User deleted Successfuly!',
		data: null,
	});
});

exports.createUser = (req, res) => {
	res.status(500).json({
		status: 'error',
		message: 'This route is Not defined... Please, use /signup route instead',
	});
};


exports.getAllUsers = factory.getAll(User);

exports.getUser = factory.getOne(User);

//Don't Change Password with this route
exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);

