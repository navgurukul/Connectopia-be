const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organization');

// Routes
router.post('/organization', organizationController.createOrganization);
router.get('/organizationlist/:emailid/:usertype', organizationController.getorganizationsByEmailUser); // /organizationlist/:emailid/:usertype
router.get('/organization/:name', organizationController.getOrganizationByName);
router.delete('/deleteOrganizationData/:organization_name', organizationController.deleteOrganizationByIdOrName); // /deleteOrganizationData/:organization_name'

// handles both PUT and POST requests 
router.route('/editOrganization/:id') // /editOrganization
    .put(organizationController.updateOrganizationById)
    .post(organizationController.updateOrganizationById);


module.exports = router;
