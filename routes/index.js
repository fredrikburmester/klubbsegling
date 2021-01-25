const express = require('express');
const router  = express.Router();
const {ensureAuthenticated} = require('../config/auth') 
const User = require("../models/user");
const Race = require("../models/race");
const Club = require("../models/club");
const Serie = require("../models/serie");
const Handicap = require("../models/handicap");
const Checkpoint = require("../models/checkpoint");

//login page
router.get('/', (req,res)=>{
    res.redirect('/dashboard');
})

//register page
router.get('/register', (req,res)=>{
    res.render('register');
})

router.get('/results', async (req,res)=>{
    const series = await Serie.find()
    const clubs = await Club.find()

    res.render('results',{
        user: req.user,
        clubs: clubs,
        series: series
    });
})

// Logged in pages
router.get('/dashboard',ensureAuthenticated, async (req,res)=>{

    const races = await Race.find()

    res.render('dashboard',{
        user: req.user,
        races: races,
    });
})

router.get('/profile',ensureAuthenticated, async (req,res)=>{

    // const person = await User.findOne({_id: req.user._id}).lean()
    // console.log(req.user)

    var srsCertMono = require('../public/srs-cert-mono.json');
    var srsStdMono = require('../public/srs-std-mono.json');


    res.render('profile',{
        user: req.user,
        boats: srsCertMono,
        stdBoats: srsStdMono
    });
})

module.exports = router; 