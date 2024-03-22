const { Model } = require('objection');
const Joi = require('joi');
const Campaign = require('./campaign');
// const CMSUser = require('./cmsUser');

class Organisation extends Model {
  static get tableName() {
    return 'organisation';
  }

  static get joiSchema() {
    return Joi.object({
      id: Joi.number().integer().greater(0),
      name: Joi.string().min(1).max(255).required(),
      logo: Joi.string().min(1).max(255).required(),
      contact_name: Joi.string().min(1).max(255).required(),
      contact_email: Joi.string().email().required(),
      contact_number: Joi.string().length(10).pattern(/^\d+$/).required(),
      description: Joi.string().min(1).max(255).required(),
      created_at: Joi.date().iso().required(),
      updated_at: Joi.date().iso().required(),
    });
  }

  static get relationMappings() {
    return {
      campaigns: {
        relation: Model.HasManyRelation,
        modelClass: Campaign,
        join: {
          from: 'organisation.id',
          to: 'campaign.organisation_id'
        }
      },
      // cmsUsers: {
      //   relation: Model.HasManyRelation,
      //   modelClass: CMSUser,
      //   join: {
      //     from: 'organisation.id',
      //     to: 'cms_user.organisation_id'
      //   }
      // }
    };
  }
}

module.exports = Organisation;
