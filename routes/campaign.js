const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaign');

// Routes
router.post('/campaign/create', campaignController.createCampaign); // /api/createNewCampaign ✅
router.get('/campaign/:orgid/:email/:usertype', campaignController.getCampaignByEmailUser); // /campaigndetails/:emailid/:usertype ✅
router.get('/campaign/stages/:id', campaignController.getCampaignById); // ✅
router.get('/campaign/:email', campaignController.getCampaignByEmail); // /campaignsByEmailid/:emailid ✅
router.put('/campaign/:id', campaignController.updateCampaignById); // /editCampaign ✅

// one can be removed after confirmation
// router.delete('/campaign/:campaign_name', campaignController.deleteCampaignByName); // /deleteCampaign/:campaign_name
router.delete('/campaign/delete/:id', campaignController.deleteCampaignById); // /deleteCampaign/:campaign_name  ✅

// /setStatus
router.put('/campaign/set-status/:id/:status', campaignController.setStatus); // /setStatus/:id  ✅

// /nextCampaignId
router.get('/campaign-next', campaignController.genNextCampaignId); // /nextCampaignId  ✅

module.exports = router;
