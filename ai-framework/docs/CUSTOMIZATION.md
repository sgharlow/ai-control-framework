# Customization Guide

## Adjusting the AI Control Framework for Your Needs

While the framework's defaults are battle-tested, every team and project has unique requirements. This guide shows you how to customize the framework without breaking its core principles.

## Core Principles (Don't Break These!)

1. **Contracts must be frozen** - This prevents drift
2. **Mocks must timeout** - This forces real implementations
3. **Scope must be limited** - This ensures incremental progress
4. **DRS must be objective** - This provides measurable quality

## Safe Customizations

### 1. Adjusting File and Line Limits

Edit `ai-framework/scripts/check-scope.sh`:

```bash
# Default limits
MAX_FILES=5      # Files per session
MAX_LINES=200    # Lines per session

# For larger refactoring sessions
MAX_FILES=10     # Still controlled
MAX_LINES=400    # Still manageable

# For hotfixes
MAX_FILES=2      # Very focused
MAX_LINES=50     # Minimal change
```

**Guidelines:**
- Never exceed 15 files (chaos ensues)
- Never exceed 500 lines (review becomes impossible)
- Adjust based on team size and experience

### 2. Mock Timeout Adjustment

Edit `ai-framework/scripts/detect-mocks.sh`:

```bash
# Default timeout
MOCK_TIMEOUT_MINUTES=30

# For complex integrations
MOCK_TIMEOUT_MINUTES=45  # More exploration time

# For simple CRUD
MOCK_TIMEOUT_MINUTES=15  # Force real data sooner
```

**Guidelines:**
- Never exceed 60 minutes (mocks become permanent)
- Never disable timeout (defeats the purpose)
- Shorter is generally better

### 3. DRS Scoring Weights

Edit `ai-framework/scripts/drs-calculate.sh`:

```bash
# Default weights
CONTRACT_WEIGHT=20
MOCK_WEIGHT=20
TEST_WEIGHT=15
ERROR_WEIGHT=10
SCOPE_WEIGHT=10
API_WEIGHT=15
DOC_WEIGHT=10

# For API-heavy projects
CONTRACT_WEIGHT=15
MOCK_WEIGHT=15
TEST_WEIGHT=15
ERROR_WEIGHT=10
SCOPE_WEIGHT=5
API_WEIGHT=25  # Increased
DOC_WEIGHT=15

# For internal tools
CONTRACT_WEIGHT=25
MOCK_WEIGHT=25
TEST_WEIGHT=20
ERROR_WEIGHT=10
SCOPE_WEIGHT=10
API_WEIGHT=5   # Decreased
DOC_WEIGHT=5
```

**Always ensure total = 100**

### 4. Session Types

Create custom session types in `ai-framework/scripts/initialize-session.sh`:

```bash
case "$SESSION_TYPE" in
    # Add your custom types
    HOTFIX)
        SESSION_TYPE="HOTFIX"
        MAX_TIME=30
        MAX_FILES=2
        MAX_LINES=50
        MIN_DRS=80  # High bar for hotfixes
        DESCRIPTION="Emergency fix mode"
        ;;
    REFACTOR)
        SESSION_TYPE="REFACTOR"
        MAX_TIME=180
        MAX_FILES=10
        MAX_LINES=400
        MIN_DRS=90  # Must improve quality
        DESCRIPTION="Code improvement mode"
        ;;
    EXPERIMENT)
        SESSION_TYPE="EXPERIMENT"
        MAX_TIME=60
        MAX_FILES=3
        MAX_LINES=150
        MIN_DRS=0   # No deployment intended
        DESCRIPTION="Exploration mode"
        ;;
esac
```

### 5. Language-Specific Patterns

Add patterns in `ai-framework/templates/patterns/`:

#### Python Pattern
`patterns/python-api.md`:
```markdown
# Python API Pattern

## Structure
```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import logging

class ItemModel(BaseModel):
    name: str
    description: Optional[str] = None
    
app = FastAPI()
logger = logging.getLogger(__name__)

@app.post("/items")
async def create_item(item: ItemModel):
    try:
        # Real database connection required
        result = await db.items.insert_one(item.dict())
        return {"id": str(result.inserted_id)}
    except Exception as e:
        logger.error(f"Failed to create item: {e}")
        raise HTTPException(status_code=500, detail="Internal error")
```

Success Rate: 92%
Common Issues: Forgetting async, missing error handling
```

#### Java Pattern
`patterns/java-spring.md`:
```markdown
# Spring Boot Pattern

## Controller
```java
@RestController
@RequestMapping("/api/v1")
@Validated
public class ItemController {
    
    private final ItemService itemService;
    private final Logger logger = LoggerFactory.getLogger(ItemController.class);
    
    @PostMapping("/items")
    public ResponseEntity<ItemResponse> createItem(@Valid @RequestBody ItemRequest request) {
        try {
            Item item = itemService.create(request);
            return ResponseEntity.ok(ItemResponse.from(item));
        } catch (Exception e) {
            logger.error("Failed to create item", e);
            throw new InternalServerException("Failed to create item");
        }
    }
}
```

Success Rate: 94%
Requirements: Real database, proper DTOs, logging
```

### 6. Contract File Types

Add support for more contract types in `ai-framework/scripts/check-contracts.sh`:

```bash
# Default contract patterns
CONTRACT_PATTERNS=(
    "*.yaml"
    "*.yml"
    "*.sql"
    "*.proto"
    "*.graphql"
    "*.json"
)

# Add your contract types
CONTRACT_PATTERNS+=(
    "*.thrift"      # Thrift IDL
    "*.avsc"        # Avro schema
    "*.xsd"         # XML schema
    "*.raml"        # RAML API
    "*.wadl"        # WADL API
)
```

### 7. Custom Validation Rules

Add to `ai-framework/scripts/can-i-continue.sh`:

```bash
# Custom check: Database migrations
echo -n "4. Database migrations... "
if [ -d "migrations" ]; then
    PENDING=$(ls migrations/*.pending 2>/dev/null | wc -l)
    if [ "$PENDING" -gt 0 ]; then
        echo -e "${RED}✗ STOP - Pending migrations${NC}"
        CONTINUE=false
        ((ERRORS++))
    else
        echo -e "${GREEN}✓ OK${NC}"
    fi
else
    echo -e "${YELLOW}⚠ No migrations folder${NC}"
fi

# Custom check: Security scan
echo -n "5. Security scan... "
if command -v snyk &> /dev/null; then
    if snyk test --severity-threshold=high > /dev/null 2>&1; then
        echo -e "${GREEN}✓ OK${NC}"
    else
        echo -e "${RED}✗ STOP - Security issues${NC}"
        CONTINUE=false
        ((ERRORS++))
    fi
else
    echo -e "${YELLOW}⚠ Snyk not installed${NC}"
fi
```

### 8. Environment-Specific Settings

Create `.framework-env`:

```bash
# Development
if [ "$ENVIRONMENT" = "development" ]; then
    export FRAMEWORK_MAX_FILES=8
    export FRAMEWORK_MAX_LINES=300
    export FRAMEWORK_MOCK_TIMEOUT=45
    export FRAMEWORK_MIN_DRS=70
fi

# Staging
if [ "$ENVIRONMENT" = "staging" ]; then
    export FRAMEWORK_MAX_FILES=5
    export FRAMEWORK_MAX_LINES=200
    export FRAMEWORK_MOCK_TIMEOUT=30
    export FRAMEWORK_MIN_DRS=80
fi

# Production
if [ "$ENVIRONMENT" = "production" ]; then
    export FRAMEWORK_MAX_FILES=3
    export FRAMEWORK_MAX_LINES=100
    export FRAMEWORK_MOCK_TIMEOUT=0  # No mocks allowed
    export FRAMEWORK_MIN_DRS=90
fi
```

### 9. IDE Integration

#### VS Code Settings

`.vscode/settings.json`:
```json
{
  "terminal.integrated.env.linux": {
    "FRAMEWORK_PATH": "${workspaceFolder}/ai-framework"
  },
  "task.autoDetect": "on",
  "editor.formatOnSave": true,
  "files.exclude": {
    ".session-*": true,
    ".drs-*": true,
    "handoff-*.md": true
  }
}
```

`.vscode/tasks.json`:
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Check DRS",
      "type": "shell",
      "command": "./ai-framework/scripts/drs-calculate.sh",
      "problemMatcher": []
    },
    {
      "label": "Can I Continue?",
      "type": "shell",
      "command": "./ai-framework/scripts/can-i-continue.sh",
      "problemMatcher": []
    }
  ]
}
```

### 10. Monitoring Integration

Add to `ai-framework/scripts/drs-calculate.sh`:

```bash
# Send metrics to monitoring service
send_metrics() {
    local drs=$1
    
    # DataDog
    if [ -n "$DATADOG_API_KEY" ]; then
        curl -X POST "https://api.datadoghq.com/api/v1/series" \
            -H "DD-API-KEY: $DATADOG_API_KEY" \
            -H "Content-Type: application/json" \
            -d "{
                \"series\": [{
                    \"metric\": \"ai.framework.drs\",
                    \"points\": [[$(date +%s), $drs]],
                    \"tags\": [\"team:$TEAM\", \"project:$PROJECT\"]
                }]
            }"
    fi
    
    # Prometheus
    if [ -n "$PROMETHEUS_GATEWAY" ]; then
        echo "ai_framework_drs $drs" | curl --data-binary @- \
            "$PROMETHEUS_GATEWAY/metrics/job/ai-framework"
    fi
}

# Call at end of script
send_metrics $DRS
```

## Configuration File

Create `.framework-config.yaml`:

```yaml
version: 1.1.0
project: your-project-name
team: your-team

limits:
  files:
    default: 5
    hotfix: 2
    refactor: 10
  lines:
    default: 200
    hotfix: 50
    refactor: 400
  mock_timeout: 30
  session_timeout: 120

drs:
  target: 85
  minimum_pr: 70
  minimum_deploy: 85
  weights:
    contracts: 20
    mocks: 20
    tests: 15
    errors: 10
    scope: 10
    api: 15
    docs: 10

patterns:
  required:
    - PATTERN-001
    - PATTERN-002
  blocked:
    - PATTERN-DEPRECATED-001

contracts:
  paths:
    - api/openapi.yaml
    - database/schema.sql
    - proto/*.proto
  exclude:
    - test/**
    - mock/**

monitoring:
  datadog:
    enabled: true
    api_key: ${DATADOG_API_KEY}
  prometheus:
    enabled: false
    gateway: http://localhost:9091

notifications:
  slack:
    webhook: ${SLACK_WEBHOOK}
    channel: "#ai-framework"
    on_violation: true
    on_success: false
```

## Anti-Patterns (Don't Do These!)

### ❌ Disabling Core Checks
```bash
# NEVER DO THIS
./ai-framework/scripts/check-contracts.sh || true  # Ignoring failures
```

### ❌ Infinite Limits
```bash
# NEVER DO THIS
MAX_FILES=999999  # Removes all control
MAX_LINES=999999  # Chaos ensues
```

### ❌ Bypassing Framework
```bash
# NEVER DO THIS
rm .contract-hashes  # Destroys contract tracking
echo "100" > .drs-score  # Fake score
```

### ❌ Permanent Mocks
```bash
# NEVER DO THIS
MOCK_TIMEOUT_MINUTES=999999  # Mocks forever
```

## Testing Customizations

After customizing, always run:

```bash
./validate-framework.sh
```

This ensures your customizations don't break core functionality.

## Sharing Customizations

Share successful customizations:

1. Document what you changed and why
2. Include metrics showing improvement
3. Submit as a PR to the community
4. Help others facing similar challenges

## Getting Help

If you need to customize beyond these guidelines:

1. Open a GitHub issue explaining your use case
2. Join community discussions
3. Check if others have similar needs
4. Consider if it should be a new feature

---

Remember: The framework's constraints are its strength. Customize thoughtfully! 🎯