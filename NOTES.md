# NOTES

Design decisions behind BookIt (TypeScript + Tailwind build).

---

## 1. The no-oversell guarantee

**The problem.** The naive booking flow is:

```text
read seats_booked  ->  if (seats_booked < capacity)  ->  insert booking

Two requests can both run the read before either runs the insert. Both can see
a free seat and both can attempt to book it. This is a classic race condition,
and it cannot be fixed in JavaScript — async/await does not stop two requests
or two Node processes from interleaving.

The fix — three layers. All of it lives in
server/src/services/booking.service.ts.

Layer 1 — one transaction. Creating the booking row and incrementing the seat
counter happen inside a single BEGIN … COMMIT. Either both happen or neither
does, so a failure halfway through cannot leave a booking without the seat
counter being updated.

Layer 2 — a row lock (SELECT … FOR UPDATE). This is the important one:

SELECT id, title, capacity, seats_booked, starts_at
FROM events
WHERE id = $1
FOR UPDATE;

FOR UPDATE takes a lock on that event row. A second transaction that wants the
same event waits until the first one commits, and only then reads
seats_booked.

The read-decide-write sequence can no longer interleave; concurrent bookings for
one event effectively become a queue. Bookings for different events are
unaffected because the lock is per row, not on the whole table.

Layer 3 — the database itself.

CHECK (seats_booked <= capacity) on events prevents the database from
accepting an invalid seat count.
A partial unique index on confirmed bookings prevents one user from holding
two confirmed bookings for the same event.
The seat increment is also written defensively as:
UPDATE events
SET seats_booked = seats_booked + 1,
    updated_at = now()
WHERE id = $1
  AND seats_booked < capacity
RETURNING seats_booked, capacity,
          (capacity - seats_booked) AS seats_remaining;

If it matches no row, the transaction is rolled back and the request receives a
clean 409 SOLD_OUT.

Why FOR UPDATE and not something else?

Alternative	Why not
Check in JavaScript before inserting	Does not solve the race condition.
An in-memory lock / mutex in Node	Only protects one process and does not provide a database-level guarantee.
SERIALIZABLE isolation	Correct, but introduces serialization failures that the application would need to detect and retry.
Redis distributed lock	Adds another service and failure mode when PostgreSQL can provide the required lock directly.
Count rows in bookings instead of a counter	Correct but less efficient for repeated availability reads. The counter gives O(1) reads and is updated in the same transaction.

Deadlocks. Cancellation also touches both the event and booking. The
implementation locks the event row first and the booking row second so the
lock order remains consistent.

TypeScript does not help here — and saying so matters. Types are checked at
compile time and erased before the code runs. A race condition is a runtime
timing problem, so the guarantee itself comes from PostgreSQL.

TypeScript still provides typed service arguments and typed database query
results.

Verified, not assumed. The project includes a standalone concurrency test:

cd server
npx tsx scripts/concurrency-test.ts

The test creates a fresh capacity-1 event, creates two independent users and
fires both booking requests at the same time.

The successful test produced:

confirmed (201): 1
sold out (409):  1

PASS - no oversell.
2. Schema

Four tables are created by the migration:

server/src/migrations/001_core_schema.ts

Table	Purpose	Notable columns
users	accounts	email, password_hash, role
events	owned by an organizer	capacity, seats_booked, price_cents
bookings	links a user to an event	status, event_id, user_id
activity_log	append-only analytics trail	type, event_id, user_id

Decisions worth explaining:

seats_booked is a counter column, not a COUNT(*). The counter gives
constant-time availability reads and is updated in the same transaction as
the booking.
Bookings are cancelled, never deleted. status = 'cancelled' preserves
booking history while allowing the seat to be booked again.
activity_log is append-only. It records event_viewed,
booking_started, booking_confirmed and booking_cancelled. The
booking_started event is written before the booking transaction so failed
attempts can still appear in the analytics funnel.
Money is stored as an integer. Event prices are stored in paise rather
than floating-point values to avoid monetary rounding problems.
One role column instead of separate user and organizer tables. An
organizer is still a user with additional permissions.
3. Indexing and query performance

Indexes are created in the migration.

Index	Serves
events (starts_at, id)	upcoming event ordering, date filtering and pagination
events USING gin (title gin_trgm_ops)	title search
events (organizer_id)	organizer dashboard
bookings (user_id, created_at)	My bookings
bookings (event_id, status)	booking and attendee lookups
Partial unique confirmed booking index	prevents duplicate confirmed bookings
activity_log (event_id, type)	analytics

Why a trigram index. Event search uses ILIKE contains matching such as:

title ILIKE '%react%'

A normal B-tree index cannot efficiently support a pattern beginning with %.
The PostgreSQL pg_trgm extension allows a trigram index to support this type
of search.

Filtering, ordering and pagination are performed inside PostgreSQL rather than
loading the entire event catalogue into Node.js.

The API uses page-based pagination because the endpoint exposes a page
parameter. Very deep offsets can become less efficient as the dataset grows;
keyset pagination would be an alternative for a much larger catalogue.

4. TypeScript decisions
strict: true is enabled on the backend, together with
noUncheckedIndexedAccess, noImplicitOverride and
forceConsistentCasingInFileNames.
noUncheckedIndexedAccess means database expressions such as rows[0]
must account for the possibility that no row exists.
db.query<T>() is generic, so query results have an explicit TypeScript
shape rather than becoming any[].
req.user is declared in types/express.d.ts. This extends Express's
Request type so authentication middleware can attach the authenticated user
safely.
Client and server types are maintained separately. A shared package would
reduce duplication but would add a monorepo/shared-package build step that
is unnecessary for a project of this size.
The migration is TypeScript too. It is compiled as part of the backend
build and then executed by node-pg-migrate.
Production Docker images use compiled JavaScript. TypeScript is compiled
during the image build rather than running TypeScript directly in production.
5. Tailwind decisions
Utilities in the markup, repeated patterns extracted. Common UI styles
such as buttons, cards, inputs and badges are reused rather than repeating
large groups of classes.
A shared brand colour scale is defined in the Tailwind configuration so
the application's theme can be changed centrally.
Responsive by default. Tailwind breakpoints are used so the application
works across desktop, tablet and mobile layouts.
Reusable components such as Button, Card, Alert, EventCard,
Pagination and StatCard keep repeated UI behavior in one place.
6. Other decisions
JWT in an httpOnly cookie, not localStorage. JavaScript cannot directly
read an httpOnly cookie, reducing the risk of token theft through client-side
scripts.
Validation happens twice — in the browser for immediate feedback and
again in the API because frontend validation can always be bypassed.
Login errors are deliberately generic so the login endpoint does not
reveal whether a particular email address is registered.
Seat availability has a separate lightweight endpoint
(/events/:id/availability) so the frontend can refresh the live seat count
without reloading the complete event detail response or creating another
event-view activity.
React.StrictMode is kept enabled. In development, React may run effects
more than once, which can cause event-view requests to appear more than once.
This behavior does not occur in the same way in the production build.
Conversion rate is calculated from activity data. The analytics endpoint
reports views, bookings started, confirmed bookings, cancellations and
conversion rates based on the append-only activity log.
7. Use of AI tools

AI tools were used during development for implementation assistance, debugging,
code review, documentation and reasoning about architecture.

Examples include:

Reviewing the booking concurrency implementation and identifying the need
for PostgreSQL row locking.
Creating and refining the concurrency test.
Debugging Docker, TypeScript, routing and frontend issues.
Reviewing API and frontend integration.
Comparing implementation decisions against the assignment requirements.
Assisting with documentation and code organization.

The final implementation was tested against the actual application, including
the concurrency guarantee, Docker setup, backend type checking, backend
production build and frontend production build.