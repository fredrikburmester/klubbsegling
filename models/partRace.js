const mongoose = require('mongoose');

const PartRaceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    classes: {
        type: Object,
        required: true
    },
    checkpoints: {
        type: Object,
        required: false
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }

});

const PartRace = mongoose.model('PartRace', PartRaceSchema);

module.exports = PartRace;