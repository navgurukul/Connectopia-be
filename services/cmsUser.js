// services/userService.js
const bcrypt = require('bcrypt');
const CMSUser = require('../models/cmsUserr');
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
      include: [
        {
          model: CampaignUser,
          include: {
            model: Campaign,
            where: { organisation },
          },
        },
      ],
    });

    const formattedUsers = users.map((user) => {
      const formattedUser = {
        name: user.name,
        emailid: user.emailid,
        usertype: user.usertype,
        campaigns: user.CampaignUsers.map((campaignUser) => ({
          campaignid: campaignUser.Campaign.campaignid,
          campaign_name: campaignUser.Campaign.campaign_name,
        })),
      };
      return formattedUser;
    });

    return formattedUsers;
  } catch (error) {
    throw new Error('Error fetching users by organisation: ' + error.message);
  }
},
  
async getUsersByOrganisationWithCampaign(organisation) {
  try {
    const users = await CMSUser.findAll({
      where: { organisation },
      include: [
        {
          model: CampaignUser,
          include: [
            {
              model: Campaign,
              attributes: ['campaignid', 'campaign_name'],
              where: { organisation }
            }
          ]
        }
      ]
    });

    const formattedUsers = users.map(user => {
      const { name, emailid, usertype } = user;
      const campaigns = user.CampaignUsers.map(campaignUser => {
        const { campaignid, Campaign: { campaign_name } } = campaignUser.Campaign;
        return { campaignid, campaign_name };
      });

      return { name, emailid, usertype, campaigns };
    });

    return formattedUsers;
  } catch (error) {
    throw new Error('Error fetching users by organisation: ' + error.message);
  }
}


};
