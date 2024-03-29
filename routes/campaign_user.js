const express = require('express');
const router = express.Router();
const campaignUserController = require('../controllers/campaign_user');

router.post('/assignCampaignToUser', campaignUserController.assignCampaignToUser);
router.delete('/removeCampaignFromUser', campaignUserController.removeCampaignFromUser);


module.exports = router;
