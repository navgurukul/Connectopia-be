const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { sequelize } = require('sequelize'); // Assuming Sequelize is initialized in models/index.js
const CMSUser = require('../models/cmsUser'); // Sequelize models
const Organisation = require('../models/Organisation');
const router = express.Router();
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET; // Make sure to keep this secret

// user login api to authenticate user and get a token
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
