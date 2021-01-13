const mongoose = require('mongoose');

const ClubSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

const Club = mongoose.model('Club', ClubSchema);

module.exports = Club;