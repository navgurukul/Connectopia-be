const { Model } = require('objection');
const Joi = require('joi');
const organization = require('./organization');

class CMSUser extends Model {
  static get tableName() {
    return 'cmsusers';
  }

  static get joiSchema() {
    return Joi.object({
      id: Joi.number().integer().greater(0),
      name: Joi.string().min(1).max(255).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(1).max(255).required(),
      usertype: Joi.string().valid('superadmin', 'admin', 'user').required(),
      organization_id: Joi.number().integer().greater(0).required(),
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
          from: 'cmsusers.organization_id',
          to: 'organization.id',
        },
      },
    };
  }
}

module.exports = CMSUser;
