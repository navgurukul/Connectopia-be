exports.up = function (knex) {
    // all the general and product specific data will be stored in this table
    return knex.schema.createTable('campaign_config', function (table) {
        table.increments('id').primary();
        table.string('key');
        table.string('image').notNullable();
        table.integer('order').notNullable(); // sequence of content to be shown in ui
        table.enum('content_type', ['general', 'product']).defaultTo('general');
        table.integer('campaign_id').unsigned().notNullable().references('id').inTable('campaign');
        table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
        table.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('campaign_config');
};
