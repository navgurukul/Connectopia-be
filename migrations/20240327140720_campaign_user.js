exports.up = function (knex) {
    return knex.schema.createTable('campaign_users', function (table) {
        table.increments('id').primary();
        table.string('email').notNullable().unique();
        table.integer('campaign_id').unsigned().notNullable().references('id').inTable('campaign');
        table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
        table.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('campaign_users');
};
