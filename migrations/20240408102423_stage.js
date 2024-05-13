exports.up = function(knex) {
    // Create the stage_config table
    return knex.schema.createTable('stage', function(table) {
      table.increments('id').primary(); // Primary key
      table.integer('campaign_id').unsigned().notNullable().references('id').inTable('campaign'); // Foreign key referencing campaign table
      table.dateTime('created_at').notNullable().defaultTo(knex.fn.now()); // Example column
      table.dateTime('updated_at').notNullable().defaultTo(knex.fn.now()); // Example column
    });
  };
  
  exports.down = function(knex) {
    // Drop the stage_config table if it exists
    return knex.schema.dropTableIfExists('stage');
  };
  