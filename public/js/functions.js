// --- GLOBAL VARIABLES ---

// --- GLOBAL FUNCTIONS ---

async function updateBoats() {
	console.log('[1] Updating user information...')
	await getUserData()

	console.log('[2] Updating user boats...')
	if (USER.boats.length != 0) {
		await getBoats({
			boat_ids: USER.boats,
		}).then((response) => {
			boats = response
		})
	}

	for (let i = 0; i < boats.length; i++) {
		let crew = boats[i].crew
		for (let j = 0; j < crew.length; j++) {
			await getUsers({
				user_ids: crew[j],
			}).then((response) => {
				boats[i].crew[j] = {
					name: response[0].name,
					id: response[0]._id,
				}
			})
		}
	}

	return true
}

async function removeBoat(id, el) {
	await axios
		.post('/users/removeboat/' + id, {})
		.then(function (response) {
			if (response.data.response.success == true) {
				window.createNotification({
					closeOnClick: false,
					displayCloseButton: false,
					positionClass: 'nfc-bottom-right',
					showDuration: 5000,
					theme: 'success',
				})({
					title: 'Båten borttagen!',
					message: '',
				})
			}
		})
		.catch(function (error) {
			console.log(error)
		})

	await updateBoats().then(() => {
		updateBoatCards()
	})
}

async function addBoat(form) {
	await axios
		.post('/users/addboat/' + form.ref.value, {})
		.then(function (response) {
			if (response.data.response.success == 'true') {
				window.createNotification({
					closeOnClick: false,
					displayCloseButton: false,
					positionClass: 'nfc-bottom-right',
					showDuration: 5000,
					theme: 'success',
				})({
					title: 'Tillagd!',
					message: 'Båten är nu tillagd',
				})
			} else {
				window.createNotification({
					closeOnClick: false,
					displayCloseButton: false,
					positionClass: 'nfc-bottom-right',
					showDuration: 5000,
					theme: 'error',
				})({
					title: 'Någonting gick snett!',
					message: response.data.response.errors[0].msg,
				})
			}
		})
		.catch(function (error) {
			console.log('Error: ', error)
		})

	await updateBoats().then(() => {
		updateBoatCards()
	})
}

function updateBoatCards() {
	cards.innerHTML = ''
	if (boats.length == 0) {
		cards.innerHTML = 'Inga båtar här inte...'
	} else {
		boats.forEach((boat) => {
			console.log('[3] Creating boat card...')
			createBoatCard(boat)
		})
	}
}

async function addCrewMember(boat_id, crewMember_id, el) {
	let errors = []

	boats.forEach((boat) => {
		if (boat._id == boat_id) {
			boat.crew.forEach((crewMember) => {
				if (crewMember.id == crewMember_id) {
					errors.push({
						msg: 'Personen är redan gast på den här båten',
					})
				}
			})
		}
	})

	if (errors.length == 0) {
		if (boat_id !== undefined && boat_id !== null && boat_id.length > 0) {
			if (
				crewMember_id !== undefined &&
				crewMember_id !== null &&
				crewMember_id.length > 0
			) {
				await axios
					.post('/boat/add/sailor', {
						user_id: crewMember_id,
						boat_id: boat_id,
					})
					.then(function (response) {
						if (response.status == 200) {
							res = response.data.response.data
							boats.forEach((boat) => {
								if (
									boat._id == boat_id &&
									res.name.length > 0 &&
									res.id.length > 0
								) {
									boat.crew.push({
										id: res.id,
									})
								}
							})
						}

						if (response.data.response.data.success == 'true') {
							window.createNotification({
								closeOnClick: false,
								displayCloseButton: false,
								positionClass: 'nfc-bottom-right',
								showDuration: 5000,
								theme: 'success',
							})({
								title: 'Gast tillagd',
								message: errors[0].msg,
							})
						}
					})
					.catch(function (error) {
						console.log(error)
					})

				await updateBoats().then(() => {
					updateBoatCards()
				})
			}
		}
	} else {
		window.createNotification({
			closeOnClick: false,
			displayCloseButton: false,
			positionClass: 'nfc-bottom-right',
			showDuration: 5000,
			theme: 'error',
		})({
			title: 'Någonting gick snett!',
			message: errors[0].msg,
		})
	}
}

async function removeCrewMember(boat_id, crewMember_id, el) {
	await axios
		.post('/boat/remove/sailor', {
			user_id: crewMember_id,
			boat_id: boat_id,
		})
		.then(function (response) {
			if (response.status == 200) {
				boats.forEach((boat) => {
					if (boat._id == boat_id) {
						let tempArray = []

						boat.crew.forEach((member) => {
							if (member != crewMember_id) tempArray.push(member)
						})

						boat.crew = tempArray
					}
				})
			}
		})
		.catch(function (error) {
			console.log(error)
		})

	await updateBoats().then(() => {
		updateBoatCards()
	})
}

async function createBoatCard(boat) {
	var cards = document.getElementById('cards')

	var card = document.createElement('div')
	card.classList.add('card')
	card.classList.add('mb-4')
	card.classList.add('shadow')
	card.classList.add('border-0')

	var cardBody = document.createElement('div')
	cardBody.classList.add('card-body')

	var cardTitle = document.createElement('h5')
	cardTitle.classList.add('card-title')
	cardTitle.innerHTML = boat.name

	var cardSubtitle = document.createElement('h6')
	cardSubtitle.classList.add('card-subtitle')
	cardSubtitle.classList.add('mb-2')
	cardSubtitle.classList.add('text-muted')
	cardSubtitle.innerHTML = boat.boatType

	var cardText = document.createElement('p')
	cardText.classList.add('card-text')
	cardText.innerText = 'SRS: ' + boat.srs

	let form = document.createElement('form')

	var addSailorSelect = document.createElement('select')
	addSailorSelect.classList.add('selectpicker')
	addSailorSelect.classList.add('form-control')
	addSailorSelect.setAttribute('name', 'id')

	allUsers.forEach((user) => {
		//if(!boat.crew.includes(user._id)) {
		let sailor = document.createElement('option')
		sailor.value = user._id
		sailor.innerHTML = user.name
		addSailorSelect.appendChild(sailor)
		//}
	})

	var addSailorButton = document.createElement('button')
	addSailorButton.innerHTML = 'Lägg till'
	addSailorButton.classList.add('btn')
	addSailorButton.classList.add('btn-primary')
	addSailorButton.setAttribute('type', 'button')
	addSailorButton.addEventListener('click', function handler() {
		addCrewMember(boat._id, this.form.id.value, this)
		//this.removeEventListener('click', handler);
	})

	card.appendChild(cardBody)
	cardBody.appendChild(cardTitle)
	cardBody.appendChild(cardSubtitle)
	cardBody.appendChild(cardText)

	if (boat.crew.length != 0) {
		var crewDiv = document.createElement('div')
		crewDiv.classList.add('mb-5')
		var addSailorText = document.createElement('p')
		addSailorText.style.marginBottom = '0'
		addSailorText.innerHTML = 'Gastar: <br>'
		crewDiv.appendChild(addSailorText)

		boat.crew.forEach((member) => {
			let name = member.name
			let id = member.id

			let div = document.createElement('div')
			div.classList.add('crewmember')

			let crewMember = document.createElement('a')
			crewMember.innerHTML = name
			crewMember.href = `/user/${id}`

			let removeButton = document.createElement('button')
			removeButton.classList.add('close')
			removeButton.id = 'removeCrewMemberButton'
			removeButton.setAttribute('type', 'button')
			removeButton.addEventListener('click', function handler() {
				removeCrewMember(boat._id, id, this)
			})

			var span = document.createElement('span')
			span.setAttribute('aria-hidden', 'true')
			span.innerHTML = '&times;'
			removeButton.appendChild(span)

			div.appendChild(crewMember)
			div.appendChild(removeButton)

			crewDiv.appendChild(div)
		})
		cardBody.appendChild(crewDiv)
	}

	form.appendChild(addSailorSelect)
	form.appendChild(addSailorButton)
	cardBody.appendChild(form)

	var cardButton = document.createElement('button')
	cardButton.classList.add('close')
	cardButton.id = 'removeBoatButton'
	cardButton.setAttribute('type', 'button')
	cardButton.addEventListener('click', function handler() {
		removeBoat(boat._id, this)
		this.removeEventListener('click', handler)
	})

	var span = document.createElement('span')
	span.setAttribute('aria-hidden', 'true')
	span.innerHTML = '&times;'
	cardButton.appendChild(span)

	cardBody.appendChild(cardButton)

	cards.appendChild(card)

	$('.selectpicker').selectpicker('refresh')
}

async function loadStats() {
	await getRaces({
		years: new Date().getFullYear().toString(),
		future: 'true',
	})
		.then((response) => {
			document.getElementById('stat1').innerHTML = response.length
		})
		.catch((err) => {
			console.log(err)
		})

	var stat2 = 0
	await getRaces({
		years: new Date().getFullYear().toString(),
		future: 'true',
		participants: USER.boats,
	})
		.then((response) => {
			stat2 += response.length
		})
		.catch((err) => {
			console.log(err)
		})

	await getRaces({
		years: new Date().getFullYear().toString(),
		future: 'true',
		crew_members: USER._id,
	})
		.then((response) => {
			stat2 += response.length
		})
		.catch((err) => {
			console.log(err)
		})

	document.getElementById('stat2').innerHTML = stat2

	await getRaces({
		previous: 'true',
		participants: USER.boats,
	})
		.then((response) => {
			document.getElementById('stat3').innerHTML = response.length
		})
		.catch((err) => {
			console.log(err)
		})
}

async function loadDashboardRaces() {
	await getRaces({
		years: new Date().getFullYear().toString(),
		clubs: USER.club,
		future: 'true',
	})
		.then(function (response) {
			RACES = response
		})
		.catch(function (error) {
			console.log(error)
		})

	sortRaces('date-old')

	for (let i = 0; i < RACES.length; i++) {
		const race = RACES[i]

		var endDate = new Date(race.endDate)
		var startDate = new Date(race.startDate)
		var today = new Date()

		if (startDate <= today && endDate >= today) {
			let row = document.createElement('p')
			row.style.display = 'flex'

			let subtitle = document.createElement('h2')
			subtitle.classList.add('subtitle')
			subtitle.innerText = 'Pågående'
			cards.appendChild(subtitle)

			let pulse = document.createElement('div')
			pulse.classList.add('spinner-grow')
			pulse.classList.add('text-success')
			pulse.setAttribute('role', 'status')
			pulse.style.marginTop = '22px'
			pulse.style.marginLeft = '10px'

			let span = document.createElement('span')
			span.classList.add('sr-only')

			pulse.appendChild(span)

			row.appendChild(subtitle)
			row.appendChild(pulse)

			cards.appendChild(row)
		} else if (i == 0) {
			let subtitle = document.createElement('h2')
			subtitle.classList.add('subtitle')
			subtitle.innerText = 'Nästa segling'
			cards.appendChild(subtitle)
		} else if (i == 1) {
			let subtitle = document.createElement('h2')
			subtitle.classList.add('subtitle')
			subtitle.innerText = 'Kommande'
			cards.appendChild(subtitle)
		}
		await createRaceCard(race)
	}
}

async function loadResultsRaces() {
	if (registered == 'true') {
		await getRaces({
			participants: USER.boats,
			future: 'true',
		})
			.then((response) => {
				response.forEach((race) => {
					RACES.push(race)
				})
			})
			.catch((err) => {
				console.log(err)
			})

		await getRaces({
			crew_members: USER._id,
			future: 'true',
		})
			.then((response) => {
				response.forEach((race) => {
					RACES.push(race)
				})
			})
			.catch((err) => {
				console.log(err)
			})

		sortRaces('date-old')
	} else if (sailed == 'true') {
		await getRaces({
			participants: USER.boats,
			previous: 'true',
		})
			.then((response) => {
				response.forEach((race) => {
					RACES.push(race)
				})
			})
			.catch((err) => {
				console.log(err)
			})
		await getRaces({
			crew_members: USER._id,
			previous: 'true',
		})
			.then((response) => {
				response.forEach((race) => {
					RACES.push(race)
				})
			})
			.catch((err) => {
				console.log(err)
			})

		sortRaces('date-old')
	} else if (available == 'true') {
		await getRaces({
			future: 'true',
		})
			.then((response) => {
				response.forEach((race) => {
					RACES.push(race)
				})
			})
			.catch((err) => {
				console.log(err)
			})

		sortRaces('date-old')
	} else {
		bar.animate(0.1)

		await getRaces({
			clubs: formclub.value,
			years: formyear.value,
			series: formserie.value,
		})
			.then((response) => {
				response.forEach((race) => {
					RACES.push(race)
				})
			})
			.catch((err) => {
				console.log(err)
			})

		sortRaces(sort.value)
	}

	printResultCards()
}

async function printResultCards() {
	showFilterButton.classList.remove('hidden')
	filterForm.classList.add('hidden')

	document.getElementById('error').innerText = ''
	document.getElementById('cards').innerHTML = ''

	document.getElementById('slider').classList.remove('hideFade')

	if (RACES.length > 0) {
		var sliderStep = 1 / RACES.length
		for (let i = 0; i < RACES.length; i++) {
			const race = RACES[i]
			await createRaceCard(race)
			bar.animate(sliderStep * (i + 1))
		}
		bar.animate(1.0)
		setTimeout(() => {
			document.getElementById('slider').classList.add('hideFade')
			bar.animate(0.0)
		}, 1500)
	} else {
		document.getElementById('error').innerText = 'Inga matchande tävlingar!'
	}
}

async function getUserData() {
	await axios
		.post('/get-user')
		.then((response) => {
			if (response.status == 200) USER = response.data.user
			else if (response.status == 203) {
				USER = null
			}
			return response
		})
		.catch((err) => {
			console.log(err)
		})
}

function isToday(someDate) {
	const today = new Date()
	return (
		someDate.getDate() == today.getDate() &&
		someDate.getMonth() == today.getMonth() &&
		someDate.getFullYear() == today.getFullYear()
	)
}

async function unRegisterForRace(id, el) {
	await axios
		.post('/un-register-for-race/' + id)
		.then((response) => {
			if (response.status == 200) {
				window.createNotification({
					closeOnClick: false,
					displayCloseButton: false,
					positionClass: 'nfc-bottom-right',
					showDuration: 5000,
					theme: 'warning',
				})({
					title: 'Avregistrerad',
					message: 'Du är nu avregistrerad på tävlingen',
				})
				USER
				USER.races = USER.races.filter((e) => e !== id) // will return ['A', 'C']
				el.innerHTML = 'Registrera'
				el.classList.remove('btn-warning')
				el.classList.add('btn-primary')
				el.id = id.toString() + 'registerButton'
				el.addEventListener('click', function handler() {
					openModalForBoatSelection(id, el.id)
					this.removeEventListener('click', handler)
				})

				return true
			} else {
				window.createNotification({
					closeOnClick: false,
					displayCloseButton: false,
					positionClass: 'nfc-bottom-right',
					showDuration: 5000,
					theme: 'error',
				})({
					title: 'Tyvärr!',
					message: response.data.response.errors[0].msg,
				})
				return true
			}
		})
		.catch((error) => {
			console.error(error)
			return false
		})
}

async function getClubById(id) {
	await axios
		.get('/club/' + id)
		.then(function (response) {
			if (response.status == 200) {
				return response.data.response.club.name
			}
		})
		.catch(function (error) {
			// handle error
			console.log(error)
		})
		.then(function () {
			// always executed
		})
}

async function openModalForBoatSelection(id, button_id) {
	if (USER.boats.length > 1) {
		document.getElementById('raceIdForModal').value = id
		document.getElementById('buttontochange').value = button_id.toString()

		for (let i = 0; i < USER.boats.length; i++) {
			const id = USER.boats[i]
			await getBoats({
				boat_ids: id,
			}).then((response) => {
				let option = document.createElement('option')
				option.value = id
				option.innerHTML = response[0].name
				document.getElementById('boatselect').appendChild(option)
			})
		}

		// $('#chooseBoat').modal('toggle')
		$('#chooseBoat').modal('show')
		$('#boatselect').selectpicker('refresh')
	} else {
		registerForRace(id, USER.boats[0], button_id)
	}
}

async function registerForRace(id, boat_id, button_id) {
	var el = document.getElementById(button_id)

	if (boat_id === undefined || boat_id == null || boat_id.length == 0) {
		window.createNotification({
			closeOnClick: false,
			displayCloseButton: false,
			positionClass: 'nfc-bottom-right',
			showDuration: 5000,
			theme: 'error',
		})({
			title: 'Tyvärr!',
			message: 'Du måste äga en båt först!',
		})
	} else {
		await axios
			.post('/register-for-race', {
				id,
				boat_id,
			})
			.then((response) => {
				if (
					response.status == 200 &&
					response.data.response.success == true
				) {
					window.createNotification({
						closeOnClick: false,
						displayCloseButton: false,
						positionClass: 'nfc-bottom-right',
						showDuration: 5000,
						theme: 'success',
					})({
						title: 'Registrerad',
						message: 'Du är nu registrerad på tävlingen',
					})

					USER.races.push(id)
					el.innerHTML = 'Avregistrera'
					el.classList.remove('btn-primary')
					el.classList.add('btn-warning')
					el.addEventListener('click', function handler() {
						unRegisterForRace(id, this)
						this.removeEventListener('click', handler)
					})
					return true
				} else {
					window.createNotification({
						closeOnClick: false,
						displayCloseButton: false,
						positionClass: 'nfc-bottom-right',
						showDuration: 5000,
						theme: 'error',
					})({
						title: 'Tyvärr!',
						message: response.data.response.errors[0].msg,
					})
					return true
				}
			})
			.catch((error) => {
				console.error(error)
				return false
			})
	}
}

function sortRaces(type) {
	if (RACES.length > 0) {
		if (type == 'date-new') {
			RACES.sort((a, b) => (a.startDate < b.startDate ? 1 : -1))
		} else if (type == 'date-old') {
			RACES.sort((a, b) => (a.startDate > b.startDate ? 1 : -1))
		} else if (type == 'name') {
			RACES.sort((a, b) => (a.name > b.name ? 1 : -1))
		} else if (type == 'club') {
			RACES.sort((a, b) => (a.club > b.club ? 1 : -1))
		} else if (type == 'serie') {
			RACES.sort((a, b) => (a.serie < b.serie ? 1 : -1))
		}
	}
}

async function createRaceCard(race) {
	var cards = document.getElementById('cards')

	var card = document.createElement('div')
	card.classList.add('load')
	card.classList.add('card')
	card.classList.add('bg-white')
	card.classList.add('shadow')
	card.classList.add('border-0')
	card.classList.add('rounded-lg')
	card.classList.add('mb-5')

	var cardBody = document.createElement('div')
	cardBody.classList.add('card-body')

	var cardTitle = document.createElement('p')
	cardTitle.classList.add('card-title')
	cardTitle.id = 'race-name'
	cardTitle.innerHTML = race.name

	var cardClub = document.createElement('p')
	cardClub.classList.add('card-text')
	cardClub.classList.add('text-muted')
	cardClub.innerText = race.club

	var cardDate = document.createElement('p')
	cardDate.classList.add('text-muted')
	cardDate.classList.add('mb-2')
	cardDate.innerHTML = `${race.startDate
		.split('T')[0]
		.replace('-', '/')} - ${race.endDate.split('T')[0].replace('-', '/')}`

	var cardButton = document.createElement('button')
	cardButton.classList.add('btn')
	cardButton.classList.add('cardButton')

	card.appendChild(cardBody)
	cardBody.appendChild(cardTitle)
	cardBody.appendChild(cardClub)
	cardBody.appendChild(cardDate)

	if (USER) {
		var found = false
		var crewMember = false

		await getBoats({
			race_ids: race._id,
		}).then((response) => {
			response.forEach((boat) => {
				if (boat.crew.includes(USER._id)) {
					crewMember = true
				}
				if (USER.boats.includes(boat._id)) {
					found = true
				}
			})
		})

		var endDate = new Date(race.endDate)
		var startDate = new Date(race.startDate)
		var today = new Date()
		if (found) {
			if (startDate <= today && endDate >= today) {
				cardButton.innerHTML = 'Rapportera'
				cardButton.classList.add('btn-success')
				cardButton.addEventListener('click', function handler() {
					reportRace(race._id, this)
					this.removeEventListener('click', handler)
				})
			} else {
				cardButton.innerHTML = 'Avregistrera'
				cardButton.classList.add('btn-warning')
				cardButton.addEventListener('click', function handler() {
					unRegisterForRace(race._id, this)
					this.removeEventListener('click', handler)
				})
			}
		} else if (crewMember) {
			if (startDate <= today && endDate >= today) {
				cardButton.innerHTML = 'Rapportera'
				cardButton.classList.add('btn-success')
				cardButton.addEventListener('click', function handler() {
					reportRace(race._id, this)
					this.removeEventListener('click', handler)
				})
			} else {
				cardButton.innerHTML = 'Avregistrera'
				cardButton.classList.add('btn-warning')
				cardButton.disabled = true
			}
		} else {
			cardButton.innerHTML = 'Registrera'
			cardButton.classList.add('btn-primary')
			cardButton.id = race._id.toString() + 'registerButton'
			let button_id = cardButton.id
			cardButton.addEventListener('click', function handler() {
				openModalForBoatSelection(race._id, button_id)
				this.removeEventListener('click', handler)
			})
		}
		cardBody.appendChild(cardButton)
	}

	var cardButton = document.createElement('a')
	cardButton.classList.add('mx-2')
	cardButton.classList.add('btn-secondary')
	cardButton.classList.add('btn')
	cardButton.href = '/race/' + race._id
	cardButton.innerText = 'Visa mer'
	cardBody.appendChild(cardButton)

	cards.appendChild(card)

	card.classList.add('loaded')
}

function reportRace(id, el) {
	location.href = `/race/report/${id}`
}

async function getRaces(e) {
	if (e === undefined) {
		e = {}
	}

	if (e.future !== undefined) e.future = e.future.toString()
	if (e.previous !== undefined) e.previous = e.previous.toString()

	let response = await axios.post('/api/find/races', {
		years: e.years,
		clubs: e.clubs,
		future: e.future,
		previous: e.previous,
		race_ids: e.race_ids,
		handicaps: e.handicaps,
		participants: e.participants,
		crew_members: e.crew_members,
		series: e.series,
		race_names: e.race_names,
	})

	return response.data
}

async function getUsers(e) {
	let response = await axios.post('/api/find/users', {
		race_ids: e.race_ids,
		clubs: e.clubs,
		user_ids: e.user_ids,
		user_names: e.user_names,
		boat_ids: e.boat_ids,
		boat_names: e.boat_names,
	})

	return response.data
}

async function getBoats(e) {
	let response = await axios.post('/api/find/boats', {
		user_ids: e.user_ids,
		boat_ids: e.boat_ids,
		race_ids: e.race_ids,
		boat_names: e.boat_names,
		owner_names: e.owner_names,
	})

	return response.data
}
