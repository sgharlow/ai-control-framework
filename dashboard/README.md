# AI Control Dashboard

Web dashboard for tracking DRS (Deployability Rating Score) history and coding session analytics.

## Features

- **DRS Trend Chart**: Visualize your score over time
- **Session History**: Track individual coding sessions
- **Stats Overview**: Average DRS, total sessions, hours coded
- **Deploy Ready Counter**: Sessions meeting the 85+ threshold

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Tech Stack

- **Next.js 14** - React framework
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Supabase** - Database & Auth (Pro tier)
- **Stripe** - Payments (Pro tier)

## Pro Tier Features

- Team management & leaderboard
- 30-day DRS trends
- Slack/Discord alerts
- Custom reports & export
- Priority support

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values.

## Deployment

Deploy to Vercel:

```bash
vercel
```

## License

MIT
