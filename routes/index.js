const express = require('express');
const router = express.Router();

const organization = require('./organization');
const campaign = require('./campaign');
const campaign_user = require('./campaign_user');
const cms_user = require('./cms_user');
const stage = require('./stage');
const sms = require('./sms');
const customer_data = require('./customer_data');

// Routes
router.use(organization)
router.use(campaign)
router.use(campaign_user)
router.use(cms_user)
router.use(stage)
router.use(sms)
router.use(customer_data)

module.exports = router;
