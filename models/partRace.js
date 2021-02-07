const mongoose = require('mongoose');

const PartRaceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: false
    },
    checkpoints: {
        type: Object,
        required: false
    },
    participants: {
        type: Object,
        required: false
    }
});

const PartRace = mongoose.model('PartRace', PartRaceSchema);

module.exports = PartRace;