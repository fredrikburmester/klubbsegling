const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const {
    ensureAuthenticated
} = require('../config/auth')

const User = require("../models/user");
const Boat = require("../models/boat");

//add boat
router.post('/addboat/:ref', ensureAuthenticated, async (req, res) => {
    var ref = req.params.ref

    let errors = []
    var success = false

    // TODO: Check and get existing boat from JSON file
    var srsCertMono = require('../public/srs-cert-mono.json');

    function getBoat(ref) {
        return srsCertMono.filter(
            function (srsCertMono) {
                return srsCertMono.Ref == ref
            }
        );
    }

    var boat = getBoat(ref)[0];

    await Boat.findOne({
        srsId: boat.SRSID
    }, function (err, obj) {
        if (obj == null) {
            const newBoat = new Boat({
                name: boat.Båtnamn,
                addedBy: req.user._id,
                owner: boat.ÄgareNamn,
                boatType: boat.Båttyp,
                nationality: boat.Nationality,
                sailNr: boat.Segelnr,
                srs: boat.SRS,
                srsU: boat.SRSUtanUndanvindsegel,
                srsSh: boat.SRSShorthanded,
                srsShu: boat.SRSShorthandedUtanUndanvindssegel,
                srsSp: boat.SRSMedSpinnaker,
                srsId: boat.SRSID
            });

            var newBoatId = newBoat._id

            newBoat.save()

            User.findOneAndUpdate({
                    _id: req.user.id
                }, {
                    $push: {
                        boats: newBoatId.toString()
                    }
                }, {
                    useFindAndModify: false
                })
                .then(function () {

                })
            res.status(200)
            response = {
                boat: newBoat,
                success: "true",
                errors: errors
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                response
            }));
        } else {
            req.user.boats.forEach(id => {
                if(id == obj._id) {
                    errors.push({
                        msg: "Du har redan den här båten!"
                    })
                    response = {
                        boat: [],
                        success: "false",
                        errors: errors
                    }
                    res.status(200)
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                        response
                    }));
                    return
                }
            });

            if(errors.length == 0) {
                User.findOneAndUpdate({
                    _id: req.user.id
                }, {
                    $push: {
                        boats: obj._id.toString()
                    }
                }, {
                    useFindAndModify: false
                }).then(response => {
                    response = {
                        boat: obj,
                        success: "true",
                        errors: errors
                    }
    
                    res.status(200)
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                        response
                    }));
                }).catch(err => {
                    console.log(err)
                })
            }
        }
    });
})

router.post('/addstdboat', ensureAuthenticated, (req, res) => {
    const {
        name,
        type
    } = req.body;

    // TODO: Check and get existing boat from JSON file
    var srsCertMono = require('../public/srs-std-mono.json');

    function getBoat(type) {
        return srsCertMono.filter(
            function (srsCertMono) {
                return srsCertMono.Båttyp == type
            }
        );
    }

    var boat = getBoat(type)[0];

    const newBoat = new Boat({
        name: name,
        type: boat.Båttyp,
        addedBy: req.user._id
    });

    // newBoat.save() // do not save the boat yet

    User.findOneAndUpdate({
            _id: req.user.id
        }, {
            $push: {
                boats: newBoat
            }
        }, {
            useFindAndModify: false
        })
        .then(function () {
            res.redirect('/profile');
        })

})

//remove boat
router.post('/removeboat/:id', ensureAuthenticated, (req, res) => {
    id = req.params.id

    let errors = []

    User.findByIdAndUpdate({
            _id: req.user._id
        }, {
            $pull: {
                boats: id
            }
        }, {
            safe: true
        })
        .then(function (err) {
            if (err.nModified == 0) {
                response = {
                    errors: errors,
                    success: false
                }
                res.status(400)
            } else {
                response = {
                    errors: errors,
                    success: true
                }
                res.status(200)
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                response
            }));
        })
})

//login handle
router.get('/login', (req, res) => {
    res.render('login');
})

router.get('/register', (req, res) => {
    res.render('register')
})

//register handle
router.post('/login', (req, res, next) => {
    console.log("login")
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true,
    })(req, res, next)
})
//register post handle
router.post('/register', (req, res) => {
    const {
        name,
        email,
        password
    } = req.body;
    let errors = [];
    if (!name || !email || !password) {
        errors.push({
            msg: "Please fill in all fields"
        })
    }

    //check if password is more than 6 characters
    if (password.length < 6) {
        errors.push({
            msg: 'password atleast 6 characters'
        })
    }
    if (errors.length > 0) {
        res.render('register', {
            errors: errors,
            name: name,
            email: email,
            password: password
        })
    } else {
        //validation passed
        User.findOne({
            email: email
        }).exec((err, user) => {
            if (user) {
                errors.push({
                    msg: 'email already registered'
                });
                res.render('register', {
                    errors,
                    name,
                    email,
                    password
                })
            } else {
                const newUser = new User({
                    name: name,
                    email: email,
                    password: password
                });

                //hash password
                bcrypt.genSalt(10, (err, salt) =>
                    bcrypt.hash(newUser.password, salt,
                        (err, hash) => {
                            if (err) throw err;
                            //save pass to hash
                            newUser.password = hash;
                            //save user
                            newUser.save()
                                .then((value) => {
                                    req.flash('success_msg', 'Du är registrerad!');
                                    res.redirect('/users/login');
                                })
                                .catch(value => console.log(value));
                        }));
            }
        })
    }
})

//logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'Du är utloggad!');
    res.redirect('/users/login');
})

module.exports = router;