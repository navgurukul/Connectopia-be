const { Model } = require("objection");
const Joi = require("joi");
const Campaign = require("./campaign"); // Assuming Campaign model is defined in campaign.js
const StageConfig = require("./stage_config");

class Stage extends Model {
  static get tableName() {
    return "stage";
  }

  static get joiSchema() {
    return Joi.object({
      id: Joi.number().integer().greater(0),
      campaign_id: Joi.number().integer().greater(0).required(), // Foreign key referencing campaign table
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
          from: "stage.campaign_id",
          to: "campaign.id",
        },

        stageConfig: {
          relation: Model.BelongsToOneRelation,
          modelClass: StageConfig,
          join: {
            from: "stage.campaign_id",
            to: "stage_config.id",
          },
        },
      },
    };
  }
}

module.exports = Stage;
