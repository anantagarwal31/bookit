import type { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql('CREATE EXTENSION IF NOT EXISTS pg_trgm;');

  pgm.createTable('users', {
    id: 'id', // shorthand for: serial primary key
    name: { type: 'varchar(120)', notNull: true },
    email: { type: 'varchar(160)', notNull: true, unique: true },
    password_hash: { type: 'text', notNull: true },
    role: {
      type: 'varchar(20)',
      notNull: true,
      default: 'user',
      check: "role IN ('user', 'organizer')",
    },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createTable('events', {
    id: 'id',
    organizer_id: {
      type: 'integer',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
    title: { type: 'varchar(180)', notNull: true },
    description: { type: 'text', notNull: true, default: '' },
    venue: { type: 'varchar(180)', notNull: true },
    starts_at: { type: 'timestamptz', notNull: true },
    capacity: { type: 'integer', notNull: true, check: 'capacity > 0' },
    seats_booked: { type: 'integer', notNull: true, default: 0, check: 'seats_booked >= 0' },
    price_cents: { type: 'integer', notNull: true, default: 0, check: 'price_cents >= 0' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.addConstraint('events', 'events_seats_within_capacity', {
    check: 'seats_booked <= capacity',
  });

  pgm.createIndex('events', ['starts_at', 'id']);
  
  pgm.createIndex('events', 'organizer_id');
  
  pgm.sql('CREATE INDEX events_title_trgm_idx ON events USING gin (title gin_trgm_ops);');

  pgm.createTable('bookings', {
    id: 'id',
    event_id: { type: 'integer', notNull: true, references: 'events(id)', onDelete: 'CASCADE' },
    user_id: { type: 'integer', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    status: {
      type: 'varchar(20)',
      notNull: true,
      default: 'confirmed',
      check: "status IN ('confirmed', 'cancelled')",
    },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    cancelled_at: { type: 'timestamptz' },
  });

  pgm.sql(`
    CREATE UNIQUE INDEX bookings_one_confirmed_per_user_event
      ON bookings (event_id, user_id)
      WHERE status = 'confirmed';
  `);

  pgm.createIndex('bookings', ['user_id', 'created_at']);
  pgm.createIndex('bookings', ['event_id', 'status']);

  pgm.createTable('activity_log', {
    id: { type: 'bigserial', primaryKey: true },
    event_id: { type: 'integer', notNull: true, references: 'events(id)', onDelete: 'CASCADE' },
    user_id: { type: 'integer', references: 'users(id)', onDelete: 'SET NULL' },
    type: {
      type: 'varchar(30)',
      notNull: true,
      check:
        "type IN ('event_viewed', 'booking_started', 'booking_confirmed', 'booking_cancelled')",
    },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createIndex('activity_log', ['event_id', 'type']);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('activity_log');
  pgm.dropTable('bookings');
  pgm.dropTable('events');
  pgm.dropTable('users');
}