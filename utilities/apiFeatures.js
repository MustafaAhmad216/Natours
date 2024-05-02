class ApiFeatures {
	constructor(query, queryString) {
		this.query = query;
		this.queryString = queryString;
	}

	filter() {
		//1A) Filtering
		const queryObj = { ...this.queryString };
		const execludedFields = ['page', 'sort', 'limit', 'fields'];
		execludedFields.forEach((field) => delete queryObj[field]);

		//1B) Advanced Filtering
		let queryStr = JSON.stringify(queryObj);
		queryStr = queryStr.replace(/\b(gte|gt|lte|lt|ne)\b/g, (match) => `$${match}`);
		this.query.find(JSON.parse(queryStr));
		return this;
	}
	sort() {
		if (this.queryString.sort) {
			const sortBy = this.queryString.sort.split(',').join(' ');
			this.query = this.query.sort(sortBy);
		} else {
			this.query = this.query.sort('-createdAt');
		}
		return this;
	}
	limitFields() {
		if (this.queryString.fields) {
			const fields = this.queryString.fields.replaceAll(',', ' ');
// 			const fields = this.queryString.fields.split(',').join(' ');
			this.query = this.query.select(fields);
		} else {
			this.query = this.query.select('-__v');
		}
		return this;
	}
	paginate() {
		const page = +this.queryString.page - 1;
		const limit = +this.queryString.limit || 15;
		const skip = limit * page;
		this.query = this.query.skip(skip).limit(limit);
        // if (this.queryString.page) {
        //     const numTours = await Tour.countDocuments();
        //     if(skip >= numTours) throw new Error('No more data in this page.. \nTry previous pages');
        // }
		return this;
	}
}

module.exports = ApiFeatures;