const express = require('express');
const router = express.Router();
const { upload } = require('../middlewares/multer');
const stageController = require('../controllers/stage');


// upload campaign main QR
router.post('/campaign/upload-qr/:campaign_id/:key/:content_type', upload('image').single('image'), stageController.uploadQR);

// /uploadimage/:campaignid/:pageno/:key/:scantype
// This can handle both upload of image and gif
router.post('/campaign/upload-image/:campaign_id/:order/:content_type', upload('image').single('image'), stageController.uploadImageToCampaign);
router.post('/campaign/upload-gif/:campaign_id/:order/:content_type', upload('gif').single('image'), stageController.uploadImageToCampaign);

// /updateimage/:campaignid/:pageno/:key/:scantype
// and this can update image and gif
router.put('/campaign/update-image/:content_id/:content_type', upload('image').single('image'), stageController.updateImageToCampaign);
router.put('/campaign/update-gif/:content_id/:content_type', upload('gif').single('image'), stageController.updateImageToCampaign);

// /allsignedurls/:campaignid/:scantype
router.get('/campaign/get-signed-url/:campaign_id/:scantype', stageController.getSignedUrls);

// /withoutStatus/allsignedurls/:campaignid/:scantype
router.get('/campaign/general-product/:campaign_id/:scantype', stageController.getGeneralAndProductContent);

router.get('/campaign/stages/with-level/:campaign_id',stageController.getStagesByCampaignIdWithLevels);
// get stages by campaign id with its level

// /compile-upload/:campaignid/:pageno/:Key/:scantype
router.post('/campaign/upload-mind/:campaign_id/:stage_id/:level/:key/:content_type', upload('mind').single('image'), stageController.uploadMind);

router.post('/campaign/upload-bulk/:campaign_id/:stage_id/:content_type', upload('mind').array('image', 5), stageController.bulkUpload);

// /delete-image/:campaignid/:pageno/:key
router.delete('/campaign/delete-image/:campaign_id/:level/:key', stageController.deleteImage);

// delete stage
router.delete('/campaign/delete-stage/:stage_id', stageController.deleteStage);


module.exports = router;
