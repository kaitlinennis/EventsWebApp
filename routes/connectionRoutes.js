const express = require('express');
const controller = require('../controllers/connectionController');
const {isLoggedIn, isAuthor, isNotAuthor} = require('../middlewares/auth'); //imports methods to authorize user
const {validateId, validateConnection, validateResult, validateRsvp} = require('../middlewares/validator'); //imports method to check input validation
const router = express.Router();

//GET /connections: send all connections to the user
router.get('/', controller.connections);

//GET /connections/newConnection: send html form for creating a new connection
router.get('/newConnection', isLoggedIn, controller.new);

//POST /connections: create a new connection
router.post('/', isLoggedIn, validateConnection, validateResult, controller.create); //validateConnection, validateResult, 

//GET /connections/:id: send details of connection identified by id
router.get('/:id', validateId, controller.show);

//GET /connections/:id/edit: send html form for editing an existing connection
router.get('/:id/edit', validateId, isLoggedIn, isAuthor, controller.edit); 

//PUT /connections/:id: update the connection identified by id
router.put('/:id', validateId, isLoggedIn, isAuthor, validateConnection, validateResult, controller.update);

//DELETE /connections/:id: delete the connection identified by id
router.delete('/:id', validateId, isLoggedIn, isAuthor, controller.delete);

//POST /:id/rsvp: create an rsvp and store it. makes sure id is valid & user is logged in
router.post('/:id/rsvp', validateId, isLoggedIn, isNotAuthor, validateRsvp, validateResult, controller.editRsvp);

//DELETE /:id/rsvp: delete the rsvp identified based on the given connection id
router.delete('/:id/rsvp', validateId, isLoggedIn, controller.deleteRsvp);

module.exports = router;
