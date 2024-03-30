// routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/cms_user');

router.post('/createNewUser', userController.createNewUser);  // ✅
router.delete('/deletecmsuser', userController.deleteCmsuser); // ✅
router.put('/updatepassword', userController.updatePassword);  // ✅
router.put('/editUserDetails', userController.editUserDetails); // ✅

//loggin
router.post('/newLogin', userController.newLogin);

module.exports = router;
