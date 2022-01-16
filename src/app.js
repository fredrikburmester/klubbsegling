var path = require('path');
const express = require('express')
const app = express()
const expressEjsLayout = require('express-ejs-layouts')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')
var cors = require('cors')

// Passport config:
require('./config/passport')(passport)

// Use Cors:
app.use(cors())

// Static files
app.use('/static', express.static('public'))

app.use(
	'/bootstrap',
	express.static(__dirname + '/node_modules/bootstrap/dist/')
)

// EJS
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, './views'));
app.use(expressEjsLayout)
app.disable('view cache')

// BodyParser
app.use(express.urlencoded({ extended: false }))

// Express session
app.use(
	session({
		secret: 'secret',
		resave: true,
		saveUninitialized: true,
	})
)

app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use((req, res, next) => {
	res.locals.success_msg = req.flash('success_msg')
	res.locals.error_msg = req.flash('error_msg')
	res.locals.error = req.flash('error')
	next()
})

//Routes
app.use('/', require('./routes/index'))
app.use('/users', require('./routes/users'))
app.use('/race', require('./routes/race'))
app.use('/admin', require('./routes/admin'))
app.use('/api', require('./routes/api'))

app.listen(3000)
