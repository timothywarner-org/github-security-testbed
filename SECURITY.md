# Security Policy

## Purpose

This repository contains **intentionally vulnerable applications** and **security training materials** for the "GitHub Copilot for Cybersecurity Specialists" video course. The codebase includes examples of vulnerable code patterns, secure code patterns, and security testing tools for **educational purposes only**.

> **Warning**: This repository contains intentionally vulnerable code (NodeGoat, WebGoat, and lesson demos). **Do not deploy any code from this repository to production environments.**

## Supported Versions

| Version | Supported | Notes |
|---------|-----------|-------|
| main    | Yes       | Latest course materials and security fixes |
| develop | Yes       | Pre-release updates, may contain experimental code |

## Reporting a Vulnerability

We take security issues seriously, even in educational repositories. If you discover a security vulnerability that affects the **infrastructure** or **unintentional security issues** (not the deliberately vulnerable demo code), please follow responsible disclosure practices.

### What to Report

**Please report:**
- Security issues in the CI/CD pipeline configurations
- Exposed secrets or credentials (that shouldn't be exposed)
- Security issues in supporting scripts/tooling (not demo vulnerable apps)
- Issues that could affect learners following the course materials
- Supply chain vulnerabilities in dependencies

**Please do NOT report:**
- Vulnerabilities in intentionally vulnerable applications (NodeGoat, WebGoat)
- SQL injection, XSS, or other OWASP vulnerabilities in `/lesson-*` demo code
- Security issues that are documented as teaching examples

### How to Report

1. **Email**: security@timothywarner.org
2. **GitHub Security Advisories**: Use the [Security tab](https://github.com/timothywarner-org/github-security-testbed/security/advisories/new) to create a private security advisory
3. **Response Time**: We aim to acknowledge reports within 48 hours

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact assessment
- Suggested remediation (if any)
- Whether you want public acknowledgment

### Safe Harbor

We support safe harbor for security researchers who:
- Make a good faith effort to avoid privacy violations, data destruction, or service interruption
- Only interact with accounts you own or with explicit permission
- Do not exploit vulnerabilities beyond what is necessary to demonstrate the issue
- Report vulnerabilities promptly and provide reasonable time for remediation

## Security Best Practices for Course Users

When using this repository for learning:

### Local Development

1. **Isolated Environment**: Run vulnerable applications in containers or VMs
   ```bash
   # Use Docker for NodeGoat
   cd NodeGoat && docker-compose up

   # Use Docker for WebGoat
   cd WebGoat && docker-compose up
   ```

2. **Network Isolation**: Never expose vulnerable apps to the internet
   ```bash
   # Bind to localhost only
   docker run -p 127.0.0.1:3000:3000 nodegoat
   ```

3. **Clean Up**: Remove containers and images after learning sessions
   ```bash
   docker-compose down --rmi all --volumes
   ```

### Credential Management

- Never commit real credentials to this repository
- Use environment variables or secret managers for any real integrations
- Rotate any credentials that may have been accidentally exposed

### Dependency Security

This repository uses Dependabot for automated security updates. Key configurations:

- **Daily security updates** for critical vulnerabilities
- **Weekly version updates** for staying current
- **Automated PRs** with security labels for easy triage

## Security Features Enabled

### GitHub Security Features

| Feature | Status | Description |
|---------|--------|-------------|
| Dependabot Alerts | Enabled | Automated vulnerability detection in dependencies |
| Dependabot Security Updates | Enabled | Automatic PRs for security fixes |
| Secret Scanning | Enabled | Detects exposed secrets in commits |
| Push Protection | Enabled | Blocks pushes containing secrets |
| Code Scanning (CodeQL) | Configured | SAST for JavaScript, TypeScript, and Java |

### CI/CD Security

The security pipeline (`.github/workflows/security-pipeline.yml`) includes:

- **Secret Detection**: TruffleHog and GitLeaks scanning
- **Dependency Scanning**: npm audit, Snyk, OWASP Dependency Check
- **SAST**: CodeQL and Semgrep analysis
- **Container Scanning**: Trivy and Grype for Docker images
- **IaC Scanning**: Checkov and KICS for Terraform/Kubernetes
- **DAST**: OWASP ZAP baseline scanning

## Vulnerability Disclosure Timeline

| Stage | Timeframe |
|-------|-----------|
| Initial Response | 48 hours |
| Vulnerability Confirmation | 7 days |
| Remediation Development | 30 days (90 for complex issues) |
| Public Disclosure | After fix is released |

## Security Contacts

- **Primary Contact**: security@timothywarner.org
- **Repository Owner**: [@timothywarner-org](https://github.com/timothywarner-org)
- **Security Advisories**: [GitHub Security Advisories](https://github.com/timothywarner-org/github-security-testbed/security/advisories/new)

## Acknowledgments

We appreciate the security research community and will acknowledge researchers who report valid vulnerabilities (with permission) in our security advisories.

---

**Last Updated**: December 2024
**Policy Version**: 1.0
