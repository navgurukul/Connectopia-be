// routes/organisationRoutes.js
const express = require('express');
const router = express.Router();
const organisationService = require('../services/organisation');
const cmsUserService = require('../services/cmsUser');

//create an oranisation
router.post('/organisations', async (req, res) => {
  try {
    const organisationData = req.body;
    if (!organisationData.name && !organisationData.logo) {
      return res.status(400).json({ message: 'Please provide both name and logo.' });
    }
    const organisation = await organisationService.createOrganisation(organisationData);
    res.status(200).json(organisation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//organisation list based on usertype
router.get('/organisationlist/:emailid/:usertype', async (req, res) => {
  const { emailid, usertype } = req.params;

  try {
    const organisations = await organisationService.getOrganisations(emailid, usertype);
    res.status(200).json(organisations);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: error.message });
  }
});

//list of users of organisation
router.get('/api/users_by_organisation/:organisation_id', async (req, res) => {
  const organisation_id = req.params.organisation_id;

  try {
      const users = await cmsUserService.getUsersByOrganisation(organisation_id);
      res.json(users);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// update organisation by id
router.put('/organisations/:id', async (req, res) => {
  try {
    const organisationId = req.params.id;
    const updatedData = req.body;

    // Call the service function to update the organization
    const updatedOrganisation = await organisationService.updateOrganisation(organisationId, updatedData);

    // If the organization was successfully updated, return it
    res.json(updatedOrganisation);
  } catch (error) {
    // If there's an error, return a 500 status with the error message
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
