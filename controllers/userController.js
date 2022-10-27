const Connection = require('../models/connection');
const model = require('../models/user');
const rsvpModel = require('../models/rsvp');

//get the sign up form
exports.new = (req, res)=>{
    res.render('./user/new');
};

//create a new user
exports.create = (req, res, next)=>{ 
    let user = new model(req.body); //create a new user document
    if(user.email)
        user.email = user.email.toLowerCase();
    user.save() //save document to database
    .then(user=>{
        req.flash('success', 'Registration succeeded!');
        res.redirect('/users/login')
    }) 
    .catch(err=>{
        if(err.name === 'ValidationError' ) {
            req.flash('error', err.message);  
            return res.redirect('/users/new');
        }

        if(err.code === 11000) {
            req.flash('error', 'Email has been used');  
            return res.redirect('/users/new');
        }
        next(err);
    }); 
};

//get the login form
exports.getLogin = (req, res)=>{
    return res.render('./user/login');
};

//process login request
exports.processLogin = (req, res, next)=>{
    //authenticate user's login request
    let email = req.body.email;
    if(email) //if email isn't null
        email = email.toLowerCase();
    let password = req.body.password;
    //get the user that matches the email
    model.findOne({email: email})
    .then(user=>{
        if(user) {
            //user found in the database
            user.comparePassword(password)
            .then(result=>{
                if(result) { //if result is true (user is authenticated)
                    req.session.user = user._id; //store user's id in the session
                    req.session.name = user.firstName + ' ' + user.lastName; //store user's first and last name in the session
                    req.flash('success', 'You have successfully logged in');
                    res.redirect('/users/profile');
                } else { //password didn't match
                    //console.log('wrong password');
                    req.flash('error', 'Wrong password!');
                    res.redirect('/users/login'); 
                }
            })
        } else {
            //console.log('wrong email address'); //can't find user matching this email address
            req.flash('error', 'Wrong email address!')
            res.redirect('/users/login'); //redirect back to login page
        }
    })
    .catch(err=>next(err));
};

//get profile
exports.profile = (req, res, next)=>{
    let id = req.session.user; //id of current user in session
    Promise.all([model.findById(id) , Connection.find({hostName:id}), rsvpModel.find({user:id}).populate('connection')])
    .then(results=>{
        const [user, connections, rsvps] = results;
        //console.log(rsvps);
        res.render('./user/profile', {user, connections, rsvps});   
    })
    .catch(err=>next(err));
};

//logout the user
exports.logout = (req, res, next)=>{ //user requests to logout
    req.session.destroy(err=>{
        if(err)
            return next(err);
        else
            res.redirect('/');
    })
};