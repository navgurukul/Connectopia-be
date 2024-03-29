const express = require('express');
const router = express.Router();
const { upload } = require('../middlewares/multer');
const stageController = require('../controllers/stage');


// S3 routes  // 4 api combined
router.post('stage/level/uploadgif', upload('gif').single('image'), stageController.uploadStageLevelGraphics);

module.exports = router;
