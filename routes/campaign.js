const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaign');

// Routes
router.get('/campaigndetails/:emailid/:usertype', campaignController.createOrganization);
router.get('/campaign/stages/:campaignid', campaignController.getCampaignById);
router.get('/organizationlist/:emailid/:usertype', campaignController.getorganizationsByEmailUser); // /organizationlist/:emailid/:usertype
router.get('/organization/:name', campaignController.getOrganizationByName);
router.delete('/deleteOrganizationData/:organization_name', campaignController.deleteOrganizationByIdOrName); // /deleteOrganizationData/:organization_name'

// handles both PUT and POST requests 
router.route('/editOrganization/:id') // /editOrganization
    .put(campaignController.updateOrganizationById)
    .post(campaignController.updateOrganizationById);


module.exports = router;
