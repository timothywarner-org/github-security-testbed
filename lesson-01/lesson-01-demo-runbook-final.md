# GitHub Copilot for Cybersecurity Specialists
## Lesson 01 Demo Runbook

**Course:** GitHub Copilot for Cybersecurity Specialists
**Lesson:** 01 - Vulnerability Detection with GitHub Copilot
**Total Demo Runtime:** 40 minutes
**Execution Context:** VS Code + GitHub Copilot + Node.js/React environments
**Demo code:** [timothywarner-org/github-security-testbed](https://github.com/timothywarner-org/github-security-testbed)

---

## 🎬 Pre-Demo Environment Setup

**Required Software:**
- VS Code (latest stable)
- GitHub Copilot extension
- GitHub Copilot Chat extension
- Node.js 20.x LTS
- npm/yarn
- Git

**Repository Structure:**
```bash
git clone https://github.com/timothywarner-org/github-security-testbed
cd github-security-testbed/lesson-01
ls -la

# Expected structure:
lesson-01/
├── demo-01-configuration/
│   ├── .vscode/
│   │   └── settings.json
│   └── README.md
├── demo-02-sql-injection/
│   ├── vulnerable/
│   │   └── api.js
│   ├── secure/
│   │   └── api.js
│   └── tests/
│       └── sql-injection.test.js
├── demo-03-xss/
│   ├── vulnerable-react-app/
│   ├── secure-react-app/
│   └── tests/
├── demo-04-custom-scanners/
│   ├── idor-app/
│   ├── scanner/
│   └── reports/
└── prompts/
    ├── sql-detection.md
    ├── xss-scanning.md
    └── custom-scanner.md
```

**Pre-Demo Checklist:**
- [ ] VS Code open with clean workspace
- [ ] GitHub Copilot signed in and active
- [ ] Node.js version verified (`node --version`)
- [ ] All vulnerable sample apps tested locally
- [ ] Browser DevTools ready for XSS demo
- [ ] Copilot Chat panel open but minimized

---

## 🎬 Demo 1: Configuring GitHub Copilot for Security
**Runtime: 8 minutes**

### Learning Objective
Set up Copilot for security tasks and secure coding best practices

### Demo Flow

#### 1.1: Install Security Extensions (2 min)
```bash
# Show VS Code Extensions panel
# Install GitHub Advanced Security extension
# Install Semgrep extension (if available)
# Show extension list
code --list-extensions | grep -i security
```

**Talking Points:**
- "Out of the box, Copilot optimizes for velocity. We need security-specific extensions."
- "GitHub Advanced Security integrates CodeQL scanning directly into your IDE."
- "These extensions teach Copilot about OWASP patterns in real-time."

#### 1.2: Configure Workspace Settings (3 min)
```json
// .vscode/settings.json
{
  "github.copilot.enable": {
    "*": true,
    "yaml": true,
    "markdown": true,
    "json": true
  },
  "github.copilot.advanced": {
    "securitySuggestions": true,
    "inEditorSuggestions": {
      "filterBySecurity": true
    }
  },
  "editor.suggest.preview": true,
  "editor.inlineSuggest.enabled": true
}
```

**Copilot Prompt to Use:**
```
Help me configure VS Code workspace settings for security-focused development.
I want Copilot to prefer parameterized queries, input validation, and secure
defaults. Show me settings.json configuration.
```

**Talking Points:**
- "Workspace settings = project-level Copilot behavior"
- "Check these into version control - everyone gets secure Copilot by default"
- "Configuration as code prevents configuration drift"

#### 1.3: Integrate SAST/DAST Tools (2 min)
```bash
# Install Semgrep
npm install -g semgrep

# Run initial scan
semgrep --config auto .

# Show results in VS Code Problems panel
```

**Copilot Chat Prompt:**
```
How do I integrate Semgrep with my Node.js project for continuous
security scanning? Show me package.json scripts and CI/CD integration.
```

**Talking Points:**
- "Copilot augments your existing tools, doesn't replace them"
- "Use Copilot Chat to interpret SAST findings - 'Why is this flagged?'"
- "The beauty: Copilot explains security tool output in plain English"

#### 1.4: Validate Configuration (1 min)
```javascript
// Create test file: vulnerable-pattern-test.js
const query = "SELECT * FROM users WHERE id = " + userId;  // Intentionally vulnerable

// Ask Copilot to identify the vulnerability
```

**Copilot Chat Prompt:**
```
Analyze this code for SQL injection vulnerabilities. Explain the attack vector
and show me the secure alternative.
```

**Expected Behavior:**
- Copilot should identify the vulnerability
- Should suggest parameterized query alternative
- Configuration is working if security-aware suggestions appear

**Key Message:**
"If Copilot doesn't catch this, your configuration needs refinement. Test, iterate, improve."

---

## 🎬 Demo 2: SQL Injection Detection and Remediation
**Runtime: 10 minutes**

### Learning Objective
Identify and mitigate SQL injection vulnerabilities in code

### Demo Flow

#### 2.1: Identify Vulnerable Pattern (3 min)
```javascript
// demo-02-sql-injection/vulnerable/api.js
const express = require('express');
const mysql = require('mysql2');
const app = express();

const db = mysql.createConnection({
  host: 'localhost',
  user: 'demo',
  password: 'demo',
  database: 'testdb'
});

// VULNERABLE ENDPOINT
app.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  // String concatenation = SQL injection vulnerability
  const query = `SELECT * FROM users WHERE id = ${userId}`;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.listen(3000, () => console.log('API running on port 3000'));
```

**Copilot Chat Prompt:**
```
Analyze this Express API endpoint for SQL injection vulnerabilities.
Show me:
1. The vulnerable line
2. How an attacker would exploit it
3. Example malicious payloads
4. Why string concatenation is dangerous
```

**Expected Copilot Response:**
- Identifies line with string concatenation
- Explains attacker could inject `1 OR 1=1`
- Shows how to bypass authentication
- Explains SQL parser interprets injected SQL as code

**Talking Points:**
- "Classic vulnerability - still #1 on OWASP 2024"
- "Copilot shows us not just WHERE, but HOW to exploit"
- "Understanding the attack makes you a better defender"

#### 2.2: Refactor to Parameterized Query (3 min)
```javascript
// demo-02-sql-injection/secure/api.js
app.get('/user/:id', (req, res) => {
  const userId = req.params.id;

  // Parameterized query - SQL injection safe
  const query = 'SELECT * FROM users WHERE id = ?';

  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
```

**Copilot Prompt:**
```
Refactor this vulnerable SQL query to use parameterized queries with
prepared statements. Show both vulnerable and secure versions side by side.
```

**Talking Points:**
- "Parameter binding = SQL treats user input as data, not code"
- "Database driver handles escaping automatically"
- "Notice the array syntax [userId] - that's the magic"

#### 2.3: Generate Security Tests (3 min)
```javascript
// demo-02-sql-injection/tests/sql-injection.test.js
const request = require('supertest');
const app = require('../secure/api');

describe('SQL Injection Prevention', () => {
  test('should reject SQL injection attempt with OR 1=1', async () => {
    const maliciousPayload = "1 OR 1=1";
    const response = await request(app)
      .get(`/user/${maliciousPayload}`);

    // Should not return all users
    expect(response.body.length).not.toBeGreaterThan(1);
  });

  test('should reject union-based injection', async () => {
    const maliciousPayload = "1 UNION SELECT * FROM passwords";
    const response = await request(app)
      .get(`/user/${maliciousPayload}`);

    expect(response.status).not.toBe(200);
  });
});
```

**Copilot Prompt:**
```
Generate security unit tests for this API that attempt SQL injection.
Include common payloads: OR 1=1, UNION SELECT, comment injection.
Tests should pass if injection fails (meaning our protection works).
```

**Talking Points:**
- "Fix isn't enough - prove it's fixed and prevent regression"
- "Security tests in CI pipeline = continuous validation"
- "If these tests pass, injection is blocked"

#### 2.4: Build Reusable Detection Prompt (1 min)
```markdown
# prompts/sql-detection.md

## SQL Injection Detection Prompt

Scan this codebase for SQL injection vulnerabilities. Focus on:

1. String concatenation in SQL queries
2. Unsanitized user input in WHERE clauses
3. Dynamic query building without parameterization
4. ORM queries using raw SQL

For each finding:
- Show the vulnerable code
- Explain the attack vector
- Provide parameterized query alternative
- Rate severity (Critical/High/Medium/Low)

Output as JSON for automated processing.
```

**Talking Points:**
- "This prompt template becomes a one-line audit tool"
- "Contoso uses this to audit 50+ microservices in minutes"
- "Save your best prompts - they're infrastructure"

---

## 🎬 Demo 3: XSS Detection and Prevention
**Runtime: 10 minutes**

### Learning Objective
Detect and prevent XSS vulnerabilities with GitHub Copilot assistance

### Demo Flow

#### 3.1: Scan Unsafe DOM Manipulation (3 min)
```javascript
// demo-03-xss/vulnerable-react-app/UserProfile.jsx
import React, { useState } from 'react';

function UserProfile() {
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');

  // VULNERABLE: dangerouslySetInnerHTML without sanitization
  return (
    <div>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Bio"
      />

      {/* XSS VULNERABILITY */}
      <div dangerouslySetInnerHTML={{ __html: bio }} />
    </div>
  );
}
```

**Copilot Chat Prompt:**
```
Analyze this React component for XSS vulnerabilities. Identify:
1. All uses of dangerouslySetInnerHTML
2. Unsafe DOM manipulation
3. Missing output encoding
4. Data flow from user input to dangerous sinks

Show me how an attacker would exploit each vulnerability.
```

**Expected Findings:**
- dangerouslySetInnerHTML without DOMPurify
- User input flows directly to DOM
- Example payload: `<img src=x onerror="alert('XSS')">`

**Talking Points:**
- "React protects you by default - unless you use dangerouslySetInnerHTML"
- "Copilot traces data flow across multiple files"
- "The attack surface is anywhere user input touches DOM"

#### 3.2: Implement Sanitization (2 min)
```javascript
// demo-03-xss/secure-react-app/UserProfile.jsx
import React, { useState } from 'react';
import DOMPurify from 'dompurify';

function UserProfile() {
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');

  // SECURE: Sanitize before rendering
  const sanitizedBio = DOMPurify.sanitize(bio);

  return (
    <div>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Bio"
      />

      {/* SECURE: Use sanitized HTML */}
      <div dangerouslySetInnerHTML={{ __html: sanitizedBio }} />
    </div>
  );
}
```

**Copilot Prompt:**
```
Refactor this React component to prevent XSS. Use DOMPurify to sanitize
user input before rendering. Show proper import and usage.
```

**Talking Points:**
- "DOMPurify removes dangerous tags/attributes"
- "Still allows safe HTML like bold/italic"
- "Defense layer 1: Input sanitization"

#### 3.3: Add Content Security Policy (3 min)
```javascript
// demo-03-xss/secure-react-app/server.js
const express = require('express');
const helmet = require('helmet');

const app = express();

// Configure CSP headers
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],  // Refine in production
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  })
);

app.use(express.static('build'));
app.listen(3000);
```

**Copilot Chat Prompt:**
```
Generate Content Security Policy headers for a React application.
Include script-src, style-src, img-src directives. Block inline
JavaScript execution. Explain each directive.
```

**Talking Points:**
- "CSP = last line of defense against XSS"
- "Even if sanitization fails, CSP blocks execution"
- "Defense layer 2: Execution prevention"

#### 3.4: Generate XSS Test Suite (2 min)
```javascript
// demo-03-xss/tests/xss-prevention.test.js
const { render, screen } = require('@testing-library/react');
const UserProfile = require('../secure-react-app/UserProfile');

describe('XSS Prevention', () => {
  test('should sanitize script tags', () => {
    const maliciousInput = '<script>alert("XSS")</script>';
    render(<UserProfile initialBio={maliciousInput} />);

    // Script should not be in DOM
    expect(document.querySelectorAll('script').length).toBe(0);
  });

  test('should sanitize event handlers', () => {
    const maliciousInput = '<img src=x onerror="alert(\'XSS\')">';
    render(<UserProfile initialBio={maliciousInput} />);

    // Event handler should be stripped
    const img = document.querySelector('img');
    expect(img?.getAttribute('onerror')).toBeNull();
  });
});
```

**Copilot Prompt:**
```
Generate React Testing Library tests that attempt XSS injection.
Include payloads: script tags, event handlers, javascript: URLs.
Tests should pass if XSS is blocked.
```

**Key Message:**
"Defense-in-depth: Sanitize input + encode output + CSP headers. Don't skip layers."

---

## 🎬 Demo 4: Custom Vulnerability Scanners
**Runtime: 12 minutes**

### Learning Objective
Create custom GitHub Copilot-assisted vulnerability scanners for proprietary code and business logic flaws

### Demo Flow

#### 4.1: Analyze IDOR Vulnerability (3 min)
```javascript
// demo-04-custom-scanners/idor-app/api/documents.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// IDOR VULNERABILITY: No tenant isolation
router.get('/documents/:docId', async (req, res) => {
  const { docId } = req.params;

  // Missing: Check if current user's tenant owns this document
  const document = await db.query(
    'SELECT * FROM documents WHERE id = ?',
    [docId]
  );

  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }

  res.json(document);
});
```

**Copilot Chat Prompt:**
```
Analyze this multi-tenant API for authorization vulnerabilities.
This is a SaaS app where users should only access their tenant's data.

Check for:
1. Insecure Direct Object Reference (IDOR)
2. Missing tenant isolation
3. Authorization bypasses
4. Horizontal privilege escalation

Explain how an attacker from Tenant A could access Tenant B's documents.
```

**Expected Analysis:**
- Identifies missing tenant check
- Shows attacker can enumerate document IDs
- Explains horizontal privilege escalation risk
- Suggests tenant-aware query

**Talking Points:**
- "Generic scanners miss this - it requires understanding your auth model"
- "Business logic flaw: 'User A shouldn't see User B's data'"
- "This vulnerability ships in 30% of multi-tenant apps"

#### 4.2: Build Custom Scanner (4 min)
```javascript
// demo-04-custom-scanners/scanner/idor-scanner.js
const axios = require('axios');

class IDORScanner {
  constructor(baseUrl, authTokens) {
    this.baseUrl = baseUrl;
    this.authTokens = authTokens;  // Tokens for different tenants
  }

  async scanEndpoint(endpoint, resourceIds) {
    const findings = [];

    // Test with Tenant A token
    const tenantAToken = this.authTokens.tenantA;

    for (const resourceId of resourceIds) {
      try {
        // Attempt to access resource belonging to Tenant B
        const response = await axios.get(
          `${this.baseUrl}${endpoint}/${resourceId}`,
          { headers: { Authorization: `Bearer ${tenantAToken}` }}
        );

        // If we got data, IDOR vulnerability exists
        if (response.status === 200) {
          findings.push({
            severity: 'CRITICAL',
            endpoint: endpoint,
            resourceId: resourceId,
            description: 'Tenant A accessed Tenant B resource',
            recommendation: 'Add tenant isolation check in query'
          });
        }
      } catch (error) {
        // 403/404 expected for proper authorization
        if (error.response?.status === 403) {
          console.log(`✅ Authorization working for ${resourceId}`);
        }
      }
    }

    return findings;
  }

  generateReport(findings) {
    const report = {
      scanDate: new Date().toISOString(),
      totalFindings: findings.length,
      criticalFindings: findings.filter(f => f.severity === 'CRITICAL').length,
      findings: findings.map(f => ({
        ...f,
        remediation: this.getRemediationSteps(f)
      }))
    };

    return report;
  }

  getRemediationSteps(finding) {
    return [
      'Add tenant_id to WHERE clause',
      'Verify current user belongs to tenant',
      'Return 403 if tenant mismatch',
      'Add security unit tests for IDOR'
    ];
  }
}

module.exports = IDORScanner;
```

**Copilot Prompt:**
```
Build a custom vulnerability scanner for IDOR in a multi-tenant SaaS API.
The scanner should:
1. Take auth tokens for multiple tenants
2. Attempt cross-tenant resource access
3. Detect successful IDOR exploits
4. Generate findings with severity ratings
5. Include remediation steps in report

Provide working Node.js code with axios.
```

**Talking Points:**
- "This scanner understands YOUR business logic"
- "It knows Tenant A shouldn't access Tenant B's data"
- "Commercial tools can't provide this specificity"

#### 4.3: Test Race Conditions (3 min)
```javascript
// demo-04-custom-scanners/scanner/race-condition-scanner.js
const axios = require('axios');

async function testRaceCondition(apiUrl, couponCode, iterations = 50) {
  console.log(`Testing race condition with ${iterations} concurrent requests...`);

  // Create array of concurrent requests
  const requests = Array(iterations).fill().map(() =>
    axios.post(`${apiUrl}/apply-coupon`, { code: couponCode })
  );

  // Execute all requests simultaneously
  const results = await Promise.allSettled(requests);

  // Analyze results
  const successCount = results.filter(r =>
    r.status === 'fulfilled' && r.value.status === 200
  ).length;

  if (successCount > 1) {
    return {
      vulnerable: true,
      finding: {
        severity: 'HIGH',
        description: `Coupon code reused ${successCount} times in race condition`,
        endpoint: '/apply-coupon',
        recommendation: 'Implement atomic coupon redemption with database locking'
      }
    };
  }

  return { vulnerable: false };
}
```

**Copilot Prompt:**
```
Generate a race condition scanner for e-commerce coupon redemption.
The scanner should:
1. Send 50 concurrent requests with same coupon code
2. Detect if coupon is reused (race condition)
3. Report vulnerability if more than 1 request succeeds
4. Suggest database locking as remediation

Use Promise.allSettled for concurrent execution.
```

**Talking Points:**
- "Race conditions are timing-dependent - hard to catch manually"
- "Wide World Importers lost thousands to this exact vulnerability"
- "Copilot generates concurrent test harness automatically"

#### 4.4: Generate Actionable Report (2 min)
```javascript
// demo-04-custom-scanners/reports/generate-report.js
function generateVulnerabilityReport(findings) {
  const report = {
    summary: {
      totalVulnerabilities: findings.length,
      critical: findings.filter(f => f.severity === 'CRITICAL').length,
      high: findings.filter(f => f.severity === 'HIGH').length,
      scanDate: new Date().toISOString()
    },
    findings: findings.map(f => ({
      title: f.description,
      severity: f.severity,
      affectedEndpoint: f.endpoint,
      vulnerableCode: f.codeSnippet,
      exploitExample: f.exampleExploit,
      remediation: {
        steps: f.remediationSteps,
        secureCodeExample: f.secureCode,
        estimatedEffort: f.effortHours
      },
      references: [
        'OWASP Top 10 2024',
        'CWE-' + f.cweId,
        'Internal Security Policy §' + f.policySection
      ]
    }))
  };

  return report;
}
```

**Copilot Prompt:**
```
Generate a vulnerability report structure that includes:
- Summary statistics (critical/high/medium counts)
- Detailed findings with affected code
- Example exploits showing how to abuse the vulnerability
- Step-by-step remediation with code snippets
- Estimated effort in hours
- References to OWASP, CWE, internal policies

Output as JSON for developer consumption.
```

**Key Message:**
"The difference between 'you have SQL injection' and 'replace line 47 with this code.'"

---

## 📋 Post-Demo Summary

**Key Demonstrations Completed:**
1. ✅ Configured Copilot for security-focused development
2. ✅ Detected and remediated SQL injection systematically
3. ✅ Prevented XSS with defense-in-depth approach
4. ✅ Built custom scanners for business logic vulnerabilities

**Deliverables:**
- Working vulnerable and secure code samples
- Reusable Copilot prompt templates
- Security test suites for CI/CD integration
- Custom scanner implementations

**Course Repository Integration:**
All demo code is in [github-security-testbed/lesson-01](https://github.com/timothywarner-org/github-security-testbed/tree/main/lesson-01).

---

## 🎯 Key Messages to Reinforce

1. **Configuration is Foundation:** Copilot's behavior is configurable - optimize for security, not just velocity
2. **Systematic > Ad-hoc:** Automated detection scales; manual review doesn't
3. **Business Logic Matters:** Generic scanners miss your organization's specific vulnerabilities
4. **Prompts are Infrastructure:** Save, version control, and continuously improve your detection prompts

---

## ⚠️ Common Demo Pitfalls to Avoid

**Technical Issues:**
- [ ] Copilot not logged in or rate limited
- [ ] Node modules not installed (run `npm install` before demo)
- [ ] Vulnerable apps not running on correct ports
- [ ] Test databases not seeded with sample data

**Timing Issues:**
- [ ] Reading prompts verbatim (paraphrase for natural flow)
- [ ] Waiting too long for Copilot responses (have backup screenshots)
- [ ] Skipping validation steps (always show tests passing)

**Teaching Issues:**
- [ ] Assuming audience knows IDOR/XSS/etc (explain briefly)
- [ ] Not explaining WHY, just WHAT (first-principles thinking)
- [ ] Forgetting to show vulnerable → secure comparison

---

## 🚀 Demo Preparation Checklist

**24 Hours Before:**
- [ ] Test all demo environments end-to-end
- [ ] Verify Copilot responses match expectations (regenerate if needed)
- [ ] Take backup screenshots of expected Copilot outputs
- [ ] Run through timing (stay within 8/10/10/12 minute allocations)

**1 Hour Before:**
- [ ] Start all necessary services (databases, APIs)
- [ ] Open VS Code with proper workspace
- [ ] Clear terminal history (clean slate for recording)
- [ ] Verify audio levels

**Right before you start:**
- [ ] Close distracting apps (Slack, email, etc.)
- [ ] Disable notifications
- [ ] Set Copilot to appropriate verbosity level
- [ ] Take a deep breath - you've got this! 🎬

---

**Built for:** Tim Warner
**Lesson Focus:** Vulnerability Detection with GitHub Copilot
**Target Audience:** Security professionals adopting AI-assisted development
**Skill Level:** Intermediate to Advanced

Ready to demonstrate! 🔒
