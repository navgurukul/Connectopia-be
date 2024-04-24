exports.up = function (knex) {
  return knex.schema.alterTable('campaign_config', function (table) {
      table.string('button_img');
  });
};

exports.down = function (knex) {
  // Revert the changes made in the 'up' function
  return knex.schema.alterTable('campaign_config', function (table) {
    table.string('button_img');
  });
};
