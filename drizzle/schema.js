import { pgTable, serial, text, timestamp, integer, varchar, date, bigint, boolean } from 'drizzle-orm/pg-core';

// Medications table
export const medications = pgTable('medications', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  dosage: text('dosage').notNull(),
  frequency: text('frequency').notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Side effects table
export const sideEffects = pgTable('side_effects', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  medicationId: bigint('medication_id', { mode: 'number' }).notNull(), // Added mode option
  symptom: text('symptom').notNull(),
  severity: integer('severity').notNull(), // 1-10 scale
  timeOfDay: text('time_of_day').notNull(), // morning, afternoon, evening, night
  date: date('date').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Daily check-ins table
export const dailyCheckins = pgTable('daily_checkins', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  date: date('date').notNull(),
  overallFeeling: integer('overall_feeling').notNull(), // 1-10 scale
  sleepQuality: integer('sleep_quality').notNull(), // 1-10 scale
  energyLevel: integer('energy_level').notNull(), // 1-10 scale
  mood: text('mood').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Reports table - Using string mode for bigint to handle large IDs properly
export const reports = pgTable('reports', {
  id: bigint('id', { mode: 'string' }).primaryKey({ autoIncrement: true }), // Added autoIncrement: true
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  pdfUrl: text('pdf_url'),
});

// Subscriptions table
export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  status: text('status').notNull(),
  plan: text('plan').notNull(),
  currency: text('currency').notNull().default('GBP'),
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// User reports count table
export const userReportsCount = pgTable('user_reports_count', {
  userId: text('user_id').primaryKey(),
  count: integer('count').notNull().default(0),
  updatedAt: timestamp('updated_at').defaultNow(),
});