// UserController.js
const bcrypt = require("bcrypt");
const moment = require("moment-timezone");

const Organization = require("../models/organization");
const Campaign = require("../models/campaign");
const CampaignConfig = require("../models/campaign_config");
const CustData = require("../models/customer_data");
const CampaignUsers = require("../models/campaign_users");
const CMSUsers = require("../models/cmsusers");

const saltRounds = 10;

module.exports = {
  //create cms user
  createNewUser: async (req, res) => {
    const { email, password, organisation_id, name, usertype } = req.body;

    try {
      if (usertype === "superadmin") {
        if (!email || !password || !name || !usertype) {
          return res.status(400).json({ message: "Incomplete details" });
        }
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = await CMSUsers.query().insert({
          email,
          password: hashedPassword,
          name,
          usertype,
        });
      }
      if (usertype === "admin" || usertype === "user") {
        if (!email || !password || !organisation_id || !name || !usertype) {
          return res.status(400).json({ message: "Incomplete details" });
        }
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = await CMSUsers.query().insert({
          email,
          password: hashedPassword,
          organisation_id,
          name,
          usertype,
        });
      }
      res.status(200).json({ message: "User created successfully" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Error creating user: " + error.message });
    }
  },

  deleteCmsuser: async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(404).send("Please enter email");
    }

    try {
      // Delete entries for the email from the campaign_users table
      await CampaignUsers.query().delete().where("email", email);

      // Now, delete the user from the cmsusers table
      await CMSUsers.query().delete().where("email", email);

      res
        .status(200)
        .send("Cmsuser account and related campaign entries deleted");
    } catch (error) {
      console.error(
        "Error deleting cmsuser and related campaign entries:",
        error
      );
      res.status(500).send("Server error");
    }
  },

  updatePassword: async (req, res) => {
    const { email, newpassword } = req.body;

    // Check if email and new password are provided
    if (!email || !newpassword) {
      return res.status(400).send("Email ID and new password are required");
    }

    try {
      // Hash the new password
      const hashedNewPassword = await bcrypt.hash(newpassword, saltRounds);

      // Update the password in the database
      const numUpdated = await CMSUsers.query()
        .update({ password: hashedNewPassword })
        .where("email", email);

      // Check if password is updated
      if (numUpdated === 0) {
        return res.status(400).send("No user found with the provided email ID");
      }

      res.status(200).send("Password updated");
    } catch (error) {
      console.error("Error updating password:", error);
      res.status(500).send("Internal server error");
    }
  },

  editUserDetails: async (req, res) => {
    const { name, password, usertype, oldemail, newemail } = req.body;

    let updateFields = {};

    if (name) {
      updateFields.name = name;
    }

    if (password) {
      try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        updateFields.password = hashedPassword;
      } catch (err) {
        console.error(err);
        return res
          .status(500)
          .json({ message: "Error hashing password: " + err });
      }
    }

    if (usertype) {
      updateFields.usertype = usertype;
    }

    if (newemail) {
      updateFields.email = newemail;
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: "No fields provided for update" });
    }

    try {
      const numUpdated = await CMSUsers.query()
        .patch(updateFields)
        .where("email", oldemail);

      if (numUpdated === 0) {
        return res
          .status(404)
          .json({ message: "No user found with the provided email ID" });
      }

      if (newemail) {
        await CampaignUsers.query()
          .patch({ email: newemail })
          .where("email", oldemail);
      }

      res.status(200).json({ message: "Data updated successfully" });
    } catch (error) {
      console.error("Error updating user details:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};
