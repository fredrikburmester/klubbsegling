const express = require('express');
const router  = express.Router();
const {ensureAuthenticated} = require('../config/auth') 
const User = require("../models/user");
const Race = require("../models/race");
const Club = require("../models/club");
const Serie = require("../models/serie");
const Handicap = require("../models/handicap");
const Checkpoint = require("../models/checkpoint");
const Boat = require("../models/boat");
const bodyParser = require("body-parser");

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/:name(serie|handicap|race|club|checkpoint|boat)?/:id', async function(req, res) {

    if(req.params.name == 'serie') var object = await Serie.find({_id: req.params.id})
    else if(req.params.name == 'handicap') var object = await Handicap.find({_id: req.params.id})
    else if(req.params.name == 'race') var object = await Race.find({_id: req.params.id})
    else if(req.params.name == 'club') var object = await Club.find({_id: req.params.id})
    else if(req.params.name == 'checkpoint') var object = await Checkpoint.find({_id: req.params.id})
    else if(req.params.name == 'boat') var object = await Boat.find({_id: req.params.id})

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ object }));
});

router.get('/races/:year/:club/:serie', async function(req, res) {
    var year = req.params.year
    var club = req.params.club
    var serie = req.params.serie
    console.log(year, club, serie)

    if (club == 'all') {
        club = '/*'
    } else {
        club = await Club.findOne({_id: club})
        club = club.name
    }

    if (serie == 'all') {
        serie = '/*'
    } else {
        serie = await Serie.findOne({_id: serie})
        serie = serie.name
    }

    if (year == 'all') {
        var start = new Date(2015, 0, 1);
        var end = new Date(2025, 0, 1);
    } else {
        var start = new Date(year, 0, 1);
        var end = new Date(year, 11, 31);
        console.log(start,end)
    }

    var object = await Race.find({
        $and: [
            {club:  { $regex: club }},
            {serie: { $regex: serie }},
            { $or: [
                {startDate: {$gte: start, $lt: end}},
                {endDate: {$gte: start, $lt: end}}
            ]}
        ]
            
    })

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ object }));

});

module.exports = router; 