const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organization');


// Routes
router.post('/organization/create', organizationController.createOrganization);
router.get('/organization/list/:email/:usertype', organizationController.getOrganizationsByEmailUser); // /organizationlist/:emailid/:usertype

// one can be removed after confirmation
// router.get('/organization/:name', organizationController.getOrganizationById);
router.get('/organization/:id', organizationController.getCampaignAndUserByOrganizationId);

// one can be removed after confirmation
// router.delete('/organization/delete/:name', organizationController.deleteOrganizationByIdOrName); // /deleteOrganizationData/:organization_name'
router.delete('/organization/delete/:id', organizationController.deleteOrganizationById); // /deleteOrganizationData/:organization_name'

router.put('/organization/edit/:id', organizationController.updateOrganizationById) // /editOrganization

// /api/users_by_organization/:organization
router.get('/organization/user/:orgid', organizationController.getUsersByOrganization);

// /users_by_organization/:organization
router.get('/organization/associated-user/:orgid', organizationController.getAssociatedUserOfOrganization);

module.exports = router;
