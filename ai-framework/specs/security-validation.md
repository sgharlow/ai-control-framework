# Security Validation Specification

## Purpose
Systematically validate security practices and compliance requirements to prevent vulnerabilities and data breaches that AI agents commonly introduce through oversight.

## Why This Matters
- **Prevents Security Vulnerabilities**: AI agents often focus on functionality while missing security implications
- **Ensures Compliance**: Systematic validation against security standards and regulations
- **Protects Sensitive Data**: Prevents accidental exposure through logs, errors, or inadequate access controls
- **Maintains Trust**: Security failures can destroy user trust and business reputation

## The Problem This Solves

### Common AI Agent Security Oversights
```javascript
// SECURITY VIOLATIONS AI agents commonly introduce:

// 1. Hardcoded secrets
const API_KEY = "sk-1234567890abcdef"; // Should be environment variable
const DB_PASSWORD = "mypassword123"; // Should be in secure vault

// 2. Missing input validation
app.post('/user', (req, res) => {
  const sql = `INSERT INTO users (name) VALUES ('${req.body.name}')`; // SQL injection
  db.query(sql); // No validation or sanitization
});

// 3. Data exposure in logs
console.log('User data:', user); // May contain PII/sensitive data
logger.error('Login failed:', {email, password}); // Password in logs!

// 4. Missing authentication
app.get('/admin/users', (req, res) => {
  // No authentication check - anyone can access
  res.json(getAllUsers());
});
```

## Security Validation Categories

### 1. Secret Management
**What to Validate:**
- No hardcoded API keys, passwords, or tokens
- Secrets stored in environment variables or secure vaults
- No secrets in configuration files committed to version control
- Proper secret rotation mechanisms

**Detection Patterns:**
```regex
# Common secret patterns to detect:
- API keys: /[Aa][Pp][Ii]_?[Kk][Ee][Yy]\s*[:=]\s*["'][^"']+["']/
- Passwords: /[Pp][Aa][Ss][Ss][Ww][Oo][Rr][Dd]\s*[:=]\s*["'][^"']+["']/
- Tokens: /[Tt][Oo][Kk][Ee][Nn]\s*[:=]\s*["'][^"']+["']/
- AWS keys: /AKIA[0-9A-Z]{16}/
- Private keys: /-----BEGIN [A-Z ]+PRIVATE KEY-----/
```

### 2. Input Validation and Sanitization
**What to Validate:**
- All user inputs validated against expected formats
- SQL injection prevention (parameterized queries)
- XSS prevention (output encoding)
- Path traversal prevention
- File upload restrictions

**Validation Requirements:**
```javascript
// GOOD: Proper input validation
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

const validateUserId = (id) => {
  return Number.isInteger(id) && id > 0 && id <= Number.MAX_SAFE_INTEGER;
};

// GOOD: Parameterized queries
const getUserById = (id) => {
  return db.query('SELECT * FROM users WHERE id = ?', [id]);
};
```

### 3. Authentication and Authorization
**What to Validate:**
- All protected endpoints have authentication checks
- Proper session management
- Role-based access control (RBAC) implementation
- JWT token validation and expiration
- Multi-factor authentication where required

**Authorization Patterns:**
```javascript
// GOOD: Proper authentication middleware
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({error: 'No token provided'});
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({error: 'Invalid token'});
  }
};

// GOOD: Role-based authorization
const requireRole = (role) => (req, res, next) => {
  if (!req.user || !req.user.roles.includes(role)) {
    return res.status(403).json({error: 'Insufficient permissions'});
  }
  next();
};
```

### 4. Data Protection and Privacy
**What to Validate:**
- No sensitive data in logs or error messages
- PII handling compliance (GDPR, CCPA)
- Data encryption at rest and in transit
- Proper data retention policies
- Secure data deletion procedures

**Data Protection Requirements:**
```javascript
// GOOD: Safe logging practices
const safeLog = (message, data) => {
  const sanitized = {...data};
  delete sanitized.password;
  delete sanitized.ssn;
  delete sanitized.creditCard;
  logger.info(message, sanitized);
};

// GOOD: PII masking
const maskEmail = (email) => {
  const [local, domain] = email.split('@');
  return `${local.substring(0, 2)}***@${domain}`;
};
```

### 5. Dependency Security
**What to Validate:**
- No known vulnerable dependencies
- Regular dependency updates
- License compliance
- Supply chain security validation

**Dependency Checks:**
```bash
# Security scanning commands
npm audit --audit-level moderate
yarn audit --level moderate
snyk test
```

### 6. Infrastructure Security
**What to Validate:**
- HTTPS enforcement
- Secure headers implementation
- CORS configuration
- Rate limiting implementation
- Security monitoring and alerting

**Security Headers:**
```javascript
// GOOD: Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});
```

## Implementation Requirements

### Core Algorithm
1. **Scan Source Code**
   - Search for hardcoded secrets and credentials
   - Validate input handling patterns
   - Check authentication/authorization implementation
   - Identify data exposure risks

2. **Analyze Dependencies**
   - Run security vulnerability scans
   - Check for outdated packages
   - Validate license compliance
   - Assess supply chain risks

3. **Validate Configuration**
   - Check security headers implementation
   - Validate HTTPS enforcement
   - Review CORS and rate limiting
   - Assess monitoring and alerting

4. **Generate Security Report**
   - List all security findings
   - Categorize by severity (Critical/High/Medium/Low)
   - Provide remediation guidance
   - Track security debt over time

## Expected Behavior

### Clean Security Validation
```
Security validation check...

Secret Management: SECURE ✓
- No hardcoded secrets detected
- Environment variables properly used
- No secrets in configuration files

Input Validation: SECURE ✓
- All inputs validated and sanitized
- Parameterized queries used
- XSS protection implemented

Authentication: SECURE ✓
- All protected endpoints authenticated
- Proper session management
- Role-based access control implemented

Data Protection: SECURE ✓
- No PII in logs or error messages
- Data encryption properly implemented
- GDPR compliance validated

Dependencies: SECURE ✓
- No known vulnerabilities
- All packages up to date
- License compliance verified

Infrastructure: SECURE ✓
- HTTPS enforced
- Security headers implemented
- Rate limiting configured

✓ Security validation PASSED
System meets security requirements
```

### Security Violations Detected
```
SECURITY VIOLATIONS DETECTED!

CRITICAL Issues (2):
✗ Hardcoded API key in config/database.js:15
✗ SQL injection vulnerability in routes/users.js:42

HIGH Issues (3):
✗ Missing authentication on /admin endpoints
✗ PII exposed in error logs (users.js:78)
✗ Vulnerable dependency: lodash@4.17.15 (CVE-2020-8203)

MEDIUM Issues (1):
✗ Missing security headers

DEPLOYMENT BLOCKED: Critical and High security issues must be resolved

Remediation Actions:
1. Move API key to environment variable
2. Use parameterized queries for database access
3. Add authentication middleware to admin routes
4. Remove PII from error logging
5. Update lodash to latest version
6. Implement security headers middleware
```

## Security Validation Rules

### Secret Detection Rules
```yaml
security:
  secrets:
    patterns:
      - name: "API Keys"
        regex: "(?i)(api[_-]?key|apikey)\\s*[:=]\\s*['\"][^'\"]{20,}['\"]"
        severity: "CRITICAL"
      - name: "Passwords"
        regex: "(?i)(password|passwd|pwd)\\s*[:=]\\s*['\"][^'\"]{8,}['\"]"
        severity: "CRITICAL"
      - name: "JWT Secrets"
        regex: "(?i)(jwt[_-]?secret|secret[_-]?key)\\s*[:=]\\s*['\"][^'\"]{16,}['\"]"
        severity: "CRITICAL"
      - name: "Database URLs"
        regex: "(mongodb|mysql|postgres)://[^\\s\"']+:[^\\s\"']+@"
        severity: "HIGH"
    
    exceptions:
      - "test/**/*"
      - "**/*.test.js"
      - "**/*.spec.js"
      - "**/mock*"
```

### Input Validation Rules
```yaml
security:
  input_validation:
    required_patterns:
      - name: "SQL Parameterization"
        check: "No string concatenation in SQL queries"
        pattern: "\\$\\{.*\\}|\\+.*\\+|`.*\\$\\{.*\\}`"
        context: "SQL queries"
        severity: "CRITICAL"
      
      - name: "Input Sanitization"
        check: "User inputs must be validated"
        endpoints: ["POST", "PUT", "PATCH"]
        required: ["validation", "sanitization"]
        severity: "HIGH"
```

### Authentication Rules
```yaml
security:
  authentication:
    protected_paths:
      - "/admin/**"
      - "/api/users/**"
      - "/api/orders/**"
    
    required_middleware:
      - "authentication"
      - "authorization"
    
    session_security:
      - "secure_cookies"
      - "csrf_protection"
      - "session_timeout"
```

## Integration with Framework

### DRS Integration
Add security validation to DRS calculation:

```
Security Validation (20 points):
- All security checks pass: +20 points
- Minor security issues: +10 points
- Major security issues: +5 points
- Critical security issues: 0 points (BLOCKS DEPLOYMENT)
```

### Evidence Requirements
Security validation becomes required evidence:

```
evidence/
├── security-scan-results.json        # Automated security scan results
├── dependency-audit.json             # Dependency vulnerability scan
├── secret-detection-report.json      # Secret scanning results
├── authentication-validation.json    # Auth/authz validation
└── compliance-checklist.json         # Regulatory compliance status
```

### Deployment Blocking
Critical and High security issues block deployment:

```yaml
deployment_gates:
  security:
    block_on:
      - "CRITICAL"
      - "HIGH"
    warn_on:
      - "MEDIUM"
    track_on:
      - "LOW"
```

## Reference Implementations

### Bash
See: `reference/bash/validate-security.sh`

### PowerShell
See: `reference/powershell/Validate-Security.ps1`

### Python
See: `reference/python/validate_security.py`

### Manual Checklist
See: `reference/checklists/security-validation.md`

## Compliance Standards

### GDPR Compliance
```yaml
gdpr:
  data_processing:
    - "Lawful basis documented"
    - "Data minimization implemented"
    - "Consent mechanisms in place"
  
  data_rights:
    - "Right to access implemented"
    - "Right to deletion implemented"
    - "Data portability supported"
  
  security_measures:
    - "Encryption at rest and in transit"
    - "Access controls implemented"
    - "Audit logging enabled"
```

### SOX Compliance
```yaml
sox:
  access_controls:
    - "Segregation of duties"
    - "Least privilege access"
    - "Regular access reviews"
  
  audit_trails:
    - "All changes logged"
    - "Immutable audit logs"
    - "Regular log reviews"
```

## Security Tools Integration

### Static Analysis
```yaml
tools:
  static_analysis:
    - "eslint-plugin-security"
    - "bandit" # Python
    - "brakeman" # Ruby
    - "gosec" # Go
    
  dependency_scanning:
    - "npm audit"
    - "yarn audit"
    - "snyk"
    - "OWASP dependency-check"
    
  secret_scanning:
    - "truffleHog"
    - "git-secrets"
    - "detect-secrets"
```

### Dynamic Analysis
```yaml
tools:
  dynamic_analysis:
    - "OWASP ZAP"
    - "Burp Suite"
    - "Nessus"
    
  penetration_testing:
    - "Regular security assessments"
    - "Vulnerability scanning"
    - "Social engineering tests"
```

## Success Metrics
- Zero critical security vulnerabilities in production
- All secrets properly externalized
- 100% authentication coverage on protected endpoints
- No PII exposure incidents
- Compliance audit pass rate >95%

## Common Issues

### Issue: "Too Many False Positives"
**Solution**: Tune detection rules, add proper exceptions, focus on high-severity issues

### Issue: "Security Scans Too Slow"
**Solution**: Run scans in parallel, cache results, use incremental scanning

### Issue: "Compliance Requirements Unclear"
**Solution**: Create compliance-specific checklists, get legal/compliance team input

## Best Practices

1. **Security by Design**: Consider security from the beginning, not as an afterthought
2. **Defense in Depth**: Implement multiple layers of security controls
3. **Principle of Least Privilege**: Grant minimum necessary permissions
4. **Regular Updates**: Keep dependencies and security tools current
5. **Security Training**: Ensure team understands security best practices

---

**Remember**: Security is not optional. A single security vulnerability can compromise the entire system and destroy user trust.