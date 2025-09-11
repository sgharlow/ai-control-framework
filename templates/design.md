# DESIGN — Architecture & Contract Guardian

## Architecture Boundaries (DO NOT CROSS)

### Allowed Components
- **Frontend:** Existing UI framework only
- **Backend:** Existing API layer only
- **Database:** Existing schema only

### Forbidden Changes
- Adding new services or components
- Changing data flow patterns
- Modifying authentication flow
- Adding middleware layers

## Frozen Contracts (IMMUTABLE This Session)

### API Contract
- **File:** api/openapi.yaml
- **Hash:** sha256:...
- **Endpoints:**
  - POST /v1/users
  - GET /v1/users/{id}

### Database Contract
- **File:** db/schema.sql
- **Hash:** sha256:...
- **Tables:**
  - users (id, email, created_at)

### Message Contract
- **File:** events/schemas.json
- **Hash:** sha256:...

## Contract Violation Response

1. STOP all work immediately
2. Document why change seems necessary
3. Create CCR with justification
4. Wait for human approval
5. If approved, update hash and restart session