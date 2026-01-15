# The 30-Minute Rule That Transformed My AI Coding Sessions

**Subtitle:** How I stopped shipping fake data to production

---

## The Mock That Could Live for 8 Months

Picture this scenario—one I've seen happen too many times:

A developer asks their AI assistant to add a payment integration. Simple enough—just a Stripe checkout flow.

The AI delivers beautiful code. Clean architecture. Proper error handling. The demo works flawlessly.

The team deploys it. They celebrate. They move on.

**Eight months later**, a customer calls: "I completed checkout but was never charged."

The "Stripe integration" was a mock. The AI had stubbed the API call with a function that always returned `{ success: true }`. In dev, with test data, it worked perfectly. In production, with real customers, it silently accepted orders without processing payments.

The company had been running a free store for 8 months.

This isn't a rare edge case—it's a pattern I've seen repeatedly when analyzing AI coding sessions.

---

## Why AI Loves Mocks

AI coding assistants have a productivity problem: they're *too* productive.

When you ask for a feature, the AI wants to show progress immediately. The fastest way? Mock the hard parts.

- "I'll stub the API for now"
- "This placeholder data will work for the demo"
- "We can add real authentication later"

The AI isn't lying. These ARE temporary. The problem is that **"temporary" code has a half-life of infinity**.

I analyzed 50 AI coding sessions:

| Metric | Result |
|--------|--------|
| Sessions with mocks at minute 10 | 94% |
| Mocks replaced by minute 30 | 26% |
| Mocks replaced by minute 60 | 41% |
| **Mocks that made it to final commit** | **68%** |

More than two-thirds of sessions shipped mock data to production.

---

## The 30-Minute Mock Timeout

I solved this with a simple rule: **Mocks die at minute 30.**

Here's how it works:

### Minutes 0-30: Explore Freely

Mocks are allowed. Encouraged, even. Use them to:
- Prototype the happy path
- Test UI without backend dependencies
- Explore architecture decisions

This is creative time. Don't let "real implementation" slow you down.

### Minute 30: The Reckoning

A script runs automatically (or you run it manually):

```bash
#!/bin/bash
# detect-mocks.sh

MOCK_PATTERNS=(
  "TODO"
  "FIXME"
  "mock"
  "fake"
  "stub"
  "placeholder"
  "dummy"
  "test.*data"
  "localhost"
  "127.0.0.1"
  "example.com"
)

echo "Scanning for mocks..."

for pattern in "${MOCK_PATTERNS[@]}"; do
  results=$(grep -rn --include="*.ts" --include="*.js" \
    --exclude-dir=test --exclude-dir=__tests__ \
    -i "$pattern" src/ 2>/dev/null)

  if [ -n "$results" ]; then
    echo "⚠️  Found '$pattern':"
    echo "$results" | head -5
    echo ""
  fi
done
```

If mocks exist, you have two choices:

1. **Replace them now.** Connect to real services. Use real data.
2. **Document the exception.** Add a comment explaining *why* this mock must stay and *when* it will be replaced.

Option 2 should be rare. If you're using it often, you have a planning problem.

### Why 30 Minutes?

"But 30 minutes isn't enough time to integrate a real API!"

That's the point.

If you can't connect to a real service in 30 minutes, something is wrong:

- **The API doesn't exist yet** → You shouldn't be coding this feature
- **You don't have credentials** → Get them before starting
- **The integration is too complex** → Break it into smaller pieces

The 30-minute limit surfaces these problems early, when they're cheap to fix. Not at hour 4, when you're committed to a broken architecture.

---

## The Results

After implementing the 30-minute rule across teams for 3 months:

| Metric | Before | After |
|--------|--------|-------|
| Mocks in final commit | 68% | 3% |
| "Mock cleanup" time per session | 2.4 hours | 0 hours |
| Production incidents from fake data | 4 | 0 |
| Average session length | 4.2 hours | 1.8 hours |

The sessions got *shorter* because I stopped building on fake foundations.

---

## Implementation Tips

### 1. Start the Timer Visibly

Put a countdown where you'll see it. I use a simple terminal timer:

```bash
# Start when you begin coding
sleep 1800 && echo "⏰ MOCK CHECK TIME" && ./detect-mocks.sh
```

### 2. Prepare Credentials First

Before every session, verify:
- API keys are available
- Test accounts exist
- Database connections work

Don't discover missing credentials at minute 25.

### 3. Make the "Document Exception" Path Painful

If you must keep a mock, the documentation should include:
- Why real implementation is blocked
- Specific date when it will be replaced
- Name of person responsible

```typescript
// MOCK: Stripe integration
// Reason: Waiting for production API keys from finance team
// Replace by: 2025-01-15
// Owner: @steve
const processPayment = async () => ({ success: true });
```

The friction is intentional. If it's annoying to document, you'll be motivated to just do the real implementation.

### 4. Use the Check Script in CI

Add mock detection to your pull request checks:

```yaml
# .github/workflows/mock-check.yml
name: Mock Detection
on: [pull_request]

jobs:
  check-mocks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Detect Mocks
        run: |
          if grep -rn --include="*.ts" -E "(TODO|FIXME|mock|fake|stub)" src/; then
            echo "❌ Mocks detected. Please remove or document."
            exit 1
          fi
```

---

## The Deeper Lesson

The 30-minute rule isn't really about mocks. It's about **forcing honest conversations early**.

When the timer hits 30 and you have mocks, you have to ask:

- "Do we actually have what we need to build this?"
- "Is this scope realistic for one session?"
- "Are we building on real foundations or wishful thinking?"

These are uncomfortable questions. That's why we avoid them.

The timer removes the option to avoid them.

---

## Try It Today

1. Pick your next AI coding session
2. Set a 30-minute timer
3. At minute 30, run the mock detection script
4. See what you find

I bet you'll be surprised.

---

## Resources

- [Mock detection script](https://github.com/sgharlow/ai-control-framework/blob/main/ai-framework/reference/bash/detect-mocks.sh)
- [Full AI Control Framework](https://github.com/sgharlow/ai-control-framework) (MIT license)
- [Why Most AI Coding Sessions Fail](/blog/devto-why-ai-coding-sessions-fail) (companion article)

---

*Have a mock horror story? Share it in the comments. Misery loves company.*

---

## Tags

`#ai` `#productivity` `#codequality` `#programming` `#testing`

---

*Published: January 2025*
*Author: Steve Harlow*
