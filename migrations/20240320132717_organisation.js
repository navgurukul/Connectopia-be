exports.up = function (knex) {
    return knex.schema.createTable('organisation', function (table) {
        table.increments('id').primary();
        table.string('name').notNullable().unique();
        table.string('logo').notNullable();
        table.string('contact_name').notNullable();
        table.string('contact_email').notNullable();
        table.string('contact_number').notNullable().unique();
        table.string('description').notNullable();
        table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
        table.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('organisation');
};
