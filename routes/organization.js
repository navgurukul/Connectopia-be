const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organization');

// Routes
router.post('/organization/create', organizationController.createOrganization);
router.get('/organization/:email/:usertype', organizationController.getOrganizationsByEmailUser); // /organizationlist/:emailid/:usertype

// one can be removed after confirmation
// router.get('/organization/:name', organizationController.getOrganizationById);
router.get('/organization/:id', organizationController.getOrganizationById);

// one can be removed after confirmation
// router.delete('/organization/delete/:name', organizationController.deleteOrganizationByIdOrName); // /deleteOrganizationData/:organization_name'
router.delete('/organization/delete/:id', organizationController.deleteOrganizationById); // /deleteOrganizationData/:organization_name'


// handles both PUT and POST requests 
router.route('/organization/edit') // /editOrganization
    .put(organizationController.updateOrganizationByName)
    .post(organizationController.updateOrganizationByName);


module.exports = router;
