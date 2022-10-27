const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const rsvpSchema = new Schema({
    id: {type:Schema.Types.ObjectId},
    rsvp: {type:String, required: [true, 'Status for RSVP is required']},
    user: {type:Schema.Types.ObjectId, ref:'User', required: [true, 'User for rsvp is required']}, //user that is rsvp-ing
    connection: {type:Schema.Types.ObjectId, ref:'Connection', required: [true, 'Connection for rsvp is required']} //connection that the user is rsvp-ing to
}, {timestamps:true});


module.exports = mongoose.model('Rsvp', rsvpSchema); //collection name will be 'rsvps' in database
