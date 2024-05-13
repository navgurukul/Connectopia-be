exports.up = function (knex) {
    // all stages/levels data will be stored in this table
    return knex.schema.createTable('stage_config', function (table) {
        table.increments('id').primary();
        table.string('key');
        table.string('image').notNullable();
        table.integer('order').notNullable();
        table.enum('level', [1, 2, 3, 4, 5]).notNullable();
        table.enum('content_type', ['level']).defaultTo('level');
        table.integer('stage_id').unsigned().notNullable().references('id').inTable('stage');
        table.integer('campaign_id').unsigned().notNullable().references('id').inTable('campaign');
        table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
        table.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('stage_config');
};
