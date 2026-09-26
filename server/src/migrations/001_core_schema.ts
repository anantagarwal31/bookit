import type { MigrationBuilder } from 'node-pg-migrate';

/**
 * Creates the complete BookIt schema: users, events, bookings and activity_log.
 *
 * Run with:  npm run migrate
 * This single migration rebuilds the whole schema from an empty database.
 *
 * The migration is written in TypeScript and compiled to dist/migrations
 * before it runs, which is why `npm run migrate` builds first.
 */

export async function up(pgm: MigrationBuilder): Promise<void> {
  // pg_trgm powers the fast "search by title" query (see the GIN index below).
  pgm.sql('CREATE EXTENSION IF NOT EXISTS pg_trgm;');

  /* ------------------------------------------------------------------ users */
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

  /* ----------------------------------------------------------------- events */
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
    // Denormalised counter of CONFIRMED bookings. It is the single source of
    // truth for availability and is always updated inside the booking
    // transaction, so it can never disagree with the bookings table.
    seats_booked: { type: 'integer', notNull: true, default: 0, check: 'seats_booked >= 0' },
    price_cents: { type: 'integer', notNull: true, default: 0, check: 'price_cents >= 0' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // THE no-oversell backstop: even a buggy query can never push the counter
  // past capacity, because PostgreSQL itself rejects the row.
  pgm.addConstraint('events', 'events_seats_within_capacity', {
    check: 'seats_booked <= capacity',
  });

  // Listing/pagination is always "upcoming events ordered by date".
  pgm.createIndex('events', ['starts_at', 'id']);
  // Organizer dashboard: "my events".
  pgm.createIndex('events', 'organizer_id');
  // Trigram index makes `title ILIKE '%query%'` fast even with 100k+ rows.
  pgm.sql('CREATE INDEX events_title_trgm_idx ON events USING gin (title gin_trgm_ops);');

  /* --------------------------------------------------------------- bookings */
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

  // A user may hold at most ONE confirmed booking per event.
  // Partial index => a cancelled booking does not block re-booking later.
  pgm.sql(`
    CREATE UNIQUE INDEX bookings_one_confirmed_per_user_event
      ON bookings (event_id, user_id)
      WHERE status = 'confirmed';
  `);

  pgm.createIndex('bookings', ['user_id', 'created_at']); // "My bookings" page
  pgm.createIndex('bookings', ['event_id', 'status']); // attendee list

  /* ----------------------------------------------------------- activity_log */
  // Append-only analytics trail. Nothing is ever updated or deleted here.
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

  // Analytics groups by (event_id, type) -> this index answers it directly.
  pgm.createIndex('activity_log', ['event_id', 'type']);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('activity_log');
  pgm.dropTable('bookings');
  pgm.dropTable('events');
  pgm.dropTable('users');
}