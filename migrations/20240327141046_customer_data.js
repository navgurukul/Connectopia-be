exports.up = function (knex) {
    // customer data aka players data table
    return knex.schema.createTable('custdata', function (table) {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('email').unique();
        table.string('phone').notNullable().unique();
        table.string('campaign_name').references('name').inTable('campaign');
        table.integer('campaign_id').unsigned().notNullable().references('id').inTable('campaign');
        table.integer('organization_id').unsigned().notNullable().references('id').inTable('organization');
        table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
        table.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('custdata');
};
