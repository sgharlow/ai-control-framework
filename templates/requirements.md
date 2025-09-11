# REQUIREMENTS — Single Session Scope

## SESSION GOAL (ONE Thing)

- **This Session:** Make SPECIFIC TEST pass with real services
- **NOT This Session:** Any other feature or improvement

## Acceptance Test (THE One Test)

**Feature:** ONE FEATURE

**Scenario:** ONE SCENARIO
- **Given** real database is connected
- **And** real API endpoint is authenticated
- **When** SPECIFIC ACTION
- **Then** OBSERVABLE OUTCOME
- **And** evidence is captured (3 proofs)

## Out of Scope (DO NOT TOUCH)

- Performance optimization (unless blocking)
- Additional features
- Refactoring existing code
- UI improvements
- Additional test scenarios

## Definition of Deployable (This Session)

- The ONE test passes
- Using real services (no mocks)
- Contracts unchanged
- Can deploy without breaking existing features
- DRS >= 85