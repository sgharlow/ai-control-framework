# Contract Integrity - Manual Checklist

## When to Use This Checklist
Use this manual process when automated scripts cannot run in your environment.

## Pre-Check Setup
- [ ] Identify all contract files in your project:
  - [ ] API specifications (OpenAPI, GraphQL schemas)
  - [ ] Database schemas (SQL, migrations)
  - [ ] Interface definitions (TypeScript, protobuf)
  - [ ] Configuration schemas

## First Time Check (Baseline Creation)

### Step 1: Document Current Contracts
- [ ] List all contract files with paths
- [ ] Note last modified date for each
- [ ] Take screenshot or copy content
- [ ] Save as "contract-baseline-[DATE].txt"

Example format:
```
Contract Baseline - 2024-01-15
================================
api/openapi.yaml - Modified: 2024-01-15 09:00
database/schema.sql - Modified: 2024-01-14 15:30
proto/user.proto - Modified: 2024-01-10 11:00
```

## Subsequent Checks

### Step 2: Compare Against Baseline
For each contract file:
- [ ] Check if file still exists
- [ ] Compare last modified date with baseline
- [ ] If date changed, note what changed

### Step 3: Evaluate Changes

If any contracts changed:
- [ ] Was change intentional?
- [ ] Was change documented?
- [ ] Was change approved (CCR process)?
- [ ] Are dependent systems notified?

## Decision Tree

```
Contract changed?
├─ NO → ✅ Continue working
└─ YES → Was it approved?
    ├─ YES → Update baseline and continue
    └─ NO → ⛔ STOP - Need approval first
```

## Recording Results

Document your check:
```
Contract Check - [DATE TIME]
============================
Checked by: [Your name]
Result: PASS/FAIL
Changed files: [List any]
Action taken: [What you did]
```

## Red Flags (STOP if you see these)
- [ ] API endpoint signatures changed
- [ ] Database column types changed
- [ ] Required fields became optional
- [ ] Field names changed
- [ ] Data types changed
- [ ] Breaking changes without version bump

## Green Flags (OK to proceed)
- [ ] All contracts unchanged
- [ ] Only additive changes (new optional fields)
- [ ] Changes have CCR approval number
- [ ] Version numbers properly bumped

## Contract Change Request (CCR) Process

If you must change a contract:

1. **Document the Change**
   - [ ] What is changing
   - [ ] Why it must change
   - [ ] Who is affected
   - [ ] Migration plan

2. **Get Approval**
   - [ ] Technical review completed
   - [ ] Stakeholders notified
   - [ ] Approval documented
   - [ ] CCR number assigned

3. **Update Baseline**
   - [ ] Create new baseline file
   - [ ] Document CCR number
   - [ ] Notify team of change

## Quick Reference

**Files to Check:**
```bash
# Common contract locations
api/*.yaml
api/*.yml
database/*.sql
schema/*.json
proto/*.proto
graphql/*.graphql
types/*.d.ts
```

**What Constitutes a Breaking Change:**
- Removing a field
- Changing a field type
- Making optional field required
- Changing endpoint path
- Changing method (GET → POST)
- Changing response structure

## Tips for Manual Checking

1. **Use Version Control**
   - `git diff api/openapi.yaml` shows changes
   - `git log -1 database/schema.sql` shows last change

2. **Use File Comparison Tools**
   - VS Code: Compare with clipboard
   - Notepad++: Compare plugin
   - Online: Diffchecker.com

3. **Create a Routine**
   - Check at session start
   - Check before commits
   - Check before deployment

## Sign-Off

By completing this checklist, I confirm:
- [ ] All contracts have been reviewed
- [ ] Any changes are intentional and approved
- [ ] The baseline is updated if needed
- [ ] Team is aware of any changes

Checker: _________________ Date: _________________ Time: _________________

---

Remember: The goal is not to prevent changes, but to make them intentional and communicated.