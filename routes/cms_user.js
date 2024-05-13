// routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/cms_user');

router.post('/cms-user/create', userController.createNewUser);  // ✅
router.delete('/cms-user/delete', userController.deleteCmsuser); // ✅
router.put('/cms-user/update', userController.updateUserDetails); // ✅

//loggin
router.post('/cms-user/login', userController.newLogin);

module.exports = router;
