const { Model } = require('objection');
const Joi = require('joi');
const Campaign = require('./campaign');

class CampaignConfig extends Model {
  static get tableName() {
    return 'campaign_config';
  }

  static get joiSchema() {
    return Joi.object({
      id: Joi.number().integer().greater(0),
      content_type: Joi.string().valid('general', 'level', 'main').default('general'),
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
          from: 'campaign_config.campaign_id',
          to: 'campaign.id',
        },
      },
    };
  }
}

module.exports = CampaignConfig;
