const express = require('express');
const router  = express.Router();
const {ensureAuthenticated} = require('../config/auth') 
const User = require("../models/user");
const Race = require("../models/race");
const Club = require("../models/club");
const Serie = require("../models/serie");
const Handicap = require("../models/handicap");
const Checkpoint = require("../models/checkpoint");

router.get('/', (req,res)=>{
    res.redirect('/dashboard');
})

//register page
router.get('/register', (req,res)=>{
    res.render('register');
})

router.post('/register-for-race/:id', async (req,res)=>{
    id = req.params.id
    if(req.user === undefined) {
        res.status(401).end();
    } else {

        found = await Race.findById(id)

        if (found) {
            Race.updateOne(
                { _id: id },
                { $addToSet: { participants: {id: req.user.id, name: req.user.name}} },
                function(err, result) {
                  if (err) {
                    res.status(500).end();
                  } else {
                    User.updateOne(
                        { _id: req.user._id },
                        { $addToSet: { races: id } },
                        function(err, result) {
                          if (err) {
                            res.status(500).end();
                          } else {
                            res.status(200).end();
                          }
                        }
                      );
                  }
                }
              );
        } else {
            console.log("not found")
            res.status(404).end();
        }
    }
})

router.post('/un-register-for-race/:id', async (req,res)=>{
    id = req.params.id
    console.log(id)
    if(req.user === undefined) {
        res.status(401).end();
    } else {

        found = await Race.findById(id)

        if (found) {
            await Race.findByIdAndUpdate(
                { _id: id },
                { $pull: { "participants": { id: req.user.id } } },
                function(err, result) {
                  if (err) {
                    console.log("Update race: ",err)
                    res.status(500).end();
                  } else {
                    console.log("participant removed")
                  }
                }
            );

            await User.findByIdAndUpdate(
                { _id: req.user.id },
                { $pull: { "races": id } },
                function(err, result) {
                    if (err) {
                        console.log("Update user: ", err)
                        res.status(500).end();
                    } else {
                        console.log("user race removed")
                        res.status(200).end();
                    }
                }
            );
        } else {
            console.log("not found")
            res.status(404).end();
        }
    }
})

router.get('/results', async (req,res)=>{
    const series = await Serie.find()
    const clubs = await Club.find()
    const races = await Race.find()

    res.render('results',{
        user: req.user,
        clubs: clubs,
        series: series,
        races: races
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