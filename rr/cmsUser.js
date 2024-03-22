// routes/userRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { sequelize } = require('sequelize'); // Assuming Sequelize is initialized in models/index.js
require('dotenv').config();
const CMSUser = require('../models/cmsUser'); // Sequelize models
const Organisation = require('../models/organisation');
const router = express.Router();
const cmsUserService = require('../services/cmsUser');

const JWT_SECRET = process.env.JWT_SECRET;

router.post('/createNewUser', async (req, res) => {
  const { emailid, password, organisation_id, name, usertype } = req.body;

  try {
    if (!emailid || !password || !organisation_id || !name || !usertype) {
      return res.status(400).json({ message: 'Incomplete details' });
    }

    await cmsUserService.createUser(emailid, password, organisation_id, name, usertype);
    res.status(200).json({ message: 'User created' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/editUserDetails', async (req, res) => {
  try {
    const updatedUser = await cmsUserService.editUserDetails(req.body);
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


router.post('/assignCampaignToUser', async (req, res) => {
  const { emailid, campaign_id } = req.body;
  try {
      if (!emailid || !campaign_id) {
          return res.status(400).send('Please provide complete details');
      }

      await cmsUserService.assignCampaignToUser(emailid, campaign_id);

      res.status(200).send('New campaign assigned to the user');
  } catch (error) {
      console.error('Error assigning campaign to user:', error);
      res.status(500).send('Server Error');
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
