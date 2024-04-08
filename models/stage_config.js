const { Model } = require('objection');
const Joi = require('joi');
const Campaign = require('./campaign');

class StageConfig extends Model {
  static get tableName() {
    return 'stage_config';
  }

  static get joiSchema() {
    return Joi.object({
      id: Joi.number().integer().greater(0),
      level: Joi.number().integer().min(0).max(5).required(),
      stage_id: Joi.number().integer().greater(0).required(),
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
          from: 'stage_config.campaign_id',
          to: 'campaign.id',
        },
      },
    };
  }
}

module.exports = StageConfig;
