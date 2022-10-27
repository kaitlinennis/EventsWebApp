const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const connectionSchema = new Schema({
    id: {type: Schema.Types.ObjectId},
    connectionName: {type: String, required: [true, 'connection name is required']},
    topic: {type: String, required: [true, 'topic is required']},
    details: {type: String, required: [true, 'details is required'],
              minLength: [10, 'the details should have at least 10 characters']},
    location: {type: String, required: [true, 'location is required']},
    date: {type: String, required: [true, 'date is required']},
    startTime: {type: String, required: [true, 'start time is required']},
    endTime: {type: String, required: [true, 'end time is required']},
    hostName: {type: Schema.Types.ObjectId, ref: 'User'}, //hostName field stores user's id. references User model
    image: {type: String, required: [true, 'image url is required']}
},
{timestamps: false}
);

//Gets all topics for connections
connectionSchema.statics.getTopics = function(connections) {
    const topics = [];
    connections.forEach((connection) => { //for each connection in connections
        if(!topics.includes(connection.topic)) { //if 'connection.topic' isn't in 'topics'
            topics.push(connection.topic);
        }
        //console.log(topics);
    });
    return topics;
};


//collection name is connections in the database
module.exports = mongoose.model('Connection', connectionSchema); //export Connection model to use in controller