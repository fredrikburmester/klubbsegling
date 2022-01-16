const express = require('express')
const router = express.Router()
const { ensureAuthenticated } = require('../config/auth')
// const User = require('../models/user')
// const Race = require('../models/race')
// const Boat = require('../models/boat')
// const Club = require('../models/club')
// const Serie = require('../models/serie')
// const Handicap = require('../models/handicap')
// const Checkpoint = require('../models/checkpoint')
import { User, Race, Boat, Club, Serie, Handicap, Checkpoint} from '../config/dbConfig';

const bodyParser = require('body-parser')
const https = require('https')
const { json } = require('body-parser')
router.use(bodyParser.json())

function getTodaysDate(offset) {
	var dateString = ''

	var today = new Date()
	var dd = String(today.getDate()).padStart(2, '0')
	var mm = String(today.getMonth() + 1).padStart(2, '0') //January is 0!
	var yyyy = today.getFullYear()

	dateString = yyyy + offset + '-' + mm + '-' + dd

	return dateString
}

router.get('/', ensureAuthenticated, async (req, res) => {
	res.render('dashboard', {
		user: req.user,
		// stat1: racesThisYear.length,
		// stat2: req.user.races.length,
		// stat3: racesSailed,
		title: 'Hem',
	})
})

router.get('/results', async (req, res) => {
	var available = false
	var registered = false
	var sailed = false

	if (req.query.available !== undefined) available = true

	if (req.query.registered !== undefined) registered = true

	if (req.query.sailed !== undefined) sailed = true

	console.log(available, registered, sailed)

	const series = await Serie.find()
	const clubs = await Club.find()

	res.render('results', {
		user: req.user,
		clubs: clubs,
		series: series,
		title: 'Seglingar',
		available: available,
		registered: registered,
		sailed: sailed,
	})
})

router.get('/profile', ensureAuthenticated, async (req, res) => {
	var srsCertMono = require('../../public/srs-cert-mono.json')
	var srsStdMono = require('../../public/srs-std-mono.json')

	res.render('profile', {
		user: req.user,
		boats: srsCertMono,
		stdBoats: srsStdMono,
		title: 'Profil',
	})
})

router.get('/register', (req, res) => {
	res.render('register')
})

// Used to get user data of the logged in user
router.post('/get-user', async (req, res) => {
	if (req.isAuthenticated()) {
		var user = req.user
		res.status(200)
		res.setHeader('Content-Type', 'application/json')
		res.end(
			JSON.stringify({
				user,
			})
		)
	} else {
		res.status(203).end()
	}
})

router.post('/register-for-race', async (req, res) => {
	const { id, boat_id } = req.body

	let errors = []

	if (req.user === undefined) {
		res.status(401).end()
	} else {
		found = await Race.findById(id)

		var today = new Date()

		// if race has been - no register
		if (found.regClosed < today) {
			errors.push({
				msg: 'Registreringen har tyvärr stängt',
			})
		} else if (found.endDate < today) {
			errors.push({
				msg: 'Den här tävlingen har redan varit!',
			})
		} else if (found.startDate < today && found.endDate > today) {
			errors.push({
				msg: 'Den här tävlingen är pågående!',
			})
		}

		if (found && errors.length == 0) {
			Race.updateOne(
				{
					_id: id,
				},
				{
					$addToSet: {
						participants: boat_id,
					},
				},
				{
					useFindAndModify: false,
				},
				function (err, result) {
					if (err) {
						console.log(err)
						res.status(500).end()
					} else {
						User.updateOne(
							{
								_id: req.user._id,
							},
							{
								$addToSet: {
									races: id,
								},
							},
							{
								useFindAndModify: false,
							},
							function (err, result) {
								if (err) {
									console.log(err)
									res.status(500).end()
								} else {
									response = {
										errors: errors,
										success: true,
									}
									res.status(200)
									res.setHeader(
										'Content-Type',
										'application/json'
									)
									res.end(
										JSON.stringify({
											response,
										})
									)
								}
							}
						)
					}
				}
			)
		} else {
			response = {
				errors: errors,
				success: false,
			}
			res.status(200)
			res.setHeader('Content-Type', 'application/json')
			res.end(
				JSON.stringify({
					response,
				})
			)
		}
	}
})

router.post('/un-register-for-race/:id', async (req, res) => {
	id = req.params.id
	if (req.user === undefined) {
		res.status(401).end()
	} else {
		found = await Race.findById(id)

		if (found) {
			await Race.findByIdAndUpdate(
				{
					_id: id,
				},
				{
					$pull: {
						participants: req.user.id,
					},
				},
				function (err, result) {
					if (err) {
						res.status(500).end()
					} else {
					}
				}
			)

			await User.findByIdAndUpdate(
				{
					_id: req.user.id,
				},
				{
					$pull: {
						races: id,
					},
				},
				function (err, result) {
					if (err) {
						res.status(500).end()
					} else {
						res.status(200).end()
					}
				}
			)
		} else {
			res.status(404).end()
		}
	}
})

router.post('/boat/add/sailor', ensureAuthenticated, async (req, res) => {
	const { user_id, boat_id } = req.body

	var user = await User.findById(user_id)

	await Boat.findById(boat_id)
		.then((boat) => {
			boat.crew.push(user_id)
			boat.save()
			response = {
				success: true,
				data: {
					name: user.name,
					id: user._id,
				},
			}
			res.status(200)
			res.setHeader('Content-Type', 'application/json')
			res.end(
				JSON.stringify({
					response,
				})
			)
		})
		.catch((err) => {
			console.log(err)
			res.status(400).end()
		})
})

router.post('/boat/remove/sailor', ensureAuthenticated, async (req, res) => {
	const { user_id, boat_id } = req.body

	await Boat.findById(boat_id)
		.then((boat) => {
			boat.crew.pull(user_id)
			boat.save()
			response = {
				success: true,
			}
			res.status(200).end()
		})
		.catch((err) => {
			console.log(err)
			res.status(400).end()
		})
})

router.get('/user/:id', async (req, res) => {
	var id = req.params.id

	if (id) {
		var public_user = await User.findById(id).select(
			'-password -__v -adminLevel'
		)

		if (public_user.club) {
			if (public_user.club.length > 0) {
				var club = await Club.findById(public_user.club[0])
			}
		}

		userBoats = []

		var boats = await Boat.find()

		// All boats for this user with all nessesary information, such as crew members for the boat
		for (let i = 0; i < public_user.boats.length; i++) {
			for (let j = 0; j < boats.length; j++) {
				if (public_user.boats[i] == boats[j]._id) {
					for (let k = 0; k < boats[j].crew.length; k++) {
						let user = await User.findById(boats[j].crew[k])
						boats[j].crew[k] = {
							name: user.name,
							id: user._id,
						}
					}
					userBoats.push(boats[j])
				}
			}
		}

		res.render('public_profile', {
			user: req.user,
			public: public_user,
			club: club.name,
			title: 'Användare',
			userBoats: userBoats,
		})
	}
})

module.exports = router
