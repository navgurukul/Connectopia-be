// routes/organisationRoutes.js
const express = require('express');
const router = express.Router();
const organisationService = require('../services/organisationService');

router.post('/organisation', async (req, res) => {
    const { organisation, desc } = req.body;

    try {
        const message = await organisationService.createOrganisation(organisation, desc);
        res.status(200).send(message);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/organisation/:name', async (req, res) => {
    const { name } = req.params;

    try {
        const organisationDetails = await organisationService.getOrganisationDetails(name);
        res.status(200).json(organisationDetails);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
