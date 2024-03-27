const { Model } = require('objection');
const Joi = require('joi');

class organization extends Model {
  static get tableName() {
    return 'organization';
  }

  static get joiSchema() {
    return Joi.object({
      id: Joi.number().integer().greater(0),
      name: Joi.string().min(1).max(255).required(),
      logo: Joi.string().min(1).max(255).required(),
      description: Joi.string().min(1).max(255).required(),
      created_at: Joi.date().iso().required(),
      updated_at: Joi.date().iso().required(),
    });
  }

  static get relationMappings() {
    return {
      campaigns: {
        relation: Model.HasManyRelation,
        modelClass: __dirname + '/campaign',
        join: {
          from: 'organization.id',
          to: 'campaign.organization_id',
        },
      },
      cmsusers: {
        relation: Model.HasManyRelation,
        modelClass: __dirname + '/cmsusers',
        join: {
          from: 'organization.id',
          to: 'cmsusers.organization_id',
        },
      },
      custdata: {
        relation: Model.HasManyRelation,
        modelClass: __dirname + '/custdata',
        join: {
          from: 'organization.id',
          to: 'custdata.organization_id',
        },
      },
    };
  }
}

module.exports = organization;
