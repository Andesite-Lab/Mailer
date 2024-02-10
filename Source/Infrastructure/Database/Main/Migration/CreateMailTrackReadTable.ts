import { Knex } from 'knex';

export class CreateMailTrackReadTable {
    public static async up(knex: Knex): Promise<void> {
        await knex.schema.createTable('mail_track_read', (table: Knex.CreateTableBuilder): void => {
            table.timestamp('readDate')
                .notNullable()
                .defaultTo(knex.fn.now())
                .comment('The date when the mail was read');
            table.uuid('mailUuid')
                .references('uuid')
                .inTable('mail')
                .onDelete('CASCADE')
                .comment('The uuid of the mail');

            table.uuid('uuid')
                .notNullable()
                .defaultTo(knex.raw('gen_random_uuid()'))
                .primary()
                .comment('The uuid of the credential');
        });
    }

    public static async down(knex: Knex): Promise<void> {
        await knex.schema.dropTableIfExists('mail_track_read');
    }
}
