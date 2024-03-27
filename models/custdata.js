const { Model } = require('objection');
const Joi = require('joi');
const Campaign = require('./campaign');
const organization = require('./organization');

class CustData extends Model {
    static get tableName() {
        return 'custdata';
    }

    static get joiSchema() {
        return Joi.object({
            id: Joi.number().integer().greater(0),
            name: Joi.string().min(1).max(255).required(),
            email: Joi.string().email().required(),
            phone: Joi.string().min(1).max(255).required(),
            campaign_name: Joi.string().min(1).max(255).required(),
            campaign_id: Joi.number().integer().greater(0).required(),
            organization_id: Joi.number().integer().greater(0).required(),
            created_at: Joi.date().iso().required(),
            updated_at: Joi.date().iso().required(),
        });
    }

    static get relationMappings() {
        return {
            campaign: {
                relation: Model.BelongsToOneRelation,
                modelClass: Campaign,
                join: {
                    from: 'custdata.campaign_id',
                    to: 'campaign.id',
                },
            },
            organization: {
                relation: Model.BelongsToOneRelation,
                modelClass: organization,
                join: {
                    from: 'custdata.organization_id',
                    to: 'organization.id',
                },
            },
        };
    }
}

module.exports = CustData;
