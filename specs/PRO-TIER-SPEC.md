# AI Control Framework — Pro Tier Specification

**Version:** 1.0
**Created:** December 31, 2025
**Status:** Planning

---

## Overview

The Pro tier extends the free AI Control Framework with team features, analytics, and premium support for development teams who want to standardize AI coding practices.

---

## Pricing

| Tier | Price | Billing | Target Customer |
|------|-------|---------|-----------------|
| **Free** | $0 | — | Individual developers |
| **Pro** | $29/user/month | Monthly or Annual (20% discount) | Small teams (2-10) |
| **Enterprise** | Custom ($10K+/year) | Annual | Large organizations |

### Annual Discount
- Pro Annual: $279/user/year (save $69 vs monthly)
- Enterprise: Custom pricing with SLA

---

## Feature Comparison

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| Core Framework | ✓ | ✓ | ✓ |
| DRS Calculator | ✓ | ✓ | ✓ |
| CLI Scripts | ✓ | ✓ | ✓ |
| Community Support | ✓ | ✓ | ✓ |
| **Web Dashboard** | — | ✓ | ✓ |
| **Team Management** | — | ✓ | ✓ |
| **DRS History & Trends** | — | ✓ | ✓ |
| **Session Analytics** | — | ✓ | ✓ |
| **Team Leaderboard** | — | ✓ | ✓ |
| **Slack/Discord Alerts** | — | ✓ | ✓ |
| **Priority Support** | — | ✓ | ✓ |
| **Custom Patterns** | — | — | ✓ |
| **SSO/SAML** | — | — | ✓ |
| **Audit Logging** | — | — | ✓ |
| **On-Premise Option** | — | — | ✓ |
| **Dedicated Support** | — | — | ✓ |

---

## Pro Tier Features (Detailed)

### 1. Web Dashboard

**URL:** dashboard.aicontrol.dev (TBD)

**Pages:**
- `/` — Dashboard home (recent sessions, DRS trend)
- `/sessions` — Session history with filtering
- `/analytics` — Team analytics and trends
- `/team` — Team member management
- `/settings` — Account and integration settings

**Tech Stack:**
- Next.js 14 (App Router)
- Supabase (Auth + Database)
- Stripe (Payments)
- Tailwind CSS
- Recharts (Visualization)

### 2. DRS History & Trends

**Features:**
- 30-day DRS trend chart
- Session-by-session breakdown
- Component score heatmap
- Export to CSV/JSON

**Data Model:**
```sql
CREATE TABLE drs_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  team_id UUID REFERENCES teams(id),
  project_name TEXT,
  drs_score INTEGER,
  component_scores JSONB,
  session_duration_minutes INTEGER,
  files_changed INTEGER,
  lines_added INTEGER,
  mocks_detected INTEGER,
  contract_changes INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 3. Team Management

**Features:**
- Invite team members via email
- Role management (Admin, Member)
- Per-seat billing
- Team-wide DRS metrics
- Team leaderboard (gamification)

**Data Model:**
```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT DEFAULT 'pro',
  seat_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id),
  user_id UUID REFERENCES auth.users(id),
  role TEXT DEFAULT 'member',
  invited_at TIMESTAMPTZ DEFAULT now(),
  joined_at TIMESTAMPTZ
);
```

### 4. Session Analytics

**Metrics Tracked:**
- Average DRS per session
- Time to DRS 85+
- Most common failure modes
- Mock timeout compliance rate
- Contract freeze violations

**Visualizations:**
- DRS distribution histogram
- Component score radar chart
- Trend line with moving average
- Team comparison bar chart

### 5. Notifications

**Channels:**
- Slack webhook integration
- Discord webhook integration
- Email digests (daily/weekly)

**Alert Types:**
- Session completed (DRS summary)
- DRS below threshold (<70)
- Contract violation detected
- Weekly team summary

---

## License Key System

### Key Format
```
ACF-PRO-XXXX-XXXX-XXXX-XXXX
```

### Validation Flow
```
1. User purchases Pro via Stripe
2. Webhook creates license key
3. Key stored in Supabase
4. CLI validates key on session start
5. Dashboard shows key status
```

### Key Storage (Supabase)
```sql
CREATE TABLE license_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  team_id UUID REFERENCES teams(id),
  plan TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### CLI Integration
```bash
# Store key locally
acf license activate ACF-PRO-XXXX-XXXX-XXXX-XXXX

# Verify key
acf license status

# Deactivate
acf license deactivate
```

---

## Stripe Integration

### Products

| Product ID | Name | Price | Interval |
|------------|------|-------|----------|
| `prod_pro_monthly` | Pro Monthly | $29 | month |
| `prod_pro_annual` | Pro Annual | $279 | year |
| `prod_enterprise` | Enterprise | Custom | year |

### Webhook Events

Handle these Stripe events:
- `checkout.session.completed` — Create license key
- `customer.subscription.updated` — Update plan/seats
- `customer.subscription.deleted` — Revoke access
- `invoice.paid` — Extend license validity
- `invoice.payment_failed` — Notify user

### Checkout Flow
1. User clicks "Upgrade to Pro" on dashboard
2. Redirect to Stripe Checkout (hosted page)
3. Stripe processes payment
4. Webhook fires `checkout.session.completed`
5. Create license key in Supabase
6. Redirect to dashboard with success message

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Create Supabase project
- [ ] Set up Next.js dashboard skeleton
- [ ] Implement Supabase Auth
- [ ] Create database schema
- [ ] Set up Stripe account and products

### Phase 2: Core Dashboard (Week 2)
- [ ] Build dashboard home page
- [ ] Implement session history page
- [ ] Add DRS trend chart
- [ ] Create settings page
- [ ] Wire up Stripe Checkout

### Phase 3: Team Features (Week 3)
- [ ] Build team management page
- [ ] Implement invite flow
- [ ] Add team leaderboard
- [ ] Create team analytics

### Phase 4: Integrations (Week 4)
- [ ] CLI license validation
- [ ] Slack/Discord webhooks
- [ ] Email notifications
- [ ] Export functionality

---

## Revenue Projections

### Conservative (Year 1)
| Quarter | Pro Users | MRR | ARR |
|---------|-----------|-----|-----|
| Q1 | 10 | $290 | — |
| Q2 | 25 | $725 | — |
| Q3 | 50 | $1,450 | — |
| Q4 | 100 | $2,900 | $34,800 |

### Optimistic (Year 1)
| Quarter | Pro Users | Enterprise Deals | MRR | ARR |
|---------|-----------|------------------|-----|-----|
| Q1 | 25 | 0 | $725 | — |
| Q2 | 75 | 1 | $2,175 + $10K | — |
| Q3 | 150 | 2 | $4,350 + $20K | — |
| Q4 | 300 | 4 | $8,700 + $40K | $144,400 |

---

## Success Metrics

| Metric | Target (90 days) | Measure |
|--------|------------------|---------|
| Pro signups | 25+ | Stripe |
| MRR | $725+ | Stripe |
| Free-to-Pro conversion | 2%+ | Analytics |
| Pro churn rate | <5%/month | Stripe |
| NPS score | 40+ | Survey |

---

## Open Questions

1. Should Enterprise include white-labeling?
2. Partner/reseller program?
3. Educational/non-profit discounts?
4. Lifetime deal option for early adopters?

---

*Specification created December 31, 2025*
