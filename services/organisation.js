// services/organisationService.js
const sequelize = require('sequelize')
const AWS = require('aws-sdk');
require('dotenv').config();
const Organisation = require('../models/organisation');
const Campaign = require('../models/Campaign');
const CampaignUser = require('../models/CampaignUser');
const CampaignConfig = require('../models/campaignConfig');
const CustData = require('../models/CustData');
const cmsUser = require('../models/CMSUser');
const getUserOrganisation = require('./cmsUser');


module.exports = {

    async createOrganisation(organisation, desc) {
        try {
            const existingOrganisation = await Organisation.findOne({ where: { organisation } });

            if (existingOrganisation) {
                throw new Error('Organisation already exists');
            }

            await Organisation.create({ organisation, desc });

            return 'Data inserted';
        } catch (error) {
            throw new Error('Error creating organisation: ' + error.message);
        }
    },

    async getOrganisationDetails(name) {
        try {
            const organisation = await Organisation.findOne({
                where: { organisation: name },
                include: [
                    {
                        model: Campaign,
                        include: [
                            {
                                model: CampaignUser,
                                include: [CMSUser],
                            },
                        ],
                    },
                ],
            });

            if (!organisation) {
                throw new Error('Organisation not found');
            }

            return organisation;
        } catch (error) {
            throw new Error('Error fetching organisation details: ' + error.message);
        }
    },

    async editOrganisation(organisationName, newOrganisationName, newDesc) {
        try {
            const organisation = await Organisation.findOne({ where: { organisation: organisationName } });

            if (!organisation) {
                throw new Error('Organisation not found');
            }

            const updateFields = {};
            if (newOrganisationName) {
                updateFields.organisation = newOrganisationName;
            }
            if (newDesc) {
                updateFields.desc = newDesc;
            }

            await Organisation.update(updateFields, { where: { organisation: organisationName } });

            return 'Organisation updated successfully';
        } catch (error) {
            throw new Error('Error updating organisation: ' + error.message);
        }
    },

    async deleteorganisationData(organisationName) {
        const transaction = await sequelize.transaction();

        try {
            // Delete organisation
            await Organisation.destroy({ where: { organisation: organisationName }, transaction });

            // Fetch campaign IDs
            const campaignIds = await Campaign.findAll({ where: { organisation: organisationName }, attributes: ['campaignid'], transaction });
            const campaignIdsArray = campaignIds.map(campaign => campaign.campaignid);

            // Delete campaigns and related data
            await Campaign.destroy({ where: { organisation: organisationName }, transaction });
            await CampaignConfig.destroy({ where: { campaignid: campaignIdsArray }, transaction });
            await CustData.destroy({ where: { campaignid: campaignIdsArray }, transaction });
            await CampaignUser.destroy({ where: { campaignid: campaignIdsArray }, transaction });

            // Delete users
            await cmsUser.destroy({ where: { organisation: organisationName }, transaction });

            // Commit the transaction
            await transaction.commit();

            // Delete files from S3
            const s3 = new AWS.S3();
            const bucketName = process.env.BUCKET_NAME; // Replace with your bucket name
            const deleteFromS3Promises = campaignIdsArray.map(campaignId => {
                const s3DeleteParams = {
                    Bucket: bucketName,
                    Prefix: campaignId + '/', // Assuming the campaignId is used as the folder name in S3
                };
                return s3.deleteObjects({ Bucket: bucketName, Delete: { Objects: [{ Key: s3DeleteParams.Prefix }] } }).promise();
            });

            await Promise.all(deleteFromS3Promises);

            return 'Data deletion completed successfully.';
        } catch (error) {
            // Rollback the transaction in case of any error
            await transaction.rollback();
            throw new Error('Error deleting organisation data: ' + error.message);
        }
    },

    async getOrganisations(emailid, usertype) {
        if (usertype === 'superadmin') {
            return await Organisation.findAll();
        } else if (usertype === 'admin' || usertype === 'user') {
            const userOrganisation = await getUserOrganisation.getUserOrganisation(emailid);
            return await Organisation.findAll({ where: { organisation: userOrganisation } });
        } else {
            throw new Error('Invalid user type');
        }
    },




};
