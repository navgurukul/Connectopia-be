const express = require('express');
const moment = require('moment-timezone');

const router = express.Router();
const custServices = require('../services/custServices');

router.get('/getPlayersList/:campaignid', async (req, res) => {
    const campaignid = req.params.campaignid;
    if (!campaignid) {
        return res.status(400).send('campaignid is required');
    }

    try {
        const players = await custServices.getCustData(campaignid);
        res.status(200).json(players);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ message: 'Error fetching data: ' + error });
    }
});
module.exports = router;
