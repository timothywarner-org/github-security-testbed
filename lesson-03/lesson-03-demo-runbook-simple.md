# Lesson 03 – 15-Minute Demo: Copilot + CodeQL

**Course:** GitHub Copilot for Cybersecurity Pros  
**Runtime target:** ~15 minutes, single smooth narrative

## Flow at a Glance

- **Part 1 (~8 min):** Use **Copilot Agent mode** to generate and run a security‑focused test suite.
- **Part 2 (~7 min):** Turn on **CodeQL code scanning** with GitHub Actions and point it at this lesson’s code.

Keep the story:

> Copilot helps you **create** security tests. GHAS and CodeQL help you **enforce** them continuously.

---

## Pre-Demo Setup (Do This First)

1. **Repo + Branch**
   - Push the `lesson-03` folder to a **private GHEC repo** with GHAS turned on.
   - Create a branch like `feature/lesson-03-security-tests`.

2. **Node/Test Harness**
   - In the repo root (or inside `lesson-03/demo-01-oauth-tests`), run:

     ```bash
     npm init -y
     npm install --save-dev jest
     ```

   - Add to `package.json`:

     ```json
     {
       "scripts": {
         "test": "jest"
       }
     }
     ```

     (Merge this into the existing `scripts` section if needed.)

3. **VS Code + Copilot**
   - Confirm **GitHub Copilot** and **Copilot Chat** are enabled in VS Code.
   - In the Copilot Chat panel, make sure you can switch to **Agent mode** (mode selector: Ask / Edit / Agent).

4. **GHAS / CodeQL entitlement**
   - In GitHub, repo **Settings → Security → Advanced Security**: verify GitHub Advanced Security is enabled for the repo.

---

## Part 1 – Copilot Agent: Generate & Run Security Tests (~8 min)

**Goal:** Show Copilot Agent understanding the repo, building a test suite, and running it for you.

### 1. Set the Scene (30–60 seconds)

- Open `lesson-03/demo-01-oauth-tests/oauth-security-tests.js` in VS Code.
- Talk track bullets:
  - “This lesson is about **automated security testing**.”
  - “We’ll let **Copilot Agent mode** design and wire up a test suite.”
  - “Then we’ll run the tests straight from chat to prove it’s not just code-as-confetti.”

### 2. Ask Copilot to Analyze the Code (Agent Mode) (1–2 min)

1. Open **Copilot Chat**.
2. Switch to **Agent** mode.
3. Use a prompt like:

   ```text
   You are helping a security engineer.

   Analyze this repo, focusing on lesson-03/demo-01-oauth-tests/oauth-security-tests.js.
   Summarize what is being tested now, and list the top 5 security behaviors that are currently NOT covered:
   - token expiration and invalidation
   - refresh token rotation
   - brute-force / rate limiting behavior
   - misuse of scopes
   - logging and audit trails for suspicious auth events

   Then propose a minimal but realistic Jest test suite structure to cover those risks.
   ```

- Let Agent mode show its plan and file selections.

### 3. Have Copilot Implement the Test Suite (2–3 min)

1. In the same Agent session, follow up:

   ```text
   Great. Please implement your proposed Jest test suite.

   - Create a new file: lesson-03/demo-01-oauth-tests/oauth-security-tests.spec.js
   - Use Jest best practices: describe blocks by threat, not function name.
   - Include tests for:
     - expired access tokens
     - refresh token rotation and invalidation of the old refresh token
     - rate limiting / lockout after repeated failed logins
     - scope misuse (reject tokens lacking the required scope)
   - Assume we can import the auth module from ../src/auth.js (create a simple stub if needed).
   - Add any missing devDependencies and npm scripts to package.json to run these tests with `npm test`.
   ```

2. Accept the Agent’s edits (review the diff quickly).
3. Talk track bullets:
   - “Agent mode is not just completing a single function.”
   - “It’s planning, touching multiple files, wiring scripts, and keeping tests consistent with the existing style.”

### 4. Ask Copilot to Run the Tests (1–2 min)

You want to show the agent actually executing tooling.

1. In the same Agent conversation, ask:

   ```text
   Now run the Jest test suite you just created and show me the results.
   ```

2. Agent mode should run `npm test` in a background shell and stream the output.

3. If some tests fail, that’s your moment:
   - “Security tests failing are good; they reveal gaps.”
   - Then:

     ```text
     Fix the failing tests by adjusting either the test data or the auth stub so they reflect a realistic, secure implementation, then re-run the tests.
     ```

4. End Part 1 with a quick bow:
   - “We just turned a vague security requirement into an executable test suite and verified it, all from chat.”

---

## Part 2 – CodeQL via GitHub Actions on This Lesson (~7 min)

**Goal:** Show CodeQL code scanning on the same repo, tuned to this lesson’s code.

You’re shifting from local, Copilot-assisted testing to cloud-side, GHAS-backed SAST.

### 1. Enable CodeQL Default Setup (UI) (2–3 min)

1. In the browser, open the same repo on GitHub.
2. Click **Settings**.
3. In the left sidebar under **Security**, click **Advanced Security**.
4. Under **Code Security → CodeQL analysis**, click **Set up → Default**.
5. Choose:
   - **Languages:** ensure **JavaScript** (and others if present) are selected.
   - **Events:** keep the defaults (`push`, `pull_request`, and a schedule).

This generates a `.github/workflows/codeql.yml` workflow that uses the CodeQL Action.

### 2. Customize CodeQL Config with Copilot (2–3 min)

Now you tune CodeQL to your course materials, using Copilot inside the workflow file.

1. From the repo in GitHub, open `.github/workflows/codeql.yml` in the web editor (or pull it locally in VS Code).
2. Point out that this is advanced config as code for code scanning.
3. In VS Code, open the workflow file and use Copilot Chat (Ask or Edit mode):

   ```text
   Update this CodeQL workflow so it focuses on the lesson-03 folder for JavaScript.

   - Limit the analysis to the lesson-03 directory tree.
   - Keep the default query suite, but add configuration so I can plug in custom queries from lesson-03/demo-03-sast-dast/codeql/queries if needed.
   - Make sure the job still runs on:
     - pushes to main
     - pull requests targeting main
     - a nightly schedule
   ```

4. Accept Copilot’s edits. You might see:
   - A `paths:` filter limiting scanning to `lesson-03/**`.
   - A comment block hinting at a custom query directory.

Talking point:

> “Now CodeQL is wired to this training code, and I can easily add my own queries for things like SQL injection beyond the stock packs.”

### 3. Trigger a Run and Show Alerts (2 min)

1. Commit the workflow changes.
2. In GitHub:
   - Go to **Actions**, show the `CodeQL` workflow run kicking off.
   - Then go to **Security → Code scanning alerts** and show the alert list once the run finishes.

3. Quick bullet commentary:
   - “CodeQL is static analysis as a service.”
   - “GHAS ties this to other features like secret scanning and Copilot-powered fixes.”

---

## Close – Tie Copilot, GHAS, and GHEC Together (≤1 min)

Final talking points:

- **Copilot Agent Mode:** turns vague security requirements into tests and commands, executed from chat.
- **CodeQL + GHAS:** turn those security expectations into repeatable, repo-wide gates.
- **GHEC context:** all of this lives behind enterprise controls, policy, and auditability.

> This is the pattern: agent-assisted development on your laptop, CodeQL and GHAS enforcing the same intent on every pull request.
