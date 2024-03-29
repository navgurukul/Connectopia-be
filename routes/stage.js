const express = require('express');
const router = express.Router();
const { upload } = require('../middlewares/multer');
const stageController = require('../controllers/stage');


// S3 routes  // 4 api combined
// 1. /uploadgif/:campaignid/:pageno/:Key/:scantype
// 2. /uploadimage/:campaignid/:pageno/:key/:scantype
router.post('stage/level/uploadgif/:campaign_id', upload('gif').single('image'), stageController.uploadStageLevelGraphics);

// update for uper wala
router.put('stage/level/uploadgif/:campaign_id', upload('gif').single('image'), stageController.updateStageLevelGraphics);


module.exports = router;
