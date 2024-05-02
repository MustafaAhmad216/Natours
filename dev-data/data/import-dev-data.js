const fs = require("fs");
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

dotenv.config({path: './config.env'});

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB)
	.then(() => console.log('DB Connection successfully established!🥳'))
	.catch((error) =>
		console.error('MongoDB connection failed:', `${error.message}⚠️⚠️`));

//Read JSON file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf8'));
// console.log(tours);


//Delete All DATA from DATABASE collection
const deleteData = async ()=>{
    try {
        // await Tour.deleteMany({});
        await User.deleteMany({});
        // await Review.deleteMany({});
        console.log(`Data Successfully deleted!`);
    } catch (error) {
        console.log(error.message);
    }
    process.exit(0);
}

//Import DATA into DATABASE
const importData = async ()=>{
    try {
        // await Tour.create(tours);
        await User.create(users, {validateBeforeSave: false});
        // await Review.create(reviews);
        console.log(`Data Successfully imported!`);
    } catch (error) {
        console.log(error.message);
    }
    process.exit(0);
}

if (process.argv[2] === '--import') {
    importData();
}
if (process.argv[2] === '--delete') {
    deleteData();
}
console.log(process.argv);