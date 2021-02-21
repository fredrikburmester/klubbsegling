const express = require('express');
const router = express.Router();
const {
    ensureAuthenticated
} = require('../config/auth')
const User = require("../models/user");
const Race = require("../models/race");
const Boat = require("../models/boat");
const Club = require("../models/club");
const Serie = require("../models/serie");
const Handicap = require("../models/handicap");
const Checkpoint = require("../models/checkpoint");

function getTodaysDate(offset) {
    var dateString = ""

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    dateString = (yyyy + offset) + "-" + mm + "-" + dd;

    return dateString
}

router.get('/', ensureAuthenticated, async (req, res) => {

    const races = await Race.find({
        endDate: {
            $gte: getTodaysDate(0),
            $lte: getTodaysDate(1)
        }
    }).sort({
        startDate: 1
    });

    res.render('dashboard', {
        user: req.user,
        races: races,
    });
})

//register page
router.get('/register', (req, res) => {
    res.render('register');
})

router.post('/register-for-race/:id', async (req, res) => {
    id = req.params.id
    let errors = []

    if (req.user === undefined) {
        res.status(401).end();
    } else {

        found = await Race.findById(id)

        var today = new Date();

        // if race has been - no register
        if(found.regClosed < today) {
            errors.push({
                msg: "Registreringen har tyvärr stängt"
            })
        } else if (found.endDate < today) {
            errors.push({
                msg: "Den här tävlingen har redan varit!"
            })
        } else if (found.startDate < today && found.endDate > today) {
            errors.push({
                msg: "Den här tävlingen är pågående!"
            })
        }
    
        

        if (found && errors.length == 0) {
            Race.updateOne({
                    _id: id
                }, {
                    $addToSet: {
                        participants: {
                            id: req.user.id,
                            name: req.user.name
                        }
                    }
                }, {useFindAndModify: false},
                function (err, result) {
                    if (err) {
                        console.log(err)
                        res.status(500).end();
                    } else {
                        User.updateOne({
                                _id: req.user._id
                            }, {
                                $addToSet: {
                                    races: id
                                }
                            }, {useFindAndModify: false},
                            function (err, result) {
                                if (err) {
                                    console.log(err)
                                    res.status(500).end();
                                } else {
                                    response = {
                                        errors: errors,
                                        success: true,
                                    }
                                    res.status(200)
                                    res.setHeader('Content-Type', 'application/json');
                                    res.end(JSON.stringify({ response }));
                                }
                            }
                        );
                    }
                }
            );
        } else {
            response = {
                errors: errors,
                success: false,
            }
            res.status(200)
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ response }));
        }
    }
})

router.post('/un-register-for-race/:id', async (req, res) => {
    id = req.params.id
    if (req.user === undefined) {
        res.status(401).end();
    } else {

        found = await Race.findById(id)

        if (found) {
            await Race.findByIdAndUpdate({
                    _id: id
                }, {
                    $pull: {
                        "participants": {
                            id: req.user.id
                        }
                    }
                },
                function (err, result) {
                    if (err) {
                        res.status(500).end();
                    } else {
                    }
                }
            );

            await User.findByIdAndUpdate({
                    _id: req.user.id
                }, {
                    $pull: {
                        "races": id
                    }
                },
                function (err, result) {
                    if (err) {
                        res.status(500).end();
                    } else {
                        res.status(200).end();
                    }
                }
            );
        } else {
            res.status(404).end();
        }
    }
})

router.get('/results', async (req, res) => {
    const series = await Serie.find()
    const clubs = await Club.find()
    const races = await Race.find()

    res.render('results', {
        user: req.user,
        clubs: clubs,
        series: series,
        races: races
    });
})

router.get('/profile', ensureAuthenticated, async (req, res) => {

    // const person = await User.findOne({_id: req.user._id}).lean()

    var srsCertMono = require('../public/srs-cert-mono.json');
    var srsStdMono = require('../public/srs-std-mono.json');

    const clubs = await Club.find()

    var club = ""
    clubs.forEach(obj => {
        if(req.user.club == obj.id) {
            club = obj.name
        }
    });

    userBoats = []

    var boats = await Boat.find()

    for(let i = 0; i < req.user.boats.length; i++) {
        for(let j = 0; j < boats.length; j++) {
            if(req.user.boats[i] == boats[j]._id) {
                userBoats.push(boats[j])
            }
        }  
    }

    res.render('profile', {
        user: req.user,
        club: club,
        boats: srsCertMono,
        stdBoats: srsStdMono
    });
})

module.exports = router;