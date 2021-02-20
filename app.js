const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const app = express();
const expressEjsLayout = require('express-ejs-layouts')
const flash = require('connect-flash');
const session = require('express-session');
const passport = require("passport");

const pug = require('pug');

//passport config:
require('./config/passport')(passport)

//mongoose
mongoose.connect('mongodb://192.168.0.118/klubbsegling_1',{useNewUrlParser: true, useUnifiedTopology : true})
.then(() => console.log('connected to mongodb'))
.catch((err)=> console.log(err));

//static files
app.use('/static', express.static('public'))

app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/'));

//EJS / Pug
app.set('view engine','ejs');
// app.set('views','./views');
app.use(expressEjsLayout);
app.disable('view cache')

//BodyParser
app.use(express.urlencoded({extended : false}));

//express session
app.use(session({
    secret : 'secret',
    resave : true,
    saveUninitialized : true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req,res,next)=> {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error  = req.flash('error');
    next();
})
    
//Routes
app.use('/',require('./routes/index'));
app.use('/users',require('./routes/users'));
app.use('/admin',require('./routes/admin'));
app.use('/json',require('./routes/object'));
 
app.listen(3000);  