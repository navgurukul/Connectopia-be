// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const cmsUserService = require('../services/cmsUserService');

router.post('/createNewUser', async (req, res) => {
  const { emailid, password, organisation, name, usertype } = req.body;

  try {
    if (!emailid || !password || !organisation || !name || !usertype) {
      return res.status(400).json({ message: 'Incomplete details' });
    }

    await cmsUserService.createUser(emailid, password, organisation, name, usertype);
    res.status(200).json({ message: 'User created' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/updatepassword', async (req, res) => {
  const { emailid, newpassword } = req.body;

  try {
    const message = await cmsUserService.updatePassword(emailid, newpassword);
    res.status(200).json({ message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/deletecmsuser', async (req, res) => {
  const { emailid } = req.body;

  try {
    if (!emailid) {
      return res.status(400).send('Please enter emailid');
    }

    await cmsUserService.deleteCmsUser({ where: { emailid } });
    res.status(200).send('CMS user account and related campaign entries deleted');
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).send('Server error');
  }
});

router.post('/editUserDetails', async (req, res) => {
  const { name, password, usertype, oldemailid, newemailid } = req.body;

  try {
    const message = await cmsUserService.editUserDetails(name, password, usertype, oldemailid, newemailid);
    res.status(200).json({ message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/users_by_organisation/:organisation', async (req, res) => {
  const { organisation } = req.params;

  try {
    const users = await cmsUserService.getUsersByOrganisation(organisation);
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/api/users_by_organisation/:organisation', async (req, res) => {
  const organisation = req.params.organisation;

  try {
    const users = await cmsUserService.getUsersByOrganisationWithCampaign(organisation);
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
