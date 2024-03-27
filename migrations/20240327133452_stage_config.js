exports.up = function (knex) {
    return knex.schema.createTable('stage_config', function (table) {
        table.increments('id').primary();
        table.enum('status', ['active', 'inactive']).notNullable();
        table.enum('level', [0, 1, 2, 3, 4, 5]).notNullable(); // 0 = Product image/QR and 1 - 5 = Levels
        table.integer('stage_number').notNullable().defaultTo(1);
        table.integer('campaign_id').unsigned().notNullable().references('id').inTable('campaign');
        table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
        table.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('stage_config');
};
