const express = require('express');
const controller = require('../controllers/itemController');
const { isLoggedIn, isHost } = require('../middleware/auth');
const { validateId } = require('../middleware/validator'); 
const router = express.Router();

//GET /connections: send all connections to the user
router.get('/', controller.index);

//GET /connections/new: send html form for creating a new connection
router.get('/new', isLoggedIn, controller.new);

//POST /connections: create a new connection
router.get('/:id',validateId, controller.show);

//GET /connections/:id: send details of connection identified by id
router.post('/',isLoggedIn, controller.create);

//GET /connections/:id: send html form for editing an existing connection
router.get('/:id/edit',validateId,isLoggedIn,isHost, controller.edit);

//PUT /connections/:id: update the connection identified by id
router.put('/:id',validateId,isLoggedIn,isHost, controller.update);

//DELETE /connections/:id: delete the connection identified by id
router.delete('/:id',isLoggedIn,isHost, controller.delete);




module.exports = router;