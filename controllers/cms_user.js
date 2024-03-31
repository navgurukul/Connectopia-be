// UserController.js
const bcrypt = require("bcrypt");
const moment = require("moment-timezone");
dotenv = require("dotenv").config();
const jwt = require("jsonwebtoken");
const Organization = require("../models/organization");
const Campaign = require("../models/campaign");
const CampaignConfig = require("../models/campaign_config");
const CustData = require("../models/customer_data");
const CampaignUsers = require("../models/campaign_users");
const CMSUsers = require("../models/cmsusers");
const organization = require("../models/organization");
const JWT_SECRET = process.env.JWT_SECRET;
const saltRounds = 10;

module.exports = {
  //create cms user
  createNewUser: async (req, res) => {
    /*
         #swagger.tags = ['CMS User']
         #swagger.summary = 'Create a cms user'
         #swagger.parameters['body'] = {
           in: 'body',
           description: 'Create a cms user',
           schema: {
             $email: 'example@gmail.com',
             $password: 'string',
             $organisation_id: 0,
             $name: 'string',
             $usertype: 'admin or user'
           }
          }
    */
    const { email, password, organisation_id, name, usertype } = req.body;

    try {
      if (email) {
        const userExists = await CMSUsers.query().findOne({ email });
        if (userExists) {
          return res.status(400).json({ message: "User already exists" });
        }
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
    /*
         #swagger.tags = ['CMS User']
         #swagger.summary = 'Delete a cms user by email'
         #swagger.parameters['body'] = {
           in: 'body',
           schema: {
             $email: 'example@gmail.com'
           }
          }
    */
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

  updateUserDetails: async (req, res) => {
    /*
         #swagger.tags = ['CMS User']
         #swagger.summary = 'Update a cms user details'
         #swagger.parameters['body'] = {
           in: 'body',
           schema: {
             $name: 'string',
             $password: 'string',
             $usertype: 'admin or user',
             $email: 'example@gmail.com',
             $newemail: 'newexample@gmail.com'
           }
          }
    */
    const { name, password, usertype, email, newemail } = req.body;

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
        .where("email", email);

      if (numUpdated === 0) {
        return res
          .status(404)
          .json({ message: "No user found with the provided email ID" });
      }

      if (newemail) {
        await CampaignUsers.query()
          .patch({ email: newemail })
          .where("email", email);
      }

      res.status(200).json({ message: "Data updated successfully" });
    } catch (error) {
      console.error("Error updating user details:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  //login
  newLogin: async (req, res) => {
    /*
         #swagger.tags = ['User Login']
         #swagger.summary = 'Login to CMS Dashboard'
         #swagger.parameters['body'] = {
           in: 'body',
           schema: {
             $email: 'example@gmail.com',
             $password: 'string'
           }
          }
    */
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password." });
    }

    try {
      // Fetch user data along with organisation description
      const user = await CMSUsers.query()
        .select("*")
        .where("email", email)
        .first();

      const organization = await Organization.query()
        .select("*")
        .where("id", user.organization_id)
        .first();

      if (!user) {
        return res.status(401).json({ message: "Invalid email or password." });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password." });
      }

      let responseData;

      // Fetch campaigns details if user is admin or user
      if (user.usertype === "admin" || user.usertype === "user") {
        const campaignResults = await CampaignUsers.query()
          .select("*")
          .where("campaign_users.email", email); // Filter by email

        const campaigns_detail = [];

        for (const campaignResult of campaignResults) {
          const campaign = await Campaign.query()
            .select("id", "name", "scantype")
            .where("id", campaignResult.campaign_id)
            .first();

          if (campaign) {
            campaigns_detail.push({
              campaign_id: campaign.id,
              campaign_name: campaign.name,
              scantype: campaign.scantype,
            });
          }
        }

        // Sign JWT token
        const token = jwt.sign({ email: email }, JWT_SECRET, {
          expiresIn: "1h",
        });

        // Response data
        responseData = {
          token,
          email: user.email,
          name: user.name,
          usertype: user.usertype,
          organization_name: organization.name,
          organization_description: organization.description,
          campaigns_detail,
        };
      } else if (user.usertype === "superadmin") {
        const token = jwt.sign({ email: email }, JWT_SECRET, {
          expiresIn: "1h",
        });

        responseData = {
          token,
          email: user.email,
          name: user.name,
          usertype: user.usertype,
          organization_name: null,
          organization_description: null,
        };
      } else {
        res.status(401).json({ message: "Invalid user role." });
      }
      res.status(200).json(responseData);
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
