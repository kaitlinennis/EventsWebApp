const express = require('express');
const controller = require('../controllers/mainController');

const router = express.Router();

//GET /: send home page to the user
router.get('/', controller.index);

//GET /: send about page to the user
router.get('/about', controller.about);

//GET /: send contact page to the user
router.get('/contact', controller.contact);

module.exports = router;