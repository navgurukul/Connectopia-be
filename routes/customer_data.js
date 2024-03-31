const express = require('express');
const router = express.Router();
const customersController = require('../controllers/customer_data');

router.get('/customer/players/:campaign_id', customersController.getPlayersList);  // /getPlayersList/:campaignid  ✅
router.post('/customer/player/add', customersController.addPlayer); //  ✅

module.exports = router;
