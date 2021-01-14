const mongoose = require('mongoose');

const HandicapSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
});

const Handicap = mongoose.model('Handicap', HandicapSchema);

module.exports = Handicap;