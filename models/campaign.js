const { Model } = require('objection');
const Joi = require('joi');
const Organisation = require('./organisation');
// const Stage = require('./stage');

class Campaign extends Model {
  static get tableName() {
    return 'campaign';
  }

  static get joiSchema() {
    return Joi.object({
      id: Joi.number().integer().greater(0),
      name: Joi.string().min(1).max(255).required(),
      description: Joi.string().allow(null).max(255),
      scan_type: Joi.string().valid('qr', 'image').required(),
      email: Joi.string().email().required(),
      startdate: Joi.date().iso().required(),
      enddate: Joi.date().iso().required(),
      campaign_duration: Joi.string().allow(null),
      status: Joi.string().valid('active', 'inactive').required(),
      organisation_id: Joi.number().integer().greater(0).required(),
      created_at: Joi.date().iso().required(),
      updated_at: Joi.date().iso().required(),
    });
  }

  static get relationMappings() {
    return {
      organisation: {
        relation: Model.BelongsToOneRelation,
        modelClass: Organisation,
        join: {
          from: 'campaign.organisation_id',
          to: 'organisation.id'
        }
      },
      // stages: {
      //   relation: Model.HasManyRelation,
      //   modelClass: Stage,
      //   join: {
      //     from: 'campaign.id',
      //     to: 'stage.campaign_id'
      //   }
      // }
    };
  }
}

module.exports = Campaign;
