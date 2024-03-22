const Organisation = require('../models/organisation');

// Controller for creating a new organisation
async function createOrganisation(req, res) {
    try {
        const organisation = await Organisation.query().insert(req.body);
        res.status(201).json(organisation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Controller for fetching all organisations
async function getAllOrganisations(req, res) {
    try {
        const organisations = await Organisation.query();
        res.status(200).json(organisations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Controller for fetching an organisation by ID
async function getOrganisationById(req, res) {
    const { id } = req.params;
    try {
        const organisation = await Organisation.query().findById(id);
        if (!organisation) {
            return res.status(404).json({ error: 'Organisation not found' });
        }
        res.status(200).json(organisation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Controller for updating an organisation by ID
async function updateOrganisationById(req, res) {
    const { id } = req.params;
    try {
        const organisation = await Organisation.query().patchAndFetchById(id, req.body);
        if (!organisation) {
            return res.status(404).json({ error: 'Organisation not found' });
        }
        res.status(200).json(organisation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Controller for deleting an organisation by ID
async function deleteOrganisationById(req, res) {
    const { id } = req.params;
    try {
        const deletedCount = await Organisation.query().deleteById(id);
        if (deletedCount === 0) {
            return res.status(404).json({ error: 'Organisation not found' });
        }
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    createOrganisation,
    getAllOrganisations,
    getOrganisationById,
    updateOrganisationById,
    deleteOrganisationById
};
