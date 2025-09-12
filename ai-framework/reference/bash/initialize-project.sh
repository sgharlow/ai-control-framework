#!/bin/bash
# AI Framework Project Initializer
# Sets up a new project with framework compliance

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}AI Framework Project Initializer${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Get project information
read -p "Project name: " PROJECT_NAME
read -p "API endpoint (or press Enter for example): " API_ENDPOINT
read -p "Database URL (or press Enter for example): " DATABASE_URL
read -p "Primary language (js/ts/py/cs): " LANGUAGE

# Set defaults if not provided
API_ENDPOINT=${API_ENDPOINT:-"https://api.example.com"}
DATABASE_URL=${DATABASE_URL:-"postgresql://localhost:5432/${PROJECT_NAME}"}

# Create project structure
echo -e "\n${YELLOW}Creating project structure...${NC}"
mkdir -p src
mkdir -p tests
mkdir -p docs
mkdir -p evidence
mkdir -p config

# Create initial contract files based on language
echo -e "${YELLOW}Creating contract files...${NC}"
mkdir -p interfaces

case "$LANGUAGE" in
    js|ts)
        cat > interfaces/api.${LANGUAGE} << 'EOF'
// API Contract - DO NOT MODIFY without CCR
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    timestamp: number;
}

export interface UserModel {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
}
EOF
        ;;
    py)
        cat > interfaces/api.py << 'EOF'
# API Contract - DO NOT MODIFY without CCR
from typing import Optional, TypeVar, Generic
from datetime import datetime
from dataclasses import dataclass

T = TypeVar('T')

@dataclass
class ApiResponse(Generic[T]):
    success: bool
    data: Optional[T] = None
    error: Optional[str] = None
    timestamp: float = 0

@dataclass
class UserModel:
    id: str
    email: str
    name: str
    created_at: datetime
EOF
        ;;
    cs)
        cat > interfaces/ApiContracts.cs << 'EOF'
// API Contract - DO NOT MODIFY without CCR
using System;

namespace Contracts
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public T Data { get; set; }
        public string Error { get; set; }
        public long Timestamp { get; set; }
    }

    public class UserModel
    {
        public string Id { get; set; }
        public string Email { get; set; }
        public string Name { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
EOF
        ;;
esac

# Initialize contract hashes
echo -e "${YELLOW}Initializing contract hashes...${NC}"
find interfaces -type f | while read file; do
    if command -v sha256sum &> /dev/null; then
        sha256sum "$file" >> .contract-hashes
    elif command -v shasum &> /dev/null; then
        shasum -a 256 "$file" >> .contract-hashes
    else
        md5sum "$file" >> .contract-hashes
    fi
done

# Create initial configuration
echo -e "${YELLOW}Creating configuration files...${NC}"

# Create .env.example
cat > .env.example << EOF
# Environment Configuration
NODE_ENV=development
PORT=3000

# API Configuration
API_ENDPOINT=${API_ENDPOINT}
API_KEY=your-api-key-here

# Database Configuration
DATABASE_URL=${DATABASE_URL}

# Security
JWT_SECRET=change-this-secret-key
ENCRYPTION_KEY=change-this-encryption-key

# Monitoring
LOG_LEVEL=info
EOF

# Create initial package.json for JS/TS projects
if [[ "$LANGUAGE" == "js" || "$LANGUAGE" == "ts" ]]; then
    cat > package.json << EOF
{
  "name": "${PROJECT_NAME}",
  "version": "0.1.0",
  "description": "AI Framework compliant project",
  "main": "src/index.${LANGUAGE}",
  "scripts": {
    "start": "node src/index.${LANGUAGE}",
    "test": "echo 'No tests yet' && exit 1",
    "lint": "echo 'No linting configured yet'",
    "drs": "bash ai-framework/reference/bash/drs-calculate.sh"
  },
  "keywords": ["ai-framework"],
  "license": "MIT",
  "dependencies": {},
  "devDependencies": {}
}
EOF
fi

# Create initial README
cat > README.md << EOF
# ${PROJECT_NAME}

AI Framework compliant project initialized on $(date '+%Y-%m-%d')

## Quick Start

1. Configure your environment:
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your actual values
   \`\`\`

2. Check framework compliance:
   \`\`\`bash
   ai-framework/reference/bash/drs-calculate.sh
   \`\`\`

3. Start development following AI Framework guidelines

## Framework Compliance

- **DRS Target**: 85/100 for deployment
- **Contract Files**: interfaces/
- **Evidence**: evidence/
- **Max Scope**: 5 files, 200 LOC per session

## Configuration

- **API Endpoint**: ${API_ENDPOINT}
- **Database**: ${DATABASE_URL}
- **Language**: ${LANGUAGE}
EOF

# Update ai-framework/templates/code.md with project specifics
if [ -f "ai-framework/templates/code.md" ]; then
    echo -e "${YELLOW}Updating framework templates...${NC}"
    sed -i.bak "s|https://api.example.com|${API_ENDPOINT}|g" ai-framework/templates/code.md
    sed -i.bak "s|postgresql://localhost:5432/dbname|${DATABASE_URL}|g" ai-framework/templates/code.md
    sed -i.bak "s|Implement core functionality with test coverage|Build ${PROJECT_NAME} with framework compliance|g" ai-framework/templates/code.md
    rm -f ai-framework/templates/code.md.bak
fi

# Initialize git if not already initialized
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}Initializing git repository...${NC}"
    git init
    git add .
    git commit -m "Initial commit: AI Framework project initialized"
fi

# Create initial DRS score
echo "0" > .drs-score
echo "$(date '+%Y-%m-%d %H:%M:%S') - DRS: 0/100 - Project initialized" > .drs-history

# Run initial DRS calculation
echo -e "\n${YELLOW}Running initial DRS calculation...${NC}"
if [ -f "ai-framework/reference/bash/drs-calculate.sh" ]; then
    bash ai-framework/reference/bash/drs-calculate.sh || true
fi

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}✓ Project initialized successfully!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Review and update configuration in .env"
echo "2. Implement your contracts in interfaces/"
echo "3. Start development with: ai-framework/prompts.md"
echo "4. Check compliance with: bash ai-framework/reference/bash/drs-calculate.sh"
echo ""
echo "Remember:"
echo "- Max 5 files per session"
echo "- Max 200 LOC per session"
echo "- No mocks after 30 minutes"
echo "- DRS ≥ 85 required for deployment"