const express = require('express');
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

router.post('/addPlayerDetails', async (req, res) => {
    const { name, phonenumber, emailid, campaignid } = req.body;

    try {
        if (!name || !phonenumber || !campaignid) {
            return res.status(400).json({ message: 'Incomplete details' });
        }

        const result = await custServices.addPlayerDetails(name, phonenumber, campaignid, emailid);
        res.status(200).send(result);
    } catch (error) {
        console.error('Error adding player details:', error);
        res.status(500).send('Failed to add player details.');
    }
});
module.exports = router;
