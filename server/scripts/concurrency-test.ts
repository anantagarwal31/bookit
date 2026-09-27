const API = process.env.API_URL || 'http://localhost:4000/api';

interface ApiResponse<T = Record<string, unknown>> {
  status: number;
  body: T;
}

type RequestFn = <T>(
  path: string,
  options?: RequestInit
) => Promise<ApiResponse<T>>;

function createClient(): RequestFn {
  let cookie = '';

  return async function request<T>(
    path: string,
    options: RequestInit = {}
  ) {
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(cookie ? { Cookie: cookie } : {}),
        ...options.headers,
      },
    });

    const setCookie = response.headers.get('set-cookie');

    if (setCookie) {
      cookie = setCookie.split(';')[0] ?? '';
    }

    const body = (await response.json().catch(() => ({}))) as T;

    return {
      status: response.status,
      body,
    };
  };
}

async function main(): Promise<void> {
  const stamp = Date.now();

  const organizer = createClient();

  const organizerSignup = await organizer('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      name: `Concurrency Organizer ${stamp}`,
      email: `concurrency-organizer-${stamp}@test.com`,
      password: 'Password123',
      role: 'organizer',
    }),
  });

  if (organizerSignup.status !== 201) {
    throw new Error(
      `Organizer signup failed: ${organizerSignup.status}`
    );
  }

  const eventResponse = await organizer('/organizer/events', {
    method: 'POST',
    body: JSON.stringify({
      title: `Concurrency Test Event ${stamp}`,
      description: 'Event used for the no-oversell concurrency test.',
      venue: 'Concurrency Test Venue',
      startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      capacity: 1,
      priceCents: 1000,
    }),
  });

  if (eventResponse.status !== 201) {
    throw new Error(
      `Event creation failed: ${eventResponse.status}`
    );
  }

  const eventId = (
    eventResponse.body as {
      event?: {
        id?: number;
      };
    }
  ).event?.id;

  if (!eventId) {
    throw new Error('Event ID was not returned');
  }

  const users = [
    {
      name: 'Concurrency User 1',
      email: `concurrency-user-1-${stamp}@test.com`,
    },
    {
      name: 'Concurrency User 2',
      email: `concurrency-user-2-${stamp}@test.com`,
    },
  ];

  const clients: RequestFn[] = [];

  for (const user of users) {
    const client = createClient();

    const signup = await client('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: user.name,
        email: user.email,
        password: 'Password123',
        role: 'user',
      }),
    });

    if (signup.status !== 201) {
      throw new Error(
        `Signup failed for ${user.email}: ${signup.status}`
      );
    }

    clients.push(client);
  }

  console.log(`Created capacity-1 event: ${eventId}`);
  console.log('Created two independent users.');
  console.log('Firing both booking requests at the same time...');

  const results = await Promise.all(
    clients.map((client) =>
      client(`/bookings/${eventId}`, {
        method: 'POST',
      })
    )
  );

  const confirmed = results.filter(
    (result) => result.status === 201
  ).length;

  const soldOut = results.filter(
    (result) =>
      result.status === 409 &&
      (result.body as { error?: { code?: string } }).error?.code ===
        'SOLD_OUT'
  ).length;

  console.log('\n--------------- RESULT ---------------');
  console.log(`confirmed (201): ${confirmed}`);
  console.log(`sold out (409):  ${soldOut}`);

  const passed = confirmed === 1 && soldOut === 1;

  console.log(
    passed
      ? '\nPASS - no oversell.\n'
      : '\nFAIL - concurrency guarantee failed.\n'
  );

  process.exit(passed ? 0 : 1);
}

main().catch((error: unknown) => {
  console.error(
    'Test could not run:',
    (error as Error).message
  );
  process.exit(1);
});