# SideTrack

SideTrack is an application designed to help users track medication side effects and create doctor-ready reports.

## Features

- Track medications with dosage, frequency, and scheduling information
- Record side effects associated with specific medications
- Log daily check-ins to monitor overall wellness
- Generate comprehensive reports for medical appointments
- In-app customer support chat for assistance
- Authentication for secure data management

## Development

### Running Locally

1. Clone the repository
2. Install dependencies with `npm install`
3. Set up required environment variables in a `.env` file
4. Run the development server with `npm run dev`

### Building for Production

```
npm run build
```

### Testing

```
npm test
```

## Recent Updates

- Added in-app customer support chat functionality
- Fixed database query issues in the side effects API using proper tagged template literals with the postgres client

## Technical Details

- Frontend: React with Tailwind CSS
- Routing: React Router
- Authentication: Supabase Auth
- Database: CockroachDB with Drizzle ORM
- API: Vercel Serverless Functions
- Real-time Chat: Stream Chat API
- Error Tracking: Sentry
- Analytics: Umami

## Environment Setup

Configure the following environment variables:

```
VITE_PUBLIC_APP_ID=
VITE_PUBLIC_APP_ENV=
VITE_PUBLIC_SENTRY_DSN=
VITE_PUBLIC_UMAMI_WEBSITE_ID=
COCKROACH_DB_URL=
ZAPT_SECRET_KEY=
```