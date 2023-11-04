import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('user')
    .ifNotExists()
    // TODO: type set nanoid
    .addColumn('id', 'char(21)', col => col.primaryKey())
    .addColumn('accessToken', 'varchar(50)', col => col.notNull())
    .addColumn('lastLogin', 'timestamp')
    .execute()

  await db.schema
    .createTable('robot')
    .ifNotExists()
    .addColumn('id', 'varchar(8)', col => col.primaryKey())
    .addColumn('userId', 'char(21)', col => col.notNull())
    .addColumn('name', 'varchar(120)', col => col.notNull())
    .addColumn('createdAt', 'timestamp')
    .addColumn('model', 'varchar(20)')
    .addColumn('pinPrompt', 'text')
    .addColumn('maxToken', 'integer')
    .addColumn('temperature', 'double precision')
    .addColumn('topP', 'double precision')
    .addColumn('presencePenalty', 'double precision')
    .addColumn('frequencyPenalty', 'double precision')
    .addColumn('input_template', 'varchar(120)')
    .addColumn('attachedMessagesCount', 'integer')
    .execute()

  // TODO: 添加隐式删除
  await db.schema
    .createTable('chat')
    .ifNotExists()
    .addColumn('id', 'varchar(8)', col => col.primaryKey())
    .addColumn('userId', 'char(21)', col => col.notNull())
    .addColumn('title', 'varchar(120)', col => col.notNull())
    .addColumn('createdAt', 'timestamp')
    .addColumn('model', 'varchar(20)')
    .addColumn('pinPrompt', 'text')
    .addColumn('maxToken', 'integer')
    .addColumn('temperature', 'double precision')
    .addColumn('topP', 'double precision')
    .addColumn('presencePenalty', 'double precision')
    .addColumn('frequencyPenalty', 'double precision')
    .addColumn('input_template', 'varchar(120)')
    .addColumn('attachedMessagesCount', 'integer')
    .execute()

  // TODO: add name to message
  // chatgpt api 包含了 name 和 fucntion_call 后续要加上
  await db.schema
    .createTable('message')
    .ifNotExists()
    .addColumn('id', 'varchar(8)', col => col.primaryKey())
    .addColumn('chatId', 'varchar(8)', col => col.notNull())
    .addColumn('content', 'text', col => col.notNull())
    .addColumn('role', 'varchar(10)', col => col.notNull())
    .addColumn('createdAt', 'timestamp')
    .addColumn('model', 'varchar(20)')
    .addColumn('isPin', 'boolean', col => col.defaultTo(false))
    .addColumn('isFavourite', 'boolean', col => col.defaultTo(false))
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('user').execute()
  await db.schema.dropTable('robot').execute()
  await db.schema.dropTable('chat').execute()
  await db.schema.dropTable('message').execute()
}
