// routes/organisationRoutes.js
const express = require('express');
const router = express.Router();
const organisationService = require('../services/organisation');

router.post('/organisations', async (req, res) => {
    try {
      const organisationData = req.body;
      const organisation = await organisationService.createOrganisation(organisationData);
      res.status(201).json(organisation);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/organisations/:id', async (req, res) => {
    try {
      const organisationId = req.params.id;
  
      // Call the service function to get the organization with campaigns
      const organisationWithCampaigns = await organisationService.getOrganisationWithCampaignsById(organisationId);
  
      if (!organisationWithCampaigns) {
        return res.status(404).json({ error: 'Organisation not found' });
      }
  
      // Return the organization with its campaigns as a response
      res.json(organisationWithCampaigns);
    } catch (error) {
      console.error('Error in organisation route:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

// router.get('/organisation/:name', async (req, res) => {
//     const { name } = req.params;

//     try {
//         const organisationDetails = await organisationService.getOrganisationDetails(name);
//         res.status(200).json(organisationDetails);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

// router.post('/editOrganisation', async (req, res) => {
//     const { organisation, neworganisation, desc } = req.body;

//     try {
//         const message = await organisationService.editOrganisation(organisation, neworganisation, desc);
//         res.status(200).json({ message });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

// router.delete('/deleteOrganizationData/:organization_name', async (req, res) => {
//     const organizationName = req.params.organization_name;

//     if (!organizationName) {
//         return res.status(400).send('Organization name is required');
//     }

//     try {
//         const message = await organisationService.deleteOrganizationData(organizationName);
//         res.status(200).send(message);
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Internal server error');
//     }
// });

// router.get('/organisationlist/:emailid/:usertype', async (req, res) => {
//     const { emailid, usertype } = req.params;
//     try {
//         const organisations = await organisationService.getOrganisations(emailid, usertype);
//         res.status(200).json(organisations);
//     } catch (error) {
//         console.error('Error fetching organisations:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });


module.exports = router;
