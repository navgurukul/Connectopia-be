// routes/userRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { sequelize } = require('../models'); // Assuming Sequelize is initialized in models/index.js
const { CMSUser, Organisation } = require('../models'); // Sequelize models

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
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


// POST /auth/login
router.post('/login', async (req, res) => {
  const { emailid, password } = req.body;

  try {
    if (!emailid || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    const user = await CMSUser.findOne({
      where: { emailid },
      include: [{ model: Organisation, attributes: ['desc'] }]
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Passwords match; proceed based on the user type
    let additionalData = {};
    if (user.usertype === 'admin' || user.usertype === 'user') {
      const campaigns = await user.getCampaigns();
      additionalData = {
        campaigns_detail: campaigns.map(campaign => ({
          campaignid: campaign.campaignid,
          campaign_name: campaign.campaign_name,
          scantype: campaign.scantype
        }))
      };
    }

    const token = jwt.sign({ emailid: user.emailid }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      token,
      emailid: user.emailid,
      name: user.name,
      usertype: user.usertype,
      organisation: user.organisation,
      organisation_desc: user.organisation.desc,
      ...additionalData
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Failed to authenticate user.' });
  }
});

module.exports = router;


module.exports = router;
