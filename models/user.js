const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const userSchema = new Schema({
    id: {type: Schema.Types.ObjectId},
    firstName: {type: String, required: [true, 'first name is required']},
    lastName: {type: String, required: [true, 'last name is required']},
    email: {type: String, required: [true, 'email address is required'], unique: [true, 'this email address has been used']},
    password: {type: String, required: [true, 'password is required']}
});

//replace plaintext password with hashed password before saving the document in the database
//pre middleware
userSchema.pre('save', function(next){ //next refers to next middleware (save)
    let user = this; //document calls 'save'
    if(!user.isModified('password')) //if user's password hasn't been modified
        return next();
    //hashing and salting password (salt is 10)
    bcrypt.hash(user.password, 10) //hash the user's password if password has been modified
    .then(hash=>{
        user.password = hash; //replaces password with hash
        next(); //moves on to save user in the database
    })
    .catch(err=>next(err));
});

//implement a method to compare the login password and the hash stored in the database
userSchema.methods.comparePassword = function(loginPassword) {
    let user = this;
    return bcrypt.compare(loginPassword, user.password); //return promise to the caller
};

module.exports = mongoose.model('User', userSchema); //collection name will be 'users' in database
