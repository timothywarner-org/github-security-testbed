# SQL Injection Demonstration

This demo showcases SQL injection vulnerabilities and their remediation using secure coding practices aligned with OWASP Top 10 2021.

## Overview

This directory contains three versions of an Express.js API:

1. **vulnerable/api.js** - Intentionally vulnerable API with 8 different SQL injection vulnerabilities
2. **secure/api.js** - Secure version using parameterized queries
3. **secure/api-enhanced.js** - Enhanced secure version with comprehensive security features

## Security Review

See **[SECURITY_FINDINGS.md](./SECURITY_FINDINGS.md)** for a complete security analysis including:

- Detailed vulnerability table mapped to OWASP Top 10
- Impact assessment for each vulnerability
- Concrete remediation steps with code examples
- Priority ranking of fixes

## Files in This Demo

```
demo-02-sql-injection/
├── SECURITY_FINDINGS.md         # Comprehensive security review
├── README.md                     # This file
├── vulnerable/
│   ├── api.js                    # Vulnerable API (DO NOT USE IN PRODUCTION)
│   └── package.json              # Dependencies for vulnerable version
├── secure/
│   ├── api.js                    # Secure version with parameterized queries
│   ├── api-enhanced.js          # Enhanced with rate limiting, logging, etc.
│   └── package.json              # Dependencies for secure versions
└── tests/
    └── sql-injection.test.js     # Security tests
```

## Vulnerabilities Demonstrated (OWASP A03:2021 - Injection)

### In vulnerable/api.js:

1. **SQL Injection in GET parameter** (Line 57)
2. **SQL Injection in Authentication** (Lines 79-80)
3. **SQL Injection in Search** (Lines 115-117)
4. **SQL Injection in ORDER BY** (Line 140)
5. **SQL Injection in INSERT** (Lines 161-162)
6. **SQL Injection in UPDATE** (Lines 188-190)
7. **SQL Injection in DELETE** (Line 215)
8. **Blind SQL Injection** (Line 241)
9. **Plaintext Password Storage** (A02:2021)
10. **No Rate Limiting** (A07:2021)
11. **Verbose Error Messages** (A05:2021)
12. **Insufficient Logging** (A09:2021)

## Security Fixes Applied

### secure/api.js
✅ Parameterized queries for all database operations  
✅ Password hashing with bcrypt  
✅ Input validation with express-validator  
✅ Whitelist validation for ORDER BY clauses  
✅ Generic error messages  

### secure/api-enhanced.js (All of the above PLUS)
✅ Rate limiting with express-rate-limit  
✅ Security headers with helmet.js  
✅ Comprehensive security logging  
✅ Timing attack prevention  
✅ Request size limits  
✅ Global error handling  

## Running the Demos

### Prerequisites

- Node.js 14+ installed
- MySQL server running (optional for code review)

### Run Vulnerable Version (Education Only)

```bash
cd vulnerable
npm install
npm start
```

⚠️ **WARNING**: Only run in isolated development environment!

### Run Secure Version

```bash
cd secure
npm install

# Run basic secure version
npm start

# Run enhanced version with all security features
npm run start:enhanced
```

## Testing SQL Injection Attacks

### Attack Examples (against vulnerable version):

```bash
# 1. Authentication Bypass
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin'\''--","password":"anything"}'

# 2. Data Extraction
curl "http://localhost:3000/user/1%20OR%201=1"

# 3. UNION-based Injection
curl "http://localhost:3000/search?q=%27%20UNION%20SELECT%20username,password,null,null%20FROM%20users--"

# 4. Boolean-based Blind Injection
curl "http://localhost:3000/check-user?username=admin'%20AND%20'1'='1"
```

### Verify Secure Version Blocks Attacks:

The same payloads against the secure version will:
- Be blocked by input validation
- Be safely handled by parameterized queries
- Return generic error messages (no information leakage)

## Key Security Lessons

### 1. **NEVER concatenate user input into SQL queries**

❌ **Bad:**
```javascript
const query = `SELECT * FROM users WHERE id = ${userId}`;
```

✅ **Good:**
```javascript
const query = 'SELECT * FROM users WHERE id = ?';
db.execute(query, [userId]);
```

### 2. **Always validate and sanitize input**

```javascript
param('id').isInt({ min: 1 })
body('email').isEmail().normalizeEmail()
```

### 3. **Use whitelist validation for dynamic SQL parts**

```javascript
const ALLOWED_COLUMNS = ['name', 'price', 'created_at'];
if (!ALLOWED_COLUMNS.includes(sortBy)) {
  return res.status(400).json({ error: 'Invalid sort field' });
}
```

### 4. **Hash passwords, never store plaintext**

```javascript
const passwordHash = await bcrypt.hash(password, 12);
const isValid = await bcrypt.compare(password, storedHash);
```

### 5. **Implement defense in depth**

- Parameterized queries (primary defense)
- Input validation (secondary defense)
- Rate limiting (prevents brute force)
- Security logging (enables detection)
- Generic error messages (prevents information disclosure)

## OWASP Top 10 2021 Coverage

| ID | Category | Addressed |
|----|----------|-----------|
| A03:2021 | Injection | ✅ Parameterized queries |
| A02:2021 | Cryptographic Failures | ✅ Password hashing |
| A07:2021 | Authentication Failures | ✅ Rate limiting |
| A05:2021 | Security Misconfiguration | ✅ Generic errors, security headers |
| A09:2021 | Logging Failures | ✅ Security event logging |

## Additional Resources

- [OWASP SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection)
- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [MySQL Prepared Statements](https://dev.mysql.com/doc/refman/8.0/en/sql-prepared-statements.html)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

## Testing

Run the security tests:

```bash
cd tests
npm install
npm test
```

## License

MIT - For educational purposes only

---

**Course**: GitHub Copilot for Cybersecurity Specialists  
**Lesson**: 01 - Vulnerability Detection  
**Author**: Timothy Warner
