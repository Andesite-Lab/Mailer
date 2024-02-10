import { Knex } from 'knex';

export class CreateMailTable {
    public static async up(knex: Knex): Promise<void> {
        await knex.schema.createTable('mail', (table: Knex.CreateTableBuilder): void => {
            table.string('to')
                .notNullable()
                .comment('The email address of the recipient');
            table.string('cc')
                .comment('The email address of the recipient in copy');
            table.string('mailType')
                .notNullable()
                .comment('The type of the email');
            table.string('language')
                .notNullable()
                .comment('The language of the email');
            table.json('interpolation')
                .comment('The interpolation of the email');
            table.timestamp('scheduledEmailDate')
                .notNullable()
                .comment('The date when the email will be sent');
            table.boolean('isSent')
                .notNullable()
                .defaultTo(false)
                .comment('The status of the email');
            table.uuid('uuid')
                .notNullable()
                .defaultTo(knex.raw('gen_random_uuid()'))
                .primary()
                .comment('The uuid of the credential');
        });
    }

    public static async down(knex: Knex): Promise<void> {
        await knex.schema.dropTableIfExists('mail');
    }
}

