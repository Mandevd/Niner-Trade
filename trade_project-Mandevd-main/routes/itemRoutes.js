const express = require('express');
const controller = require('../controllers/itemController');
const { isLoggedIn, isHost, isNotHost, isNotOffer, isOffer } = require('../middleware/auth');
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

router.post('/:id/watch', validateId, isLoggedIn, isNotHost, controller.watch);

router.put('/:id/unwatch', validateId, isLoggedIn, isNotHost, controller.unwatch);

router.get('/:id/trade', validateId, isLoggedIn, isNotHost, controller.trade);

router.put('/:id/offer', validateId, isLoggedIn, isNotHost, controller.offer);

router.get('/:id/manage', validateId, isLoggedIn, controller.manageOffer);

router.put('/:id/acceptOffer', validateId, isLoggedIn, isNotOffer, controller.acceptOffer);

router.delete('/:id/rejectOffer', validateId, isLoggedIn, isNotOffer, controller.rejectOffer);

router.delete('/:id/cancelOffer', validateId, isLoggedIn, isOffer, controller.cancelOffer);


module.exports = router;