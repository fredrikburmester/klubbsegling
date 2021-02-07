const mongoose = require('mongoose');

const CheckpointSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    location: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false
    },
    race: {
        type: Object,
        required: false
    }
});

const Checkpoint = mongoose.model('Checkpoint', CheckpointSchema);

module.exports = Checkpoint;