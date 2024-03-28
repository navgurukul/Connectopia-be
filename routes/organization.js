const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organization');

// Routes
router.post('/organization', organizationController.createOrganization);
router.get('/organizationlist/:emailid/:usertype', organizationController.getOrganizationsByEmailUser); // /organizationlist/:emailid/:usertype
router.get('/organization/:name', organizationController.getOrganizationByName);
router.delete('/deleteOrganizationData/:organization_name', organizationController.deleteOrganizationByIdOrName); // /deleteOrganizationData/:organization_name'

// handles both PUT and POST requests 
router.route('/editOrganization') // /editOrganization
    .put(organizationController.updateOrganizationByName)
    .post(organizationController.updateOrganizationByName);


module.exports = router;
