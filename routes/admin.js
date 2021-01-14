const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const {ensureAuthenticated} = require('../config/auth') 

const fileUpload = require('express-fileupload');

router.use(fileUpload({
    createParentPath: true
}));

const User = require("../models/user");
const Boat = require("../models/boat");
const Race = require("../models/race");
const Club = require("../models/club");
const Serie = require("../models/serie");
const Handicap = require("../models/handicap");

router.get('/',ensureAuthenticated, async (req,res)=>{

    const races = await Race.find()
    const clubs = await Club.find()
    const series = await Serie.find()
    const handicaps = await Handicap.find()

    res.render('admin',{
        user: req.user,
        races: races,
        clubs: clubs,
        series: series,
        handicaps: handicaps
    });
})

router.post('/addserie',ensureAuthenticated, async (req,res)=>{
    const{
        name,
        description
    } = req.body

    const races = await Race.find()
    const clubs = await Club.find()
    const series = await Serie.find()
    const handicaps = await Handicap.find()

    let errors = [];

    if (!name || !description) {
        errors.push({
            msg: "Alla fält ej ifyllda"
        })
    }

    if(errors.length > 0) {
        res.render('admin', {
            errors: errors,
            user: req.user,
            races: races,
            clubs: clubs,
            series: series,
            handicaps: handicaps
        })
    } else {
        Serie.findOne({name: name}, function(err,serie) { 
            if(serie) {
                errors.push({
                    msg: 'Serien finns redan'
                });
                res.render('admin', {
                    errors,
                    user: req.user,
                    races: races,
                    clubs: clubs,
                    series: series,
                    handicaps: handicaps
                })
            } else {
                const newSerie = new Serie({
                    name: name,
                    description: description
                });
                
                newSerie.save()
                res.redirect('/admin');
            }
        });
    }
})

router.post('/removeserie',ensureAuthenticated, async (req,res)=>{
    const{
        name
    } = req.body

    Serie.deleteOne({name: name})
    .then(function(){
        res.redirect('/admin');
    })
})

router.post('/addhandicap',ensureAuthenticated, async (req,res)=>{
    const{
        name,
        description
    } = req.body

    const races = await Race.find()
    const clubs = await Club.find()
    const series = await Serie.find()
    const handicaps = await Handicap.find()

    let errors = [];

    if (!name || !description) {
        errors.push({
            msg: "Alla fält ej ifyllda"
        })
    }

    if(errors.length > 0) {
        res.render('admin', {
            errors: errors,
            user: req.user,
            races: races,
            clubs: clubs,
            series: series,
            handicaps: handicaps
        })
    } else {
        Handicap.findOne({name: name}, function(err,handicap) { 
            if(handicap) {
                errors.push({
                    msg: 'Handikappsystemet finns redan'
                });
                res.render('admin', {
                    errors,
                    user: req.user,
                    races: races,
                    clubs: clubs,
                    series: series,
                    handicaps: handicaps
                })
            } else {
                const newHandicap = new Handicap({
                    name: name,
                    description: description
                });
                
                newHandicap.save()
                res.redirect('/admin');
            }
        });
    }
})

router.post('/removehandicap',ensureAuthenticated, async (req,res)=>{
    const{
        name
    } = req.body

    Handicap.deleteOne({name: name})
    .then(function(){
        res.redirect('/admin');
    })
})

router.post('/addclub',ensureAuthenticated, async (req,res)=>{
    const{
        name
    } = req.body

    let logo;
  
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }
  
    // The name of the input field (i.e. "logo") is used to retrieve the uploaded file
    logo = req.files.logo;
    console.log(logo)

    filename = name + '-' + logo.name
  
    // Use the mv() method to place the file somewhere on your server
    logo.mv('./public/uploads/' + filename, function(err) {
      if (err)
        return res.status(500).send(err);
    });

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
            clubs: clubs,
            series: series,
            handicaps: handicaps
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
                    clubs: clubs,
                    series: series,
                    handicaps: handicaps
                })
            } else {
                const newClub = new Club({
                    name: name,
                    logo: filename
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

    console.log(new Date(startdate))

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
            clubs: clubs,
            series: series,
            handicaps: handicaps
        })
    } else {
        Race.findOne({name: name}, function(err,race) { 
            if(race) {
                errors.push({
                    msg: 'Tävlingen finns redan'
                });
                res.render('admin', {
                    errors,
                    user: req.user,
                    races: races,
                    clubs: clubs,
                    series: series,
                    handicaps: handicaps
                })
            } else {
                function fixBool(s) {
                    if(s == 'on') return 1;
                    else return 0;
                }

                var c1 = fixBool(check1)
                var c2 = fixBool(check2)
                var c3 = fixBool(check3)
                var c4 = fixBool(check4)
                var c5 = fixBool(check5)
                var c6 = fixBool(check6)

                const newRace = new Race({
                    name: name,
                    startDate: new Date(startdate),
                    endDate: new Date(enddate),
                    club: club,
                    org: org,
                    tel: tel,
                    email: email,
                    pdf: pdf,
                    image: image,
                    description: description,
                    rbft: c1,
                    rbfn: c2,
                    rbbt: c3,
                    rbbn: c4,
                    rc: c5,
                    reg: c6,
                    handicap: handicap,
                    regOpen: regOpen,
                    regclose: regclose
                });
                
                newRace.save()
                res.redirect('/admin');
            }
        });
    }

})

router.post('/removerace',ensureAuthenticated, async (req,res)=>{
    const{
        name
    } = req.body

    Race.deleteOne({name: name})
    .then(function(){
        res.redirect('/admin');
    })
})

module.exports = router;