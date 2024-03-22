const { Model } = require('objection');
const Joi = require('joi'); // Changed import statement

class Crud extends Model {
  static get tableName() {
    return 'crud';
  }

  static get joiSchema() {
    return Joi.object({
      id: Joi.number().integer().greater(0),
      name: Joi.string(),
      email: Joi.string().email().required(),
      mobile: Joi.string().required(),
    });
  }

  // Custom validate method to validate the model instance against Joi schema
  async validate() {
    try {
      await Crud.joiSchema.validateAsync(this.$toJson());
    } catch (error) {
      throw new Error(`Validation error: ${error.message}`);
    }
  }

  // Override $beforeInsert method to perform validation before insertion
  async $beforeInsert(queryContext) {
    await this.validate();
    return super.$beforeInsert(queryContext);
  }

  // Override $beforeUpdate method to perform validation before update
  async $beforeUpdate(opt, queryContext) {
    await this.validate();
    return super.$beforeUpdate(opt, queryContext);
  }
}

module.exports = Crud;
