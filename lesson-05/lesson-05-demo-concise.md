# Lesson 05 – Azure IaC & Compliance Demo (Concise Runbook)

**Repo:** `timothywarner-org/github-security-testbed`
**Lesson:** 05 – Azure, IaC, Compliance & Incident Response
**Runtime target:** ~15 minutes
**Context shift:** Same story as the Terraform/EC2 lesson, but now using **Azure + Bicep** instead of AWS + Terraform.

You already placed these in `lesson-05/`:

- `azure-sql-vulnerable.bicep`  (intentionally bad)
- `azure-sql-hardened.bicep`    (fixed / best-practice)

---

## Demo Flow (High Level)

1. Use **Copilot** to review `azure-sql-vulnerable.bicep` and call out security / compliance risks.
2. Have **Copilot** help move toward `azure-sql-hardened.bicep` and explain the hardening choices.
3. Run a simple **policy/compliance check** pattern over the Bicep (via scripts / tooling you already wired up in Lesson 05).
4. Use GitHub / Azure views to tie this back to **compliance & incident response**.

Keep each beat to ~3–4 minutes. This is the capstone, so focus on narrative more than knobs.

---

## Prerequisites (Before You Start)

- Repo cloned and opened in VS Code.
- You’re logged into GitHub (`gh auth status`) and Azure (`az login`) in the integrated terminal.
- Bicep CLI installed (`az bicep version` or `bicep --version`).
- Azure subscription you can safely deploy a tiny SQL demo into (or just *lint / validate* the Bicep without a full deploy).
- Lesson 05 helper scripts (policy checks / incident-response scripts) are in place from your earlier Terraform version – you’ll just point them at these Bicep files by path instead of `.tf`.

---

## 1. Copilot Code Review – `azure-sql-vulnerable.bicep` (3–4 minutes)

**Goal:** Show Copilot recognizing insecure Azure SQL configuration in IaC.

1. In VS Code, open:
   `lesson-05/azure-sql-vulnerable.bicep`
2. Select the full file or the SQL server + firewall section.
3. Open Copilot Chat (inline or sidebar) and run this prompt.

**Prompt to Copilot Chat:**

> You are a cloud security engineer reviewing Bicep infrastructure-as-code.
> Review this `azure-sql-vulnerable.bicep` file for security and compliance risks.
>
> 1. Identify specific risky settings (for example TLS, firewall, encryption, credentials).
> 2. For each issue, explain **why** it is a problem in Azure SQL and which best practice / compliance concern it violates.
> 3. Propose concrete changes to this Bicep to harden it, but **do not** rewrite the entire file yet.
> Keep the response concise and structured as a table of issues plus a short bullet list of remediation steps.

**On-camera callouts you can make:**

- **Hard-coded admin password** in a normal parameter (no `@secure()`), which means it’s logged in deployment history and visible to anyone with read access. Azure guidance is to use secure parameters for secrets.
- **Weak / legacy TLS** (TLS < 1.2) despite current Azure SQL guidance that minimum TLS should be 1.2 to avoid known protocol vulnerabilities.
- **Public network access enabled** plus a broad firewall rule, which significantly increases attack surface.
- **Transparent Data Encryption disabled**, even though TDE is recommended and enabled by default for new Azure SQL DBs.

No fixes yet; just showcase that Copilot can “smell” these issues in IaC.

---

## 2. Copilot-Guided Hardening – move toward `azure-sql-hardened.bicep` (4–5 minutes)

**Goal:** Show “before → after” using Copilot to converge on a secure baseline that matches your hardened template.

1. Open `lesson-05/azure-sql-hardened.bicep` in a second editor tab for your reference.
2. Go back to `azure-sql-vulnerable.bicep`, select the server + firewall + TDE resources.
3. Use this prompt to have Copilot rewrite them in-place:

**Prompt to Copilot Chat (from inside the vulnerable file):**

> Based on your earlier review, update these Bicep resources in-place to follow Azure SQL security best practices.
> Specifically:
>
> - Use a `@secure()` parameter for the administrator password instead of a hard-coded default.
> - Require TLS 1.2 or higher for client connections.
> - Replace the “allow everything” firewall rule with a parameterized single trusted IP.
> - Ensure Transparent Data Encryption (TDE) is enabled for the database.
> Preserve the general structure and names, and keep the changes minimal and well-commented.

4. Accept Copilot’s changes into a throwaway branch or just let them exist locally for the demo.
5. Flip over to your `azure-sql-hardened.bicep` tab and show how similar the patterns are.

**Key talking points:**

- `@secure()` for secrets keeps the value out of deployment history and aligns with secure-parameter rules.
- TLS 1.2 minimum and TDE enabled line up with Azure SQL security / compliance guidance.
- Narrow firewall scope (and the idea of private endpoints) gets you away from the “0.0.0.0/0” anti-pattern.

---

## 3. Compliance / Policy Check Script (3–4 minutes)

**Goal:** Reuse your Lesson 05 “compliance check” pattern, but point it at Bicep instead of Terraform.

Assuming you already have a simple script wired up from the Terraform version (for example, a Node/JS or PowerShell tool that checks for bad patterns), update it to inspect the Bicep files by path.

Examples of on-camera commands from the repo root:

```bash
# Show that the vulnerable template fails your simple checks
node lesson-05/tools/check-iac.js lesson-05/azure-sql-vulnerable.bicep

# Then show the hardened template passing (or at least raising fewer issues)
node lesson-05/tools/check-iac.js lesson-05/azure-sql-hardened.bicep
