exports.up = function (knex) {
  return knex.schema.alterTable('stage_config', function (table) {
      table.enum('content_type', ['level', 'product', 'product-qr']).defaultTo('level').alter();
  });
};

exports.down = function (knex) {
  // Revert the changes made in the 'up' function
  return knex.schema.alterTable('stage_config', function (table) {
      table.enum('content_type', ['level', 'general', 'product-qr']).defaultTo('level').alter();
  });
};
