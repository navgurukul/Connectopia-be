const express = require('express');
const router = express.Router();
const customersController = require('../controllers/customer_data');

router.get('/getPlayersList/:campaign_id', customersController.getPlayersList);  ///getPlayersList/:campaignid
router.post('/addPlayerDetails', customersController.addPlayer);

module.exports = router;
