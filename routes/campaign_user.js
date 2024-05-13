const express = require('express');
const router = express.Router();
const campaignUserController = require('../controllers/campaign_user');

router.post('/campaign/assign/user', campaignUserController.assignCampaignToUser); // ✅
router.delete('/campaign/remove/user', campaignUserController.removeCampaignFromUser); // ✅


module.exports = router;
