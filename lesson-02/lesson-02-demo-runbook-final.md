# GitHub Copilot for Cybersecurity Specialists
## Lesson 02 Demo Runbook (v2)

**Course:** GitHub Copilot for Cybersecurity Specialists
**Lesson:** 02 - Implement Security Protocols with Copilot
**Total Demo Runtime:** 40 minutes
**Execution Context:** VS Code + GitHub Copilot + GitHub Advanced Security + Azure
**Demo code:** [github-security-testbed/lesson-02](https://github.com/timothywarner-org/github-security-testbed/tree/main/lesson-02)

---

## 🎯 Lesson Focus

This lesson teaches **how to use GitHub Copilot and GitHub Advanced Security to implement security protocols**, not just how to write secure code manually.

**Key Difference from Traditional Training:**
- Traditional: "Here's how to write OAuth 2.0"
- This Lesson: "Here's how to prompt Copilot to generate OAuth 2.0 and validate it with GHAS"

---

## 🎬 Pre-Demo Environment Setup

**Required Software:**
- VS Code (latest stable)
- GitHub Copilot extension
- GitHub Copilot Chat extension
- GitHub Advanced Security (GHAS) enabled on repository
- Node.js 20.x LTS
- Azure CLI
- Git

**GitHub Repository Setup:**
```bash
# Create your own practice repo and clone it. Public repositories can use
# secret scanning, push protection, Dependabot, and code scanning for free.
gh repo create copilot-security-lesson-02 --public --clone
cd copilot-security-lesson-02

# Bring in this lesson's demo code from the course testbed
git clone --depth 1 https://github.com/timothywarner-org/github-security-testbed ../github-security-testbed
cp -r ../github-security-testbed/lesson-02/. .
git add . && git commit -m "Add Lesson 02 demo code" && git push -u origin HEAD

# Turn on Dependabot alerts (this also turns on the dependency graph)
gh api -X PUT repos/{owner}/{repo}/vulnerability-alerts

# Turn on secret scanning and push protection
gh api -X PATCH repos/{owner}/{repo} \
  -f 'security_and_analysis[secret_scanning][status]=enabled' \
  -f 'security_and_analysis[secret_scanning_push_protection][status]=enabled'
```

**GHAS Configuration:**
- Enable CodeQL analysis
- Enable secret scanning
- Enable dependency scanning
- Configure security policies (branch protection with GHAS checks)

**Pre-Demo Checklist:**
- [ ] VS Code with Copilot active
- [ ] GHAS enabled and configured on repository
- [ ] CodeQL workflow running
- [ ] Secret scanning active
- [ ] Azure CLI logged in
- [ ] Copilot Chat ready

---

## 🎬 Demo Sequence 1: Copilot Security Knowledge (10 min)

### Objective
Demonstrate that Copilot understands security patterns from training, not just generic code completion

### Demo 1.1: Copilot Knows Cryptographic Correctness (3 min)

**Setup:**
Create empty file: `encryption-demo.js`

**Live Coding with Copilot:**
```javascript
// Type this comment, let Copilot complete:
// Encrypt data using AES-256-GCM with secure IV generation

// Watch Copilot suggest implementation
```

**Expected Copilot Suggestion:**
```javascript
const crypto = require('crypto');

function encrypt(plaintext, key) {
  // Generate cryptographically secure IV (12 bytes for GCM)
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let ciphertext = cipher.update(plaintext, 'utf8');
  ciphertext = Buffer.concat([ciphertext, cipher.final()]);

  const tag = cipher.getAuthTag();

  // Prepend IV and tag to ciphertext
  return Buffer.concat([iv, tag, ciphertext]);
}
```

**Teaching Points:**
- ✅ Copilot chose AES-256-GCM (authenticated encryption)
- ✅ Copilot used crypto.randomBytes (cryptographically secure)
- ✅ Copilot used 12-byte IV (correct for GCM mode)
- ✅ Copilot extracted authentication tag
- ✅ Copilot prepended IV/tag to ciphertext (correct storage pattern)

**Key Message:**
"Copilot didn't just autocomplete - it made five security-critical decisions correctly. This is security knowledge embedded in the AI."

---

### Demo 1.2: Copilot Understands Compliance Requirements (3 min)

**Copilot Chat Prompt:**
```
Generate password-based encryption that meets PCI-DSS requirements for key derivation
```

**Expected Copilot Chat Response:**
Shows PBKDF2 with 600,000+ iterations, explains PCI-DSS requirements

**Teaching Points:**
- Copilot knows compliance frameworks
- Generates code that meets specific standards
- Can explain reasoning behind implementation choices

---

### Demo 1.3: GHAS Validates Copilot Outputs (4 min)

**Setup:**
Deliberately introduce vulnerability in Copilot-generated code

**Steps:**
1. Use Copilot to generate JWT validation
2. Manually change RS256 to HS256 (weaker algorithm)
3. Commit to branch
4. Show CodeQL detecting the vulnerability
5. Show security policy blocking PR merge

**Teaching Points:**
- Copilot generates secure defaults
- GHAS catches manual changes that weaken security
- Automated security review prevents vulnerabilities from merging

**Key Message:**
"This is the workflow: Copilot generates secure implementations. GHAS validates they stay secure. Humans can't accidentally weaken security without GHAS catching it."

---

## 🎬 Demo Sequence 2: Authentication with Copilot (10 min)

### Objective
Show how to use Copilot to generate production-ready OAuth 2.0 and JWT authentication

### Demo 2.1: Generate OAuth 2.0 with PKCE (4 min)

**Copilot Chat Prompt:**
```
Generate an OAuth 2.0 authorization server in Node.js with Express that implements:
- Authorization code flow with PKCE
- SHA-256 code_challenge generation
- Redirect URI validation against whitelist
- 10-minute authorization code expiration
- Single-use authorization codes
- Proper state parameter handling

Include complete working code with error handling.
```

**Demo Flow:**
1. Show Copilot Chat generating ~100 lines of OAuth code
2. Highlight key security features in generated code:
   - PKCE code_challenge validation
   - Redirect URI whitelist
   - Authorization code expiration
   - Single-use code enforcement
3. Run the server, test OAuth flow with Postman
4. Show it works correctly

**Teaching Points:**
- OAuth 2.0 spec is 200+ pages. Copilot knows it all.
- PKCE implementation is complex. Copilot generates it correctly.
- Security features (expiration, single-use) are included automatically.

---

### Demo 2.2: Generate JWT with Secure Defaults (3 min)

**Copilot Prompt (in-editor):**
```javascript
// Generate JWT token with proper claims and RS256 signing

```

**Show Copilot Completing:**
```javascript
const jwt = require('jsonwebtoken');
const fs = require('fs');

const privateKey = fs.readFileSync('private.key');

function generateToken(userId, roles) {
  return jwt.sign(
    {
      iss: 'https://auth.example.com',
      sub: userId,
      aud: 'https://api.example.com',
      exp: Math.floor(Date.now() / 1000) + (15 * 60), // 15 minutes
      iat: Math.floor(Date.now() / 1000),
      roles: roles
    },
    privateKey,
    { algorithm: 'RS256' }
  );
}
```

**Teaching Points:**
- ✅ All required claims present (iss, sub, aud, exp, iat)
- ✅ RS256 algorithm (asymmetric, secure)
- ✅ Short expiration (15 min)
- ✅ Proper timestamp handling

---

### Demo 2.3: GHAS Secret Scanning Catches Key Leak (3 min)

**Demo:**
1. Copy private key content into code file
2. Attempt to commit
3. Show GHAS secret scanning blocking the commit
4. Show remediation guidance

**Teaching Points:**
- Even with secure Copilot-generated code, humans make mistakes
- GHAS prevents credential leaks automatically
- Real-time feedback during development

**Key Message:**
"Copilot generates secure implementations. GHAS prevents human errors from compromising them."

---

## 🎬 Demo Sequence 3: Encryption and Key Management (10 min)

### Objective
Demonstrate Copilot's ability to integrate cloud key management and implement proper encryption

### Demo 3.1: Copilot Integrates Azure Key Vault (4 min)

**Copilot Chat Prompt:**
```
Generate Node.js code that:
1. Fetches encryption key from Azure Key Vault
2. Uses DefaultAzureCredential for authentication
3. Caches key in memory with 1-hour TTL
4. Automatically refreshes key before expiration
5. Handles Key Vault unavailability gracefully

Use @azure/keyvault-keys and @azure/identity libraries.
```

**Demo Flow:**
1. Show Copilot generating complete Key Vault integration
2. Highlight security features:
   - No hardcoded credentials (DefaultAzureCredential)
   - Key caching (performance)
   - Automatic refresh (no expiration failures)
   - Graceful degradation (handles outages)
3. Run code, show key fetch from Azure Key Vault
4. Show caching behavior (subsequent calls are fast)

**Teaching Points:**
- Cloud key management is best practice
- Copilot knows Azure SDK patterns
- Generated code is production-ready

---

### Demo 3.2: Key Rotation Without Downtime (3 min)

**Copilot Chat Prompt:**
```
Implement versioned encryption in Node.js:
- Encrypt new data with current key version
- Decrypt old data using historical key versions
- Maintain key version registry
- Support re-encryption of data during rotation

Include version storage format.
```

**Demo:**
1. Show Copilot generating versioned encryption
2. Encrypt data with version 1
3. Rotate to version 2
4. Show old data still decrypts (version 1 key used)
5. Show new data encrypts with version 2

**Teaching Points:**
- Key rotation is complex
- Copilot knows the pattern
- Zero-downtime rotation is achievable

---

### Demo 3.3: GHAS Dependency Scanning (3 min)

**Demo:**
1. Show package.json with vulnerable cryptography library
2. Commit and push
3. Show GHAS dependency scanning alert
4. Show vulnerability details and remediation guidance
5. Update to patched version

**Key Message:**
"GHAS validates not just your code, but your dependencies. End-to-end security validation."

---

## 🎬 Demo Sequence 4: Zero-Trust with Infrastructure-as-Code (10 min)

### Objective
Show Copilot generating infrastructure-as-code for zero-trust architecture

### Demo 4.1: Generate Terraform for Network Segmentation (4 min)

**Copilot Chat Prompt:**
```
Generate Terraform configuration for Azure that implements zero-trust network segmentation:
- VNet with three subnets: web (10.0.1.0/24), app (10.0.2.0/24), data (10.0.3.0/24)
- Network Security Groups with:
  * Web subnet: Allow 443 from internet, allow 8080 to app subnet only
  * App subnet: Allow 8080 from web, allow 5432 to data subnet only
  * Data subnet: Allow 5432 from app subnet only
- Default deny for all other traffic
- NSG flow logs enabled for audit

Provide complete Terraform with all resources.
```

**Demo Flow:**
1. Show Copilot generating ~100 lines of Terraform
2. Highlight zero-trust principles:
   - Network segmentation (separate subnets)
   - Least privilege (minimal required access)
   - Default deny (explicit allow only)
   - Audit logging (NSG flow logs)
3. Run `terraform plan` - show what would be created
4. (Optional) Show pre-deployed infrastructure in Azure Portal

**Teaching Points:**
- Zero-trust implementation is complex Terraform
- Copilot generates it from natural language
- Infrastructure-as-code makes security repeatable

---

### Demo 4.2: Generate Service Mesh Configuration (3 min)

**Copilot Chat Prompt:**
```
Generate Istio service mesh configuration that implements:
- Mutual TLS between all services
- Automatic certificate provisioning and rotation
- Authorization policy: service-a can call service-b, but service-b cannot call service-c
- Deny all by default, explicit allow only

Provide complete Istio YAML manifests.
```

**Demo:**
1. Show Copilot generating Istio configuration
2. Highlight zero-trust at service layer
3. Explain mTLS authentication
4. Show authorization policies

**Teaching Points:**
- Service mesh implements zero-trust for microservices
- Copilot knows Istio configuration patterns
- Generated configs are deployment-ready

---

### Demo 4.3: GHAS Scans Infrastructure-as-Code (3 min)

**Demo:**
1. Show Terraform file with security misconfiguration:
   - NSG rule allowing internet access to database
2. Commit to branch
3. Show GHAS CodeQL detecting the misconfiguration
4. Show security policy blocking PR merge
5. Fix the misconfiguration
6. Show GHAS allowing merge after fix

**Key Message:**
"GHAS scans infrastructure-as-code just like application code. Misconfigurations are caught before deployment."

---

## 📋 Post-Demo Summary

**What We Demonstrated:**

1. **Copilot Security Knowledge**
   - Cryptographic correctness (AES-GCM, secure IVs)
   - Compliance requirements (PCI-DSS, PBKDF2 iterations)
   - Security patterns (PKCE, JWT claims, key rotation)

2. **GHAS Validation**
   - CodeQL catching vulnerabilities
   - Secret scanning preventing credential leaks
   - Dependency scanning identifying vulnerable libraries
   - IaC scanning catching misconfigurations

3. **Authentication Generation**
   - OAuth 2.0 with PKCE (100+ lines generated)
   - JWT with proper claims and RS256 signing
   - Secure defaults embedded automatically

4. **Encryption & Key Management**
   - Azure Key Vault integration
   - Versioned encryption for key rotation
   - Cloud-native key management

5. **Zero-Trust Infrastructure**
   - Terraform network segmentation
   - Istio service mesh with mTLS
   - Infrastructure-as-code for repeatability

---

## 🎯 Key Messages to Reinforce

1. **Copilot Has Security Knowledge**
   - Trained on cryptographic libraries, compliance frameworks, security patterns
   - Generates secure implementations automatically
   - Understands nuances (GCM vs CBC, RS256 vs HS256, PKCE requirements)

2. **GHAS Provides Validation Layer**
   - CodeQL scans code for vulnerabilities
   - Secret scanning prevents credential leaks
   - Dependency scanning catches vulnerable libraries
   - Security policies enforce standards before merge

3. **Workflow is Generate → Validate → Deploy**
   - Copilot generates secure implementations
   - GHAS validates they meet policy
   - Humans review architecture and threat model
   - Deploy with confidence through automated validation

4. **Prompt Quality Matters**
   - Specific prompts produce hardened implementations
   - Include security requirements in prompts
   - Save effective prompts for reuse

---

## ⚠️ Common Demo Pitfalls

**Technical:**
- [ ] Copilot not generating expected code (use Copilot Chat as backup)
- [ ] GHAS not enabled on repository (enable before demo)
- [ ] Azure CLI not authenticated (run `az login` before demo)
- [ ] CodeQL workflow not running (trigger manually if needed)

**Timing:**
- [ ] Terraform generation can be verbose (use Copilot Chat, not inline)
- [ ] CodeQL scans take 2-3 minutes (have pre-run scan ready)
- [ ] Key Vault operations need Azure resources (pre-create if showing live)

**Teaching:**
- [ ] Don't just show code generation - explain WHY it's secure
- [ ] Connect Copilot outputs to security principles (OWASP, NIST)
- [ ] Show both successful generation AND GHAS validation

---

## 🚀 Recording Tips

**Before you start:**
- Test all Copilot prompts (ensure they generate expected output)
- Have pre-run GHAS scans ready (CodeQL takes time)
- Pre-create Azure resources (Key Vault, VNet) if showing live
- Have backup screenshots of successful generations

**While you work:**
- Read Copilot prompts slowly (students will copy them)
- Pause after generation to highlight security features
- Explain WHY generated code is secure, not just WHAT it does
- Show GHAS validation immediately after generation

**Key Transitions:**
- "Let's see what Copilot suggests..." (before generation)
- "Notice that Copilot..." (highlight security features)
- "GHAS validates this by..." (show validation)
- "In production, you would..." (connect to real-world use)

---

## 📚 Resources for Students

**Demo code:**
https://github.com/timothywarner-org/github-security-testbed/tree/main/lesson-02

**Includes:**
- All Copilot prompts from demos
- Generated code samples
- Terraform templates
- GHAS policy configurations
- Step-by-step setup guides

---

**Built for:** Tim Warner
**Lesson Focus:** GitHub Copilot + GHAS for Security Implementation
**Target Audience:** Security professionals learning AI-assisted development
**Skill Level:** Intermediate

Ready to demonstrate Copilot's security superpowers! 🔒✨
