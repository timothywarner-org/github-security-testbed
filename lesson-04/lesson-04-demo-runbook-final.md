# Lesson 4 Demo Runbook: Security Code Review, Threat Modeling, and Auditing

**Course:** GitHub Copilot for Cybersecurity Specialists  
**Lesson:** 4 of 5  
**Duration:** 40 minutes  
**Demo code:** [timothywarner-org/github-security-testbed](https://github.com/timothywarner-org/github-security-testbed)

---

## 📋 Overview

This lesson demonstrates using GitHub Copilot Chat and GitHub Advanced Security for comprehensive security analysis workflows. You'll perform interactive code reviews, generate threat models, build custom security linters, and automate dependency vulnerability management.

**Learning Objectives:**
1. Use Copilot Chat for interactive security code reviews and STRIDE threat modeling
2. Generate automated security checklists and compliance reports from GHAS data
3. Build custom security linters for organization-specific policies
4. Automate dependency vulnerability analysis with AI-powered prioritization

---

## 🛠️ Prerequisites

### Required Tools
```bash
# Core tools
- GitHub account with Copilot subscription
- GitHub Advanced Security enabled on target repository
- VS Code with GitHub Copilot Chat extension
- Node.js 18+ and npm
- Git CLI

# Security tools
- Semgrep CLI (for custom linter demo)
- GitHub CLI (gh) for API access
- Azure CLI (for Azure config demo)

# Verify installations
node --version        # Should be v18+
npm --version
gh --version
semgrep --version
az --version
```

### Test Repository Setup
```bash
# Clone the demo repository
git clone https://github.com/timothywarner-org/github-security-testbed
cd github-security-testbed/lesson-04

# Install dependencies
npm install

# Verify GitHub CLI authentication
gh auth status

# Should see: "Logged in to github.com as <your-username>"
```

### Environment Configuration
```bash
# Set GitHub token for API access (if needed)
export GITHUB_TOKEN="your_github_token_here"

# Verify GHAS is enabled on repository
gh api repos/OWNER/REPO | jq '.security_and_analysis'

# Should show code_scanning_default_setup: "enabled"
```

---

## 🎯 Demo 1: Interactive Security Code Review with Copilot Chat

**Objective:** Demonstrate conversational security analysis finding auth/authz vulnerabilities  
**Duration:** 10 minutes  
**Files:** `demos/auth-api/server.js`, `demos/auth-api/middleware/auth.js`

### Setup (Pre-demo)

```bash
# Navigate to demo directory
cd demos/auth-api

# Install dependencies
npm install

# Verify vulnerable API runs
npm start

# Test endpoint (should return 200)
curl http://localhost:3000/api/profile -H "Authorization: Bearer test"

# Stop server (Ctrl+C)
```

### Demo Script

**Step 1: Open Copilot Chat and provide architectural context**

Open `server.js` in VS Code, then open Copilot Chat panel.

```
PROMPT 1: "I need a security code review of this Express.js API. The architecture:

- Express REST API with JWT authentication
- Role-based access control (admin, user roles)
- User profile endpoints with PII
- Deployed to Azure App Service with internet access
- Processes sensitive user data (email, profile info)

Focus on authentication and authorization vulnerabilities. Use OWASP Top 10 as framework."
```

**What Copilot Should Find:**
- JWT signature validation bypass (HS256 vs RS256 confusion)
- Missing token expiration enforcement
- Hardcoded JWT secret in code
- Authorization bypass via role manipulation
- Information disclosure in error messages

**Step 2: Drill into specific findings**

```
PROMPT 2: "Show me the JWT validation code. Does it properly verify the signature? Check for algorithm confusion vulnerabilities."
```

**Expected Response:** Copilot identifies that `jwt.verify()` is called but doesn't restrict algorithms, allowing HS256/RS256 confusion attack.

```
PROMPT 3: "Check the authorization middleware. Can a user escalate privileges by modifying the JWT payload?"
```

**Expected Response:** Copilot finds that role checking trusts JWT payload without cryptographic validation.

**Step 3: Generate STRIDE threat model**

```
PROMPT 4: "Generate a STRIDE threat model for this API architecture. Consider:
- API is internet-accessible
- Uses JWT bearer token authentication
- Stores user PII in MongoDB
- Deployed as single Azure App Service instance

Provide specific attack scenarios for each STRIDE category."
```

**Expected Output Structure:**
```
STRIDE Threat Model for Auth API

**Spoofing:**
- Attacker forges JWT tokens using HS256/RS256 algorithm confusion
- Session token theft via XSS (if tokens stored in localStorage)

**Tampering:**
- Modify JWT role claims to gain admin privileges
- Intercept and modify API requests (requires TLS validation)

**Repudiation:**
- No audit logging of authentication attempts
- User actions not associated with cryptographic identity

**Information Disclosure:**
- Error messages leak system architecture details
- JWT payload reveals user roles and permissions
- Timing attacks on authentication validation

**Denial of Service:**
- No rate limiting on authentication endpoints
- Computationally expensive JWT verification without caching

**Elevation of Privilege:**
- JWT role manipulation bypasses RBAC
- Admin endpoints accessible with forged admin tokens
```

**Step 4: Export findings as security review report**

```
PROMPT 5: "Generate a security review report in markdown format with:
- Executive summary
- Detailed findings with CWE references
- Severity ratings (Critical/High/Medium/Low)
- Remediation recommendations with code examples
- OWASP Top 10 mapping"
```

Copy the generated report and save to `security-reports/auth-api-review-2024-11.md`.

### Teaching Points

**Emphasize:**
- Architectural context is critical for accurate security analysis
- Conversational approach finds issues traditional static analysis misses
- STRIDE provides systematic framework for threat identification
- AI accelerates discovery, but human judgment validates findings

**Common Issues:**
- If Copilot gives generic advice, provide more specific architectural details
- If findings are vague, ask follow-up questions drilling into specific code paths
- If threat model is incomplete, prompt for specific STRIDE categories

---

## 🎯 Demo 2: Automated Compliance Reporting from GHAS

**Objective:** Transform GHAS vulnerability data into compliance reports  
**Duration:** 10 minutes  
**Files:** `scripts/compliance-report.js`

### Setup (Pre-demo)

```bash
# Navigate to scripts directory
cd scripts

# Install dependencies
npm install @octokit/rest dotenv

# Set environment variables
cat > .env << 'EOF'
GITHUB_TOKEN=your_github_token
REPO_OWNER=your_github_username
REPO_NAME=github-security-testbed
EOF

# Verify GHAS data is available
node fetch-ghas-data.js

# Should output JSON with CodeQL and Dependabot findings
```

### Demo Script

**Step 1: Query GHAS API for security findings**

Show the `fetch-ghas-data.js` script that queries GitHub's API:

```javascript
// fetch-ghas-data.js - Simplified for demo
const { Octokit } = require("@octokit/rest");

async function fetchSecurityAlerts() {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  // Fetch CodeQL SAST findings
  const codeqlAlerts = await octokit.codeScanning.listAlertsForRepo({
    owner: process.env.REPO_OWNER,
    repo: process.env.REPO_NAME,
    state: 'open'
  });

  // Fetch Dependabot vulnerability alerts
  const dependabotAlerts = await octokit.dependabot.listAlertsForRepo({
    owner: process.env.REPO_OWNER,
    repo: process.env.REPO_NAME,
    state: 'open'
  });

  return {
    codeql: codeqlAlerts.data,
    dependabot: dependabotAlerts.data
  };
}

// Execute and save to JSON
fetchSecurityAlerts()
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(err => console.error(err));
```

Run the script:
```bash
node fetch-ghas-data.js > ghas-findings.json
```

**Step 2: Use Copilot to generate OWASP Top 10 compliance report**

Open Copilot Chat and provide the GHAS data:

```
PROMPT 1: "Analyze this GHAS vulnerability data and generate an OWASP Top 10 compliance report.

For each finding, identify:
- Which OWASP Top 10 category it maps to
- CWE identifier
- Severity and exploitability
- Current compliance status

[Paste the first 20 lines of ghas-findings.json]

Format as markdown table with columns: Finding | OWASP Category | CWE | Severity | Status"
```

**Expected Output:**
```markdown
# OWASP Top 10 Compliance Report
**Generated:** 2024-11-16
**Repository:** github-security-testbed

| Finding | OWASP Category | CWE | Severity | Status |
|---------|----------------|-----|----------|--------|
| SQL Injection in login endpoint | A03:2021 Injection | CWE-89 | Critical | Open |
| Hardcoded JWT secret | A07:2021 Auth Failures | CWE-798 | High | Open |
| XSS in search results | A03:2021 Injection | CWE-79 | High | Open |
| Outdated lodash (CVE-2024-xxx) | A06:2021 Vulnerable Components | CWE-1035 | Medium | Open |

**Compliance Summary:**
- A03:2021 Injection: 2 critical findings, 60% remediated
- A07:2021 Identification & Authentication: 1 high finding, 0% remediated
- A06:2021 Vulnerable Components: 1 medium finding, 0% remediated
```

**Step 3: Generate executive summary with risk metrics**

```
PROMPT 2: "Transform this technical report into an executive summary for CISO review. Include:
- Total vulnerability count by severity
- Business impact assessment (focus on PII exposure, compliance risk, revenue impact)
- Estimated remediation timeline and cost
- Regulatory compliance risk (GDPR, SOC 2, PCI-DSS)
- Recommended immediate actions

Keep to one page, avoid technical jargon."
```

**Expected Output:**
```markdown
# Security Executive Summary - November 2024

## Risk Overview
**Critical Issues:** 2 requiring immediate attention
**High-Priority Issues:** 3 requiring remediation within 30 days
**Overall Risk Rating:** HIGH

## Business Impact
- **PII Exposure Risk:** SQL injection vulnerability exposes 50K customer records (GDPR Article 33 breach notification required)
- **Authentication Weakness:** Hardcoded secrets could enable account takeover affecting all 1.2M users
- **Compliance Risk:** Current posture fails SOC 2 security controls, blocking enterprise sales pipeline

## Financial Impact
- **Estimated Breach Cost:** $420K (based on 2024 IBM Cost of Data Breach Report)
- **Remediation Cost:** $15K engineering time (80 hours @ blended rate)
- **Revenue at Risk:** $2.3M enterprise deals delayed pending SOC 2 certification

## Recommended Actions
1. **Immediate (24 hours):** Rotate all secrets, deploy WAF rules blocking SQL injection
2. **This Week:** Remediate critical and high severity findings, deploy fixes to production
3. **This Month:** Complete security testing, achieve SOC 2 compliance, resume enterprise sales

**Next Review:** Weekly security meetings until risk rating reduced to MEDIUM
```

**Step 4: Automate weekly security digest via GitHub Actions**

Show the GitHub Actions workflow file:

```yaml
# .github/workflows/security-digest.yml
name: Weekly Security Digest

on:
  schedule:
    - cron: '0 9 * * 1'  # Every Monday at 9 AM UTC
  workflow_dispatch:     # Allow manual trigger

jobs:
  generate-report:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
        working-directory: ./scripts
      
      - name: Fetch GHAS findings
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: node fetch-ghas-data.js > findings.json
        working-directory: ./scripts
      
      - name: Generate compliance report with Copilot
        run: |
          # Use GitHub Copilot API to generate report
          # (This is a placeholder - actual implementation would use Copilot API)
          echo "Generating compliance report..."
      
      - name: Email security team
        uses: dawidd6/action-send-mail@v3
        with:
          server_address: smtp.gmail.com
          server_port: 465
          username: ${{ secrets.MAIL_USERNAME }}
          password: ${{ secrets.MAIL_PASSWORD }}
          subject: Weekly Security Digest - ${{ github.repository }}
          body: file://./scripts/security-report.md
          to: security-team@company.com
          from: GitHub Actions
```

Demonstrate running the workflow:
```bash
# Trigger workflow manually
gh workflow run security-digest.yml

# View workflow run
gh run list --workflow=security-digest.yml
```

### Teaching Points

**Emphasize:**
- GHAS provides data, Copilot provides intelligence and context
- Stakeholder-specific reporting (technical vs executive) drives action
- Automation enables continuous security visibility vs quarterly snapshots
- Trend data (week-over-week changes) is more actionable than point-in-time status

**Common Issues:**
- GitHub API rate limits - cache results, don't query on every request
- If Copilot mapping is inaccurate, provide OWASP/CWE reference documentation
- Executive summaries must include business impact, not just technical severity

---

## 🎯 Demo 3: Custom Security Linter for Azure Configuration

**Objective:** Build Semgrep rule detecting hardcoded Azure storage connection strings  
**Duration:** 10 minutes  
**Files:** `linters/azure-storage-auth.yml`, `test-cases/`

### Setup (Pre-demo)

```bash
# Navigate to linters directory
cd linters

# Install Semgrep
pip install semgrep

# Verify Semgrep works
semgrep --version
```

### Demo Script

**Step 1: Identify the security anti-pattern**

Show vulnerable code example:

```javascript
// BAD: Hardcoded Azure Storage connection string (CWE-798)
const connectionString = "DefaultEndpointsProtocol=https;AccountName=mystorageacct;AccountKey=abc123...";
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
```

Show secure alternative:

```javascript
// GOOD: Using DefaultAzureCredential with managed identity
const { DefaultAzureCredential } = require("@azure/identity");
const { BlobServiceClient } = require("@azure/storage-blob");

const credential = new DefaultAzureCredential();
const blobServiceClient = new BlobServiceClient(
  "https://mystorageacct.blob.core.windows.net",
  credential
);
```

**Step 2: Use Copilot to generate Semgrep rule**

Open Copilot Chat:

```
PROMPT: "Generate a Semgrep rule that detects hardcoded Azure Storage connection strings in JavaScript and TypeScript code.

The rule should:
- Match string literals containing 'AccountName=' and 'AccountKey='
- Match both single and double quotes
- Detect the pattern in variable assignments and function arguments
- Provide a clear error message explaining the security risk
- Suggest using DefaultAzureCredential instead
- Include severity level: HIGH
- Map to CWE-798 (Use of Hard-coded Credentials)

Output in Semgrep YAML format."
```

**Expected Output:**

```yaml
rules:
  - id: azure-hardcoded-storage-connection-string
    patterns:
      - pattern-either:
          - pattern: |
              "$STRING"
          - pattern: |
              '$STRING'
      - metavariable-regex:
          metavariable: $STRING
          regex: '.*AccountName=.*AccountKey=.*'
    message: |
      Hardcoded Azure Storage connection string detected (CWE-798).
      
      Connection strings contain sensitive credentials that should never be committed to code.
      
      SECURE ALTERNATIVE:
      Use DefaultAzureCredential with managed identity:
      
      const { DefaultAzureCredential } = require("@azure/identity");
      const credential = new DefaultAzureCredential();
      const blobServiceClient = new BlobServiceClient(
        "https://ACCOUNT.blob.core.windows.net",
        credential
      );
      
      Documentation: https://docs.microsoft.com/azure/storage/common/storage-auth-aad
    severity: ERROR
    languages:
      - javascript
      - typescript
    metadata:
      cwe: CWE-798
      owasp: A07:2021 - Identification and Authentication Failures
      references:
        - https://docs.microsoft.com/azure/storage/common/storage-auth-aad
        - https://cwe.mitre.org/data/definitions/798.html
```

Save to `linters/azure-storage-auth.yml`.

**Step 3: Test the rule against vulnerable and secure code**

Create test cases:

```bash
# Create test directory
mkdir -p test-cases

# Vulnerable code sample
cat > test-cases/vulnerable.js << 'EOF'
// This should trigger the Semgrep rule
const Azure = require('@azure/storage-blob');

const connectionString = "DefaultEndpointsProtocol=https;AccountName=devstore;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==";
const blobService = Azure.BlobServiceClient.fromConnectionString(connectionString);
EOF

# Secure code sample
cat > test-cases/secure.js << 'EOF'
// This should NOT trigger the Semgrep rule
const { DefaultAzureCredential } = require('@azure/identity');
const { BlobServiceClient } = require('@azure/storage-blob');

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const credential = new DefaultAzureCredential();
const blobServiceClient = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net`,
  credential
);
EOF
```

Run Semgrep tests:

```bash
# Test against vulnerable code - should find issue
semgrep --config linters/azure-storage-auth.yml test-cases/vulnerable.js

# Expected output: 1 finding detected

# Test against secure code - should pass
semgrep --config linters/azure-storage-auth.yml test-cases/secure.js

# Expected output: 0 findings
```

**Step 4: Integrate into GitHub Actions for automated enforcement**

Create GitHub Actions workflow:

```yaml
# .github/workflows/custom-security-linting.yml
name: Custom Security Linting

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  semgrep:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install Semgrep
        run: pip install semgrep
      
      - name: Run custom Azure security rules
        run: |
          semgrep --config linters/azure-storage-auth.yml \
            --config linters/azure-managed-identity.yml \
            --config linters/azure-key-vault.yml \
            --error \
            --verbose \
            --sarif \
            --output semgrep-results.sarif \
            .
      
      - name: Upload results to GitHub Security
        if: always()
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: semgrep-results.sarif
```

Demonstrate triggering the check:

```bash
# Create a branch with vulnerable code
git checkout -b test-security-linter

# Add vulnerable file
cp test-cases/vulnerable.js src/storage-client.js
git add src/storage-client.js
git commit -m "Add storage client (intentionally vulnerable for demo)"

# Push and create PR
git push origin test-security-linter
gh pr create --title "Test security linter" --body "Testing custom Semgrep rule"

# The GitHub Action should fail the build with clear error message
```

### Teaching Points

**Emphasize:**
- Custom linters catch YOUR organization's specific anti-patterns
- Generic tools (ESLint, Semgrep) can be extended for custom security policies
- Educational error messages reduce repeat violations
- Enforcement in CI prevents vulnerabilities from reaching production

**Common Issues:**
- False positives kill developer trust - test rules thoroughly before enforcement
- Semgrep regex patterns can be tricky - use Copilot to refine and test
- Integration with GitHub Security tab provides visibility across organization

---

## 🎯 Demo 4: AI-Powered Dependency Vulnerability Workflow

**Objective:** Analyze CVE exploitability and generate automated remediation PRs  
**Duration:** 10 minutes  
**Files:** `scripts/dependency-analysis.js`

### Setup (Pre-demo)

```bash
# Navigate to demo app with known vulnerable dependencies
cd ../vulnerable_repos/NodeGoat

# Install dependencies (includes vulnerable packages)
npm install

# Run Dependabot scan
gh api repos/OWNER/REPO/dependabot/alerts > dependabot-alerts.json

# You should see alerts for NodeGoat's outdated packages, such as marked and express.
```

### Demo Script

**Step 1: Fetch Dependabot alerts via GitHub API**

Show the API query script:

```javascript
// scripts/fetch-dependabot-alerts.js
const { Octokit } = require("@octokit/rest");

async function fetchDependabotAlerts() {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  
  const alerts = await octokit.dependabot.listAlertsForRepo({
    owner: process.env.REPO_OWNER,
    repo: process.env.REPO_NAME,
    state: 'open',
    severity: 'critical,high'  // Focus on critical/high only
  });
  
  return alerts.data.map(alert => ({
    number: alert.number,
    package: alert.security_advisory.package.name,
    vulnerability: alert.security_advisory.summary,
    severity: alert.security_advisory.severity,
    cve: alert.security_advisory.cve_id,
    cvss: alert.security_advisory.cvss.score,
    affectedVersions: alert.security_vulnerability.vulnerable_version_range,
    firstPatchedVersion: alert.security_vulnerability.first_patched_version?.identifier
  }));
}
```

Run and display results:

```bash
node scripts/fetch-dependabot-alerts.js | jq '.[0:3]'
```

**Example output:**
```json
[
  {
    "number": 42,
    "package": "lodash",
    "vulnerability": "Prototype Pollution in lodash",
    "severity": "high",
    "cve": "CVE-2024-1234",
    "cvss": 7.4,
    "affectedVersions": "< 4.17.21",
    "firstPatchedVersion": "4.17.21"
  },
  {
    "number": 43,
    "package": "axios",
    "vulnerability": "Server-Side Request Forgery (SSRF)",
    "severity": "critical",
    "cve": "CVE-2024-5678",
    "cvss": 9.1,
    "affectedVersions": "< 1.6.5",
    "firstPatchedVersion": "1.6.5"
  }
]
```

**Step 2: Use Copilot to assess CVE exploitability**

For the critical axios SSRF vulnerability, open Copilot Chat:

```
PROMPT: "Analyze CVE-2024-5678 (axios SSRF vulnerability) for exploitability in our context.

ARCHITECTURE CONTEXT:
- We use axios for backend API calls to trusted internal microservices
- All axios requests go to URLs constructed from environment variables
- No user input is directly passed to axios URL construction
- Application runs in Azure App Service with network isolation
- Network security groups restrict outbound traffic to known services

CVE DETAILS:
- Axios versions < 1.6.5 vulnerable to SSRF
- Attack vector: Attacker controls the URL parameter passed to axios.get/post/etc
- Impact: Attacker can make requests to arbitrary internal/external hosts

QUESTIONS:
1. Is this CVE exploitable in our architecture?
2. What is the attack path (if exploitable)?
3. What is the business impact if exploited?
4. Recommended priority: Critical/High/Medium/Low?
5. Can we delay remediation or must we patch immediately?"
```

**Expected Response:**
```markdown
EXPLOITABILITY ANALYSIS: CVE-2024-5678 (Axios SSRF)

1. **Is this exploitable?** UNLIKELY in your current architecture

2. **Attack path analysis:**
   - The vulnerability requires attacker-controlled URL input to axios calls
   - Your architecture uses URLs from environment variables, not user input
   - Network security groups limit outbound traffic
   - Attack would require:
     a) Finding a code path where user input influences env vars (unlikely)
     b) Bypassing NSG restrictions (blocked at network layer)

3. **Business impact if exploited:**
   - Potential access to internal Azure metadata service (169.254.169.254)
   - Possible exfiltration of sensitive config data
   - Lateral movement to internal services (if NSGs misconfigured)
   
4. **Recommended priority:** MEDIUM (not immediate)
   - Vulnerability exists but exploitation path is blocked
   - Defense-in-depth still warrants patching
   - Include in next normal update cycle

5. **Can we delay?** YES, within reason
   - Not an emergency patch
   - Schedule for next sprint (within 30 days)
   - Monitor for NSG changes that could widen attack surface
   
RECOMMENDATION: Include in next dependency update batch. Add detection rule
for user-influenced axios URL construction to prevent future risk.
```

**Step 3: Generate pull request with dependency upgrade and code fixes**

For a truly exploitable vulnerability, demonstrate automated PR generation:

```
PROMPT: "Generate a pull request for upgrading axios from 1.5.0 to 1.6.5.

REQUIREMENTS:
1. Update package.json and package-lock.json
2. Identify breaking changes from axios changelog
3. Update code that uses deprecated axios features
4. Add tests validating the upgrade
5. Generate PR description with:
   - Security justification (CVE reference)
   - Breaking changes summary
   - Testing performed
   - Deployment considerations

OUTPUT: Complete PR as a bash script that creates the branch, makes changes, and opens PR"
```

**Expected Output:**

```bash
#!/bin/bash
# Auto-generated PR for axios CVE-2024-5678 remediation

set -e

BRANCH="security/upgrade-axios-cve-2024-5678"
CVE="CVE-2024-5678"
ISSUE_URL="https://github.com/OWNER/REPO/security/dependabot/43"

# Create branch
git checkout -b $BRANCH

# Update axios version
npm install axios@1.6.5 --save-exact

# Run tests to catch breaking changes
npm test

# If tests pass, commit changes
git add package.json package-lock.json
git commit -m "security: upgrade axios to 1.6.5 to fix $CVE

Addresses SSRF vulnerability in axios < 1.6.5

Breaking changes:
- None that affect our usage patterns
- All existing tests pass

Testing:
- Unit tests: PASS
- Integration tests: PASS
- Manual smoke testing of API calls: PASS

Closes: $ISSUE_URL"

# Push branch
git push origin $BRANCH

# Create PR
gh pr create \
  --title "Security: Upgrade axios to fix CVE-2024-5678 (SSRF)" \
  --body "## Security Fix

**CVE:** CVE-2024-5678
**Severity:** Critical (CVSS 9.1)
**Issue:** [Dependabot Alert #43]($ISSUE_URL)

### Vulnerability
Axios versions < 1.6.5 are vulnerable to Server-Side Request Forgery (SSRF), allowing attackers to make arbitrary HTTP requests from the server.

### Fix
Upgrade axios from 1.5.0 to 1.6.5

### Breaking Changes
None identified. All existing tests pass.

### Testing Performed
- ✅ Unit tests (127 passing)
- ✅ Integration tests (43 passing)
- ✅ Manual verification of API calls
- ✅ Security scan (0 high/critical findings)

### Deployment Considerations
No configuration changes required. Safe to deploy immediately.

### Checklist
- [x] Dependencies updated
- [x] Tests passing
- [x] No breaking changes
- [x] Security scan clean
- [ ] Code review approved
- [ ] QA validation
- [ ] Ready to merge" \
  --base main \
  --head $BRANCH

echo "✅ PR created successfully"
```

Save and execute:
```bash
chmod +x scripts/create-security-pr.sh
./scripts/create-security-pr.sh
```

**Step 4: Validate fixes pass security tests before merging**

Show the GitHub Actions workflow that validates security PRs:

```yaml
# .github/workflows/security-pr-validation.yml
name: Security PR Validation

on:
  pull_request:
    branches: [main]
    types: [opened, synchronize]

jobs:
  security-validation:
    runs-on: ubuntu-latest
    if: contains(github.event.pull_request.labels.*.name, 'security')
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm test
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: CodeQL Analysis
        uses: github/codeql-action/analyze@v2
      
      - name: Dependency vulnerability scan
        run: npm audit --audit-level=high
      
      - name: Verify CVE is fixed
        run: |
          # Check that the vulnerable dependency version is no longer present
          if npm list axios@1.5.0 2>/dev/null; then
            echo "ERROR: Vulnerable axios version still present"
            exit 1
          fi
          echo "✅ Vulnerable version removed"
      
      - name: Security test suite
        run: npm run test:security
      
      - name: Auto-approve if all checks pass
        if: success()
        uses: hmarr/auto-approve-action@v3
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Teaching Points

**Emphasize:**
- Not all CVEs are exploitable in every context - architecture matters
- Exploitability analysis focuses human effort on real risks
- Automated PRs still require human validation and testing
- Security test automation provides confidence in dependency upgrades

**Common Issues:**
- Breaking changes in major version upgrades require careful testing
- False confidence in "automatic" fixes - always validate manually
- Integration test coverage is critical for safe dependency updates

---

## 📊 Metrics and Success Criteria

### Lesson Objectives Met?

**Security Code Review:**
- ✅ Demonstrated conversational security analysis finding auth/authz flaws
- ✅ Generated STRIDE threat model in < 5 minutes
- ✅ Showed 10x faster review velocity vs manual line-by-line

**Automated Compliance:**
- ✅ Transformed GHAS data into OWASP-mapped compliance report
- ✅ Generated executive risk summary with business impact
- ✅ Automated weekly security digest via GitHub Actions

**Custom Linters:**
- ✅ Built Semgrep rule for Azure hardcoded credential detection
- ✅ Integrated into CI pipeline for enforcement
- ✅ Demonstrated educational error messages reducing repeat violations

**Dependency Management:**
- ✅ Analyzed CVE exploitability in architectural context
- ✅ Generated intelligent upgrade path with breaking change analysis
- ✅ Created automated PR with comprehensive testing validation

### Key Demonstrations

**Demonstrated:**
1. **Security Code Review:** Conversational analysis identifying auth/authz vulnerabilities
2. **Threat Modeling:** STRIDE analysis generating comprehensive threat models in minutes
3. **Security Auditing:** Automated compliance validation across Azure infrastructure
4. **Dependency Management:** Intelligent vulnerability prioritization and automated remediation

**Reusable Artifacts:**
- Security review prompts and report templates
- STRIDE threat model framework
- Azure audit automation scripts
- Vulnerability analysis and PR generation patterns

---

## 🎯 Key Messages

**Main Takeaway 1:** Copilot Chat enables interactive security analysis at scale - 10x review velocity without compromising quality.

**Main Takeaway 2:** Threat modeling automation produces comprehensive models in minutes vs days of traditional workshops.

**Main Takeaway 3:** Automated auditing provides continuous compliance visibility vs annual point-in-time assessments.

**Force Multiplier:** "Security teams using AI-assisted review analyze 10x more code without 10x more people."

---

## 🎓 Resources

**Course repository:** [github-copilot-cybersecurity-professionals](https://github.com/timothywarner-org/github-copilot-cybersecurity-professionals)
- Security review templates
- Threat modeling frameworks
- Audit automation scripts
- Custom linter examples
- Vulnerability analysis prompts

**Next Lesson:** Lesson 5 covers compliance automation, incident response, and configuration management.

---

## 💡 Pro Tips for Recording

### Timing
- Code review demo: 10 min (show 2-3 key findings, not every issue)
- Threat modeling: 10 min (show STRIDE analysis, don't read entire output)
- Security audit: 10 min (execute script, show critical findings only)
- Dependency management: 10 min (show prioritization logic, sample PR)

### Copilot Chat Tips
- Start with clean chat history
- Use specific architectural context in prompts
- Show iterative refinement (follow-up questions)
- Demonstrate copy/paste to GitHub for integration

### Common Issues
- If Copilot verbose: Ask for "concise summary"
- If analysis generic: Add more architectural context
- If audit script errors: Verify Azure CLI authentication

### Remember Tim's Voice
- First-principles security explanations
- Real-world breach examples and lessons learned
- Skeptical about automation replacing judgment
- Focus on practical ROI and metrics

---

**End of Demo Runbook**
