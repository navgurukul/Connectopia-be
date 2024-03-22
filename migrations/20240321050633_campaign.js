exports.up = function (knex) {
    return knex.schema.createTable('campaign', function (table) {
        table.increments('id').primary();
        table.string('name').notNullable().unique();
        table.string('description').nullable();
        table.enum('scan_type', ['qr', 'image']).notNullable();
        table.string('email').notNullable().unique();
        table.date('start_date').notNullable();
        table.date('end_date').notNullable();
        table.time('campaign_duration').nullable();
        table.enum('status', ['active', 'inactive']).notNullable();
        table.enum('scan_sequence', ['fixed', 'random']).notNullable();
        table.integer('total_stages').notNullable().defaultTo(1);
        table.integer('organisation_id').unsigned().notNullable().references('id').inTable('organisation');
        table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
        table.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('campaign');
};
