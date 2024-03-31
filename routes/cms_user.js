// routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/cms_user');

router.post('/createNewUser', userController.createNewUser);  // ✅
router.delete('/deleteCmsUser', userController.deleteCmsuser); // ✅
router.put('/updateUserDetails', userController.updateUserDetails); // ✅

//loggin
router.post('/newLogin', userController.newLogin);

module.exports = router;
