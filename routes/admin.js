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
const { json } = require('body-parser');

router.get('/', ensureAuthenticated, async (req, res) => {

    const races = await Race.find()
    const clubs = await Club.find()
    const series = await Serie.find()
    const handicaps = await Handicap.find()
    const checkpoints = await Checkpoint.find()

    res.render('admin', {
        user: req.user,
        races: races,
        clubs: clubs,
        series: series,
        handicaps: handicaps,
        checkpoints: checkpoints,
        errors: []
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

    if(req.params.obj == 'checkpoint'){
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

                let filename = name + '-' + logo.name

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
                if(!date) {
                    return '2000-01-01'
                } else {
                    return date
                } 
            }
            function checkEndDate(date) {
                if(!date) {
                    return '2030-01-01'
                } else {
                    return date
                } 
            }

            var imagefilenames = []
            var pdffilenames = []

            if(req.files !== null) {
                if(req.files.pdf !== undefined) {
                    if(req.files.pdf.length === undefined) {
                        req.files.pdf.mv('./public/uploads/races/' + name + '/pdf/' + req.files.pdf.name, function (err) {
                            if (err) {
                                errors.push({
                                    msg: "Någonting gick snett med bilden!"
                                })
                            } else {
                                pdffilenames.push({filename: req.files.pdf.name})
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
                                    pdffilenames.push({filename: req.files.pdf.name})
                                }
                            });
                        });
                    }
                } 
                
                if(req.files.images !== undefined) {
                    if(req.files.images.length === undefined) {
                        req.files.images.mv('./public/uploads/races/' + name + '/images/' + req.files.images.name, function (err) {
                            if (err) {
                                errors.push({
                                    msg: "Någonting gick snett med bilden!"
                                })
                            } else {
                                pdffilenames.push({filename: req.files.images.name})
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
                                    pdffilenames.push({filename: req.files.file.name})
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
            endDateTemp.setHours( 23,59,59,0 );
 
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
    res.end(JSON.stringify({ response }));
})

router.post('/remove/:name(serie|handicap|race|club|checkpoint)?', ensureAuthenticated, async (req, res) => {
    const {
        id
    } = req.body

    if (req.params.name == 'serie') {
        Serie.deleteOne({
                _id: id
            })
            .then(function () {
                res.redirect('/admin');
            })
    } else if (req.params.name == 'handicap') {
        Handicap.deleteOne({
                _id: id
            })
            .then(function () {
                res.redirect('/admin');
            })
    } else if (req.params.name == 'race') {
        Race.deleteOne({
                _id: id
            })
            .then(function () {
                res.redirect('/admin');
            })
    } else if (req.params.name == 'club') {
        Club.deleteOne({
                _id: id
            })
            .then(function () {
                res.redirect('/admin');
            })
    } else if (req.params.name == 'checkpoint') {
        Checkpoint.deleteOne({
                _id: id
            })
            .then(function () {
                res.redirect('/admin');
            })
    }

})

router.post('/create/race/:temp(template|new)', ensureAuthenticated, async (req, res) => {
    const {
        name
    } = req.body

    let errors = []
    var template = null
    var useTemplate = false
    
    const races = await Race.find()
    const clubs = await Club.find()
    const series = await Serie.find()
    const handicaps = await Handicap.find()
    const checkpoints = await Checkpoint.find()
    const orgs = await User.find({
        adminLevel: 5
    })

    
    if (req.params.temp == 'template') {
        useTemplate = true
        template = await Race.findOne({
            name: name
        }, function (err, found) {
            if (!found) {
                errors.push({
                    msg: "Det finns tyvärr inget sådant race."
                })
            } 
        });
    }

    if(errors.length > 0) {
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
            useTemplate: useTemplate,
            orgs: orgs,
            template: template
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