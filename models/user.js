const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    adminLevel: {
        type: Number,
        required: true,
        default: 0 // 0: user, 1: race organizer , 3: club owner, 4: co-admin, 5: admin 
    },
    profilePicture: {
        type: String,
        required: false
    },
    phone: {
        type: String,
        required: false
    },
    boats: {
        type: Array,
        required: false
    },
    club: {
        type: Array,
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

const User = mongoose.model('User', UserSchema);

module.exports = User;