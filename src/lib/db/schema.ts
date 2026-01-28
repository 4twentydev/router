import {
  pgTable,
  serial,
  varchar,
  boolean,
  timestamp,
  integer,
  jsonb,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  pin: varchar('pin', { length: 4 }).notNull(),
  role: varchar('role', { length: 20 }).notNull().default('employee'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  taskType: varchar('task_type', { length: 50 }).notNull(),
  assignedTo: integer('assigned_to')
    .notNull()
    .references(() => users.id),
  createdBy: integer('created_by')
    .notNull()
    .references(() => users.id),
  taskData: jsonb('task_data').notNull(),
  isCompleted: boolean('is_completed').notNull().default(false),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

export type PalletBuilderData = {
  jobNumber: string;
  palletNumber: string;
  palletWidth: string;
  palletLength: string;
  material: string;
};
