# BookIt — Live Event Booking Platform (TypeScript + Tailwind)

A full-stack event booking app. Organizers create events with a limited number of seats; users browse, search and book a seat. The core guarantee is that **an event with capacity N can never have more than N confirmed bookings**, even when multiple people book the last seat at exactly the same moment.

**Stack:** React 18 + TypeScript + Tailwind CSS (Vite) · Node.js + Express + TypeScript · PostgreSQL (Neon) · node-pg-migrate

Everything is written in TypeScript with `strict` mode on — including the database migration — and the project type-checks and builds successfully.

---

## Run it with Docker (recommended — one command)

Docker runs the React frontend and Express API. PostgreSQL is hosted by Neon.

Make sure `server/.env` contains a valid `DATABASE_URL` and `JWT_SECRET`.

```bash
docker compose up --build

That starts the API and frontend, runs the database migrations, runs the seed with --if-empty, and serves both apps.

What	URL
React app	http://localhost:3000
API	http://localhost:4000/api

The --if-empty flag means existing Neon data is not overwritten when the application starts.

Run it without Docker

You need Node.js 18+ and a PostgreSQL database. Neon PostgreSQL can be used directly.

# 1. backend

cd server

cp .env.example .env
# then set DATABASE_URL and JWT_SECRET

npm install

npm run migrate
npm run seed
npm run dev

The API runs at:

http://localhost:4000/api

In a new terminal:

# 2. frontend

cd client

cp .env.example .env

npm install

npm run dev

The React development server runs at:

http://localhost:5173

Demo accounts

All seeded accounts use the password Password123.

Email	Role
organizer@bookit.com	organizer
organizer2@bookit.com	organizer
user@bookit.com	user
user2@bookit.com	user
user3@bookit.com	user
Prove the no-oversell guarantee

The project includes a concurrency test that creates a fresh capacity-1 event, creates two independent users and fires both booking requests simultaneously using Promise.all.

With the API running:

cd server

npx tsx scripts/concurrency-test.ts

Expected output:

Created capacity-1 event: <event-id>

Created two independent users.

Firing both booking requests at the same time...

--------------- RESULT ---------------

confirmed (201): 1
sold out (409):  1

PASS - no oversell.

The booking implementation uses a PostgreSQL transaction and locks the event row using SELECT ... FOR UPDATE before checking and updating its seat count.

The concurrency test has been successfully run against the actual API.

Type-checking and production builds

Backend:

cd server

npm run typecheck
npm run build

Frontend:

cd client

npm run build

The frontend production build runs TypeScript checking before creating the Vite production bundle.

Project structure
bookit/

├── docker-compose.yml
├── render.yaml
├── README.md
├── NOTES.md
│
├── server/
│   ├── Dockerfile
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   ├── scripts/
│   │   └── concurrency-test.ts
│   └── src/
│       ├── types/
│       │   ├── index.ts
│       │   └── express.d.ts
│       ├── config/
│       ├── migrations/
│       ├── db/
│       ├── middleware/
│       ├── routes/
│       ├── controllers/
│       ├── services/
│       └── utils/
│
└── client/
    ├── Dockerfile
    ├── .env.example
    ├── package.json
    ├── tailwind.config.js
    ├── vite.config.ts
    └── src/
        ├── api/
        ├── context/
        ├── components/
        ├── pages/
        ├── types/
        └── utils/

The backend follows a simple route → controller → service → database flow:

route — defines the URL and authentication/authorization middleware
controller — handles the HTTP request and response
service — contains business logic and database operations
API reference
Method	Endpoint	Access	Description
POST	/api/auth/signup	public	Create an account
POST	/api/auth/login	public	Log in and set the auth cookie
POST	/api/auth/logout	public	Clear the auth cookie
GET	/api/auth/me	public	Get the current user
GET	/api/events?search=&date=&page=	public	List, search, filter and paginate events
GET	/api/events/:id	public	Get event details and record an event view
GET	/api/events/:id/availability	public	Get live seat availability
POST	/api/bookings/:eventId	user	Book a seat — concurrency critical
GET	/api/me/bookings	user	Get the logged-in user's bookings
DELETE	/api/bookings/:id	user	Cancel a booking and free the seat
POST	/api/organizer/events	organizer	Create an event
GET	/api/organizer/events	organizer	Get the organizer's events
GET	/api/organizer/events/:id	organizer	Get one owned event
PATCH	/api/organizer/events/:id	organizer	Edit an owned event
GET	/api/organizer/events/:id/attendees	organizer	Get attendees
GET	/api/organizer/events/:id/analytics	organizer	Get event analytics

Status codes: 400 invalid input · 401 not logged in · 403 not allowed · 404 not found · 409 conflict such as sold out, already booked or capacity below sold.

Errors always come back as:

{
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE"
  }
}
Features
Auth — email + password, bcrypt hashing, JWT in an httpOnly cookie, protected routes and organizer authorization.
Browse — search by title, filter by date, pagination, event details and live seat availability.
Booking — one seat per user per event, transactional booking, row-level locking and no overselling under concurrent requests.
My bookings — view confirmed/cancelled bookings and cancel bookings to release seats.
Organizer dashboard — create/edit events, view seats sold, attendees and event details.
Analytics — event views, bookings started, bookings confirmed, cancellations and conversion rates from the append-only activity_log table.
UI — Tailwind CSS, responsive layouts, loading/empty/error states, sold-out states and form validation.