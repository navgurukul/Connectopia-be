// services/userService.js
const bcrypt = require('bcrypt');
const User = require('../models/cmsUserr');
const CampaignUser = require('../models/CampaignUser');

module.exports = {
  async createUser(emailid, password, organisation, name, usertype) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
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
      const [rowsAffected] = await User.update(
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
      await User.destroy({ where: { emailid } });

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

      const [rowsAffected] = await User.update(updateFields, { where: { emailid: oldemailid } });

      if (rowsAffected === 0) {
        throw new Error('No user found with the provided email ID');
      }

      return 'Data updated successfully';
    } catch (error) {
      throw new Error('Error updating user details: ' + error.message);
    }
  }


};
