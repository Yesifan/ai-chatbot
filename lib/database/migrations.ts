import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('user')
    .ifNotExists()
    .addColumn('id', 'uuid', col => col.primaryKey())
    .addColumn('accessToken', 'varchar(50)', col => col.notNull())
    .addColumn('lastLogin', 'timestamp')
    .execute()

  //TODO: 修改模型
  await db.schema
    .createTable('robot')
    .ifNotExists()
    .addColumn('id', 'uuid', col => col.primaryKey())
    .addColumn('access_token', 'varchar(50)', col => col.notNull())
    .addColumn('last_login', 'timestamp')
    .execute()

  await db.schema
    .createTable('chat')
    .ifNotExists()
    .addColumn('id', 'uuid', col => col.primaryKey())
    .addColumn('access_token', 'varchar(50)', col => col.notNull())
    .addColumn('last_login', 'timestamp')
    .execute()

  await db.schema
    .createTable('message')
    .ifNotExists()
    .addColumn('id', 'uuid', col => col.primaryKey())
    .addColumn('access_token', 'varchar(50)', col => col.notNull())
    .addColumn('last_login', 'timestamp')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('user').execute()
  await db.schema.dropTable('robot').execute()
  await db.schema.dropTable('chat').execute()
  await db.schema.dropTable('message').execute()
}
