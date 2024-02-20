// routes/campaignRoutes.js
const express = require('express');
const moment = require('moment-timezone');

const router = express.Router();
const image = require('../services/image');
const campaignService = require('../services/campaign');
const CampaignUser = require('../models/campaignUser');
const CampaignConfig = require('../models/campaignConfig');

router.post('/api/createNewCampaign', async (req, res) => {
  const { campaignid, organisation, campaignname, startdate, enddate, desc, scantype, usertype, emailid } = req.body;

  if (!campaignid || !organisation || !campaignname || !startdate || !enddate || !desc || !usertype || !emailid) {
    return res.status(400).json({ message: 'Incomplete details' });
  }

  try {
    const result = await campaignService.createNewCampaign({
      campaignid,
      organisation,
      campaignname,
      startdate,
      enddate,
      desc,
      scantype,
      usertype,
      emailid
    });

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/nextCampaignId', async (req, res) => {
  try {
      const campaignId = await campaignService.getNextCampaignId();
      res.status(200).json({ CampaignId: campaignId });
  } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Server error');
  }
});

router.post('/setStatus', async (req, res) => {
  const { status_value, campaignname } = req.body;
  try {
      await campaignService.updateCampaignStatus(campaignname, status_value);
      res.status(200).send('Data updated successfully');
  } catch (error) {
      console.error('Error updating data: ', error);
      res.status(500).send('Error updating data');
  }
});

// router.post("/updateimage/:campaignid/:pageno/:key/:scantype", image.upload('image').single('image'), async (req, res) => {
//   const { campaignid, pageno, key, scantype } = req.params;

//   try {
//     if (!req.file) {
//       return res.status(400).send({ msg: "No file provided for upload." });
//     }

//     // Determine the file extension from mimetype
//     let fileExtension;
//     switch (req.file.mimetype) {
//       case "image/jpeg":
//         fileExtension = "jpeg";
//         break;
//       case "image/jpg":
//         fileExtension = "jpg";
//         break;
//       case "image/png":
//         fileExtension = "png";
//         break;
//       default:
//         return res.status(400).send('Unsupported image type.');
//     }

//     const compositeKey = `${key}.${fileExtension}`;

//     // Check if the key exists in the database (without considering the file extension)
//     const keyExists = await image.checkKeyInDB(campaignid, pageno, key);
//     if (keyExists) {
//       // If key exists, replace the image in S3 and update the database record with the new file extension
//       await image.uploadToS3(req.file.buffer, campaignid, pageno, compositeKey);
//       await image.updateExistingKeyInDB(campaignid, pageno, key, scantype, fileExtension);
//       res.status(200).send('Existing image replaced and database updated with new file extension.');
//     } else {
//       // If key does not exist, upload the image to S3 and insert a new entry into the database
//       await image.uploadToS3(req.file.buffer, campaignid, pageno, compositeKey);
//       await image.insertNewKeyInDB(campaignid, pageno, compositeKey, scantype);
//       res.status(200).send('Image uploaded and new key stored in database with file extension.');
//     }
//   } catch (error) {
//     console.error("Error while uploading:", error);
//     res.status(500).send({ msg: "Failed to upload the image. Please try again later." });
//   }
// });

router.get('/withoutStatus/allsignedurls/:campaignid/:scantype', async (req, res) => {
  try {
    const { campaignid, scantype } = req.params;

    let keysData;

    if (scantype === 'imagescan') {
      keysData = await image.fetchKeysFromDB2(campaignid);
    } else if (scantype === 'QRscan') {
      keysData = await image.fetchKeysFromDB1(campaignid, scantype);
    } else {
      return res.status(400).send('Invalid scantype provided.');
    }

    const signedURLs = await Promise.all(keysData.map(data => image.getPresignedUrl(campaignid, data.pageno, data.key)));
    const response = keysData.map((data, index) => ({ pageno: data.pageno, key: data.key, value: signedURLs[index] }));

    // Group by page number
    const groupedResponse = response.reduce((accumulator, current) => {
      (accumulator[current.pageno] = accumulator[current.pageno] || []).push({ key: current.key, value: current.value });
      return accumulator;
    }, {});

    res.status(200).send(groupedResponse);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Failed to generate the signed URLs.');
  }
});

router.post('/assignCampaignToUser', async (req, res) => {
  const { emailid, campaign_name } = req.body;

  try {
    const message = await campaignService.assignCampaignToUser(emailid, campaign_name);
    res.status(200).send(message);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.delete('/removeCampaignFromUser', async (req, res) => {
  const { emailid, campaign_name } = req.body;

  try {
    const message = await campaignService.removeCampaignFromUser(emailid, campaign_name);
    res.status(200).send(message);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.delete('/deleteCampaign/:campaign_name', async (req, res) => {
  const { campaign_name } = req.params;

  try {
    const message = await campaignService.deleteCampaign(campaign_name);
    res.status(200).json({ message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/editCampaign', async (req, res) => {
  try {
    const { campaign_name, newcampaign_name, startdate, enddate, desc } = req.body;

    const newCampaignData = {};
    if (newcampaign_name) {
      newCampaignData.campaign_name = newcampaign_name;
    }
    if (startdate) {
      newCampaignData.startdate = startdate;
    }
    if (enddate) {
      newCampaignData.enddate = enddate;
    }
    if (desc) {
      newCampaignData.desc = desc;
    }

    const message = await campaignService.editCampaign(campaign_name, newCampaignData);
    return res.status(200).json({ message });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Failed to update campaign' });
  }
});

router.get('/campaignsByEmailid/:emailid', async (req, res) => {
  try {
    const { emailid } = req.params;
    const campaigns = await campaignService.getCampaignsByEmailId(emailid);
    return res.status(200).json(campaigns);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Failed to fetch campaigns by email id' });
  }
});

// router.post('/compile-upload/:campaignid/:pageno/:Key/:scantype', image.upload('mind').single('image'), async (req, res) => {
//   const campaignId = req.params.campaignid;
//   const pageNo = req.params.pageno;
//   const key = req.params.Key;
//   const scantype = req.params.scantype;

//   try {
//     if (!req.file) {
//       return res.status(400).send('No file uploaded');
//     }

//     const result = await campaignService.compileAndUpload(campaignId, pageNo, key, scantype, req.file);
//     res.status(200).send(result);
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });

router.get('/campaigndetails/:emailid/:usertype', async (req, res) => {
  const { emailid, usertype } = req.params;
  console.log(emailid, usertype);

  try {
    const campaigns = await campaignService.getCampaignDetails(emailid, usertype);
    res.status(200).json(campaigns);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server error');
  }
});

// router.post("/updategif/:campaignid/:pageno/:Key/:scantype", image.upload('gif').single('image'), async (req, res) => {
//   const campaignid = req.params.campaignid;
//   const pageno = req.params.pageno;
//   const Key = req.params.Key;
//   const scantype = req.params.scantype;

//   try {
//     console.log(req.file);
//     if (!req.file) {
//       return res.status(400).send({
//         msg: "No file provided for upload.",
//       });
//     }

//     let fileExtension;
//     switch (req.file.mimetype) {
//       case "image/gif":
//         fileExtension = "gif";
//         break;
//       default:
//         return res.status(400).send('Unsupported file type.');
//     }

//     const compositeKey = `${Key}.${fileExtension}`; // Now it will just form as 'key.gif'
//     const keyExists = await image.checkKeyInDB(campaignid, pageno, compositeKey);

//     if (!keyExists) {
//       await image.loadGifToS3(req.file.buffer, campaignid, pageno, compositeKey, scantype);
//       res.status(200).send('GIF uploaded and key stored in database');
//     } else {
//       res.status(200).send({ message: 'New GIF uploaded' });
//     }
//   } catch (error) {
//     console.error("Error while uploading:", error);
//     res.status(500).send({
//       msg: "Failed to upload the GIF. Please try again later.",
//     });
//   }
// });

router.get('/allsignedurls/:campaignid/:scantype', async (req, res) => {
  try {
    const { campaignid, scantype } = req.params;
    const currentMoment = moment().tz('Asia/Kolkata');
    const currentDate = currentMoment.format('YYYY-MM-DD');

    // Query campaign details from the database
    const campaign = await campaignService.findByPk(campaignid);

    if (!campaign || campaign.status === 'inactive' || currentDate < campaign.startdate || currentDate > campaign.enddate) {
      return res.status(400).send('Cannot launch campaign');
    }

    let keysData;

    if (scantype === 'imagescan') {
      keysData = await image.fetchKeysFromDB2(campaignid);
    } else if (scantype === 'QRscan') {
      keysData = await image.fetchKeysFromDB1(campaignid, scantype);
    } else {
      return res.status(400).send('Invalid scantype provided.');
    }
    const groupedResponse = {}; // Grouped response object

    // Loop through keysData to generate signed URLs and group by page number
    keysData.forEach((data) => {
      // Generate signed URL for each key
      const signedURL = image.generateSignedURL(data.key);

      // Group by page number
      if (!groupedResponse[data.pageno]) {
        groupedResponse[data.pageno] = [];
      }
      groupedResponse[data.pageno].push({ key: data.key, value: signedURL });
    });

    res.status(200).send(groupedResponse);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Failed to generate the signed URLs.');
  }
});

// router.post("/uploadimage/:campaignid/:pageno/:key/:scantype", image.upload('image').single('image'), async (req, res) => {
//   const campaignid = req.params.campaignid;
//   const pageno = req.params.pageno;
//   const key = req.params.key;
//   const scantype = req.params.scantype;

//   try {
//     console.log(req.file);
//     if (!req.file) {
//       return res.status(400).send({
//         msg: "No file provided for upload.",
//       });
//     }

//     // Determine the file extension from mimetype
//     let fileExtension;
//     switch (req.file.mimetype) {
//       case "image/jpeg": fileExtension = "jpeg"; break;
//       case "image/jpg": fileExtension = "jpg"; break;
//       case "image/png": fileExtension = "png"; break;
//       case "image/svg+xml": fileExtension = "svg"; break;
//       default: return res.status(400).send('Unsupported image type.');
//     }

//     const compositeKey = `${key}.${fileExtension}`;

//     await image.uploadToS3(req.file.buffer, campaignid, pageno, compositeKey);

//     // Insert into database using Sequelize
//     await CampaignConfig.create({
//       campaignid: campaignid,
//       pageno: pageno,
//       key: compositeKey,
//       scantype: scantype
//     });

//     res.send('Image uploaded and key stored in database');
//   } catch (error) {
//     console.error("Error while uploading:", error);
//     res.status(500).send({
//       msg: "Failed to upload the image. Please try again later.",
//     });
//   }
// });

// router.post("/uploadgif/:campaignid/:pageno/:Key/:scantype", image.upload('gif').single('image'), async (req, res) => {
//   const campaignid = req.params.campaignid;
//   const pageno = req.params.pageno;
//   const Key = req.params.Key;
//   const scantype = req.params.scantype;

//   try {
//     console.log(req.file);
//     if (!req.file) {
//       return res.status(400).send({
//         msg: "No file provided for upload.",
//       });
//     }

//     let fileExtension;
//     switch (req.file.mimetype) {
//       case "image/gif": fileExtension = "gif"; break;
//       default: return res.status(400).send('Unsupported file type.');
//     }

//     const compositeKey = `${Key}.${fileExtension}`;   // Now it will just form as 'key.gif'

//     await image.uploadS3(req.file.buffer, campaignid, pageno, compositeKey);

//     // Insert into database using Sequelize
//     await CampaignConfig.create({
//       campaignid: campaignid,
//       pageno: pageno,
//       key: compositeKey,
//       scantype: scantype
//     });

//     res.send('gif uploaded and key stored in database');
//   } catch (error) {
//     console.error("Error while uploading:", error);
//     res.status(500).send({
//       msg: "Failed to upload the gif. Please try again later.",
//     });
//   }
// });

module.exports = router;
