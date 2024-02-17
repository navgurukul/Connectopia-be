// services/organisationService.js
const Organisation = require('../models/organisation');
const Campaign = require('../models/Campaign');
const CampaignUser = require('../models/CampaignUser');
const User = require('../models/User');

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
                                include: [User],
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
    

};
