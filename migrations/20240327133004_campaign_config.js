exports.up = function (knex) {
    return knex.schema.createTable('campaign_config', function (table) {
        table.increments('id').primary();
        table.string('image_key').notNullable();
        table.integer('order').notNullable(); // sequence of content to be shown in ui
        table.enum('content_type', ['general', 'level', 'main']).defaultTo('general');
        table.integer('campaign_id').unsigned().notNullable().references('id').inTable('campaign');
        table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
        table.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('campaign_config');
};
