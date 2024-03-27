exports.up = function (knex) {
    return knex.schema.createTable('campaign', function (table) {
        table.increments('id').primary();
        table.string('name').notNullable().unique();
        table.string('description').nullable();
        table.enum('scantype', ['qr', 'image']).notNullable();
        table.string('email').notNullable().unique();
        table.date('startdate').notNullable();
        table.date('enddate').notNullable();
        table.time('campaign_duration').nullable();
        table.enum('status', ['active', 'inactive']).notNullable();
        table.enum('scan_sequence', ['fixed', 'random']).notNullable();
        table.integer('total_stages').notNullable().defaultTo(1);
        table.integer('organization_id').unsigned().notNullable().references('id').inTable('organization');
        table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
        table.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('campaign');
};
