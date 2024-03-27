exports.up = function (knex) {
    return knex.schema.createTable('cmsusers', function (table) {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('email').notNullable().unique();
        table.string('password').notNullable();
        table.enum('usertype', ['superadmin', 'admin', 'user']).notNullable();
        table.integer('organization_id').unsigned().notNullable().references('id').inTable('organization');
        table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
        table.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('cmsusers');
};
