const mongoose = require('mongoose')

const RatingSchema = new mongoose.Schema({
	  userId: {
		      type: String,
		      ref: 'User',
		      required: true
		    },
	  grade: {
		      type: Number,
		      required: true
		    }
})

const BookSchema = new mongoose.Schema({
	  userId: {
		      type: String,
		      ref: 'User',
		      required: true
		    },
	  title: {
		      type: String,
		      required: true
		    },
	  author: {
		      type: String,
		      required: true
		    },
	  imageUrl: {
		      type: String,
		      required: true
		    },
	  year: {
		      type: Number,
		      required: true
		    },
	  genre: {
		      type: String,
		      required: true
		    },
	  ratings: [RatingSchema],
	  averageRating: {
		      type: Number,
		      required: true
		    }
})

module.exports = mongoose.model('Book', BookSchema)
