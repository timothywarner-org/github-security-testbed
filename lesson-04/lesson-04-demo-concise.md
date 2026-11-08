# Lesson 04 – Security Demo (Concise Runbook)

**Repo:** `timothywarner-org/github-security-testbed`  
**Runtime:** ~15 minutes  
**Context:** MS Press GitHub Copilot for Cybersecurity – Lesson 04

---

## Demo Flow (high level)

1. Use **Copilot** to perform a focused **code review** in VS Code.  
2. Have **Copilot generate and refine a `gh api` + `jq` script** to list OWASP‑tagged CodeQL alerts.  
3. Show **Dependency review** on a pull request in the GitHub web UI.  
4. Show **Code scanning alerts** in the **Security** tab in GitHub web.

Keep each beat to ~3–4 minutes. Don’t over-explain; let the tools speak.

---

## Prerequisites (do these first)

- Repo cloned locally and opened in VS Code.  
- Workspace file: `github-security-testbed.code-workspace`.  
- You are logged into GitHub in VS Code / Git Bash (`gh auth status` is green).  
- `gh` CLI and `jq` installed on your system.  
- GitHub Advanced Security + CodeQL are already enabled on the repo and have run at least once on the default branch.  
- There is a prepared PR that changes dependencies (e.g., `package.json` / lock file) so Dependency review has something to show.

Suggested focus area for code review + alerts:  
- `lesson-04/demos/auth-api` (or another lesson-04 demo app you prefer).

---

## 1. Copilot Code Review in VS Code (3–4 minutes)

**Goal:** Show Copilot acting as a security-aware reviewer on a real file.

1. In VS Code, open:  
   `lesson-04/demos/auth-api/middleware/security.js`
2. Select the whole file or a clearly risky section.
3. Open Copilot Chat (inline or in the sidebar) and run this prompt.

**Prompt to Copilot Chat:**

> You are an application security engineer.  
> Review this file for security issues.  
> 1. Call out any issues and map them to the OWASP Top 10 (ID and name).  
> 2. Explain why each issue matters in a sentence or two.  
> 3. Suggest concrete code changes in this file to improve security.  
> Keep the answer short and structured as a table plus a bullet list of remediation steps.

**What to highlight verbally**

- Copilot understands **OWASP Top 10** language.  
- It spots patterns (insecure auth, validation, etc.) without changing the code yet.  
- You can ask follow-ups like “Show me a safer version of this middleware function.”

Optional follow-up prompt if you want one example fix:

> Show me a safer version of this middleware, in-place, that addresses the issues you identified. Keep the changes minimal and well-commented.

Accept *one* suggested change or simply scroll and talk through the diff.

---

## 2. Copilot‑Generated `gh api` OWASP Script (4–5 minutes)

**Goal:** Have Copilot help you build a Bash script that uses `gh api` to list OWASP‑tagged CodeQL alerts for this repo, then run it.

Create a new script file in VS Code:

- `lesson-04/scripts/owasp-top10-alerts.sh`

With that file active, open Copilot Chat and use this prompt:

**Prompt to Copilot Chat:**

> I’m in a Git clone of this repo and I have `gh` and `jq` installed and authenticated.  
> Write a Bash script for this file that uses the GitHub REST API via `gh api` to list CodeQL code-scanning alerts for the current repository and filter down to rules tagged with OWASP (OWASP Top 10).  
> Requirements:  
> - Use `repos/:owner/:repo/code-scanning/alerts` with `gh api` so the owner and repo come from the current directory.  
> - Add the `Accept` and `X-GitHub-Api-Version` headers.  
> - Use `jq` to:  
>   - keep only alerts whose `rule.tags` contain the string `owasp` (case-insensitive)  
>   - output JSON objects with: alert number, rule id, security severity, OWASP tags, and the file path of the most recent instance.  
> - Include `set -euo pipefail` at the top.  
> - Add a short comment header explaining what the script does.  
> Keep the script readable and under 40 lines.

Let Copilot draft the script, then refine it (if needed) toward this final shape:

```bash
#!/usr/bin/env bash
# List CodeQL alerts tagged with OWASP for the current repo.
# Requires: gh CLI (logged in) and jq.

set -euo pipefail

echo "Repo: $(gh repo view --json nameWithOwner -q .nameWithOwner)"
echo "OWASP-tagged CodeQL alerts:"
echo

gh api   -H "Accept: application/vnd.github+json"   -H "X-GitHub-Api-Version: 2022-11-28"   repos/:owner/:repo/code-scanning/alerts   --paginate   --jq '
    map(
      select(
        (.rule.tags // []) | any(.[]; test("owasp"; "i"))
      )
    )
    | .[]
    | {
        number,
        rule: .rule.id,
        severity: .rule.security_severity_level,
        owasp_tags: [(.rule.tags // [] | .[] | select(test("owasp"; "i")))] | unique,
        file: .most_recent_instance.location.path
      }
  '
```

**How to run it (Git Bash from repo root):**

```bash
chmod +x lesson-04/scripts/owasp-top10-alerts.sh
lesson-04/scripts/owasp-top10-alerts.sh
```

Notice:

- It’s the same data that shows up in the Security tab.  
- The filter is purely on `rule.tags` containing “owasp”, which often map to OWASP Top 10 rules.  
- This is an easy pattern to adapt for other tags (CWE, severity, etc.).

---

## 3. Dependency Review in GitHub Web (3–4 minutes)

**Goal:** Show supply-chain visibility when dependencies change in a PR.

Before you start, make sure you have a PR that changes dependencies, for example:

- Modifies `package.json` / `package-lock.json` in one of the vulnerable apps.

**Walkthrough:**

1. In the browser, go to the `github-security-testbed` repo on GitHub.  
2. Open your prepared PR (e.g., “Lesson 04 – dependency change demo”).  
3. Click **Files changed**.  
4. Open the **Dependency review** view/panel.  
5. Call out:  
   - Added / removed / updated packages.  
   - Any vulnerable versions and their severity.  
   - How this helps reviewers catch risky upgrades before merging.

Tie back to OWASP: vulnerable components / supply-chain risk.

---

## 4. Code Scanning Alerts in GitHub Web (3–4 minutes)

**Goal:** Close the loop by showing the same CodeQL findings in the Security tab.

1. In the same repo, click the **Security** tab.  
2. Under **Code scanning**, open **Code scanning alerts**.  
3. Filter by:  
   - Tool = **CodeQL**  
   - Branch = your default branch (e.g., `main`).  
4. Open an alert that is clearly related to an OWASP category.  
5. Show:  
   - The annotated code in the file.  
   - The rule details, including tags (OWASP / CWE where available).  
   - The ability to mark as fixed, dismiss, or create issues.

The takeaway:

> “That’s the same data our `gh api` script pulled, just filtered differently. Copilot helps write the code, CodeQL finds issues, and Dependency review + Security tab give us supply-chain and code-level visibility in one place.”

---

## End State

You’ve hit all four beats in under 15 minutes:

1. Copilot as **security reviewer**.  
2. Copilot as **automation partner** for the `gh api` script.  
3. **Dependency review** for supply-chain changes.  
4. **Code scanning alerts** as the single pane of glass.

Use this file as your on-screen checklist so you can stay relaxed and focused during the recording.
