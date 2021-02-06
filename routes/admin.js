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

router.get('/', ensureAuthenticated, async (req, res) => {

    const races = await Race.find()
    const clubs = await Club.find()
    const series = await Serie.find()
    const handicaps = await Handicap.find()

    res.render('admin', {
        user: req.user,
        races: races,
        clubs: clubs,
        series: series,
        handicaps: handicaps,
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
        check1,
        check2,
        check3,
        check4,
        check5,
        check6,
        handicap,
        regOpen,
        regClose,
        partRaces,
        serie
    } = req.body

    console.log(req.body)

    let errors = [];

    var races = await Race.find()
    var clubs = await Club.find()
    var series = await Serie.find()
    var handicaps = await Handicap.find()
    var orgs = await User.find({
        adminLevel: 3
    })

    console.log("req.params.obj: ", req.params.obj)

    if (req.params.obj == 'handicap') {
        console.log("handicap")
        if (name) {
            Handicap.findOne({
                name: name
            }, function (found) {
                if (!found) {
                    const newObj = new Handicap({
                        name: name
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
        console.log("club")

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
        console.log("serie")

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
        console.log("race")
        if (name && startDate && endDate && club && org && handicap && serie) {

            function fixBool(s) {
                if (s == 'on') return 1;
                else return 0;
            }

            var c1 = fixBool(check1)
            var c2 = fixBool(check2)
            var c3 = fixBool(check3)
            var c4 = fixBool(check4)
            var c5 = fixBool(check5)
            var c6 = fixBool(check6)

            if(!regOpen) {
                var rO = '2000-01-01'
            } else {
                rO = regOpen
            }

            if(!regClose) {
                var rC = '2000-01-01'
            } else {
                rC = regClose
            }
            var test = typeof req.files.pdf.length

            console.log(typeof req.files.pdf.length)
            console.log(typeof req.files.images.length)

            if(req.files.pdf) {
                if(req.files.pdf.length === undefined) {
                    console.log("Moving PDF file")
                    req.files.pdf.mv('./public/uploads/races/' + name + '/pdf/' + req.files.pdf.name, function (err) {
                        if (err) {
                            errors.push({
                                msg: "Någonting gick snett med bilden!"
                            })
                        }
                    });
                } else {
                    console.log("Moving several PDF file")
                    Array.from(req.files.pdf).forEach(file => {
                        file.mv('./public/uploads/races/' + name + '/pdf/' + file.name, function (err) {
                            console.log(file.name)
                            if (err) {
                                errors.push({
                                    msg: "Någonting gick snett med bilden!"
                                })
                            }
                        });
                    });
                }
            }
            
            if(req.files.images) {
                if(req.files.images.length === undefined) {
                    req.files.images.mv('./public/uploads/races/' + name + '/images/' + req.files.images.name, function (err) {
                        if (err) {
                            errors.push({
                                msg: "Någonting gick snett med bilden!"
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
                            }
                        });
                    });
                }
            }


            Race.findOne({
                name: name
            }, function (found) {
                if (!found) {
                    const newObj = new Race({
                        name: name,
                        startDate: new Date(startDate),
                        endDate: new Date(endDate),
                        club: club,
                        org: org,
                        tel: tel,
                        email: email,
                        description: description,
                        rbft: c1,
                        rbfn: c2,
                        rbbt: c3,
                        rbbn: c4,
                        rc: c5,
                        reg: c6,
                        handicap: handicap,
                        regOpen: new Date(rO),
                        regclose: new Date(rC),
                        partRaces: partRaces,
                        serie: serie
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
        res.render('admin', {
            errors: errors,
            success: 'false',
            data: "",
            user: req.user,
            races: races,
            clubs: clubs,
            series: series,
            handicaps: handicaps
        })
    } else {
        var races = await Race.find()
        var clubs = await Club.find()
        var series = await Serie.find()
        var handicaps = await Handicap.find()
        var orgs = await User.find({
            adminLevel: 3
        })
        res.render('admin', {
            errors: errors,
            success: 'true',
            data: name,
            user: req.user,
            races: races,
            clubs: clubs,
            series: series,
            handicaps: handicaps
        })
    }
})

/* ---------------------------- */

// router.post('/addserie',ensureAuthenticated, async (req,res)=>{
//     const{
//         name,
//         description,

//     } = req.body

//     const races = await Race.find()
//     const clubs = await Club.find()
//     const series = await Serie.find()
//     const handicaps = await Handicap.find()

//     let errors = [];

//     if (!name || !description) {
//         errors.push({
//             msg: "Alla fält ej ifyllda"
//         })
//     }

//     if(errors.length > 0) {
//         res.render('admin', {
//             errors: errors,
//             user: req.user,
//             races: races,
//             clubs: clubs,
//             series: series,
//             handicaps: handicaps
//         })
//     } else {
//         Serie.findOne({name: name}, function(err,serie) { 
//             if(serie) {
//                 errors.push({
//                     msg: 'Serien finns redan'
//                 });
//                 res.render('admin', {
//                     errors,
//                     user: req.user,
//                     races: races,
//                     clubs: clubs,
//                     series: series,
//                     handicaps: handicaps
//                 })
//             } else {
//                 const newSerie = new Serie({
//                     name: name,
//                     description: description
//                 });

//                 newSerie.save()
//                 res.redirect('/admin');
//             }
//         });
//     }
// })

// router.post('/addhandicap',ensureAuthenticated, async (req,res)=>{
//     const{
//         name,
//         description
//     } = req.body

//     const races = await Race.find()
//     const clubs = await Club.find()
//     const series = await Serie.find()
//     const handicaps = await Handicap.find()

//     let errors = [];

//     if (!name || !description) {
//         errors.push({
//             msg: "Alla fält ej ifyllda"
//         })
//     }

//     if(errors.length > 0) {
//         res.render('admin', {
//             errors: errors,
//             user: req.user,
//             races: races,
//             clubs: clubs,
//             series: series,
//             handicaps: handicaps
//         })
//     } else {
//         Handicap.findOne({name: name}, function(err,handicap) { 
//             if(handicap) {
//                 errors.push({
//                     msg: 'Handikappsystemet finns redan'
//                 });
//                 res.render('admin', {
//                     errors,
//                     user: req.user,
//                     races: races,
//                     clubs: clubs,
//                     series: series,
//                     handicaps: handicaps
//                 })
//             } else {
//                 const newHandicap = new Handicap({
//                     name: name,
//                     description: description
//                 });

//                 newHandicap.save()
//                 res.redirect('/admin');
//             }
//         });
//     }
// })

// router.post('/addclub', ensureAuthenticated, async (req, res) => {
//     const {
//         name,
//         shortName,
//         description,
//         website,
//         adress,
//         country,
//         email
//     } = req.body

//     let logo;

//     if (!req.files || Object.keys(req.files).length === 0) {
//         return res.status(400).send('No files were uploaded.');
//     }

//     // The name of the input field (i.e. "logo") is used to retrieve the uploaded file
//     logo = req.files.logo;
//     console.log(logo)

//     filename = name + '-' + logo.name

//     // Use the mv() method to place the file somewhere on your server
//     logo.mv('./public/uploads/' + filename, function (err) {
//         if (err)
//             return res.status(500).send(err);
//     });

//     const races = await Race.find()
//     const clubs = await Club.find()

//     let errors = [];

//     if (!name) {
//         errors.push({
//             msg: "Namn krävs"
//         })
//     }

//     if (errors.length > 0) {
//         res.render('admin', {
//             errors: errors,
//             user: req.user,
//             races: races,
//             clubs: clubs,
//             series: series,
//             handicaps: handicaps
//         })
//     } else {
//         Club.findOne({
//             name: name
//         }, function (err, club) {
//             if (club) {
//                 errors.push({
//                     msg: 'Klubben finns redan'
//                 });
//                 res.render('admin', {
//                     errors,
//                     user: req.user,
//                     races: races,
//                     clubs: clubs,
//                     series: series,
//                     handicaps: handicaps
//                 })
//             } else {
//                 const newClub = new Club({
//                     name: name,
//                     logo: filename,
//                     shortName: shortName,
//                     description: description,
//                     website: website,
//                     adress: adress,
//                     country: country,
//                     email: email
//                 });

//                 newClub.save()
//                 res.redirect('/admin');
//             }
//         });
//     }
// })

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
    // var {
    //     name
    // } = req.body;

    let errors = []

    const races = await Race.find()
    const clubs = await Club.find()
    const series = await Serie.find()
    const handicaps = await Handicap.find()

    const orgs = await User.find({
        adminLevel: 3
    })

    var template = false

    if (req.params.temp == 'template') {
        template = true
    }

    res.render('create-race', {
        errors: errors,
        success: 'false',
        data: "",
        user: req.user,
        races: races,
        clubs: clubs,
        series: series,
        handicaps: handicaps,
        template: template,
        orgs: orgs
    })

})

// router.get('/create/race', ensureAuthenticated, async (req, res) => {

//     const races = await Race.find()
//     const clubs = await Club.find()
//     const series = await Serie.find()
//     const handicaps = await Handicap.find()

//     res.render('admin', {
//         user: req.user,
//         races: races,
//         clubs: clubs,
//         series: series,
//         handicaps: handicaps
//     });
// })

// router.post('/addracefromtemplate', ensureAuthenticated, async (req, res) => {
//     const {
//         name
//     } = req.body;

//     if (!name) {
//         res.redirect('/admin');
//     }

//     const race = await Race.findOne({
//         name: name
//     })

//     const races = await Race.find()
//     const clubs = await Club.find()
//     const series = await Serie.find()
//     const handicaps = await Handicap.find()

//     const orgs = await User.find({
//         adminLevel: 3
//     })

//     res.render('createRace', {
//         user: req.user,
//         races: races,
//         clubs: clubs,
//         series: series,
//         handicaps: handicaps,
//         raceTemplate: race,
//         orgs: orgs,
//         template: true
//     })
// })

// router.post('/addnewrace', ensureAuthenticated, async (req, res) => {

//     const races = await Race.find()
//     const clubs = await Club.find()
//     const series = await Serie.find()
//     const handicaps = await Handicap.find()
//     const orgs = await User.find({
//         adminLevel: 3
//     })

//     res.render('createRace', {
//         user: req.user,
//         races: races,
//         clubs: clubs,
//         series: series,
//         handicaps: handicaps,
//         template: false,
//         orgs: orgs
//     })
// })

// router.post('/addrace', ensureAuthenticated, (req, res) => {
//     const {
//         name,
//         startDate,
//         endDate,
//         club,
//         org,
//         tel,
//         email,
//         pdf,
//         image,
//         description,
//         check1,
//         check2,
//         check3,
//         check4,
//         check5,
//         check6,
//         handicap,
//         regOpen,
//         regclose,
//         partRaces,
//         serie
//     } = req.body;

//     const races = Race.find()
//     const clubs = Club.find()
//     const series = Serie.find()
//     const handicaps = Handicap.find()

//     const orgs = User.find({
//         adminLevel: 3
//     })

//     console.log(new Date(startDate))

//     let errors = [];

//     if (!name) {
//         errors.push({
//             msg: "Namn krävs"
//         })
//     }

//     if (errors.length > 0) {
//         res.render('admin', {
//             errors: errors,
//             user: req.user,
//             races: races,
//             clubs: clubs,
//             series: series,
//             handicaps: handicaps
//         })
//     } else {
//         Race.findOne({
//             name: name
//         }, function (err, race) {
//             if (race) {
//                 errors.push({
//                     msg: 'Tävlingen finns redan'
//                 });
//                 res.render('admin', {
//                     errors,
//                     user: req.user,
//                     races: races,
//                     clubs: clubs,
//                     series: series,
//                     handicaps: handicaps
//                 })
//             } else {
//                 function fixBool(s) {
//                     if (s == 'on') return 1;
//                     else return 0;
//                 }

//                 var c1 = fixBool(check1)
//                 var c2 = fixBool(check2)
//                 var c3 = fixBool(check3)
//                 var c4 = fixBool(check4)
//                 var c5 = fixBool(check5)
//                 var c6 = fixBool(check6)

//                 const newRace = new Race({
//                     name: name,
//                     startDate: new Date(startDate),
//                     endDate: new Date(endDate),
//                     club: club,
//                     org: org,
//                     tel: tel,
//                     email: email,
//                     pdf: pdf,
//                     image: image,
//                     description: description,
//                     rbft: c1,
//                     rbfn: c2,
//                     rbbt: c3,
//                     rbbn: c4,
//                     rc: c5,
//                     reg: c6,
//                     handicap: handicap,
//                     regOpen: new Date(regOpen),
//                     regclose: new Date(regclose),
//                     partRaces: partRaces,
//                     serie: serie
//                 });

//                 newRace.save()
//                 res.redirect('/admin');
//             }
//         });
//     }

// })

module.exports = router;