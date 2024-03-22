const express = require('express');
const router = express.Router();
const crudController = require('../controllers/crud');

// Routes
router.post('/crud', crudController.createCrud);
router.get('/crud', crudController.getCrudList);
router.get('/crud/:id', crudController.getCrud);
router.put('/crud/:id', crudController.updateCrud);
router.delete('/crud/:id', crudController.deleteCrud);

module.exports = router;
