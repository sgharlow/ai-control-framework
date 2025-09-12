# Production Readiness Specification

## Purpose
Ensure code is truly ready for production deployment by validating environment-agnostic implementation, operational requirements, and production-specific concerns that AI agents commonly overlook.

## Why This Matters
- **Prevents Production Failures**: Code that works in development often fails in production due to environment differences
- **Ensures Operational Excellence**: Production systems need monitoring, health checks, and proper configuration management
- **Reduces Deployment Risk**: Systematic validation catches issues before they reach users
- **Enables Reliable Operations**: Proper observability and configuration management enable smooth operations

## The Problem This Solves

### Common Production Readiness Oversights
```javascript
// DEVELOPMENT-ONLY CODE that fails in production:

// 1. Hardcoded environment values
const API_URL = "http://localhost:3000/api"; // Fails in production
const DB_HOST = "127.0.0.1"; // Local database only
const LOG_LEVEL = "debug"; // Too verbose for production

// 2. Missing health checks
app.listen(3000, () => {
  console.log('Server started'); // No health endpoint for load balancers
});

// 3. Inadequate error handling for production
app.use((err, req, res, next) => {
  console.log(err); // Exposes stack traces to users
  res.status(500).send(err.message); // Leaks internal details
});

// 4. No operational monitoring
const processOrder = async (order) => {
  // No metrics, no tracing, no alerts
  return await orderService.create(order);
};

// 5. Missing graceful shutdown
process.on('SIGTERM', () => {
  process.exit(0); // Abrupt shutdown, connections dropped
});
```

## Production Readiness Categories

### 1. Environment Configuration
**What to Validate:**
- No hardcoded environment-specific values
- Proper environment variable usage
- Configuration validation and defaults
- Environment-specific feature flags

**Configuration Requirements:**
```javascript
// GOOD: Environment-agnostic configuration
const config = {
  port: process.env.PORT || 3000,
  apiUrl: process.env.API_URL || 'http://localhost:3000/api',
  dbHost: process.env.DB_HOST || 'localhost',
  logLevel: process.env.LOG_LEVEL || 'info',
  nodeEnv: process.env.NODE_ENV || 'development'
};

// GOOD: Configuration validation
const validateConfig = () => {
  const required = ['DB_HOST', 'API_URL', 'JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// GOOD: Environment-specific behavior
const isDevelopment = config.nodeEnv === 'development';
const isProduction = config.nodeEnv === 'production';

if (isProduction) {
  // Production-specific setup
  app.use(helmet()); // Security headers
  app.use(compression()); // Response compression
}
```

### 2. Health Checks and Monitoring
**What to Validate:**
- Health check endpoints implemented
- Readiness and liveness probes
- Dependency health validation
- Graceful degradation capabilities

**Health Check Implementation:**
```javascript
// GOOD: Comprehensive health checks
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.APP_VERSION || 'unknown'
  };
  
  res.status(200).json(health);
});

app.get('/health/ready', async (req, res) => {
  try {
    // Check critical dependencies
    await Promise.all([
      checkDatabase(),
      checkExternalAPI(),
      checkRedis()
    ]);
    
    res.status(200).json({
      status: 'ready',
      dependencies: {
        database: 'healthy',
        externalAPI: 'healthy',
        redis: 'healthy'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      error: error.message
    });
  }
});

app.get('/health/live', (req, res) => {
  // Simple liveness check
  res.status(200).json({
    status: 'alive',
    pid: process.pid,
    memory: process.memoryUsage()
  });
});
```

### 3. Observability and Logging
**What to Validate:**
- Structured logging implementation
- Correlation ID tracking
- Metrics collection
- Distributed tracing support

**Observability Implementation:**
```javascript
// GOOD: Structured logging
const logger = winston.createLogger({
  level: config.logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log' })
  ]
});

// GOOD: Correlation ID middleware
const correlationId = (req, res, next) => {
  req.correlationId = req.headers['x-correlation-id'] || 
                     req.headers['x-request-id'] || 
                     uuidv4();
  
  res.setHeader('x-correlation-id', req.correlationId);
  req.logger = logger.child({ correlationId: req.correlationId });
  next();
};

// GOOD: Request logging
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    req.logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('User-Agent')
    });
  });
  
  next();
};

// GOOD: Metrics collection
const promClient = require('prom-client');

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const httpRequestTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});
```

### 4. Error Handling and Recovery
**What to Validate:**
- Production-safe error responses
- Proper error logging without exposure
- Circuit breaker implementation
- Retry mechanisms with backoff

**Production Error Handling:**
```javascript
// GOOD: Production error handler
const errorHandler = (err, req, res, next) => {
  // Log full error details
  req.logger.error('Request error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body
  });
  
  // Send safe error response
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (err.isOperational) {
    // Known operational errors - safe to expose
    res.status(err.statusCode || 500).json({
      error: err.message,
      correlationId: req.correlationId
    });
  } else {
    // Unknown errors - don't expose details in production
    res.status(500).json({
      error: isProduction ? 'Internal server error' : err.message,
      correlationId: req.correlationId
    });
  }
};

// GOOD: Circuit breaker for external services
const CircuitBreaker = require('opossum');

const externalAPIOptions = {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000
};

const externalAPIBreaker = new CircuitBreaker(callExternalAPI, externalAPIOptions);

externalAPIBreaker.on('open', () => {
  logger.warn('External API circuit breaker opened');
});

externalAPIBreaker.on('halfOpen', () => {
  logger.info('External API circuit breaker half-open');
});
```

### 5. Resource Management and Lifecycle
**What to Validate:**
- Proper resource acquisition and cleanup
- Connection pool management
- Memory leak prevention
- File handle and stream management
- Async operation lifecycle management

**Resource Management Implementation:**
```javascript
// GOOD: Proper resource management with cleanup
class DatabaseService {
  constructor() {
    this.pool = createConnectionPool({
      max: 10,
      min: 2,
      acquireTimeoutMillis: 30000,
      createTimeoutMillis: 3000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 100
    });
  }

  async query(sql, params) {
    const connection = await this.pool.acquire();
    try {
      return await connection.query(sql, params);
    } finally {
      this.pool.release(connection); // Always release
    }
  }

  async close() {
    await this.pool.destroy();
  }
}

// GOOD: File resource management
async function processFile(filename) {
  const stream = fs.createReadStream(filename);
  try {
    const data = await parseStream(stream);
    return processData(data);
  } finally {
    stream.destroy(); // Ensure cleanup
  }
}

// GOOD: Async operation lifecycle management
class TaskProcessor {
  constructor() {
    this.activeOperations = new Set();
    this.intervals = new Set();
    this.timeouts = new Set();
  }

  async processTask(task) {
    const operation = this.executeTask(task);
    this.activeOperations.add(operation);
    
    try {
      return await operation;
    } finally {
      this.activeOperations.delete(operation);
    }
  }

  startPeriodicTask(fn, interval) {
    const intervalId = setInterval(fn, interval);
    this.intervals.add(intervalId);
    return intervalId;
  }

  scheduleTask(fn, delay) {
    const timeoutId = setTimeout(() => {
      this.timeouts.delete(timeoutId);
      fn();
    }, delay);
    this.timeouts.add(timeoutId);
    return timeoutId;
  }

  async shutdown() {
    // Clear all intervals and timeouts
    this.intervals.forEach(id => clearInterval(id));
    this.timeouts.forEach(id => clearTimeout(id));
    this.intervals.clear();
    this.timeouts.clear();

    // Wait for active operations to complete
    await Promise.allSettled(Array.from(this.activeOperations));
    this.activeOperations.clear();
  }
}
```

### 6. Graceful Shutdown and Cleanup
**What to Validate:**
- Proper signal handling
- Graceful connection closure
- Complete resource cleanup
- Zero-downtime deployment support

**Graceful Shutdown Implementation:**
```javascript
// GOOD: Graceful shutdown
let server;
let isShuttingDown = false;

const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}, starting graceful shutdown`);
  isShuttingDown = true;
  
  // Stop accepting new connections
  server.close((err) => {
    if (err) {
      logger.error('Error during server close', { error: err.message });
      process.exit(1);
    }
    
    logger.info('Server closed');
    
    // Close database connections
    Promise.all([
      database.close(),
      redis.quit(),
      // Other cleanup tasks
    ])
    .then(() => {
      logger.info('All connections closed, exiting');
      process.exit(0);
    })
    .catch((err) => {
      logger.error('Error during cleanup', { error: err.message });
      process.exit(1);
    });
  });
  
  // Force exit after timeout
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Health check considers shutdown state
app.get('/health/ready', (req, res) => {
  if (isShuttingDown) {
    return res.status(503).json({ status: 'shutting down' });
  }
  // ... rest of health check
});
```

### 6. Security and Compliance
**What to Validate:**
- Security headers in production
- Rate limiting implementation
- CORS configuration
- Audit logging for compliance

**Production Security:**
```javascript
// GOOD: Production security middleware
if (isProduction) {
  // Security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"]
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));
  
  // Rate limiting
  const rateLimit = require('express-rate-limit');
  
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP',
    standardHeaders: true,
    legacyHeaders: false
  });
  
  app.use('/api/', limiter);
  
  // CORS configuration
  const cors = require('cors');
  
  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || false,
    credentials: true,
    optionsSuccessStatus: 200
  }));
}
```

## Implementation Requirements

### Core Algorithm
1. **Environment Validation**
   - Check for hardcoded environment values
   - Validate configuration management
   - Verify environment variable usage
   - Test configuration in different environments

2. **Operational Readiness**
   - Validate health check endpoints
   - Check monitoring and logging implementation
   - Verify graceful shutdown handling
   - Test error handling and recovery

3. **Security and Compliance**
   - Validate security headers and middleware
   - Check rate limiting and CORS
   - Verify audit logging
   - Test authentication and authorization

4. **Performance and Scalability**
   - Check resource usage patterns
   - Validate connection pooling
   - Test under load conditions
   - Verify caching strategies

## Expected Behavior

### Production Readiness Validation
```
Production readiness check...

Environment Configuration: READY ✓
- No hardcoded environment values
- All required environment variables defined
- Configuration validation implemented
- Environment-specific behavior properly handled

Health Checks: READY ✓
- Health endpoint implemented (/health)
- Readiness probe available (/health/ready)
- Liveness probe available (/health/live)
- Dependency health checks working

Observability: READY ✓
- Structured logging implemented
- Correlation ID tracking enabled
- Metrics collection configured
- Request/response logging active

Error Handling: READY ✓
- Production-safe error responses
- Proper error logging without exposure
- Circuit breakers for external services
- Retry mechanisms with backoff

Graceful Shutdown: READY ✓
- Signal handlers implemented
- Graceful connection closure
- Resource cleanup procedures
- Zero-downtime deployment support

Security: READY ✓
- Security headers configured
- Rate limiting implemented
- CORS properly configured
- Audit logging enabled

✓ Production readiness VALIDATED
System ready for production deployment
```

### Production Readiness Issues
```
PRODUCTION READINESS ISSUES DETECTED!

Environment Configuration: ISSUES (3)
✗ Hardcoded API URL in config/api.js:12
✗ Missing required environment variable: JWT_SECRET
✗ No configuration validation on startup

Health Checks: MISSING (2)
✗ No health check endpoint found
✗ No readiness probe implementation

Observability: INCOMPLETE (4)
✗ Console.log used instead of structured logging
✗ No correlation ID tracking
✗ No metrics collection
✗ Missing request/response logging

Error Handling: UNSAFE (2)
✗ Stack traces exposed to users (error-handler.js:15)
✗ No circuit breaker for external API calls

Graceful Shutdown: NOT IMPLEMENTED (3)
✗ No signal handlers for SIGTERM/SIGINT
✗ Abrupt process exit without cleanup
✗ No graceful connection closure

Security: VULNERABLE (2)
✗ Missing security headers
✗ No rate limiting implemented

DEPLOYMENT BLOCKED: Critical production readiness issues must be resolved
```

## Production Readiness Checklist

### Environment Configuration
```yaml
environment:
  configuration:
    - [ ] No hardcoded environment values
    - [ ] All config from environment variables
    - [ ] Configuration validation on startup
    - [ ] Environment-specific feature flags
    - [ ] Proper default values defined
  
  deployment:
    - [ ] Docker/container ready
    - [ ] Environment-specific configs
    - [ ] Secrets management integration
    - [ ] Configuration documentation
```

### Operational Excellence
```yaml
operations:
  health_checks:
    - [ ] Health endpoint (/health)
    - [ ] Readiness probe (/health/ready)
    - [ ] Liveness probe (/health/live)
    - [ ] Dependency health validation
  
  observability:
    - [ ] Structured logging (JSON format)
    - [ ] Correlation ID tracking
    - [ ] Metrics collection (Prometheus)
    - [ ] Distributed tracing support
    - [ ] Request/response logging
  
  error_handling:
    - [ ] Production-safe error responses
    - [ ] Comprehensive error logging
    - [ ] Circuit breakers for external services
    - [ ] Retry mechanisms with backoff
    - [ ] Dead letter queues for failed messages
  
  resource_management:
    - [ ] Connection pooling implemented
    - [ ] File handles properly closed
    - [ ] Memory leak prevention
    - [ ] Async operation cleanup
    - [ ] Resource monitoring and alerting
    - [ ] Graceful resource shutdown
```

### Security and Compliance
```yaml
security:
  headers:
    - [ ] Security headers (Helmet.js)
    - [ ] HSTS implementation
    - [ ] Content Security Policy
    - [ ] X-Frame-Options protection
  
  access_control:
    - [ ] Rate limiting configured
    - [ ] CORS properly configured
    - [ ] Authentication middleware
    - [ ] Authorization checks
  
  compliance:
    - [ ] Audit logging enabled
    - [ ] Data privacy compliance
    - [ ] Security scanning passed
    - [ ] Vulnerability assessment complete
```

## Integration with Framework

### DRS Integration
Add production readiness to DRS calculation:

```
Production Readiness (15 points):
- All production checks pass: +15 points
- Minor production issues: +10 points
- Major production issues: +5 points
- Critical production issues: 0 points (BLOCKS DEPLOYMENT)
```

### Evidence Requirements
Production readiness becomes required evidence:

```
evidence/
├── environment-validation.json        # Environment configuration check
├── health-check-validation.json       # Health endpoint validation
├── observability-check.json           # Logging and monitoring validation
├── error-handling-validation.json     # Error handling validation
├── graceful-shutdown-test.json        # Shutdown procedure validation
└── security-headers-check.json        # Security configuration validation
```

### Deployment Gates
Production readiness issues block deployment:

```yaml
deployment_gates:
  production_readiness:
    block_on:
      - "Missing health checks"
      - "Hardcoded environment values"
      - "Unsafe error handling"
      - "No graceful shutdown"
    warn_on:
      - "Incomplete observability"
      - "Missing metrics"
    require_all:
      - "Environment validation"
      - "Security headers"
      - "Error handling"
```

## Reference Implementations

### Bash
See: `reference/bash/validate-production-readiness.sh`

### PowerShell
See: `reference/powershell/Validate-ProductionReadiness.ps1`

### Python
See: `reference/python/validate_production_readiness.py`

### Manual Checklist
See: `reference/checklists/production-readiness.md`

## Success Metrics
- Zero production incidents due to configuration issues
- Health check availability >99.9%
- Mean time to detection (MTTD) <5 minutes
- Mean time to recovery (MTTR) <15 minutes
- Security scan pass rate 100%

## Common Issues

### Issue: "Health Checks Too Complex"
**Solution**: Start with simple health checks, add complexity gradually

### Issue: "Too Much Logging Overhead"
**Solution**: Use appropriate log levels, implement log sampling for high-volume endpoints

### Issue: "Configuration Management Complexity"
**Solution**: Use configuration management tools, implement validation schemas

## Best Practices

1. **Environment Parity**: Keep development, staging, and production as similar as possible
2. **Fail Fast**: Validate configuration and dependencies on startup
3. **Graceful Degradation**: Design for partial failures and dependency outages
4. **Observability First**: Implement logging and monitoring from the beginning
5. **Security by Default**: Enable security features by default, not as an afterthought

---

**Remember**: Production readiness is not optional. A system that works in development but fails in production provides no business value.