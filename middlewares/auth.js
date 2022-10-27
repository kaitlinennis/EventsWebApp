const Connection = require('../models/connection');

//check if user is a guest
exports.isGuest = (req, res, next)=>{
    if(!req.session.user) { //if user not logged in (no user in session) aka user is a guest
        return next(); //move on to next middleware function
    } else {
        req.flash('error', 'You are logged in already');
        return res.redirect('/users/profile');
    }
};

//check if user is authenticated
exports.isLoggedIn = (req, res, next)=>{
    if(req.session.user) { //if user is logged in
        return next(); //move on to next middleware function
    } else {
        req.flash('error', 'You need to log in first');
        return res.redirect('/users/login');
    }
};

//check if a user is the host/author of a particular connection
exports.isAuthor = (req, res, next)=>{
    let id = req.params.id;
    Connection.findById(id) //find connection by id
    .then(connection=>{
        if(connection) { //if a connection with that id exists
            if(connection.hostName == req.session.user) { //if the author/host of the connection equals the current user
                console.log('isAuthor');
                return next(); //move on to next middleware function
            } else { //author/host of that connection isn't the currently logged in user
                let err = new Error('Unauthorized to access the resource');
                err.status = 401;
                return next(err);
            }
        } else {
            let err = new Error('Cannot find a connection with id ' + req.params.id);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err=>next(err));
}

//check if a user is NOT the host/author of a particular connection
exports.isNotAuthor = (req, res, next)=>{
    let id = req.params.id;
    Connection.findById(id)
    .then(connection=>{
        if(connection) { //if a connection with that id exists
            if(connection.hostName != req.session.user) { //if the author/host of the connection DOES NOT equal the current user
                console.log('isNotAuthor');
                return next(); //move on to next middleware function
            } else { //author/host of that connection IS the currently logged in user
                let err = new Error('Unauthorized to access the resource');
                err.status = 401;
                return next(err);
            }
        } else {
            let err = new Error('Cannot find a connection with id ' + req.params.id);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err=>next(err));
}