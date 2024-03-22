// app.js

const express = require('express');
const sendOTP = require('../services/otpService');
const verifyOTP = require('../services/otpService');

const router = express();

//Send OTP to user's mobile number
router.post('/sendotp/:mobilenumber', async (req, res) => {
    const { mobilenumber } = req.params;
    const templateId = 'your_template_id';
    const authKey = 'your_auth_key';

    try {
        const result = await sendOTP(mobilenumber, templateId, authKey);
        res.status(200).send(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send(error);
    }
});

//OTP verification for user's mobile number
router.get('/verifyOtp/:mobilenumber/:otp', async (req, res) => {
    const { mobilenumber, otp } = req.params;
    const authKey = 'your_auth_key';

    try {
        const result = await verifyOTP(mobilenumber, otp, authKey);
        res.status(200).send(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send(error);
    }
});


module.exports = router;
