const express = require('express');
const router  = express.Router();
const {ensureAuthenticated} = require('../config/auth') 
const User = require("../models/user");

//login page
router.get('/', (req,res)=>{
    res.redirect('/dashboard');
})

//register page
router.get('/register', (req,res)=>{
    res.render('register');
})

// Logged in pages
router.get('/dashboard',ensureAuthenticated,(req,res)=>{
    res.render('dashboard',{
        user: req.user,
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