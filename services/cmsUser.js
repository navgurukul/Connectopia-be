// services/userService.js
const bcrypt = require('bcrypt');
const CMSUser = require('../models/cmsUser');
const CampaignUser = require('../models/CampaignUser');
const Campaign = require('../models/Campaign');

module.exports = {
  async createUser(emailid, password, organisation, name, usertype) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await CMSUser.create({
        emailid,
        password: hashedPassword,
        organisation,
        name,
        usertype,
      });
      return user;
    } catch (error) {
      throw new Error('Error creating user: ' + error.message);
    }
  },

  async updatePassword(emailid, newPassword) {
    try {
      if (!emailid || !newPassword) {
        throw new Error('Email ID and new password are required');
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      const [rowsAffected] = await CMSUser.update(
        { password: hashedNewPassword },
        { where: { emailid } }
      );

      if (rowsAffected === 0) {
        throw new Error('No user found with the provided email ID');
      }

      return 'Password updated';
    } catch (error) {
      throw new Error('Error updating password: ' + error.message);
    }
  },

  async deleteCmsUser(emailid) {
    try {
      if (!emailid) {
        throw new Error('Please provide an emailid');
      }

      // Delete the user from the cmsusers table
      await CMSUser.destroy({ where: { emailid } });

      // Delete related campaign entries from the campaign_users table
      await CampaignUser.destroy({ where: { emailid } });

      return 'CMS user account and related campaign entries deleted';
    } catch (error) {
      throw new Error('Error deleting CMS user: ' + error.message);
    }
  },

  async editUserDetails(name, password, usertype, oldemailid, newemailid) {
    try {
      let updateFields = {};
      if (name) {
        updateFields.name = name;
      }
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updateFields.password = hashedPassword;
      }
      if (usertype) {
        updateFields.usertype = usertype;
      }
      if (newemailid) {
        updateFields.emailid = newemailid;
      }

      const [rowsAffected] = await CMSUser.update(updateFields, { where: { emailid: oldemailid } });

      if (rowsAffected === 0) {
        throw new Error('No user found with the provided email ID');
      }

      return 'Data updated successfully';
    } catch (error) {
      throw new Error('Error updating user details: ' + error.message);
    }
  },

  async getUsersByOrganisation(organisation) {
    try {
      const users = await CMSUser.findAll({
        attributes: ['name', 'emailid', 'usertype'], // Specify the correct attributes here
        where: { organisation: organisation }
      });

      const campaigns = await Campaign.findAll({
        attributes: ['campaignid', 'campaign_name'],
        where: { organisation: organisation },
      });

      const campaignUser = await CampaignUser.findAll({
        attributes: ['campaignid', 'emailid'],
        where: { campaignid: campaigns.map(campaign => campaign.campaignid) }
      });

      const userCampaignsMap = {};
      campaignUser.forEach((cu) => {
        if (!userCampaignsMap[cu.emailid]) {
          userCampaignsMap[cu.emailid] = [];
        }
        userCampaignsMap[cu.emailid].push(cu.campaignid);
      });

      const formattedUsers = users
        .filter(user => userCampaignsMap[user.emailid]) // Filter out users with no campaigns
        .map((user) => ({
          name: user.name,
          emailid: user.emailid,
          usertype: user.usertype,
          campaigns: campaigns
            .filter(campaign => userCampaignsMap[user.emailid].includes(campaign.campaignid))
            .map((campaign) => ({
              campaignid: campaign.campaignid,
              campaign_name: campaign.campaign_name,
            })),
        }));

      return formattedUsers;
    } catch (error) {
      throw new Error('Error fetching users by organisation: ' + error.message);
    }
  },


  async getUsersByOrganisationWithCampaign(organisation) {
    try {
      // Find users based on the provided organisation
      const users = await CMSUser.findAll({
        attributes: ['name', 'emailid', 'usertype'],
        where: { organisation: organisation }
      });

      // Find campaigns associated with the provided organisation
      const campaigns = await Campaign.findAll({
        attributes: ['campaignid', 'campaign_name'],
        where: { organisation: organisation }
      });

      // Find campaign users associated with the campaigns
      const campaignUsers = await CampaignUser.findAll({
        attributes: ['campaignid', 'emailid'],
        where: { campaignid: campaigns.map(campaign => campaign.campaignid) }
      });

      // Map campaigns to each user
      const formattedUsers = users.map(user => {
        const userCampaigns = campaignUsers
          .filter(cu => cu.emailid === user.emailid)
          .map(cu => {
            const campaign = campaigns.find(campaign => campaign.campaignid === cu.campaignid);
            return {
              campaignid: campaign.campaignid,
              campaign_name: campaign.campaign_name
            };
          });

        return {
          name: user.name,
          emailid: user.emailid,
          usertype: user.usertype,
          campaigns: userCampaigns
        };
      });

      return formattedUsers;
    } catch (error) {
      throw new Error('Error fetching users by organisation: ' + error.message);
    }
  },

  async getUserOrganisation(emailid) {
    const user = await CMSUser.findOne({
      attributes: ['organisation'],
      where: { emailid }
    });
    if (!user) {
      throw new Error('User not found');
    }
    return user.organisation;
  }


};
