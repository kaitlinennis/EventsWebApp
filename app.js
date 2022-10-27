//require modules
const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const mainRoutes = require('./routes/mainRoutes');
const connectionRoutes = require('./routes/connectionRoutes');
const userRoutes = require('./routes/userRoutes');

//create application
const app = express();

//configure application
let port = 3000;
let host = 'localhost';
app.set('view engine', 'ejs');

//connect to database
mongoose.connect('mongodb://localhost:27017/connection', 
                {useNewUrlParser: true, useUnifiedTopology: true}) //, useCreateIndex: true
.then(()=>{
    //start the web server
    app.listen(port, host, ()=>{
        console.log('Server is running on port', port);
    });
})
.catch(err=>console.log(err.message));

//mount middleware functions
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));


app.use(session({
    secret: 'jiajghghakjhskgjh', //string to sign/encrypt our cookie (should be kept in safe place)
    resave: false, //don't want to resave a session unless the session is updated
    //saveUnitialized: false: server won't store session in memory or send cookie to client if session hasn't 
    //changed/doesn't include any data. true: will always create the session no matter if 
    //there is data attached to the session or not. when requests without a cookie come in, create a new session
    saveUninitialized: false,
    store: new MongoStore({mongoUrl: 'mongodb://localhost:27017/demos'}), //collections name is 'sessions' by default
    cookie: {maxAge: 60*60*1000} //set up lifetime of the cookie (1 hour)
}));

app.use(flash());

app.use((req, res, next) => {
    //console.log(req.session);
    res.locals.user = req.session.user||null; //storing user in session in variable. if doesn't exist, variable will be initialized to null

    res.locals.name = req.session.name||'Guest'; //storing user's name for the user in session in a variable. if user isn't logged in, variable will be initialized to 'Guest'

    res.locals.errorMessages = req.flash('error'); //check if success message in the flash, if so then store in object
    res.locals.successMessages = req.flash('success'); //check if error message in the flash, if so then store in object
    next();
});


//set up routes
app.get('/', (req, res) => {
    res.render('index');
});


app.use('/', mainRoutes);
app.use('/connections', connectionRoutes);
app.use('/users', userRoutes); //handles all user-related requests


app.use((req, res, next) => {
    let err = new Error('The server cannot locate ' + req.url);
    err.status = 404;
    next(err);
});

app.use((err, req, res, next)=> {
    console.log(err.stack);
    if(!err.status) {
        err.status = 500;
        err.message = ("Internal server error");
    }

    res.status(err.status);
    res.render('./error', {error: err});
});