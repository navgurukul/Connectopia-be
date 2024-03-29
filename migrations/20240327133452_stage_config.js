exports.up = function (knex) {
    return knex.schema.createTable('stage_config', function (table) {
        table.increments('id').primary();
        table.string('image_key').notNullable();
        table.enum('level', [1, 2, 3, 4, 5]).notNullable();
        table.integer('stage_number').notNullable().defaultTo(1);
        table.integer('campaign_id').unsigned().notNullable().references('id').inTable('campaign');
        table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
        table.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('stage_config');
};
