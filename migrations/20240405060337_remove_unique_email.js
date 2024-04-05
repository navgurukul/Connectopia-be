exports.up = function (knex) {
    return knex.schema.alterTable('campaign', function (table) {
        table.string('email').notNullable().alter();
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('campaign', function (table) {
        table.string('email').notNullable().unique().alter();
    });
};
