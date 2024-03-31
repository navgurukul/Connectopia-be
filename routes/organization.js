const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organization');

const test = (req, res, next) => {
    console.log(req.body);
    next();
}

// Routes
router.post('/organization/create', test, organizationController.createOrganization);
router.get('/organization/:email/:usertype', organizationController.getOrganizationsByEmailUser); // /organizationlist/:emailid/:usertype

// one can be removed after confirmation
// router.get('/organization/:name', organizationController.getOrganizationById);
router.get('/organization/:id', organizationController.getOrganizationById);

// one can be removed after confirmation
// router.delete('/organization/delete/:name', organizationController.deleteOrganizationByIdOrName); // /deleteOrganizationData/:organization_name'
router.delete('/organization/delete/:id', organizationController.deleteOrganizationById); // /deleteOrganizationData/:organization_name'


// handles both PUT and POST requests 
router.route('/organization/edit/:id') // /editOrganization
    .put(organizationController.updateOrganizationByName)
    .post(organizationController.updateOrganizationByName);

// /users_by_organization/:organization
router.get('/organization/user/:orgid', organizationController.getUsersByOrganization);

// /api/users_by_organization/:organization
router.get('/organization/associated-user/:orgid', organizationController.getAssociatedUserOfOrganization);

module.exports = router;
