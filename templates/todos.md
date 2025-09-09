# TODOS — Active Issues & Mocks

## CRITICAL (Blocks Deploy)

None currently

## Active Mocks (Max 3, Expire in 72h)

### MOCK-001: Auth Service
- **Created:** 2025-09-09 14:00
- **Expires:** 2025-09-12 14:00
- **Location:** src/auth.js line 45
- **Risk:** May leak to production
- **Resolution:** Get real auth endpoint URL, update AUTH_BASE_URL env var

## Technical Debt

- Items here do not block current session
- Must be addressed before next major release
- Each item must have owner and deadline