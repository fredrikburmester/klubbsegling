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

function exitHandler(options, exitCode) {
    if (options.cleanup) console.log('clean');
    if (exitCode || exitCode === 0) console.log(exitCode);
    if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

app.listen(3000); 