const mongoose = require('mongoose')

const SerieSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
})

const Serie = mongoose.model('Serie', SerieSchema)

module.exports = Serie
