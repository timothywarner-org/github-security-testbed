# GitHub Copilot for Cybersecurity Specialists - Lesson 3: Automated Security Testing
**Runtime: 40 minutes | Demo-heavy security testing**
**Environment: VS Code + GitHub Enterprise Cloud + Azure (optional)**

---

## 🎯 Lesson Overview

This lesson demonstrates using GitHub Copilot and GitHub Advanced Security (GHAS) to generate comprehensive automated security testing covering unit tests, fuzz testing, SAST/DAST workflows, and CI/CD security gates.

**Key Message:** Transform security testing from weeks of manual work to minutes of AI-assisted automation while maintaining enterprise-grade quality.

---

## ⚠️ Pre-Demo Checklist

**A day before you start:**
- [ ] Test all 4 demo flows end-to-end
- [ ] Verify Copilot authentication and quota
- [ ] Backup screenshots of expected Copilot outputs
- [ ] Clone course repository: `git clone https://github.com/timothywarner-org/github-security-testbed`

**Right before you start:**
- [ ] Start demo environment services
- [ ] Open VS Code with demo workspace
- [ ] Clear terminal history for clean recording
- [ ] Verify GitHub Copilot extension active
**Immediately Before:**
- [ ] Close distracting apps (Slack, email)
- [ ] Disable all notifications
- [ ] Set Copilot to high verbosity mode
- [ ] Deep breath - you got this

---

## 🎬 Demo 1: OAuth Authentication Test Suite Generation
**Time: 10 minutes | Learning Objective: Generate comprehensive security unit tests**

### Pre-Demo Setup (1 min)
```bash
cd github-security-testbed/lesson-03/demo-01-oauth-tests
ls -la  # Show auth_server.py OAuth implementation
code auth_server.py  # Open in VS Code
```

### Demo Flow

#### Step 1: Show OAuth Implementation (1 min)
Open `auth_server.py` showing OAuth implementation with:
- Token generation (JWT signing)
- Token validation (signature verification)
- Token expiration enforcement
- Refresh token rotation
- Scope-based authorization

**Talking Points:**
- "This is our OAuth authentication server from Lesson 2"
- "It handles authentication, authorization, token management"
- "We need comprehensive security tests validating all these security properties"
- "Writing these manually would take days - let's use Copilot"

#### Step 2: Generate Test Suite with Copilot (3 min)
Open Copilot Chat (Ctrl+Shift+I / Cmd+Shift+I)

**Copilot Prompt:**
```
Generate pytest security test suite for OAuth 2.0 implementation in auth_server.py. Include tests for:

1. Valid authentication flow (proper credentials return valid tokens)
2. Invalid credentials (authentication fails, no tokens returned)
3. Token expiration (expired tokens rejected)
4. Malformed tokens (invalid signature, structure, claims)
5. Refresh token rotation (old refresh token invalidated after use)
6. Scope enforcement (limited scope tokens can't access privileged resources)
7. Authorization code replay attacks (reusing auth codes fails)

Use pytest fixtures for database setup and teardown. Include proper async/await handling. Add comprehensive docstrings explaining what each test validates.
```

**Expected Copilot Response:**
- Generates complete test file with 40+ test cases
- Creates pytest fixtures for test isolation
- Includes async/await for authentication flows
- Comprehensive docstrings explaining security validation

**Talking Points:**
- "Watch Copilot analyze OAuth implementation and generate tests"
- "It understands OAuth security patterns from millions of open source test suites"
- "Generates both positive flows (valid auth succeeds) and negative flows (attacks fail)"
- "Includes test fixtures, async handling, proper assertions"

#### Step 3: Refine Specific Test (2 min)
Review generated `test_refresh_token_rotation` - notice it doesn't verify old token invalidation.

**Copilot Prompt:**
```
Update test_refresh_token_rotation to verify old refresh token becomes invalid after use and attempting to reuse it raises InvalidTokenError. This prevents token replay attacks.
```

**Expected Copilot Response:**
- Modifies test to attempt old token reuse
- Asserts old token rejection with proper error

**Talking Points:**
- "The beauty of Copilot is iterative refinement"
- "I noticed a gap - old token reuse not validated"
- "One targeted prompt fixes that specific security requirement"
- "This is how you build production-quality security tests"

#### Step 4: Execute Tests and GHAS Validation (3 min)
```bash
# Run test suite
pytest test_auth_server.py -v --cov=auth_server --cov-report=term-missing

# Expected output: 40+ tests passing, 95% coverage

# Commit for GHAS scanning
git add test_auth_server.py
git commit -m "Add comprehensive OAuth security test suite"
git push origin main
```

Navigate to GitHub → Actions → Show CodeQL scanning test code

**Talking Points:**
- "All 40 tests pass - comprehensive OAuth security validation"
- "95% code coverage of authentication logic"
- "GHAS scans our test code itself - tests can have vulnerabilities too"
- "CodeQL validates: no hardcoded secrets, no SQL injection in test setup, proper cleanup"
- "We generated production-quality security tests in 10 minutes vs days manually"

**Key Takeaway:** Copilot democratizes security testing expertise - generate comprehensive test suites from natural language prompts.

---

## 🎬 Demo 2: Input Validation Fuzzing Harness
**Time: 10 minutes | Learning Objective: Create fuzzing harnesses for vulnerability discovery**

### Pre-Demo Setup (1 min)
```bash
cd github-security-testbed/lesson-03/demo-02-fuzzing
ls -la  # Show api_validator.c JSON parser
code api_validator.c  # Open in VS Code
```

### Demo Flow

#### Step 1: Show Vulnerable Code (1 min)
Open `api_validator.c` showing JSON parser with recursion depth bug.

**Talking Points:**
- "This JSON parser processes API requests"
- "It has a vulnerability we don't know about yet - fuzzing will find it"
- "Real vulnerability: recursion depth not enforced correctly"
- "Manual testing never triggers this - fuzzing will discover it automatically"

#### Step 2: Generate libFuzzer Harness (3 min)
**Copilot Prompt:**
```
Generate libFuzzer harness for JSON parser in api_validator.c targeting parse_json_request() function. Include:

1. Harness code with LLVMFuzzerTestOneInput entry point
2. Compilation instructions with AddressSanitizer enabled
3. Initial seed corpus with 10 diverse JSON structures:
   - Empty objects
   - Deeply nested objects (20+ levels)
   - Large arrays (1000+ elements)
   - Strings with special characters
   - Unicode edge cases
   - Maximum-size payloads
4. Shell script to execute fuzzing with 4GB memory limit and 60 second timeout
```

**Expected Copilot Response:**
- `fuzz_json_parser.c` with proper libFuzzer interface
- `build_fuzzer.sh` with compilation flags
- `corpus/` directory with 10 seed files
- `run_fuzzer.sh` execution script

**Talking Points:**
- "Copilot generates everything needed for production fuzzing"
- "libFuzzer harness with proper entry point"
- "AddressSanitizer detects memory corruption immediately"
- "Seed corpus with diverse inputs helps fuzzing find bugs faster"

#### Step 3: Execute Fuzzing (2 min)
```bash
# Compile fuzzer
chmod +x build_fuzzer.sh
./build_fuzzer.sh

# Start fuzzing (show pre-recorded results for demo speed)
./run_fuzzer.sh

# After 2 hours (simulated), show crash output:
```

**Show Crash Output:**
```
=================================================================
==12345==ERROR: AddressSanitizer: heap-buffer-overflow
    #0 parse_json_internal api_validator.c:87
    #1 parse_json_internal api_validator.c:92 (recursive)
    ... [50+ stack frames showing deep recursion] ...
    #52 parse_json_request api_validator.c:45

SUMMARY: AddressSanitizer: heap-buffer-overflow
```

**Talking Points:**
- "libFuzzer discovered heap buffer overflow through systematic input exploration"
- "AddressSanitizer caught memory corruption immediately when it occurred"
- "50+ recursion frames - deeply nested JSON exhausted stack"
- "Real vulnerability that manual testing missed, fuzzing found automatically"
- "This could allow attackers denial-of-service or potentially remote code execution"

#### Step 4: Generate GitHub Actions Continuous Fuzzing (3 min)
**Copilot Prompt:**
```
Create GitHub Actions workflow that runs this libFuzzer harness for 6 hours nightly, reports crashes as GitHub Issues with 'security' and 'critical' labels, uploads crash artifacts, and preserves corpus between runs.
```

**Expected Copilot Response:**
- `.github/workflows/fuzz.yml` with scheduled trigger
- Crash artifact upload on failure
- Automated issue creation on crash
- Corpus persistence across runs

**Talking Points:**
- "Continuous fuzzing in CI/CD - security validation runs automatically"
- "Every night, 6-hour fuzzing campaigns discover new vulnerabilities"
- "Crashes automatically filed as GitHub Issues for security team"
- "Corpus persists and improves over time - continuous security improvement"
- "Bottom line: Copilot turns fuzzing from research project into production practice"

**Key Takeaway:** Copilot generates complete fuzzing infrastructure discovering vulnerabilities that code review and static analysis miss.

---

## 🎬 Demo 3: CodeQL SAST + Dependency Scanning Workflow
**Time: 10 minutes | Learning Objective: Automate SAST/DAST with comprehensive scanning**

### Pre-Demo Setup (1 min)
```bash
cd github-security-testbed/lesson-03/demo-03-sast-dast
ls -la  # Show Node.js application
code src/api/search.js  # Open vulnerable code
```

### Demo Flow

#### Step 1: Show Vulnerable Application (1 min)
Open `src/api/search.js` showing SQL injection:

```javascript
export async function searchUsers(req, res) {
    const searchQuery = req.query.q;
    // VULNERABILITY: Unsanitized user input in SQL query
    const sql = `SELECT * FROM users WHERE name LIKE '%${searchQuery}%'`;
    const results = await db.query(sql);
    res.json(results);
}
```

**Talking Points:**
- "Classic SQL injection - unsanitized user input in query"
- "Also have outdated dependencies with known CVEs"
- "Let's generate automated scanning to catch these automatically"

#### Step 2: Generate Security Scanning Workflow (3 min)
**Copilot Prompt:**
```
Generate GitHub Actions workflow that performs comprehensive security scanning:

1. CodeQL SAST for JavaScript/TypeScript covering SQL injection, XSS, auth bypasses, crypto weaknesses
2. npm dependency scanning using npm audit
3. GitHub secret scanning
4. Configure workflow to:
   - Run on all pull requests
   - Run weekly on schedule (Sunday 2 AM)
   - Fail builds if critical or high severity vulnerabilities detected
   - Create GitHub Security Advisory for findings
5. Use security-extended CodeQL query pack for deeper analysis
6. Generate SARIF reports for all tools
```

**Expected Copilot Response:**
- Complete `.github/workflows/security-scan.yml`
- Multiple jobs: CodeQL, dependency scan, secret scan
- Policy enforcement (fail on critical/high)
- SARIF upload to Security Overview

**Talking Points:**
- "Copilot generates production-grade scanning workflow"
- "CodeQL SAST, dependency scanning, secret scanning orchestrated"
- "security-extended query pack catches 30% more vulnerabilities"
- "Policy enforcement: fail critical/high, track medium/low"

#### Step 3: Commit and Trigger Scan (2 min)
```bash
git add .github/workflows/security-scan.yml
git commit -m "Add comprehensive security scanning workflow"
git push origin main
```

Navigate to GitHub → Actions → Show workflow executing

**Talking Points:**
- "Workflow executing all security scans in parallel"
- "CodeQL analyzing JavaScript/TypeScript"
- "Dependency scan checking for CVEs"
- "Secret scan examining commits for credentials"

#### Step 4: Review Findings in Security Overview (3 min)
Navigate to Repository → Security → Overview

**Show findings:**
- 3 CodeQL alerts (SQL injection, XSS, auth bypass)
- 2 Dependabot alerts (Express, Axios CVEs)

Click SQL injection alert showing:
- Dataflow analysis (user input → SQL query)
- Attack scenario explanation
- Recommended fix (parameterized queries)
- Example secure code

**Copilot Fix:**
In vulnerable code, prompt: "Fix this SQL injection using parameterized queries"

Copilot generates:
```javascript
const sql = 'SELECT * FROM users WHERE name LIKE ?';
const results = await db.query(sql, [`%${searchQuery}%`]);
```

**Talking Points:**
- "CodeQL's dataflow analysis traces untrusted input to dangerous sink"
- "Not just pattern matching - understands data flow through application"
- "Actionable remediation with example code"
- "Fix, commit, rescan - automated validation"
- "Mean time to remediate drops from weeks to hours with automated scanning"

**Key Takeaway:** GHAS Security Overview provides enterprise-scale vulnerability management with centralized visibility and actionable remediation guidance.

---

## 🎬 Demo 4: Complete CI/CD Security Pipeline
**Time: 10 minutes | Learning Objective: Build security gates enforcing policy in CI/CD**

### Pre-Demo Setup (1 min)
```bash
cd github-security-testbed/lesson-03/demo-04-cicd-pipeline
code .  # Open deployment pipeline workspace
```

### Demo Flow

#### Step 1: Explain Deployment Requirements (1 min)
**Talking Points:**
- "Need deployment pipeline deploying in under 15 minutes"
- "Must enforce strict security: tests pass, no critical/high vulns, compliance met"
- "Security gates block deployment if criteria not met"
- "Approval workflow for legitimate exceptions"
- "Let's generate complete production pipeline"

#### Step 2: Generate Complete Pipeline (3 min)
**Copilot Prompt:**
```
Generate GitHub Actions deployment pipeline for Node.js web application deploying to Azure App Service with mandatory security gates:

1. Security test suite must pass with 100% pass rate and 85% code coverage
2. CodeQL SAST must find 0 critical/high vulnerabilities
3. Dependency scanning must find 0 critical CVEs
4. STIG compliance checks must pass
5. Manual security approval required for any gate failures
6. Deploy to Azure staging slot, run smoke tests, swap to production
7. Automatic rollback on failure

Include: multi-stage pipeline, job dependencies, policy enforcement, approval workflow, Azure deployment with slot swap.
```

**Expected Copilot Response:**
- Complete multi-stage `.github/workflows/deploy.yml`
- 5 gate stages: tests, SAST, dependencies, compliance, deploy
- Approval workflow for gate failures
- Azure deployment with staging/production slots

**Talking Points:**
- "Enterprise-grade pipeline - five security gate stages"
- "Each stage has explicit pass/fail criteria"
- "Gate failures block deployment and notify security team"
- "Only when all gates pass does deployment proceed automatically"

#### Step 3: Test Pipeline with Vulnerability (2 min)
Introduce SQL injection, commit, push:
```bash
# Modify src/api/search.js to have SQL injection
git add src/api/search.js
git commit -m "Update search API"
git push origin main
```

Show workflow execution → SAST gate fails

**Show failure output:**
```
SAST Scan Results
═══════════════════
Critical: 0
High: 1 (SQL Injection in search.js:23)

❌ SAST gate FAILED
Blocking deployment to production
```

**Show GitHub Issue created:**
```
Title: [Security Gate Failure] Production deployment blocked

Gate Results:
- Security Tests: ✅ success
- SAST Scan: ❌ failure (1 high severity vulnerability)
- Dependency Scan: ✅ success
- Compliance Check: ✅ success

Required Action: Review and fix SQL injection before deployment

@security-team
```

**Talking Points:**
- "Security gate caught SQL injection and blocked deployment"
- "Instead of shipping vulnerability to production, pipeline creates security review"
- "Deployment completely blocked until fix or manual approval"
- "This is continuous security validation at work"

#### Step 4: Fix and Successful Deployment (3 min)
Fix SQL injection with Copilot, commit, push:
```bash
# Copilot fixes vulnerability with parameterized query
git add src/api/search.js
git commit -m "Fix SQL injection using parameterized queries"
git push origin main
```

Show successful pipeline:
```
Security Gate Summary
═══════════════════════
✅ Security Tests: PASSED (100%, 92% coverage)
✅ SAST Scan: PASSED (0 critical/high)
✅ Dependency Scan: PASSED (0 critical CVEs)
✅ Compliance Check: PASSED (STIG compliant)

All gates passed - proceeding to deployment

Deployment:
  ✓ Deployed to staging
  ✓ Smoke tests passed
  ✓ Swapped to production
  ✓ Health check passed

✅ Deployment complete in 12 minutes
```

**Talking Points:**
- "All security gates pass - automatic deployment proceeds"
- "Deploy to staging, smoke test, swap to production, verify health"
- "12 minutes commit-to-production when gates pass"
- "Zero critical vulnerabilities reached production in 6 months using this pattern"
- "Bottom line: Automated security gates enforce policy without manual review bottlenecks"

**Key Takeaway:** Security gates transform security from deployment bottleneck into automated enforcement maintaining both velocity and security.

---

## 📋 Lesson Summary

**What We Demonstrated:**
1. **Security Unit Tests:** Generated 40+ OAuth tests in minutes vs days manually
2. **Fuzzing:** Discovered heap overflow through automated input exploration
3. **SAST/DAST:** Comprehensive scanning catching SQL injection, CVEs, exposed secrets
4. **Security Gates:** CI/CD pipeline blocking vulnerable deployments automatically

**Key Security Concepts:**
- Test generation from natural language prompts
- Coverage-guided fuzzing with sanitizers
- Dataflow analysis detecting complex vulnerabilities
- Policy enforcement through automated gates
- Defense-in-depth with multiple validation layers

**Reusable Artifacts Created:**
- OAuth security test suite template
- libFuzzer harness pattern
- CodeQL scanning workflow
- Complete CI/CD security pipeline

---

## 🎯 Key Messages

**Main Takeaway 1:** Copilot democratizes security testing expertise - generate production-quality tests without being a security expert.

**Main Takeaway 2:** Automated security testing finds vulnerabilities that manual review and normal testing miss through systematic exploration.

**Main Takeaway 3:** Security gates enforce policy automatically, transforming security from deployment bottleneck into continuous validation.

**Force Multiplier Message:** "Security teams using these patterns test 10x more code without 10x more people. Copilot augments security expertise, GHAS provides enterprise orchestration."

---

## 🎓 Student Resources

**Course repository:** [github-copilot-cybersecurity-professionals](https://github.com/timothywarner-org/github-copilot-cybersecurity-professionals)
- All demonstration code
- Security test templates
- Fuzzing harness examples
- GitHub Actions workflows
- Copilot prompt library

**Next Lesson Preview:** Lesson 4 covers security code review, threat modeling, and automated auditing with Copilot.

---

## 💡 Pro Tips for Recording

**Timing Management:**
- OAuth demo: 10 min (don't read all generated code)
- Fuzzing demo: 10 min (use pre-recorded fuzzing results)
- SAST demo: 10 min (commit workflow early so scan completes)
- Pipeline demo: 10 min (have pre-failed run ready)

**Common Copilot Issues:**
- If Copilot slow: Have backup screenshots ready
- If Copilot suggests wrong framework: Refine prompt with specific framework
- If tests fail unexpectedly: Show debugging process (it's educational)

**Engagement Opportunities:**
- After OAuth demo: "Has anyone generated security tests with Copilot?"
- After fuzzing: "How many here have implemented fuzzing? What barriers?"
- After SAST: "What's your current mean time to remediate critical vulns?"
- After pipeline: "What security gates would your organization prioritize first?"

**Remember Tim's Voice:**
- Feynman-style first principles explanations
- Engineering precision without academic stuffiness
- Real-world grounding with enterprise examples
- Skeptical optimism about AI capabilities
- Bottom-line: practical takeaways over theory

**CRITICAL:** Always explain WHY not just WHAT. Students need to understand attacker perspective to build effective defenses.

---

**End of Demo Runbook**
