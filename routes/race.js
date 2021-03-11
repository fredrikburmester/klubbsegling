const express = require('express');
const router = express.Router();
const {
    ensureAuthenticated
} = require('../config/auth')
// const User = require("../models/user");
const Race = require("../models/race");
// const Boat = require("../models/boat");
// const Club = require("../models/club");
// const Serie = require("../models/serie");
// const Handicap = require("../models/handicap");
// const Checkpoint = require("../models/checkpoint");

router.get('/:id', async (req, res) => {
    var id = req.params.id

    const race = await Race.findById(id);

    res.render('race', {
        user: req.user,
        race: race,
        title: "Tävling"
    });
})

router.get('/report/:id', async (req, res) => {
    var id = req.params.id

    const race = await Race.findById(id);

    res.render('report', {
        user: req.user,
        race: race,
        checkpoints: [],
        title: "Rapportera"
    });
})

module.exports = router;