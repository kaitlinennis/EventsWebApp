const rateLimit = require('express-rate-limit');

//Keep track of requests from each client/IP address.
//If any IP address sends more than 5 requests in
//a 1 minute time window, an error will be sent back.
//Will send a 429 error with message.
exports.logInLimiter = rateLimit({
    windowMs: 60 * 1000, //1 minute time window
    max: 5, //max 5 requests
    message: 'Too many login requests. Try again later',
    handler: (req, res, next) =>{
        let err = new Error('Too many login requests. Try again later');
        err.status = 429;
        return next(err);
    }
});