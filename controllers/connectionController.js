const model = require('../models/connection');
const rsvpModel = require('../models/rsvp');

exports.connections = (req, res, next) => {
    model.find() //find all connections
    .then(connections=>{ 
            let topics = model.getTopics(connections) //input connections as an argument to get topics
            res.render('./connection/connections', {topics: topics, connections: connections}) //send topics and connections for rendering
    })
    .catch(err=>next(err));
};

exports.new = (req, res) => {
    res.render('./connection/newConnection');
}; 

exports.create = (req, res, next) => {
    let connection = new model(req.body); //create a new connection document
    //stores hostName as the current user in session. Logged in user that creates the connection is the hostName
    connection.hostName = req.session.user;
    connection.save() //insert the document to the database
    .then(connection=>{
        req.flash('success', 'Connection has been successfully created');
        res.redirect('/connections');
    })
    .catch(err=>{
        if(err.name === 'ValidationError') {
            //err.status = 400; //invalid request
            req.flash('error', err.message);
            return res.redirect('back');
        }
        next(err); //go to error handler
    });
};

exports.show = (req, res, next) => {
    let id = req.params.id;
    let user = req.session.user;
    //RSVPs should only be counted if that RSVP status is "YES". This is to count the # of people attending a connection event
    Promise.all([model.findById(id).populate('hostName', 'firstName lastName'), rsvpModel.count({connection: id, rsvp: "YES"})])
    .then(results=>{
        const [connection, rsvps] = results;
        if(connection) {
            //console.log(connection);
            return res.render('./connection/connection', {connection, user, rsvps});
        } else {
            let err = new Error('Cannot find the connection with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>next(err)); //if query fails while trying to query our database
};

exports.edit = (req, res, next) => {
    let id = req.params.id;
    model.findById(id)
    .then(connection=>{
        if(connection) {
            res.render('./connection/edit', {connection});
        } else {
            let err = new Error('Cannot find the connection with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>next(err)); //if query fails while trying to query our database
};

exports.update = (req, res, next) => {
    let connection = req.body;
    let id = req.params.id;

    model.findByIdAndUpdate(id, connection, {useFindAndModify: false, runValidators: true})
    .then(connection=>{
        if(connection) {
            req.flash('success', 'Successfully updated connection');
            res.redirect('/connections/'+id);
        } else {
            let err = new Error('Cannot find a connection with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=> {
        if(err.name === 'ValidationError') {
            //err.status = 400; //invalid request
            req.flash('error', err.message);
            return res.redirect('back');
        }
        next(err);
    });
};

exports.delete = (req, res, next) => {
    let id = req.params.id;
    //When deleting a connection, delete all of its associated RSVPs as well. Any rsvp with that connection id.
    Promise.all([model.findByIdAndDelete(id, {useFindAndModify: false}), rsvpModel.deleteMany({ connection: id })])
    .then(connection =>{
        if(connection) {
            req.flash('success', 'Successfully deleted connection and associated RSVPs');
            res.redirect('/connections');
        } else {
            let err = new Error('Cannot find a connection with id ' + id);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err=> {
        if(err.name === 'ValidationError') {
            //err.status = 400; //invalid request
            req.flash('error', err.message);
            return res.redirect('back');
        }
        next(err);
    });
    //.catch(err=>next(err));
};

exports.editRsvp = (req, res, next)=>{
    //console.log(req.body.rsvp);
    let id = req.params.id; //store connection id in variable
    //Update an rsvp for a particular connection AND a particular user
    rsvpModel.findOne({connection:id, user:req.session.user}).then(rsvp=>{ //find rsvp with connection matching connection id
        if(rsvp) { //rsvp is already in database for a particular connection and user, so update 
            rsvpModel.findByIdAndUpdate(rsvp._id, {rsvp:req.body.rsvp}, {useFindAndModify: false, runValidators: true})
            .then(rsvp=>{
                req.flash('success', 'Successfully updated RSVP'); //notify user of successful operation
                res.redirect('/users/profile');
            })
            .catch(err=>{
                console.log(err);
                if(err.name === 'ValidationError') {
                    req.flash('error', err.message); //notify user of operation failure
                    return res.redirect('/back');
                }
                next(err);
            });

        } else { //rsvp is not in database yet for a particular connection and user, so create rsvp
            let rsvp = new rsvpModel({
                connection: id,
                rsvp: req.body.rsvp,
                user: req.session.user
            });
            rsvp.save() //save the newly created rsvp in the database
            .then(rsvp=>{ //if rsvp saves successfully
                req.flash('success', 'Successfully created RSVP');
                res.redirect('/users/profile'); //redirect user back to their profile
            })
            .catch(err=>{
                //console.log(err);
                req.flash('error', err.message);
                next(err)});
        }
    })
    .catch(err=>next(err));
};

exports.deleteRsvp = (req, res, next)=>{
    let id = req.params.id; //connection id
    //find RSVP associated with a specific connection/user and delete that RSVP.
    rsvpModel.findOneAndDelete({connection:id, user:req.session.user})
    .then(rsvp=>{
        req.flash('success', 'Successfully deleted RSVP');
        res.redirect('/users/profile');
    })
    .catch(err=>{
        req.flash('error', err.message);
        next(err);
    });

};