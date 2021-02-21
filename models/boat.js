const mongoose = require('mongoose');

const BoatSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    addedBy: {
        type: String,
        required: true
    },
    owner: {
        type: String,
        required: false
    },
    imageLink: {
        type: String,
        required: false
    },
    ref: {
        type: String,
        required: false
    },
    boatType: {
        type: String,
        required: false
    },
    boatClass: {
        type: String,
        required: false
    },
    calcBoatClass: {
        type: String,
        required: false
    },
    skl: {
        type: String,
        required: false
    },
    width: {
        type: String,
        required: false
    },
    depth: {
        type: String,
        required: false
    },
    depl: {
        type: String,
        required: false
    },
    nationality: {
        type: String,
        required: false
    },
    sailNr: {
        type: String,
        required: false
    },
    srs: {
        type: String,
        required: false
    },
    srsU: {
        type: String,
        required: false
    },
    srsSh: {
        type: String,
        required: false
    },
    srsShu: {
        type: String,
        required: false
    },
    srsSp: {
        type: String,
        required: false
    },
    srsId: {
        type: String,
        required: false
    },
    verified: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Boat = mongoose.model('Boat', BoatSchema);

module.exports = Boat;