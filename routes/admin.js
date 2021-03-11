const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const {
    ensureAuthenticated
} = require('../config/auth')
const bodyParser = require("body-parser");

const fileUpload = require('express-fileupload');

router.use(fileUpload({
    createParentPath: true
}));

router.use(bodyParser.urlencoded({
    extended: false
}));
router.use(bodyParser.json());

const User = require("../models/user");
const Boat = require("../models/boat");
const Race = require("../models/race");
const Club = require("../models/club");
const Serie = require("../models/serie");
const Handicap = require("../models/handicap");
const Checkpoint = require("../models/checkpoint");
const {
    json
} = require('body-parser');

router.get('/', ensureAuthenticated, async (req, res) => {

    const races = await Race.find()
    const clubs = await Club.find()
    const series = await Serie.find()
    const handicaps = await Handicap.find()
    const checkpoints = await Checkpoint.find()

    res.render('admin_new', {
        user: req.user,
        races: races,
        clubs: clubs,
        series: series,
        handicaps: handicaps,
        checkpoints: checkpoints,
        errors: [],
        title: "Admin"
    });
})

router.get('/races', ensureAuthenticated, async (req, res) => {

    const races = await Race.find()
    // const clubs = await Club.find()
    // const series = await Serie.find()
    // const handicaps = await Handicap.find()
    // const checkpoints = await Checkpoint.find()

    res.render('./admin/races', {
        user: req.user,
        races: races,
        // clubs: clubs,
        // series: series,
        // handicaps: handicaps,
        // checkpoints: checkpoints,
        errors: [],
        title: "Admin"
    });
})



router.post('/add/:obj(serie|handicap|race|club|checkpoint)?', ensureAuthenticated, async (req, res) => {
    const {
        name, 
        description,
        shortName,
        club,
        website,
        adress,
        country,
        email,
        startDate,
        endDate,
        org,
        tel,
        pdf,
        images,
        boatInFront,
        boatBehind,
        requireRegistration,
        handicap,
        regOpen,
        regClose,
        partRaces,
        serie,
        location
    } = req.body

    let errors = [];

    var races = await Race.find()
    var clubs = await Club.find()
    var series = await Serie.find()
    var handicaps = await Handicap.find()
    var orgs = await User.find({
        adminLevel: 3
    })

    if (req.params.obj == 'checkpoint') {
        if (name && location) {
            Checkpoint.findOne({
                name: name
            }, function (found) {
                if (!found) {
                    const newObj = new Checkpoint({
                        name: name,
                        description: description,
                        location: location
                    });
                    newObj.save()
                } else {
                    errors.push({
                        msg: "Checkpunkten finns redan"
                    })
                }
            });
        } else {
            errors.push({
                msg: "Det saknas ett fält"
            })
        }
    } else if (req.params.obj == 'handicap') {
        if (name) {
            Handicap.findOne({
                name: name
            }, function (found) {
                if (!found) {
                    const newObj = new Handicap({
                        name: name,
                        description: description
                    });
                    newObj.save()
                } else {
                    errors.push({
                        msg: "Handikappsystemet finns redan"
                    })
                }
            });
        } else {
            errors.push({
                msg: "Det saknas ett fält"
            })
        }
    } else if (req.params.obj == 'club') {

        let logo;
        if (name && shortName && adress && country && email && website && description) {

            if (!typeof contact) {
                var contact = email
            }

            if (!req.files || Object.keys(req.files).length === 0) {
                errors.push({
                    msg: "Logo saknas"
                })
            } else {

                logo = req.files.logo;

                filename = name + '-' + logo.name

                // Use the mv() method to place the file somewhere on your server
                logo.mv('./public/uploads/logos/' + shortName + '/' + filename, function (err) {
                    if (err) {
                        errors.push({
                            msg: "Någonting gick snett med bilden!"
                        })
                    }
                });

                Club.findOne({
                    name: name
                }, async function (found) {
                    if (!found) {
                        const newObj = new Club({
                            name: name,
                            shortName: shortName,
                            adress: adress,
                            country: country,
                            email: email,
                            website: website,
                            description: description,
                            logo: "path",
                            contact: contact
                        });
                        newObj.save()
                    } else {
                        errors.push({
                            msg: "Klubben finns redan"
                        })
                    }
                });
            }
        } else {
            errors.push({
                msg: "Det saknas ett fält"
            })
        }
    } else if (req.params.obj == 'serie') {

        if (name || description) {
            Serie.findOne({
                name: name
            }, function (found) {
                if (!found) {
                    const newObj = new Serie({
                        name: name,
                        description: description
                    });
                    newObj.save()
                } else {
                    errors.push({
                        msg: "Serien finns redan"
                    })
                }
            });
        } else {
            errors.push({
                msg: "Det saknas ett fält"
            })
        }
    } else if (req.params.obj == 'race') {
        if (name && startDate && endDate && club && org && handicap && serie) {
            function fixBool(check) {
                if (check == "on" || check == "true" || check == true) {
                    return true;
                } else {
                    return false;
                }
            }

            function checkStartDate(date) {
                if (!date) {
                    return '2000-01-01'
                } else {
                    return date
                }
            }

            function checkEndDate(date) {
                if (!date) {
                    return '2030-01-01'
                } else {
                    return date
                }
            }

            var imagefilenames = []
            var pdffilenames = []

            if (req.files !== null) {
                if (req.files.pdf !== undefined) {
                    if (req.files.pdf.length === undefined) {
                        req.files.pdf.mv('./public/uploads/races/' + name + '/pdf/' + req.files.pdf.name, function (err) {
                            if (err) {
                                errors.push({
                                    msg: "Någonting gick snett med bilden!"
                                })
                            } else {
                                pdffilenames.push({
                                    filename: req.files.pdf.name
                                })
                            }

                        });
                    } else {
                        Array.from(req.files.pdf).forEach(file => {
                            file.mv('./public/uploads/races/' + name + '/pdf/' + file.name, function (err) {
                                if (err) {
                                    errors.push({
                                        msg: "Någonting gick snett med bilden!"
                                    })
                                } else {
                                    pdffilenames.push({
                                        filename: req.files.pdf.name
                                    })
                                }
                            });
                        });
                    }
                }

                if (req.files.images !== undefined) {
                    if (req.files.images.length === undefined) {
                        req.files.images.mv('./public/uploads/races/' + name + '/images/' + req.files.images.name, function (err) {
                            if (err) {
                                errors.push({
                                    msg: "Någonting gick snett med bilden!"
                                })
                            } else {
                                pdffilenames.push({
                                    filename: req.files.images.name
                                })
                            }
                        });
                    } else {
                        Array.from(req.files.images).forEach(file => {
                            file.mv('./public/uploads/races/' + name + '/images/' + file.name, function (err) {
                                if (err) {
                                    errors.push({
                                        msg: "Någonting gick snett med bilden!"
                                    })
                                } else {
                                    pdffilenames.push({
                                        filename: req.files.file.name
                                    })
                                }
                            });
                        });
                    }
                }
            }

            var newObj = null
            partRacesJson = JSON.parse(partRaces)
            // partRacesJson.forEach(race => {
            //     race['participants'] = []
            // });

            endDateTemp = new Date(endDate)
            endDateTemp.setHours(23, 59, 59, 0);

            Race.findOne({
                name: name
            }, function (found) {
                if (!found) {
                    newObj = new Race({
                        name: name,
                        startDate: new Date(startDate),
                        endDate: endDateTemp,
                        club: club,
                        org: org,
                        tel: tel,
                        email: email,
                        description: description,
                        boatInFront: fixBool(boatInFront),
                        boatBehind: fixBool(boatBehind),
                        requireRegistration: fixBool(requireRegistration),
                        handicap: handicap,
                        regOpen: new Date(checkStartDate(regOpen)),
                        regClose: new Date(checkEndDate(regClose)),
                        partRaces: partRacesJson,
                        serie: serie,
                        images: imagefilenames,
                        pdf: pdffilenames,
                        participants: [],
                    });
                    newObj.save()
                } else {
                    errors.push({
                        msg: "Ett race med samma namn finns redan"
                    })
                }
            });
        } else {
            errors.push({
                msg: "Det saknas ett fält"
            })
        }
    }

    if (errors.length > 0) {
        response = {
            errors: errors,
            success: false,
            data: "",
            user: req.user,
            races: races,
            clubs: clubs,
            series: series,
            handicaps: handicaps
        }
    } else {
        var races = await Race.find()
        var clubs = await Club.find()
        var series = await Serie.find()
        var handicaps = await Handicap.find()
        var orgs = await User.find({
            adminLevel: 3
        })
        response = {
            errors: errors,
            success: true,
            data: newObj,
            user: req.user,
            races: races,
            clubs: clubs,
            series: series,
            handicaps: handicaps
        }
    }

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
        response
    }));
})

router.post('/remove/:name(serie|handicap|race|club|checkpoint)?', ensureAuthenticated, async (req, res) => {
    const {
        id
    } = req.body

    var result
    var dbResponse
    var errors = []

    if (req.params.name == 'serie') {
        await Serie.deleteOne({
                _id: id
            })
            .then(res => {
                dbResponse = res
            }).catch(err => {
                errors.push({
                    msg: err
                })
            })
    } else if (req.params.name == 'handicap') {
        await Handicap.deleteOne({
                _id: id
            })
            .then(res => {
                dbResponse = res
            }).catch(err => {
                errors.push({
                    msg: err
                })
            })
    } else if (req.params.name == 'race') {
        await Race.deleteOne({
                _id: id
            })
            .then(res => {
                dbResponse = res
                console.log(dbResponse)
            }).catch(err => {
                errors.push({
                    msg: err
                })
            })
    } else if (req.params.name == 'club') {
        await Club.deleteOne({
                _id: id
            })
            .then(res => {
                dbResponse = res
            }).catch(err => {
                errors.push({
                    msg: err
                })
            })
    } else if (req.params.name == 'checkpoint') {
        await Checkpoint.deleteOne({
                _id: id
            })
            .then(res => {
                dbResponse = res
            })
            .catch(err => {
                errors.push({
                    msg: err
                })
            })
    }

    if (errors.length > 0) {
        res.status(500)
        result = {
            success: false
        }
    } else if (dbResponse.deletedCount != 1) {
        res.status(203)
        result = {
            success: false
        }
    } else {
        res.status(200)
        result = {
            success: true,
            id: id
        }
    }

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
        result
    }));

})

router.post('/create/race', ensureAuthenticated, async (req, res) => {
    var {
        id,
        edit
    } = req.body

    if(edit === undefined) edit = false
    if(id === undefined) id = null

    let errors = []

    const races = await Race.find()
    const clubs = await Club.find()
    const series = await Serie.find()
    const handicaps = await Handicap.find()
    const checkpoints = await Checkpoint.find()
    const orgs = await User.find({
        adminLevel: 5
    })

    if (errors.length > 0) {
        res.render('admin', {
            errors: errors,
            success: 'false',
            data: "",
            user: req.user,
            races: races,
            clubs: clubs,
            series: series,
            handicaps: handicaps,
            checkpoints: checkpoints,
            orgs: orgs,
            title: "Skapa tävling"
        })
    } else {
        res.render('create-race', {
            errors: errors,
            success: 'true',
            data: "",
            user: req.user,
            races: races,
            clubs: clubs,
            series: series,
            handicaps: handicaps,
            checkpoints: checkpoints,
            orgs: orgs,
            edit: edit,
            id: id,
            title: "Skapa tävling"
        })
    }
})

// router.get('/races', ensureAuthenticated, async (req, res) => {

//     const races = await Race.find()
//     const clubs = await Club.find()
//     const series = await Serie.find()
//     const handicaps = await Handicap.find()

//     res.render('races', {
//         user: req.user,
//         races: races,
//         clubs: clubs,
//         series: series,
//         handicaps: handicaps,
//         errors: []
//     });
// })


module.exports = router;