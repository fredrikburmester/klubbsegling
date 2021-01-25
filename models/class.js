const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: false
    },
    endDate: {
        type: Date,
        required: false
    },
    description: {
        type: String,
        required: true
    },
    boats: {
        type: Object,
        required: false
    },
    checkpoints: {
        type: Object,
        required: false
    },
    date: {
        type: Date,
        default: Date.now
    }

});

const Class = mongoose.model('Class', ClassSchema);

module.exports = Class;