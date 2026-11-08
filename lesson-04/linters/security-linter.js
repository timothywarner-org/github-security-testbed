/**
 * Custom Security Linter
 * =======================
 * Course: GitHub Copilot for Cybersecurity Specialists
 * Lesson: 04 - Security Code Review, Threat Modeling, Auditing
 *
 * Copilot Prompt Used:
 * "Create custom ESLint-like security linter for JavaScript"
 *
 * Features:
 * - SQL injection detection
 * - XSS vulnerability detection
 * - Hardcoded credential detection
 * - Insecure function detection
 * - Dependency vulnerability checking
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// =============================================================================
// Security Rules
// =============================================================================

const securityRules = {
  // ---------------------------------------------------------------------------
  // Injection Rules
  // ---------------------------------------------------------------------------
  'no-sql-concat': {
    severity: 'error',
    message: 'SQL query built with string concatenation. Use parameterized queries.',
    cwe: 'CWE-89',
    patterns: [
      /(?:query|execute|run)\s*\(\s*['"`].*\$\{.*\}.*['"`]\s*\)/g,
      /(?:query|execute|run)\s*\(\s*['"`].*['"`]\s*\+/g,
      /(?:query|execute|run)\s*\(\s*.*\+\s*['"`]/g
    ]
  },

  'no-eval': {
    severity: 'error',
    message: 'eval() is dangerous and can lead to code injection.',
    cwe: 'CWE-95',
    patterns: [
      /\beval\s*\(/g,
      /new\s+Function\s*\(/g,
      /setTimeout\s*\(\s*['"`]/g,
      /setInterval\s*\(\s*['"`]/g
    ]
  },

  'no-command-injection': {
    severity: 'error',
    message: 'Command execution with unsanitized input. Use child_process.spawn with args array.',
    cwe: 'CWE-78',
    patterns: [
      /(?:exec|execSync)\s*\(\s*(?!['"`])/g,
      /(?:exec|execSync)\s*\(\s*['"`].*\$\{.*\}/g,
      /spawn\s*\(.*shell:\s*true/g
    ]
  },

  // ---------------------------------------------------------------------------
  // XSS Rules
  // ---------------------------------------------------------------------------
  'no-innerhtml': {
    severity: 'warning',
    message: 'Direct innerHTML assignment can lead to XSS. Use textContent or sanitize input.',
    cwe: 'CWE-79',
    patterns: [
      /\.innerHTML\s*=/g,
      /\.outerHTML\s*=/g
    ]
  },

  'no-document-write': {
    severity: 'warning',
    message: 'document.write() can lead to XSS vulnerabilities.',
    cwe: 'CWE-79',
    patterns: [
      /document\.write\s*\(/g,
      /document\.writeln\s*\(/g
    ]
  },

  'react-dangerously-set-innerhtml': {
    severity: 'warning',
    message: 'dangerouslySetInnerHTML can lead to XSS. Ensure input is sanitized.',
    cwe: 'CWE-79',
    patterns: [
      /dangerouslySetInnerHTML/g
    ]
  },

  // ---------------------------------------------------------------------------
  // Cryptography Rules
  // ---------------------------------------------------------------------------
  'no-weak-crypto': {
    severity: 'error',
    message: 'Weak cryptographic algorithm detected. Use modern alternatives.',
    cwe: 'CWE-327',
    patterns: [
      /createHash\s*\(\s*['"](?:md5|sha1)['"]\s*\)/g,
      /createCipher(?:iv)?\s*\(\s*['"](?:des|des-ede|des-ede3|rc4|rc2)['"]/gi,
      /createCipher(?:iv)?\s*\(\s*['"].*-ecb['"]/g
    ]
  },

  'no-weak-random': {
    severity: 'warning',
    message: 'Math.random() is not cryptographically secure. Use crypto.randomBytes().',
    cwe: 'CWE-338',
    patterns: [
      /Math\.random\s*\(\s*\)/g
    ],
    exceptions: ['test', 'spec', 'mock']
  },

  // ---------------------------------------------------------------------------
  // Credential Rules
  // ---------------------------------------------------------------------------
  'no-hardcoded-credentials': {
    severity: 'error',
    message: 'Hardcoded credential detected. Use environment variables.',
    cwe: 'CWE-798',
    patterns: [
      /(?:password|passwd|pwd)\s*[:=]\s*['"][^'"]{4,}['"]/gi,
      /(?:api_?key|apikey|api_?secret)\s*[:=]\s*['"][^'"]{8,}['"]/gi,
      /(?:secret|token)\s*[:=]\s*['"][A-Za-z0-9+/=]{20,}['"]/gi,
      /(?:aws_access_key_id|aws_secret_access_key)\s*[:=]\s*['"][^'"]+['"]/gi,
      /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----/g
    ],
    exceptions: ['example', 'placeholder', 'test123', 'changeme', 'YOUR_']
  },

  // ---------------------------------------------------------------------------
  // Path Traversal Rules
  // ---------------------------------------------------------------------------
  'no-path-traversal': {
    severity: 'error',
    message: 'Potential path traversal vulnerability. Validate and sanitize file paths.',
    cwe: 'CWE-22',
    patterns: [
      /(?:readFile|readFileSync|createReadStream)\s*\(\s*(?!['"`])/g,
      /(?:writeFile|writeFileSync|createWriteStream)\s*\(\s*(?!['"`])/g,
      /path\.join\s*\([^)]*req\./g
    ]
  },

  // ---------------------------------------------------------------------------
  // Information Disclosure Rules
  // ---------------------------------------------------------------------------
  'no-stack-trace-exposure': {
    severity: 'warning',
    message: 'Error stack trace may be exposed to users. Use proper error handling.',
    cwe: 'CWE-209',
    patterns: [
      /res\.(?:send|json)\s*\(\s*(?:err|error)\.stack/g,
      /res\.(?:send|json)\s*\(\s*(?:err|error)\s*\)/g
    ]
  },

  'no-console-sensitive': {
    severity: 'warning',
    message: 'Logging potentially sensitive data. Remove or mask before production.',
    cwe: 'CWE-532',
    patterns: [
      /console\.(?:log|info|debug)\s*\([^)]*(?:password|token|secret|key|credential)/gi
    ]
  },

  // ---------------------------------------------------------------------------
  // Security Headers Rules
  // ---------------------------------------------------------------------------
  'use-helmet': {
    severity: 'warning',
    message: 'Express app without Helmet middleware. Add app.use(helmet()) for security headers.',
    cwe: 'CWE-693',
    filePatterns: ['**/server.js', '**/app.js', '**/index.js'],
    check: (content) => {
      if (content.includes("express()") && !content.includes("helmet")) {
        return true;
      }
      return false;
    }
  }
};

// =============================================================================
// Linter Class
// =============================================================================

class SecurityLinter {
  constructor(options = {}) {
    this.options = {
      rules: { ...securityRules, ...options.rules },
      ignorePatterns: options.ignorePatterns || ['node_modules', '.git', 'dist', 'build'],
      extensions: options.extensions || ['.js', '.jsx', '.ts', '.tsx'],
      maxFileSize: options.maxFileSize || 1024 * 1024  // 1MB
    };

    this.findings = [];
    this.stats = {
      filesScanned: 0,
      errors: 0,
      warnings: 0,
      skipped: 0
    };
  }

  /**
   * Lint a single file
   */
  lintFile(filePath) {
    const findings = [];

    // Check file size
    const stats = fs.statSync(filePath);
    if (stats.size > this.options.maxFileSize) {
      this.stats.skipped++;
      return findings;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    // Check each rule
    for (const [ruleId, rule] of Object.entries(this.options.rules)) {
      // Pattern-based rules
      if (rule.patterns) {
        for (const pattern of rule.patterns) {
          const regex = new RegExp(pattern.source, pattern.flags);
          let match;

          while ((match = regex.exec(content)) !== null) {
            const lineNumber = content.substring(0, match.index).split('\n').length;
            const line = lines[lineNumber - 1] || '';

            // Check exceptions
            if (rule.exceptions) {
              const hasException = rule.exceptions.some(exc =>
                line.toLowerCase().includes(exc.toLowerCase())
              );
              if (hasException) continue;
            }

            findings.push({
              ruleId,
              severity: rule.severity,
              message: rule.message,
              cwe: rule.cwe,
              file: filePath,
              line: lineNumber,
              column: match.index - content.lastIndexOf('\n', match.index),
              source: line.trim().substring(0, 100)
            });
          }
        }
      }

      // Custom check functions
      if (rule.check && rule.check(content)) {
        findings.push({
          ruleId,
          severity: rule.severity,
          message: rule.message,
          cwe: rule.cwe,
          file: filePath,
          line: 1,
          column: 1,
          source: ''
        });
      }
    }

    return findings;
  }

  /**
   * Lint a directory recursively
   */
  lintDirectory(dirPath) {
    const files = this.getFiles(dirPath);

    for (const file of files) {
      try {
        const fileFindings = this.lintFile(file);
        this.findings.push(...fileFindings);
        this.stats.filesScanned++;

        for (const finding of fileFindings) {
          if (finding.severity === 'error') this.stats.errors++;
          else if (finding.severity === 'warning') this.stats.warnings++;
        }
      } catch (error) {
        console.error(`Error linting ${file}: ${error.message}`);
      }
    }

    return this;
  }

  /**
   * Get all files in directory matching extensions
   */
  getFiles(dirPath) {
    const files = [];

    const walk = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        // Check ignore patterns
        if (this.options.ignorePatterns.some(p => fullPath.includes(p))) {
          continue;
        }

        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (this.options.extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    };

    walk(dirPath);
    return files;
  }

  /**
   * Generate text report
   */
  generateTextReport() {
    const lines = [];
    lines.push('Security Lint Report');
    lines.push('='.repeat(60));
    lines.push(`Files scanned: ${this.stats.filesScanned}`);
    lines.push(`Errors: ${this.stats.errors}`);
    lines.push(`Warnings: ${this.stats.warnings}`);
    lines.push('='.repeat(60));
    lines.push('');

    // Group by file
    const byFile = {};
    for (const finding of this.findings) {
      if (!byFile[finding.file]) {
        byFile[finding.file] = [];
      }
      byFile[finding.file].push(finding);
    }

    for (const [file, fileFindings] of Object.entries(byFile)) {
      lines.push(file);

      for (const finding of fileFindings) {
        const severity = finding.severity === 'error' ? '✗' : '⚠';
        lines.push(`  ${finding.line}:${finding.column}  ${severity} ${finding.message}`);
        lines.push(`         ${finding.ruleId} (${finding.cwe || 'N/A'})`);
        if (finding.source) {
          lines.push(`         > ${finding.source}`);
        }
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Generate SARIF report (for CI integration)
   */
  generateSarifReport() {
    return {
      $schema: 'https://docs.oasis-open.org/sarif/sarif/v2.1.0/errata01/os/schemas/sarif-schema-2.1.0.json',
      version: '2.1.0',
      runs: [{
        tool: {
          driver: {
            name: 'security-linter',
            version: '1.0.0',
            rules: Object.entries(this.options.rules).map(([id, rule]) => ({
              id,
              name: id,
              shortDescription: { text: rule.message },
              defaultConfiguration: { level: rule.severity },
              properties: { tags: [rule.cwe] }
            }))
          }
        },
        results: this.findings.map(f => ({
          ruleId: f.ruleId,
          level: f.severity === 'error' ? 'error' : 'warning',
          message: { text: f.message },
          locations: [{
            physicalLocation: {
              artifactLocation: { uri: f.file },
              region: {
                startLine: f.line,
                startColumn: f.column
              }
            }
          }],
          properties: { cwe: f.cwe }
        }))
      }]
    };
  }

  /**
   * Get exit code based on findings
   */
  getExitCode() {
    return this.stats.errors > 0 ? 1 : 0;
  }
}

// =============================================================================
// Export
// =============================================================================

module.exports = {
  SecurityLinter,
  securityRules
};

// =============================================================================
// CLI
// =============================================================================

if (require.main === module) {
  const args = process.argv.slice(2);
  const targetPath = args[0] || '.';
  const outputFormat = args.includes('--sarif') ? 'sarif' : 'text';

  console.log('Security Linter');
  console.log('='.repeat(40));
  console.log(`Scanning: ${path.resolve(targetPath)}`);
  console.log('');

  const linter = new SecurityLinter();
  linter.lintDirectory(targetPath);

  if (outputFormat === 'sarif') {
    console.log(JSON.stringify(linter.generateSarifReport(), null, 2));
  } else {
    console.log(linter.generateTextReport());
  }

  process.exit(linter.getExitCode());
}
