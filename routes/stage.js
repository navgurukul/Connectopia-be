const express = require('express');
const router = express.Router();
const { upload } = require('../middlewares/multer');
const stageController = require('../controllers/stage');


// upload campaign main QR
router.post('/campaign/upload-qr/:campaign_id/:key/:content_type', upload('image').single('image'), stageController.uploadQR);

// /uploadimage/:campaignid/:pageno/:key/:scantype
// This can handle both upload of image and gif
router.post('/campaign/upload-image/:campaign_id/:level/:order/:content_type', upload('image').single('image'), stageController.uploadImageToCampaign);
// /updateimage/:campaignid/:pageno/:key/:scantype
// and this can update image and gif
router.put('/campaign/update-image/:content_id/:content_type', upload('image').single('image'), stageController.updateImageToCampaign);

// /allsignedurls/:campaignid/:scantype
router.get('/campaign/get-signed-url/:campaign_id/:scantype', stageController.getSignedUrl);
// /withoutStatus/allsignedurls/:campaignid/:scantype
router.get('/campaign/get-signed-url/no-status/:campaign_id/:scantype', stageController.getSignedUrlWithoutStatus);

router.get('/campaign/stages/with-level/:campaign_id',stageController.getStagesByCampaignIdWithLevels);
// get stages by campaign id with its level

// /compile-upload/:campaignid/:pageno/:Key/:scantype
router.post('/campaign/upload-mind/:campaign_id/:order/:key/:content_type', upload('mind').single('image'), stageController.uploadMind);

// /delete-image/:campaignid/:pageno/:key
router.delete('/campaign/delete-image/:campaign_id/:level/:key', stageController.deleteImage);

module.exports = router;
