const express = require('express');
const router = express.Router();
const { upload } = require('../middlewares/multer');
const stageController = require('../controllers/stage');


// S3 routes  // 4 api combined
// 1. /uploadgif/:campaignid/:pageno/:Key/:scantype
// 2. /uploadimage/:campaignid/:pageno/:key/:scantype
router.post('/campaign/upload-gif/:campaign_id', upload('gif').single('image'), stageController.uploadGraphics);
// /updategif/:campaignid/:pageno/:Key/:scantype
router.put('/campaign/update-gif/:campaign_id', upload('gif').single('image'), stageController.updateGraphics);


// /uploadimage/:campaignid/:pageno/:key/:scantype
router.post('/campaign/upload-image/:campaign_id/:level/:key/:scantype/:order/:stage_number/:content_type', upload('image').single('image'), stageController.uploadImageToCampaign);  
// /updateimage/:campaignid/:pageno/:key/:scantype
router.put('/campaign/update-image/:id/:content_type', upload('image').single('image'), stageController.updateImageToCampaign);

// /allsignedurls/:campaignid/:scantype
router.get('/campaign/get-signed-url/:campaign_id/:scantype', stageController.getSignedUrl);
// /withoutStatus/allsignedurls/:campaignid/:scantype
router.get('/campaign/get-signed-url/no-status/:campaign_id/:scantype', stageController.getSignedUrlWithoutStatus);

// /compile-upload/:campaignid/:pageno/:Key/:scantype
router.post('/campaign/upload-mind/:campaign_id', upload('mind').single('image'), stageController.uploadMind);

// /delete-image/:campaignid/:pageno/:key
router.delete('/campaign/delete-image/:campaign_id/:level/:key', stageController.deleteImage);

module.exports = router;
