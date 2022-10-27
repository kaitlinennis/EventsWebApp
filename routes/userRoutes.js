const express = require('express');
const controller = require('../controllers/userController');
const {isGuest, isLoggedIn} = require('../middlewares/auth'); //imports methodsto authorize user
const {logInLimiter} = require('../middlewares/rateLimiters');
const {validateSignUp, validateLogIn, validateResult} = require('../middlewares/validator');

const router = express.Router();

//get the sign up form
router.get('/new', isGuest, controller.new);

//create a new user
router.post('/', isGuest, validateSignUp, validateResult, controller.create);

//get the login form
router.get('/login', isGuest, controller.getLogin);

//process login request
router.post('/login', logInLimiter, isGuest, validateLogIn, validateResult, controller.processLogin);

//get profile
router.get('/profile', isLoggedIn, controller.profile);

//logout the user
router.get('/logout', isLoggedIn, controller.logout);

module.exports = router;