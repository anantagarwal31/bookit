import bcrypt from 'bcryptjs';
import * as db from './pool';

const DEMO_PASSWORD = 'Password123';
const EVENT_COUNT = 50;

const CITIES = [
  'Bengaluru',
  'Mumbai',
  'Delhi',
  'Pune',
  'Hyderabad',
  'Chennai',
  'Jaipur',
];

const TOPICS = [
  'React Workshop',
  'Node.js Bootcamp',
  'Startup Pitch Night',
  'UI/UX Meetup',
  'Data Science Summit',
  'Cloud Conclave',
  'Indie Music Evening',
  'Photography Walk',
  'AI Hackathon',
  'Product Management 101',
  'DevOps Day',
  'Open Source Saturday',
];

const pick = <T>(list: readonly T[]): T =>
  list[Math.floor(Math.random() * list.length)] as T;

const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const daysFromNow = (days: number, hour = 18): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

async function seed(): Promise<void> {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const { rows: organizers } = await db.query<{ id: number }>(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ('BookIt Organizer', 'organizer@bookit.com', $1, 'organizer')
     ON CONFLICT (email) DO UPDATE
     SET role = 'organizer'
     RETURNING id`,
    [passwordHash]
  );

  const organizerId = organizers[0]?.id;

  if (!organizerId) {
    throw new Error('Could not create or find organizer');
  }

  const showcaseEvents: [
    string,
    string,
    string,
    string,
    number,
    number
  ][] = [
    [
      'React India Meetup',
      'A hands-on evening about React, hooks and performance patterns.',
      'Tech Park Auditorium, Bengaluru',
      daysFromNow(3),
      50,
      49900,
    ],
    [
      'Node.js Deep Dive',
      'Build a production-ready REST API with transactions and indexes.',
      'WeWork Galaxy, Bengaluru',
      daysFromNow(6),
      30,
      79900,
    ],
    [
      'Startup Pitch Night',
      'Ten founders, five minutes each, one panel of investors.',
      'T-Hub, Hyderabad',
      daysFromNow(9),
      120,
      0,
    ],
    [
      'Jazz Evening',
      'An intimate jazz session with a live quartet.',
      'Blue Door Cafe, Mumbai',
      daysFromNow(4),
      100,
      129900,
    ],
    [
      'UX Clinic',
      'Bring your product and get a live design critique.',
      'Design Studio, Pune',
      daysFromNow(8),
      75,
      59900,
    ],
    [
      'Weekend Photography Walk',
      'Explore the old city and learn street photography basics.',
      'City Palace Gate, Jaipur',
      daysFromNow(12),
      25,
      29900,
    ],
  ];

  for (const [
    title,
    description,
    venue,
    startsAt,
    capacity,
    priceCents,
  ] of showcaseEvents) {
    await db.query(
      `INSERT INTO events
        (organizer_id, title, description, venue, starts_at, capacity, price_cents)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        organizerId,
        title,
        description,
        venue,
        startsAt,
        capacity,
        priceCents,
      ]
    );
  }

  const values: string[] = [];
  const params: unknown[] = [];

  for (let i = 0; i < EVENT_COUNT; i += 1) {
    const base = params.length;

    params.push(
      organizerId,
      `${pick(TOPICS)} #${i + 1}`,
      'Sample event generated for testing search and pagination.',
      `${pick(CITIES)} Convention Centre`,
      daysFromNow(randomInt(1, 180), randomInt(9, 20)),
      randomInt(20, 500),
      randomInt(0, 20) * 9900
    );

    values.push(
      `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7})`
    );
  }

  await db.query(
    `INSERT INTO events
      (organizer_id, title, description, venue, starts_at, capacity, price_cents)
     VALUES ${values.join(', ')}`,
    params
  );

  console.log(`Seeded ${showcaseEvents.length + EVENT_COUNT} events.`);
  console.log('Organizer: organizer@bookit.com');
  console.log('Password: Password123');

  await db.pool.end();
}

seed().catch((error: unknown) => {
  console.error('Seed failed:', error);
  process.exit(1);
});