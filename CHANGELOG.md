# Changelog

All notable changes to the AI Control Framework will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-01-06

### Added
- **Deployability Rating Score (DRS)** - 100-point scoring system with 13 components for measuring AI code quality
- **QUICK-WIN-DEMO.md** - 5-minute proof-of-value demonstration
- **Web Dashboard** - DRS history tracking with Supabase persistence
- **Pro Tier Features**:
  - Dashboard analytics with interactive charts
  - Usage limits component
  - Subscription management UI
  - Team management with member invites and roles
  - Google Analytics integration
- **Stripe Integration** - Checkout flow and webhook handlers for Pro tier
- **Pricing Page** - Comparison table, FAQ, and social proof
- **Blog Post** - "Why 95% of AI Projects Fail" with market-validated stats
- **MCP Server** - Model Context Protocol server for framework integration
- **136 Integration Tests** - 100% test coverage across all components

### Changed
- Polished README with badges, marketing copy, and visual examples
- Enhanced documentation with implementation guides
- Updated landing pages with failure statistics (95%/42% data points)

### Framework Components (all at v2.0)
1. Contract Integrity (7 points)
2. Behavioral Contracts (7 points)
3. Security Validation (16 points)
4. Data Integrity (9 points)
5. No Mocks (7 points)
6. Tests Passing (7 points)
7. Integration Evidence (9 points)
8. Architecture Stability (7 points)
9. Production Readiness (14 points)
10. Context Preservation (7 points)
11. Error Handling (4 points)
12. Scope Compliance (4 points)
13. Documentation (2 points)

### Technical Highlights
- 30-minute mock timeout enforcement
- Contract freezing mechanism
- Hard limits: 5 files, 200 LOC per session
- Time-based convergence gates
- Evidence capture requirements

## [1.0.0] - 2025-12-01

### Added
- Initial framework release
- Basic DRS calculation
- Template system
- Pattern library
- Reference implementations (Bash, PowerShell, Python)
- Manual checklists

---

For more information, see the [README](README.md) and [ROADMAP-2025](ROADMAP-2025.md).
