const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaign');

// Routes
router.get('/campaigndetails/:orgid/:emailid/:usertype', campaignController.getCampaignByEmailUser); // /campaigndetails/:emailid/:usertype
router.get('/campaign/stages/:campaignid', campaignController.getCampaignById);
router.put('/campaign/stages/:campaignid', campaignController.updateCampaignById);
router.get('/campaignsByEmailid/:emailid', campaignController.getCampaignByEmail); // /campaignsByEmailid/:emailid

router.get('/organization/:name', campaignController.getOrganizationByName);
router.delete('/deleteCampaign/:campaign_name', campaignController.deleteOrganizationByIdOrName); // /deleteOrganizationData/:organization_name'

// handles both PUT and POST requests 
router.route('/editOrganization/:id') // /editOrganization
    .put(campaignController.updateOrganizationById)
    .post(campaignController.updateOrganizationById);


module.exports = router;
