const mongoose = require('mongoose');

const RaceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    startdate: {
        type: Date,
        required: false
    },
    enddate: {
        type: Date,
        required: false
    }
});

const Race = mongoose.model('Race', RaceSchema);

module.exports = Race;