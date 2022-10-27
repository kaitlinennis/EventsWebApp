//const Connection = require('../models/connection');
const {body} = require('express-validator');
const {validationResult} = require('express-validator');

//check if the route parameter is a valid objectId value (a 24-bit Hex string)
exports.validateId = (req, res, next)=>{
    let id = req.params.id;
    if(id.match(/^[0-9a-fA-F]{24}$/)) { //if route parameter is a valid ObjectId type value
        return next(); //move on to next middleware function
    } else { //if route parameter isn't a valid ObjectId type value
        let err = new Error('Invalid connection id');
        err.status = 400;
        return next(err);
    }
};

//checks if the sign up form fields are valid values and sanitizes the input
exports.validateSignUp = [body('firstName', 'First Name cannot be empty').notEmpty().trim().escape(),
body('lastName', 'Last Name cannot be empty').notEmpty().trim().escape(),
body('email', 'Email must be a valid email address').isEmail().trim().escape().normalizeEmail(),
body('password', 'Password must be at least 6 characters and at most 64 characters').isLength({min: 6, max: 64})];

//checks if the log in form fields are valid values and sanitizes the input
exports.validateLogIn = [body('email', 'Email must be a valid email address').isEmail().trim().escape().normalizeEmail(),
body('password', 'Password must be at least 6 characters and at most 64 characters').isLength({min: 6, max: 64})];

//used to extract validation errors
exports.validateResult = (req, res, next)=>{
    console.log('validateResult');
    let errors = validationResult(req);
    if(!errors.isEmpty()){
        errors.array().forEach(error=>{
            req.flash('error', error.msg);
        });
        console.log(errors);
        return res.redirect('back');
    } else {
        return next();
    }

};

//checks if the create new connection form fields are valid values and sanitizes the input
exports.validateConnection = [body('connectionName', 'Connection title cannot be empty').notEmpty().trim().escape(),
body('topic', 'Connection topic cannot be empty').notEmpty().trim().escape(),
body('details', 'Connection details must be at least 10 characters').isLength({min: 10}).trim().escape(),
body('location', 'Location cannot be empty').notEmpty().trim().escape(),
body('date', 'Date cannot be empty and must be a valid date').notEmpty().trim().escape(), //.isDate()
body('startTime', 'Start time cannot be empty and must be a valid time').notEmpty().trim().escape(), //isISO8601()
body('endTime', 'End time cannot be empty and must be a valid time').notEmpty().trim().escape(), //isISO8601(), isAfter(startTime)
body('image', 'Image url cannot be empty').notEmpty().trim()]; //.escape()

//Makes 'YES', 'NO', and 'MAYBE' the only possible values for rsvp.
//For server-side validation to prevent things like XSS
exports.validateRsvp = [body('rsvp').isIn(['YES', 'NO', 'MAYBE'])];