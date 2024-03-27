const { Model } = require('objection');
const Joi = require('joi');
const Campaign = require('./campaign');

class CampaignUser extends Model {
  static get tableName() {
    return 'campaign_users';
  }

  static get joiSchema() {
    return Joi.object({
      id: Joi.number().integer().greater(0),
      email: Joi.string().email().required(),
      campaign_id: Joi.number().integer().greater(0).required(),
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
          from: 'campaign_users.campaign_id',
          to: 'campaign.id',
        },
      },
    };
  }
}

module.exports = CampaignUser;
