const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organization');

// Routes
router.post('/organization', organizationController.createOrganisation);
router.get('/organization', organizationController.getAllOrganisations);
router.get('/organization/:id', organizationController.getOrganisationById);
router.put('/organization/:id', organizationController.updateOrganisationById);
router.delete('/organization/:id', organizationController.deleteOrganisationById);

module.exports = router;
