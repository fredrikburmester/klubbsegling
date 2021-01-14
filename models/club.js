const mongoose = require('mongoose');

const ClubSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    adress: {
        type: String,
        required: false
    },
    zipcode: {
        type: String,
        required: false
    },
    county: {
        type: String,
        required: false
    },
    country: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false
    },
    website: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    logo: {
        type: String,
        required: false
    },
    contact: {
        type: String,
        required: false
    },
});

const Club = mongoose.model('Club', ClubSchema);

module.exports = Club;