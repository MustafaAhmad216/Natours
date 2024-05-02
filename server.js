const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException' , (err) => {
	console.error('UNHANDLED EXCEPTION!💥.... SHUTTING DOWN');
	console.error(`${(err.name).toUpperCase()}: ${err.message} ⚠️⚠️`);
	// console.error(err);
	
	process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
	'<PASSWORD>',
	process.env.DATABASE_PASSWORD
	);
	mongoose
	.connect(DB)
	.then(() => console.log('DB Connection successfully established!🥳'));
	// .catch((error) =>
	// 	console.error('MongoDB connection failed:', `${error.message}⚠️⚠️`),
	// );
	
	const port = process.env.PORT || 3000;
	const server = app.listen(port, () => {
		console.log(`App running on port ${port}`);
	});
	
	process.on('unhandledRejection', (err) => {
		console.error('UNHANDLED REJECTION!💥.... SHUTTING DOWN');
		// console.error(`${err.name.toUpperCase()}: ${err.message} ⚠️⚠️`);
		console.error(err);
		
		server.close(() => {
			process.exit(1);
		});
	});
	
	// console.log(x);
	