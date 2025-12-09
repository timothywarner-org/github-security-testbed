# Quick Reference: Security Fixes

## SQL Injection Fixes - Before & After

### Issue 1: SQL Injection in GET Parameter

**❌ VULNERABLE** (Line 57):
```javascript
app.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  const query = `SELECT * FROM users WHERE id = ${userId}`;  // DANGEROUS!
  db.query(query, callback);
});
```

**✅ SECURE** (secure/api-enhanced.js):
```javascript
app.get('/user/:id',
  param('id').isInt({ min: 1 }).withMessage('User ID must be a positive integer'),
  handleValidationErrors,
  async (req, res) => {
    const userId = parseInt(req.params.id, 10);
    const [rows] = await pool.execute(
      'SELECT id, username, email, display_name, created_at FROM users WHERE id = ?',
      [userId]  // Parameterized - SAFE!
    );
  }
);
```

---

### Issue 2: SQL Injection in Authentication + Plaintext Passwords

**❌ VULNERABLE** (Lines 79-80):
```javascript
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const query = "SELECT * FROM users WHERE username = '" + username +
                "' AND password = '" + password + "'";  // DOUBLE DANGER!
  db.query(query, callback);
});
```

**✅ SECURE** (secure/api-enhanced.js):
```javascript
app.post('/login',
  loginLimiter,  // Rate limiting
  body('username').trim().isLength({ min: 3, max: 50 })
    .matches(/^[a-zA-Z0-9_]+$/),
  body('password').isLength({ min: 8 }),
  handleValidationErrors,
  async (req, res) => {
    const { username, password } = req.body;
    
    // Parameterized query
    const [rows] = await pool.execute(
      'SELECT id, username, password_hash, role FROM users WHERE username = ?',
      [username]  // SAFE!
    );
    
    // Bcrypt password comparison
    const passwordValid = await bcrypt.compare(password, user.password_hash);
  }
);
```

---

### Issue 3: SQL Injection in Search

**❌ VULNERABLE** (Lines 115-117):
```javascript
app.get('/search', (req, res) => {
  const searchTerm = req.query.q || '';
  const category = req.query.category || '';
  
  const query = `SELECT * FROM products
                 WHERE name LIKE '%${searchTerm}%'
                 AND category = '${category}'`;  // DANGEROUS!
  db.query(query, callback);
});
```

**✅ SECURE** (secure/api-enhanced.js):
```javascript
app.get('/search',
  query('q').optional().trim().isLength({ max: 100 }).escape(),
  query('category').optional().trim().isLength({ max: 50 }),
  handleValidationErrors,
  async (req, res) => {
    const searchTerm = req.query.q || '';
    const category = req.query.category || '';
    
    let sql = 'SELECT id, name, description, price, category FROM products WHERE 1=1';
    const params = [];
    
    if (searchTerm) {
      sql += ' AND name LIKE ?';
      params.push(`%${searchTerm}%`);  // SAFE!
    }
    
    if (category) {
      sql += ' AND category = ?';
      params.push(category);  // SAFE!
    }
    
    sql += ' LIMIT 100';
    const [rows] = await pool.execute(sql, params);
  }
);
```

---

### Issue 4: SQL Injection in ORDER BY

**❌ VULNERABLE** (Line 140):
```javascript
app.get('/products', (req, res) => {
  const sortBy = req.query.sort || 'name';
  const order = req.query.order || 'ASC';
  
  const query = `SELECT * FROM products ORDER BY ${sortBy} ${order}`;  // DANGEROUS!
  db.query(query, callback);
});
```

**✅ SECURE** (secure/api-enhanced.js):
```javascript
const ALLOWED_SORT_COLUMNS = ['name', 'price', 'category', 'created_at'];
const ALLOWED_SORT_ORDERS = ['ASC', 'DESC'];

app.get('/products',
  query('sort').optional().isIn(ALLOWED_SORT_COLUMNS),
  query('order').optional().toUpperCase().isIn(ALLOWED_SORT_ORDERS),
  handleValidationErrors,
  async (req, res) => {
    // Whitelist validation
    const sortBy = ALLOWED_SORT_COLUMNS.includes(req.query.sort)
      ? req.query.sort
      : 'name';
    const order = ALLOWED_SORT_ORDERS.includes(req.query.order?.toUpperCase())
      ? req.query.order.toUpperCase()
      : 'ASC';
    
    // Column from whitelist only - SAFE!
    const sql = `SELECT id, name, description, price, category
                 FROM products
                 ORDER BY ${sortBy} ${order}
                 LIMIT 100`;
    
    const [rows] = await pool.execute(sql);
  }
);
```

---

### Issue 5: Password Storage

**❌ VULNERABLE** (Lines 161-162):
```javascript
app.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  
  const query = `INSERT INTO users (username, email, password, role)
                 VALUES ('${username}', '${email}', '${password}', 'user')`;  
  // Plaintext password AND SQL injection!
  db.query(query, callback);
});
```

**✅ SECURE** (secure/api-enhanced.js):
```javascript
app.post('/register',
  body('username').trim().isLength({ min: 3, max: 50 })
    .matches(/^[a-zA-Z0-9_]+$/),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  handleValidationErrors,
  async (req, res) => {
    const { username, email, password } = req.body;
    
    // Hash password with bcrypt
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Parameterized INSERT
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, NOW())',
      [username, email, passwordHash, 'user']  // SAFE!
    );
  }
);
```

---

## Error Handling Fix

**❌ VULNERABLE** (Line 62):
```javascript
db.query(query, (err, results) => {
  if (err) {
    return res.status(500).json({ error: err.message });  
    // Exposes SQL error details to attacker!
  }
});
```

**✅ SECURE** (secure/api-enhanced.js):
```javascript
try {
  const [rows] = await pool.execute(query, params);
  // ... handle results
} catch (error) {
  console.error('Database error:', error);  // Log server-side only
  res.status(500).json({
    success: false,
    message: 'An error occurred'  // Generic message - SAFE!
  });
}
```

---

## Rate Limiting Addition

**❌ VULNERABLE**: No rate limiting

**✅ SECURE** (secure/api-enhanced.js):
```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,  // 5 attempts per window
  message: 'Too many login attempts, please try again later'
});

app.post('/login', loginLimiter, ...);  // Applied to login endpoint
```

---

## Security Logging Addition

**❌ VULNERABLE**: No security logging

**✅ SECURE** (secure/api-enhanced.js):
```javascript
function logSecurityEvent(eventType, details) {
  console.log('[SECURITY EVENT]', JSON.stringify({
    timestamp: new Date().toISOString(),
    event: eventType,
    ...details
  }));
}

// Usage throughout the application:
logSecurityEvent('login_failed', { username, ip: req.ip });
logSecurityEvent('login_success', { username, ip: req.ip });
logSecurityEvent('user_registered', { userId, username });
logSecurityEvent('rate_limit_exceeded', { ip: req.ip, endpoint: req.path });
```

---

## Security Headers Addition

**❌ VULNERABLE**: No security headers

**✅ SECURE** (secure/api-enhanced.js):
```javascript
const helmet = require('helmet');

app.use(helmet());  // Adds comprehensive security headers
```

---

## Key Security Principles

1. **Never trust user input** - Always validate and sanitize
2. **Use parameterized queries** - Never concatenate SQL
3. **Hash passwords** - Never store plaintext
4. **Limit attempts** - Use rate limiting
5. **Hide details** - Generic error messages
6. **Log everything** - Security event logging
7. **Defense in depth** - Multiple security layers

---

## Attack Prevention Summary

| Attack Type | Vulnerable Code | Secure Solution |
|-------------|-----------------|-----------------|
| SQL Injection | String concatenation | Parameterized queries |
| Auth Bypass | SQL injection in login | Parameterized + bcrypt |
| Brute Force | No rate limiting | express-rate-limit |
| Info Disclosure | Detailed error messages | Generic messages |
| Timing Attacks | Variable response times | bcrypt constant-time |
| Password Theft | Plaintext storage | bcrypt hashing |

---

**All vulnerabilities are now remediated in `secure/api-enhanced.js`** ✅
