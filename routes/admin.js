const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const {ensureAuthenticated} = require('../config/auth') 

const User = require("../models/user");
const Boat = require("../models/boat");
const Race = require("../models/race");
const Club = require("../models/club");

router.get('/',ensureAuthenticated, async (req,res)=>{

    const races = await Race.find()
    const clubs = await Club.find()

    res.render('admin',{
        user: req.user,
        races: races,
        clubs: clubs
    });
})

router.post('/addclub',ensureAuthenticated, async (req,res)=>{
    const{
        name
    } = req.body

    const races = await Race.find()
    const clubs = await Club.find()

    let errors = [];

    if (!name) {
        errors.push({
            msg: "Namn krävs"
        })
    }

    if(errors.length > 0) {
        res.render('admin', {
            errors: errors,
            user: req.user,
            races: races,
            clubs: clubs
        })
    } else {
        Club.findOne({name: name}, function(err,club) { 
            if(club) {
                errors.push({
                    msg: 'Klubben finns redan'
                });
                res.render('admin', {
                    errors,
                    user: req.user,
                    races: races,
                    clubs: clubs
                })
            } else {
                const newClub = new Club({
                    name: name
                });
                
                newClub.save()
                res.redirect('/admin');
            }
        });
    }
})

router.post('/removeclub',ensureAuthenticated, async (req,res)=>{
    const{
        name
    } = req.body

    Club.deleteOne({name: name})
    .then(function(){
        res.redirect('/admin');
    })
})

router.post('/addrace',ensureAuthenticated,(req,res)=>{
    const {
        name,
        startdate,
        enddate,
        club,
        org,
        tel,
        email,
        pdf,
        image,
        description,
        check1,
        check2,
        check3,
        check4,
        check5,
        check6,
        handicap,
        regOpen,
        regclose
    } = req.body;

    let errors = [];

    if (!name) {
        errors.push({
            msg: "Namn krävs"
        })
    }

    if (errors.length > 0) {
        res.render('admin', {
            errors: errors,
            user: req.user
        })
    } else {
        const newRace = new Race({
            name: name
        });

        newRace.save()
        res.redirect('/admin');
    }

})

module.exports = router;