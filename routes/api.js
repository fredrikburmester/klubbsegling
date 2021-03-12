const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const User = require("../models/user");
const jwt = require('jsonwebtoken');

const config = require('../config');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
  extended: true
}));

router.post('/login', (req, res) => {
    const {
        username,
        password 
    } = req.body

    User.findOne({email:username}, (err, user) => {
        if (err) return res.status(500).send('Error on the server.');
        if (!user) return res.status(404).send('No user found.');
        let passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });
        let token = jwt.sign({ id: user._id }, config.secret, { expiresIn: 86400 // expires in 24 hours
        });
        // if(user.adminLevel == 5) var is_admin = true
        res.status(200).send({ auth: true, token: token, user: user, is_admin: (user.adminLevel == 5)  });
    })
=======
const {
    ensureAuthenticated
} = require('../config/auth')
const User = require("../models/user");
const Race = require("../models/race");
const Club = require("../models/club");
const Serie = require("../models/serie");
const Handicap = require("../models/handicap");
const Checkpoint = require("../models/checkpoint");
const Boat = require("../models/boat");
const bodyParser = require("body-parser");
const https = require('https')
const {
    json
} = require('body-parser');
router.use(bodyParser.json());
const cors = require("cors");

router.use(cors());
router.use(bodyParser.urlencoded({
    extended: false
}));
router.use(bodyParser.json());

// router.get('/user/:id', async function(req, res) {
//     if(req.user === undefined) {
//         res.status(401).end();
//     } else {
//         var object = await User.findById({ _id: req.params.id})
//         res.setHeader('Content-Type', 'application/json');
//         res.end(JSON.stringify({ object }));
//     }
// });

router.get('/:name(serie|handicap|race|club|checkpoint|boat|user)?/:id', async function (req, res) {

    if (req.params.name == 'serie') var object = await Serie.find({
        _id: req.params.id
    })
    else if (req.params.name == 'handicap') var object = await Handicap.find({
        _id: req.params.id
    })
    else if (req.params.name == 'race') var object = await Race.find({
        _id: req.params.id
    })
    else if (req.params.name == 'club') var object = await Club.find({
        _id: req.params.id
    })
    else if (req.params.name == 'checkpoint') var object = await Checkpoint.find({
        _id: req.params.id
    })
    else if (req.params.name == 'boat') var object = await Boat.find({
        _id: req.params.id
    })
    else if (req.params.name == 'user') {
        var object = await User.find({
            _id: req.params.id
        }).select('-password -__v -adminLevel');
    }

    if (object.length > 0) {
        res.status(200)
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(object, null, 2));
    } else {
        res.status(404).end()
    }
});

router.post('/find/races', async (req, res) => {
    var {
        race_ids,
        years,
        clubs,
        handicaps,
        participants,
        crew_members,
        series,
        race_names,
        future,
        previous
    } = req.body

    console.log(req.body)

    function checkUndefined(variable) {
        if(variable == undefined)
            return ''
        else 
            return variable
    }

    race_ids = checkUndefined(race_ids)
    years = checkUndefined(years)
    clubs = checkUndefined(clubs)
    handicaps = checkUndefined(handicaps)
    participants = checkUndefined(participants)
    crew_members = checkUndefined(crew_members)
    series = checkUndefined(series)
    race_names = checkUndefined(race_names)
    future = checkUndefined(future)
    previous = checkUndefined(previous)

    var check_race_ids = true
    var check_clubs = true
    var check_handicaps = true
    var check_crew_members = true
    var check_series = true
    var check_race_names = true
    var check_future = true
    var check_previous = true
    var check_years = true
    var check_participants = true

    if(typeof race_ids == "string" && race_ids.length == 0)
        check_race_ids = false
    if(typeof clubs == "string" && clubs.length == 0)
        check_clubs = false
    if(typeof handicaps == "string" && handicaps.length == 0)
        check_handicaps = false
    if(typeof participants == "string" && participants.length == 0)
        check_participants = false
    if(typeof crew_members == "string" && crew_members.length == 0)
        check_crew_members = false
    if(typeof series == "string" && series.length == 0)
        check_series = false
    if(typeof race_names == "string" && race_names.length == 0)
        check_race_names = false
    if(typeof future == "string" && future.length == 0)
        check_future = false
    if(typeof previous == "string" && previous.length == 0)
        check_previous = false
    if(typeof years == "string" && years.length == 0)
        check_years = false

    if (typeof years === "number") var years = years.toString()
    if (typeof race_ids === "number") var race_ids = race_ids.toString()
    if (typeof crew_members === "number") var crew_members = crew_members.toString()
    if (typeof participants === "number") var participants = participants.toString()

    if (typeof future === Boolean) future = future.toString()
    if (typeof previous === Boolean) previous = previous.toString()

    var result = []
    var boat_ids_with_crew_members = []

    await Boat.find({
        crew: {
            $in: crew_members
        }
    }).then(boats => {
        boats.forEach(boat => {
            boat_ids_with_crew_members.push(boat._id)
        });
    })

    console.log("22 ",series)
    await Race.find().then(response => {
        response.forEach(race => {

            if(check_crew_members) {
                if (crew_members.length == 0) {
                    return
                } else {
                    let included = false
                    if (boat_ids_with_crew_members.length > 0) {
                        boat_ids_with_crew_members.forEach(boat_id => {
                            if (race.participants.includes(boat_id)) included = true
                        });
                    }
                    if (!included) return
                }
            }

            if(check_race_ids)
                if (!race_ids.includes(race._id)) return

            if(check_clubs)    
                if (!clubs.includes(race.club)) return

            if(check_series)  
                if (!series.includes(race.serie)) return

            if(check_handicaps)  
                if (!handicaps.includes(race.handicap)) return

            if(check_years)  
                if (!years.includes(race.startDate.getFullYear().toString())) return

            if(check_race_names)  
                if (!race_names.includes(race.name)) return

            if(check_future) {
                if (future !== undefined && race.endDate <= new Date()) {
                    if (future == "true")
                        return
                }
            }

            if(check_previous) {
                if (previous !== undefined && race.endDate >= new Date()) {
                    if (previous == "true")
                        return
                }
            }

            if(check_participants) {
                if (participants.length == 0) {
                    return
                } else {
                    var included = false
                    race.participants.forEach(p => {
                        if (participants.includes(p.id) || participants.includes(p.name)) {
                            included = true
                        }
                    });
                    if (!included) return
                }
            }

            result.push(race)
        });
    }).catch(err => {
        console.log(err)
        res.status(500).end()
    })

    res.status(200)
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result));
});

router.post('/find/users', async (req, res) => {
    var {
        race_ids,
        clubs,
        user_ids,
        user_names,
        boat_ids,
        boat_names
    } = req.body

    var result = []

    await User.find().sort({
        name: 1
    }).then(response => {
        response.forEach(user => {
            if (user_ids !== undefined && user_ids.length > 0 && !user_ids.includes(user._id)) {
                return
            }
            if (race_ids !== undefined && races.length > 0) {
                var included = false
                user.races.forEach(race_id => {
                    if (race_ids.includes(race_id)) included = true
                })
                if (!included) return
            }
            if (clubs !== undefined && clubs.length > 0) {
                var included = false
                user.clubs.forEach(club_name => {
                    if (clubs.includes(club_name)) included = true
                })
                if (!included) return
            }
            if (user_names !== undefined && user_names.length > 0 && !names.includes(user.name)) {
                return
            }
            if (boat_ids !== undefined && boat_ids.length > 0) {
                var included = false
                user.boats.forEach(boat_id => {
                    if (boat_id.includes(boat_id)) included = true
                })
                if (!included) return
            }
            result.push(user)
        })
    }).catch(err => {
        console.log(err)
        res.status(500).end()
    })

    res.status(200)
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result));

})

router.post('/find/boats', async (req, res) => {
    var {
        user_ids,
        boat_ids,
        race_ids,
        boat_names,
        owner_names,
    } = req.body

    var result = []
    var races = []

    await Race.find({
        _id: {
            $in: race_ids
        }
    }).then(response => {
        response.forEach(race => {
            races.push(race)
        });
    })

    await Boat.find().sort({
        name: 1
    }).then(response => {
        response.forEach(boat => {

            if (user_ids !== undefined && user_ids.length > 0 && !user_ids.includes(boat.owner)) {
                return
            }
            if (boat_ids !== undefined && boat_ids.length > 0 && !boat_ids.includes(boat._id.toString())) {
                return
            }
            if (race_ids !== undefined && race_ids.length > 0) {
                var included = false
                races.forEach(race => {
                    if (race.participants.includes(boat._id)) {
                        included = true
                    }
                })
                if (!included) return
            }
            if (boat_names !== undefined && boat_names.length > 0 && !boat_names.includes(boat.name)) {
                return
            }
            if (owner_names !== undefined && owner_names.length > 0 && !owner_names.includes(boat.owner)) {
                return
            }
            result.push(boat)
        })
    }).catch(err => {
        console.log(err)
        res.status(500).end()
    })

    res.status(200)
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result));

>>>>>>> b8a8c0a906931e7d0f264a0c047b304d6dac9513
})

module.exports = router;