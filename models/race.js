const mongoose = require('mongoose');

const RaceSchema = new mongoose.Schema({
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
    club: {
        type: String,
        required: true
    },
    serie: {
        type: String,
        required: true
    },
    partRaces: { // checkpoints within
        type: Object,
        required: true
    },
    org: {
        type: String,
        required: true
    },
    tel: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    pdf: {
        type: Object,
        required: false
    },
    image: {
        type: Object,
        required: false
    },
    description: {
        type: String,
        required: true
    },
    boatInFront: {
        type: Boolean,
        required: false
    },
    boatBehind: {
        type: Boolean,
        required: false
    },
    handicap: {
        type: String,
        required: true
    },
    regOpen: {
        type: Date,
        required: false
    },
    regClose: {
        type: Date,
        required: false
    },
    reg: {
        type: Boolean,
        required: false
    },
    date: {
        type: Date,
        default: Date.now
    }

});

const Race = mongoose.model('Race', RaceSchema);

module.exports = Race;