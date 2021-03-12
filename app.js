const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const app = express();
const flash = require('connect-flash');
const session = require('express-session');

/* NEW STUFF */
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('./config');
const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

// CORS middleware
const allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
}

app.use(allowCrossDomain)

/* --------- */ 

//mongoose
mongoose.connect('mongodb://192.168.0.118/klubbsegling_1',{useNewUrlParser: true, useUnifiedTopology : true})
.then(() => console.log('connected to mongodb'))
.catch((err)=> console.log(err));

//static files
app.use('/static', express.static('public'))

//Routes
app.use('/',require('./routes/index'));
app.use('/users',require('./routes/users'));
app.use('/race',require('./routes/race'));
app.use('/admin',require('./routes/admin'));
app.use('/api',require('./routes/api'));
 
app.listen(3000);  