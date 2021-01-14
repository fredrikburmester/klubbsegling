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
    series: {
        type: String,
        required: true
    },
    org: {
        type: String,
        required: false
    },
    tel: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false
    },
    pdf: {
        type: String,
        required: false
    },
    image: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    rbft: {
        type: Boolean,
        required: false
    },
    rbfn: {
        type: Boolean,
        required: false
    },
    rbbt: {
        type: Boolean,
        required: false
    },
    rbbn: {
        type: Boolean,
        required: false
    },
    rc: {
        type: Boolean,
        required: false
    },
    handicap: {
        type: String,
        required: false
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