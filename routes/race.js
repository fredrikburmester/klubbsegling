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

    console.log(race)

    res.render('race', {
        user: req.user,
        race: race,
    });
})

module.exports = router;