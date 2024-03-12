// services/campaignService.js
const AWS = require('aws-sdk');
require('dotenv').config();

const sequelize = require('../config/database');
const Campaign = require('../models/campaign');
const CampaignUser = require('../models/campaignUser');
const CampaignConfig = require('../models/campaignConfig')
const CmsUser = require('../models/cmsUser');
const image = require('./image');
const { Log } = require('@tensorflow/tfjs');

const bucketName = process.env.BUCKET_NAME;
const awsConfig = {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY,
    region: process.env.REGION_NAME,
};
const S3 = new AWS.S3(awsConfig);
module.exports = {

    async createCampaign(data) {
        console.log('data', data);
        try {
            const campaign = await Campaign.create(data);
            return campaign;
        } catch (error) {
            throw new Error(`Error creating campaign: ${error.message}`);
        }
    }

  
    // async createNewCampaign({ campaignid, organisation, campaignname, startdate, enddate, desc, scantype, usertype, emailid }) {
    //     try {
    //         await sequelize.transaction(async (transaction) => {
    //             const campaign = await Campaign.create({
    //                 campaignid,
    //                 organisation,
    //                 campaign_name: campaignname,
    //                 startdate,
    //                 enddate,
    //                 desc,
    //                 scantype,
    //             }, { transaction });

    //             if (usertype !== 'superadmin') {
    //                 await CampaignUser.create({ emailid, campaignid }, { transaction });
    //             }
    //         });

    //         return { success: true, message: 'Campaign created successfully' };
    //     } catch (error) {
    //         console.error('Error creating campaign:', error);
    //         throw new Error('Failed to create campaign');
    //     }
    // },

    // async assignCampaignToUser(emailid, campaign_name) {
    //     try {
    //         if (!emailid || !campaign_name) {
    //             throw new Error('Please provide complete details');
    //         }

    //         // Fetch the campaignid based on the campaign_name
    //         const campaign = await Campaign.findOne({ where: { campaign_name } });
    //         if (!campaign) {
    //             throw new Error('Campaign not found');
    //         }

    //         // Insert the data into the campaign_users table
    //         await CampaignUser.create({ emailid, campaignid: campaign.campaignid });

    //         return 'New campaign assigned to the user';
    //     } catch (error) {
    //         console.error('Error:', error);
    //         throw new Error('Failed to assign campaign to user');
    //     }
    // },

    // async removeCampaignFromUser(emailid, campaign_name) {
    //     try {
    //         if (!emailid || !campaign_name) {
    //             throw new Error('Please provide complete details');
    //         }

    //         // Fetch the campaignid based on the campaign_name
    //         const campaign = await Campaign.findOne({ where: { campaign_name } });
    //         if (!campaign) {
    //             throw new Error('Campaign not found');
    //         }

    //         // Check if the user is associated with the campaign
    //         const association = await CampaignUser.findOne({ where: { emailid, campaignid: campaign.campaignid } });
    //         if (!association) {
    //             throw new Error('User is not associated with the campaign');
    //         }

    //         // Remove the association between user and campaign
    //         await CampaignUser.destroy({ where: { emailid, campaignid: campaign.campaignid } });

    //         return 'Campaign removed from user';
    //     } catch (error) {
    //         console.error('Error:', error);
    //         throw new Error('Failed to remove campaign from user');
    //     }
    // },

    // async updateCampaignStatus(campaignName, statusValue) {
    //     try {
    //         const [updatedRowsCount, updatedRows] = await Campaign.update(
    //             { status: statusValue },
    //             { where: { campaign_name: campaignName } }
    //         );
    //         if (updatedRowsCount === 0) {
    //             throw new Error(`Campaign with name ${campaignName} not found.`);
    //         }
    //     } catch (error) {
    //         console.error('Error updating campaign status:', error);
    //         throw error;
    //     }
    // },

    // async deleteCampaign(campaignName) {
    //     try {
    //         if (!campaignName) {
    //             throw new Error('campaign_name is required');
    //         }

    //         // Find the campaign by name
    //         const campaign = await Campaign.findOne({ where: { campaign_name: campaignName } });
    //         if (!campaign) {
    //             throw new Error('Campaign not found');
    //         }

    //         // Start a transaction to ensure all deletions are successful
    //         await sequelize.transaction(async (transaction) => {
    //             // Delete campaign from CampaignConfig
    //             await CampaignConfig.destroy({ where: { campaignid: campaign.campaignid }, transaction });

    //             // Delete campaign from CampaignUsers
    //             await CampaignUser.destroy({ where: { campaignid: campaign.campaignid }, transaction });

    //             // Delete campaign from CampaignTable
    //             await Campaign.destroy({ where: { campaignid: campaign.campaignid }, transaction });

    //             // Now proceed with S3 deletion
    //             await image.deleteObjectsFromS3Folder(campaign.campaignid.toString());
    //         });

    //         return 'Campaign and associated entries deleted successfully';
    //     } catch (error) {
    //         console.error('Error:', error);
    //         throw new Error('Failed to delete campaign and associated entries');
    //     }
    // },

    // async editCampaign(campaignName, newCampaignData) {
    //     try {
    //         if (!campaignName) {
    //             throw new Error('Campaign name is required to update.');
    //         }

    //         // Find the campaign by name
    //         const campaign = await Campaign.findOne({ where: { campaign_name: campaignName } });
    //         if (!campaign) {
    //             throw new Error('Campaign not found');
    //         }

    //         // Update fields if provided
    //         if (newCampaignData) {
    //             await Campaign.update(newCampaignData, { where: { campaign_name: campaignName } });
    //         }

    //         return 'Campaign updated successfully';
    //     } catch (error) {
    //         console.error('Error:', error);
    //         throw new Error('Failed to update campaign');
    //     }
    // },

    // async getCampaignsByEmailId(emailId) {
    //     try {
    //         // First, fetch all campaignid values associated with the provided emailid
    //         const campaignUsers = await CampaignUser.findAll({
    //             attributes: ['campaignid'],
    //             where: { emailid: emailId },
    //         });
    //         const campaignIds = campaignUsers.map(campaignUser => campaignUser.campaignid);

    //         // For each campaignid, fetch campaign details and associated users
    //         const promises = campaignIds.map(async (campaignId) => {
    //             try {
    //                 // Find campaign details
    //                 const campaign = await Campaign.findOne({
    //                     attributes: ['campaign_name', 'campaignid', 'scantype', 'status', 'desc', 'startdate', 'enddate'],
    //                     where: { campaignid: campaignId },
    //                     attributes: ['campaign_name', 'campaignid', 'scantype', 'status', 'desc', 'startdate', 'enddate'],
    //                     raw: true
    //                 });

    //                 const campaignUsers = await CampaignUser.findAll({
    //                     attributes: ['emailid'],
    //                     where: { campaignid: campaignId },
    //                 });

    //                 // Extract email ids from campaign users
    //                 const emailIds = campaignUsers.map(cu => cu.emailid);

    //                 // Find users associated with the extracted email ids
    //                 const users = await CmsUser.findAll({
    //                     attributes: ['emailid', 'usertype', 'name'],
    //                     where: { emailid: emailIds },
    //                 });
    //                 const userList = users.map(user => user.toJSON());

    //                 // Add users to the campaign object
    //                 campaign.users = userList;
    //                 return campaign;
    //             } catch (error) {
    //                 console.error('Error fetching campaign and users:', error);
    //                 throw new Error('Failed to fetch campaign and users');
    //             }
    //         });
    //         const results = await Promise.all(promises);
    //         return results;
    //     } catch (error) {
    //         console.error('Error:', error);
    //         throw new Error('Failed to fetch campaigns by email id');
    //     }
    // },

    // async getNextCampaignId() {
    //     try {
    //         const maxCampaignId = await Campaign.max('campaignid');
    //         const nextCampaignId = maxCampaignId ? maxCampaignId + 1 : 1;
    //         return nextCampaignId
    //     } catch (error) {
    //         console.error('Error:', error);
    //         throw new Error('Failed to fetch next campaign id');
    //     }
    // },

    // async compileAndUpload(campaignId, pageNo, key, scantype, file, buffer) {
    //     try {
    //         const compositeKeyMind = `${key}.mind`;
    //         const compositeKeyImage = `${key}.${file.originalname.split('.').pop()}`;

    //         const [campaignConfig, created] = await CampaignConfig.findOrCreate({
    //             where: { campaignid: campaignId, pageno: pageNo, key: compositeKeyMind },
    //             defaults: { scantype: scantype }
    //         });

    //         if (!created) {
    //             // If entry already exists, update scantype
    //             await image.update({ scantype: scantype });
    //         }

    //         // Perform S3 uploads
    //         await Promise.all([
    //             S3.upload({
    //                 Bucket: bucketName,
    //                 Key: `${campaignId}/${pageNo}/${compositeKeyMind}`,
    //                 Body: buffer,
    //                 ContentType: 'application/octet-stream'
    //             }).promise(),
    //             S3.upload({
    //                 Bucket: bucketName,
    //                 Key: `${campaignId}/${pageNo}/${compositeKeyImage}`,
    //                 Body: file.buffer,
    //                 ContentType: file.mimetype
    //             }).promise()
    //         ]);

    //         return 'Both .mind and image files uploaded successfully';
    //     } catch (error) {
    //         console.error('Error:', error);
    //         throw new Error('Failed to compile and upload');
    //     }
    // },

    // async getCampaignDetails(emailid, usertype) {
    //     try {
    //         let campaigns = [];
    //         if (usertype === 'superadmin') {
    //             // Fetch all campaigns for superadmin
    //             campaigns = await Campaign.findAll({
    //                 attributes: ['campaignid', 'scantype', 'campaign_name', 'emailid']
    //             });
    //         } else if (usertype === 'admin' || usertype === 'user') {
    //             // Fetch organisation for admin or user
    //             const organisationResult = await CmsUser.findOne({
    //                 attributes: ['organisation'],
    //                 where: { emailid: emailid }
    //             });
    //             const organisation = organisationResult ? organisationResult.organisation : null;

    //             if (!organisation) {
    //                 throw new Error('Organisation not found for user');
    //             }

    //             // Fetch campaigns for the organisation
    //             campaigns = await Campaign.findAll({
    //                 attributes: ['campaignid', 'scantype', 'campaign_name', 'emailid'],
    //                 where: { organisation: organisation }
    //             });
    //         } else {
    //             throw new Error('Invalid usertype');
    //         }

    //         return campaigns;
    //     } catch (error) {
    //         console.error('Error:', error);
    //         throw new Error('Failed to fetch campaign details');
    //     }
    // },

    // async checkCampaignStatus(campaignid) {
    //     try {
    //         const result = await Campaign.findByPk(campaignid, {
    //             attributes: [
    //                 [sequelize.fn('DATE_FORMAT', sequelize.col('startdate'), '%Y-%m-%d'), 'formatted_startdate'],
    //                 [sequelize.fn('DATE_FORMAT', sequelize.col('enddate'), '%Y-%m-%d'), 'formatted_enddate'],
    //                 'status'
    //             ]
    //         });
    //         if (!result) {
    //             throw new Error('Campaign not found');
    //         }
    //         return [result.toJSON()];
    //     } catch (error) {
    //         console.error('Error checking campaign status:', error);
    //         throw error;
    //     }
    // },



};
