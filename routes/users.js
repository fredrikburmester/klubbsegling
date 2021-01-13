const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const {ensureAuthenticated} = require('../config/auth') 

const User = require("../models/user");
const Boat = require("../models/boat");

//add boat
router.post('/addboat', ensureAuthenticated, (req, res) => {
    const {
        ref
    } = req.body;

    // TODO: Check and get existing boat from JSON file
    var srsCertMono = require('../public/srs-cert-mono.json');

    function getBoat(ref) {
        return srsCertMono.filter(
            function(srsCertMono){ return srsCertMono.Ref == ref }
        );
    }
      
    var boat = getBoat(ref)[0];
    if(boat) {
        console.log("found")
    } else {
        console.log("not found")
    }
    // TODO: Check length of boat name >0

    const newBoat = new Boat({
        name: boat.Båtnamn,
        type: boat.Båttyp,
        addedBy: req.user._id
    });

    // newBoat.save() // do not save the boat yet

    console.log("req.user", req.user)

    User.findOneAndUpdate({_id: req.user.id}, {
        $push: {
            boats: newBoat
    }}, {useFindAndModify: false})
    .then(function(){
        console.log("Added boat", newBoat)
        res.redirect('/profile');
    })

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
            function(srsCertMono){ return srsCertMono.Båttyp == type }
        );
    }
      
    var boat = getBoat(type)[0];

    // if(boat) {
    //     console.log("found")
    // } else {
    //     console.log("not found")
    // }

    const newBoat = new Boat({
        name: name,
        type: boat.Båttyp,
        addedBy: req.user._id
    });

    // newBoat.save() // do not save the boat yet

    console.log("req.user", req.user)

    User.findOneAndUpdate({_id: req.user.id}, {
        $push: {
            boats: newBoat
    }}, {useFindAndModify: false})
    .then(function(){
        console.log("Added boat", newBoat)
        res.redirect('/profile');
    })

})

//remove boat
router.post('/removeboat', ensureAuthenticated, (req, res) => {
    const {
        remove_name
    } = req.body;

    User.updateOne({_id: req.user._id}, {
        $pull: {
            boats: { name: remove_name }
        }
    }, { safe: true })
    .then(function(){
        res.redirect('/profile');
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
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
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
    console.log(' Name ' + name + ' email :' + email + ' pass:' + password);
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
            console.log(user);
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
                                    console.log(value)
                                    req.flash('success_msg', 'You have now registered!');
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
    req.flash('success_msg', 'Now logged out');
    res.redirect('/users/login');
})

module.exports = router;