exports.up = function(knex) {
    return knex.schema.createTable('crud', function(table) {
      table.increments('id').primary();
      table.string('name');
      table.string('email').unique();
      table.string('mobile').unique();
      table.timestamps(true, true);
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTableIfExists('crud');
  };
  