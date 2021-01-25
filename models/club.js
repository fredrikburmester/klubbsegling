const mongoose = require('mongoose');

const ClubSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    shortName: {
        type: String,
        required: true,
    },
    adress: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
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
        required: true
    },
    logo: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: false
    },
});

const Club = mongoose.model('Club', ClubSchema);

module.exports = Club;