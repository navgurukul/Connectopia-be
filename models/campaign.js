const { Model } = require('objection');
const Joi = require('joi');
const organization = require('./organization');
const CampaignConfig = require('./campaign_config');
const StageConfig = require('./stage_config');
const CampaignUser = require('./campaign_users');

class Campaign extends Model {
  static get tableName() {
    return 'campaign';
  }

  static get joiSchema() {
    return Joi.object({
      id: Joi.number().integer().greater(0),
      name: Joi.string().min(1).max(255).required(),
      email: Joi.string().email().required(),
      description: Joi.string().allow(null).max(255),
      scantype: Joi.string().min(1).max(255).required(),
      scan_sequence: Joi.string().min(1).max(255).required(),
      total_stages: Joi.number().integer().greater(0).required(),
      startdate: Joi.date().iso().required(),
      enddate: Joi.date().iso().required(),
      campaign_duration: Joi.date().iso().required(),
      status: Joi.string().min(1).max(255).required(),
      organization_id: Joi.number().integer().greater(0),
      created_at: Joi.date().iso().required(),
      updated_at: Joi.date().iso().required(),

    });
  }

  static get relationMappings() {
    return {
      organization: {
        relation: Model.BelongsToOneRelation,
        modelClass: organization,
        join: {
          from: 'campaign.organization_id',
          to: 'organization.id',
        },
      },
      campaignConfigs: {
        relation: Model.HasManyRelation,
        modelClass: CampaignConfig,
        join: {
          from: 'campaign.id',
          to: 'campaign_config.campaign_id',
        },
      },
      stageConfigs: {
        relation: Model.HasManyRelation,
        modelClass: StageConfig,
        join: {
          from: 'campaign.id',
          to: 'stage_config.campaign_id',
        },
      },
      campaignUsers: {
        relation: Model.HasManyRelation,
        modelClass: CampaignUser,
        join: {
          from: 'campaign.id',
          to: 'campaign_users.campaign_id',
        },
      },
    };
  }
}

module.exports = Campaign;
