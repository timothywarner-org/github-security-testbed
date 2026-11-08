# GitHub Copilot for Cybersecurity Specialists - Lesson 5: Compliance, Incident Response, Configuration Management

**Runtime: 40 minutes | Compliance automation + IaC hardening + IR workflows**
**Environment: VS Code + GitHub Enterprise Cloud + Azure/Terraform**

---

## 🎯 Lesson Overview

This lesson demonstrates using GitHub Copilot and infrastructure-as-code to automate compliance checking, STIG validation, incident response playbooks, and security documentation. Transform quarterly compliance panic into continuous validation while maintaining audit evidence.

**Key Message:** Security compliance becomes deterministic when encoded in infrastructure. Incident response becomes reliable when automated. Documentation stays accurate when generated from code.

---

## ⚠️ Pre-Demo Checklist

**A day before you start:**
- [ ] Test all 4 demo flows end-to-end
- [ ] Verify Copilot authentication and quota
- [ ] Clone TerraGoat: `git clone https://github.com/bridgecrewio/terragoat`
- [ ] Verify PowerShell 7.x installed locally
- [ ] Test Python environment for compliance scripts
- [ ] Backup screenshots of expected Copilot outputs

**Right before you start:**
- [ ] Start demo environment services (Terraform, Python environments)
- [ ] Open VS Code with demo workspace
- [ ] Clear terminal history for clean recording
- [ ] Verify GitHub Copilot extension active
- [ ] Have Azure CLI authenticated (az login)

**Immediately Before:**
- [ ] Close distracting apps (Slack, email, notifications)
- [ ] Disable all system notifications
- [ ] Set Copilot to high verbosity mode
- [ ] Deep breath - you've done this before

---

## 🎬 Demo 1: IaC Security Templates and Compliance Baselines
**Time: 10 minutes | Learning Objective: Generate secure-by-default infrastructure templates**

### Pre-Demo Setup (1 min)
```bash
cd github-security-testbed/lesson-05/demo-01-iac-templates
ls -la  # Show TerraGoat Terraform files
code .  # Open in VS Code
```

### Demo Flow

#### Step 1: Show Misconfigured Infrastructure (2 min)
Open TerraGoat file showing Azure SQL database with vulnerabilities:
- Public accessibility enabled (bad)
- Transparent data encryption disabled (bad)
- Minimal firewall rules (bad)
- No audit logging configured (bad)

**Code Example:**
```hcl
resource "azurerm_mssql_server" "vulnerable" {
  name                         = "vulndb-${random_string.suffix.result}"
  resource_group_name          = azurerm_resource_group.rg.name
  location                      = azurerm_resource_group.rg.location
  version                       = "12.0"
  administrator_login           = "sqladmin"
  administrator_login_password  = var.sql_admin_password  # ← No rotation policy
  # MISSING: TDE encryption configuration
  # MISSING: VirtualNetworkRule for private endpoint
  # MISSING: AzureServicesAndResourcesAccessEnabled = false
}

resource "azurerm_mssql_database" "vulnerable_db" {
  name           = "vulnerable-db"
  server_id      = azurerm_mssql_server.vulnerable.id
  collation      = "SQL_Latin1_General_CP1_CI_AS"
  # MISSING: threat_detection_policy
  # MISSING: backup_retention_days > 7
}
```

**Talking Points:**
- "This is how most cloud infrastructure starts - developers focus on functionality, security gets bolted on later"
- "Azure SQL has dozens of security controls - which ones matter? Which are misconfigured?"
- "Manual audit of 500 servers × 50+ controls? That's 25,000 checks. Impossible to keep current."
- "Let's use Copilot to generate the hardened baseline template from security requirements"

#### Step 2: Generate Hardened Template with Copilot (3 min)
Open Copilot Chat (Ctrl+Shift+I / Cmd+Shift+I)

**Copilot Prompt:**
```
Generate hardened Azure SQL Terraform module following security best practices.
Include:

1. **Encryption at Rest**: Transparent Data Encryption (TDE) enabled, customer-managed keys
2. **Encryption in Transit**: TLS 1.2 minimum, connection policy enforced
3. **Network Security**:
   - Private endpoints only (no public IP)
   - Firewall rules whitelist only known services
   - Virtual network service endpoints configured
4. **Access Control**:
   - Azure AD authentication primary method
   - Administrator login minimal privileges
   - Database-level role-based access control
5. **Audit & Monitoring**:
   - Audit logging enabled to storage account
   - Advanced threat protection enabled
   - Vulnerability assessments scheduled weekly
6. **Compliance**:
   - CIS Azure foundations benchmark aligned
   - NIST 800-53 SC-7 (boundary protection) controls
   - Comments explaining each security control

Output as Terraform module (variables.tf, main.tf, outputs.tf). Include validation and error handling.
```

**Expected Copilot Response:**
- `variables.tf` with security-focused input variables
- `main.tf` with comprehensive hardened configuration
- `outputs.tf` with audit evidence data
- Inline comments explaining why each control matters

**Talking Points:**
- "Copilot analyzes Azure SQL documentation, CIS benchmarks, and security best practices"
- "Generates not just code, but explanations of why controls matter"
- "This module becomes your compliance baseline - every deployment gets these controls automatically"
- "No more 'I think we configured encryption somewhere' - it's deterministic"

#### Step 3: Review and Refine Security Controls (2 min)
Point to specific sections:

**Show TDE Configuration:**
```hcl
resource "azurerm_mssql_server_transparent_data_encryption" "secure" {
  server_id = azurerm_mssql_server.secure.id
  key_vault_key_id = azurerm_key_vault_key.sql_tde_key.id
}
```

**Show Private Endpoint:**
```hcl
resource "azurerm_private_endpoint" "sql" {
  name                = "${var.sql_server_name}-private-endpoint"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  subnet_id           = azurerm_subnet.private.id

  private_service_connection {
    name              = "sql-connection"
    is_manual_approval_enabled = false
    private_connection_resource_id = azurerm_mssql_server.secure.id
    subresource_names = ["sqlServer"]
  }
}
```

**Talking Points:**
- "TDE with customer-managed keys - only your organization decrypts this database"
- "Private endpoint - no public IP exposure at all. Zero attack surface on the network"
- "These aren't optional 'nice to have' controls - they're part of the hardened baseline"
- "Every database provisioned with this module gets these controls by default"

#### Step 4: Validate Template and Deploy (2 min)
```bash
# Validate Terraform syntax
terraform validate

# Check against Azure best practices (if using checkov)
checkov -f main.tf --framework terraform --check CKV_AZURE_1,CKV_AZURE_3,CKV_AZURE_15

# Deploy to Azure (demo only - don't actually deploy to production)
# terraform plan
# terraform apply
```

**Show Success Output:**
```
✓ TLE encryption enabled with customer-managed key
✓ Private endpoint configured, public access denied
✓ Azure AD authentication primary method
✓ Audit logging enabled to storage account
✓ Advanced threat protection active
✓ Compliance checks: CIS 4.1, CIS 4.8, CIS 4.9 ✓
```

**Talking Points:**
- "Validation confirms Terraform syntax is correct"
- "Checkov runs Azure security checks - CKV_AZURE controls"
- "When you provision with this module, your SQL database is secure by default"
- "This is compliance-as-code: security is deterministic, auditable, and reproducible"

**Key Takeaway:** Copilot generates hardened infrastructure templates that encode security controls into provisioning. Every deployment with this module gets the same security baseline automatically.

---

## 🎬 Demo 2: CIS and NIST Benchmark Verification Scripts
**Time: 10 minutes | Learning Objective: Automate compliance benchmark checking**

### Pre-Demo Setup (1 min)
```bash
cd github-security-testbed/lesson-05/demo-02-compliance-scripts
ls -la  # Show existing Azure resources
code .  # Open VS Code
```

### Demo Flow

#### Step 1: Show Compliance Audit Challenge (2 min)
Open PowerShell showing Azure resource list:
```powershell
# Get all Azure SQL Servers in subscription
Get-AzSqlServer | Select-Object ServerName, Location, SqlAdministratorLogin

# Expected output: 15-50 servers across dev/test/prod
# Each needs ~50 CIS controls checked
# 15 servers × 50 controls = 750 manual checks per audit cycle
# Quarterly audits = 3,000 checks per year
```

**Talking Points:**
- "CIS benchmarks are prescriptive - specific settings for security baselines"
- "NIST 800-53 is outcome-focused - achieve these security properties"
- "Manual checking 15 servers? That's realistic. But doing it quarterly? That's painful."
- "And you miss things - 'I thought we set that parameter...' - no, you didn't"

#### Step 2: Generate CIS Compliance Script with Copilot (3 min)
Open Copilot Chat

**Copilot Prompt:**
```
Generate PowerShell script to audit Azure SQL Servers against CIS Microsoft Azure Foundations Benchmark.
Check these specific controls:

1. CIS 4.1: Ensure 'Server parameter 'log_checkpoints' is set to 'ON' for PostgreSQL Database Server'
2. CIS 4.2: Ensure 'Server parameter 'log_connections' is set to 'ON' for PostgreSQL Database Server'
3. CIS 4.3: Ensure 'Server parameter 'log_disconnections' is set to 'ON' for PostgreSQL Database Server'
4. CIS 4.4: Ensure 'Enforce SSL connection' is set to 'ENABLED' for MySQL Database Server'
5. CIS 4.8: Ensure that Azure SQL Database transparent data encryption is enabled
6. CIS 4.9: Ensure that Azure SQL Database has Azure Active Directory authentication configured
7. CIS 4.11: Ensure Azure SQL Server firewall rules do not allow 0.0.0.0/0 (ALLOW ALL)
8. CIS 4.12: Ensure Azure SQL Server audit logging is enabled

For each check:
- Query actual Azure resource state
- Compare against expected (secure) value
- Return PASS/FAIL/WARNING
- If FAIL, suggest remediation command

Output:
- Console table with results
- JSON export for automation
- Detailed remediation steps for each failure

Use Azure PowerShell cmdlets (Get-Az*). Include error handling for missing permissions.
```

**Expected Copilot Response:**
- PowerShell function for each CIS control
- Connection/authentication handling
- HTML/CSV report generation

**Talking Points:**
- "Copilot understands Azure cmdlets from Microsoft documentation"
- "Generates not just checks, but remediation suggestions"
- "This script becomes your compliance automation - run it weekly, get a report"

#### Step 3: Execute Compliance Scan (2 min)
```bash
# Run compliance script
./Audit-CIS-AzureSQLComplianceBaseline.ps1 -SubscriptionId "<sub-id>" -Verbose

# Expected output:
#   ✓ TDE Enabled                    PASS
#   ✓ AD Auth Configured             PASS
#   ✗ Firewall Rule 0.0.0.0/0        FAIL - Remediate: Remove-AzSqlServerFirewallRule
#   ✓ Audit Logging Enabled          PASS
#   ⚠ Backup Retention < 30 days     WARNING - Recommend: 30+ days for compliance

# Export to JSON/CSV for auditor
./Audit-CIS-AzureSQLComplianceBaseline.ps1 -ExportFormat JSON -OutputFile compliance-report-$(Get-Date -Format yyyy-MM-dd).json
```

**Show Report Output:**
```json
{
  "scan_date": "2025-11-26T19:30:00Z",
  "subscription": "prod",
  "summary": {
    "total_controls": 8,
    "passed": 6,
    "failed": 1,
    "warnings": 1,
    "compliance_percentage": 75
  },
  "findings": [
    {
      "control_id": "CIS 4.11",
      "control_name": "Firewall rule 0.0.0.0/0",
      "status": "FAIL",
      "resource": "db-prod-01",
      "remediation": "Remove-AzSqlServerFirewallRule -ResourceGroupName 'prod' -ServerName 'db-prod-01' -FirewallRuleName 'AllowAllWindowsAzureIps'"
    }
  ]
}
```

**Talking Points:**
- "75% compliant - audit evidence captured with timestamp"
- "Specific remediation commands - no ambiguity about what to fix"
- "JSON export for integration with ticketing systems (create Jira ticket per failure)"
- "Run this weekly - continuous validation beats quarterly panic audits"

#### Step 4: Schedule Automated Scanning (1 min)
Show GitHub Actions workflow:

**File: `.github/workflows/compliance-scan.yml`**
```yaml
name: Weekly CIS Compliance Audit

on:
  schedule:
    - cron: '0 6 * * MON'  # Every Monday at 6 AM UTC
  workflow_dispatch:

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run CIS Compliance Audit
        run: |
          ./Audit-CIS-AzureSQLComplianceBaseline.ps1 \
            -SubscriptionId ${{ secrets.AZURE_SUBSCRIPTION_ID }} \
            -ExportFormat JSON

      - name: Upload Results
        uses: actions/upload-artifact@v3
        with:
          name: compliance-report-${{ github.run_id }}
          path: compliance-report-*.json

      - name: Create Compliance Issue
        if: failure()
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: 'Compliance Audit Failed - Week of ' + new Date().toISOString().split('T')[0],
              body: 'See artifacts for detailed findings',
              labels: ['compliance', 'security']
            })
```

**Talking Points:**
- "Automated compliance scanning every Monday morning"
- "Results uploaded as artifacts - audit evidence captured automatically"
- "If audit fails, GitHub automatically creates an issue for team review"
- "Compliance is now continuous, not quarterly"

**Key Takeaway:** Copilot generates compliance verification scripts that transform manual audits into automated checks. Run weekly, get consistent evidence, fix issues before they become audit findings.

---

## 🎬 Demo 3: STIG Validation and Auto-Remediation
**Time: 10 minutes | Learning Objective: Automate STIG compliance with safe remediation**

### Pre-Demo Setup (1 min)
```bash
cd github-security-testbed/lesson-05/demo-03-stig-remediation
ls -la  # Show Windows Server with STIG scan results
code .  # Open VS Code
```

### Demo Flow

#### Step 1: Show STIG Vulnerability Scan (2 min)
Open STIG scan results (pre-recorded from PowerSTIG):

```powershell
# Get STIG baseline for Windows Server 2022
Get-DscResource -Name SecurityBaseline -ErrorAction SilentlyContinue

# Run scan showing current state vs. STIG baseline
Invoke-Pester -Path ./Windows-Server-2022-STIG-Test.ps1 -Passthru
```

**Show Results:**
```
Pester Test Results Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Tests: 284
Passed:      242 (85%)
Failed:       28 (10%)
Skipped:      14 (5%)

CAT I (Critical):   2 failures
  ✗ V-93075: Windows Defender Antimalware Service Disabled
  ✗ V-93089: Windows Firewall Profiles Not All Enabled

CAT II (Medium):   18 failures
  ✗ V-93127: Password Policy Min Length < 14 chars
  ✗ V-93145: Account Lockout Duration < 30 min
  [...]

CAT III (Low):     8 failures
  ✗ V-93389: Unnecessary Services Installed
```

**Talking Points:**
- "STIGs are DoD security standards - highly prescriptive"
- "CAT I = critical vulnerability, CAT II = medium, CAT III = low"
- "285 controls per baseline - manual checking takes days"
- "This Windows Server is 85% compliant - 28 gaps to remediate"
- "CAT I failures block production deployment"

#### Step 2: Generate Auto-Remediation Scripts with Copilot (3 min)
Open Copilot Chat

**Copilot Prompt:**
```
Generate PowerShell DSC (Desired State Configuration) remediation scripts for Windows Server 2022 STIG failures.

For these CAT I (critical) failures:
- V-93075: Enable Windows Defender Antimalware Service (set to Auto startup)
- V-93089: Enable Windows Firewall (Domain, Private, Public profiles)

For these CAT II failures:
- V-93127: Set minimum password length to 14 characters (GPO and local policy)
- V-93145: Set account lockout duration to 30 minutes minimum
- V-93147: Set password history to 24 passwords remembered

For each remediation:
1. Create PowerShell DSC configuration that sets the correct value
2. Include validation checks (confirm setting was applied)
3. Add rollback capability (show how to undo if needed)
4. Provide pre-remediation and post-remediation verification

Output:
- Separate DSC resource for each STIG control
- Composite configuration combining all remediations
- Deployment script with safety checks
- Rollback script for each configuration
- Testing script to verify remediation

Include error handling and logging. Assume running with administrative privileges.
```

**Expected Copilot Response:**
- `Remediate-STIG-WindowsServer-2022.ps1` DSC configuration
- Per-control remediation scripts
- Validation and rollback capability

**Show Generated Code Example:**
```powershell
configuration RemediateStigWindowsServer2022 {
  param(
    [Parameter(Mandatory)]
    [string[]]$ComputerName
  )

  Import-DscResource -ModuleName PSDesiredStateConfiguration
  Import-DscResource -ModuleName SecurityPolicyDsc

  Node $ComputerName {
    # V-93075: Enable Windows Defender Antimalware Service
    Service WindowsDefenderService {
      Name       = 'WinDefend'
      State      = 'Running'
      StartupType = 'Automatic'
      DependsOn  = '[Package]WindowsDefenderEnabled'
    }

    # V-93089: Enable Windows Firewall (all profiles)
    WindowsFirewall FirewallDomain {
      Enabled = $true
      Profile = 'Domain'
    }

    WindowsFirewall FirewallPrivate {
      Enabled = $true
      Profile = 'Private'
    }

    WindowsFirewall FirewallPublic {
      Enabled = $true
      Profile = 'Public'
    }

    # V-93127: Minimum Password Length = 14
    SecurityPolicy PasswordMinLength {
      Name   = 'MinimumPasswordLength'
      Value  = 14
    }

    # V-93145: Account Lockout Duration >= 30 minutes
    SecurityPolicy AccountLockoutDuration {
      Name   = 'LockoutDuration'
      Value  = 30
    }
  }
}
```

**Talking Points:**
- "Copilot understands DSC syntax and STIG requirements"
- "Generates complete configurations, not just commands"
- "DSC ensures idempotent remediation - run it multiple times, same result"
- "Service dependencies handled automatically"

#### Step 3: Execute Remediation with Validation (2 min)
```powershell
# Step 1: Pre-remediation verification
Write-Host "Pre-Remediation STIG Baseline State:"
Invoke-Pester -Path ./Windows-Server-2022-STIG-Test.ps1 -Passthru | Select-Object -Property Passed, Failed, Skipped

# Step 2: Generate DSC configuration
. .\Remediate-STIG-WindowsServer-2022.ps1
RemediateStigWindowsServer2022 -ComputerName 'PRODSERVER-01' -OutputPath .\DscConfig

# Step 3: Apply DSC (can be with Desired State Configuration LCM or direct)
Start-DscConfiguration -Path .\DscConfig -ComputerName 'PRODSERVER-01' -Wait -Verbose -Force

# Step 4: Post-remediation verification
Write-Host "Post-Remediation STIG Baseline State:"
Invoke-Pester -Path ./Windows-Server-2022-STIG-Test.ps1 -Passthru | Select-Object -Property Passed, Failed, Skipped
```

**Show Remediation Results:**
```
Pre-Remediation:   242 Passed, 28 Failed
Post-Remediation:  269 Passed, 2 Failed (CAT I critical issues remediated!)

CAT I Status:      ✓ All 2 critical failures remediated
CAT II Status:     ✓ 18 of 18 medium failures remediated
CAT III Status:    ⚠ 8 low-priority issues remain (acceptable for now)

Overall Compliance: 85% → 97.8% (remediation successful)
```

**Talking Points:**
- "Pre-remediation: 28 failures blocking compliance"
- "DSC applied configuration to server"
- "Post-remediation: Critical CAT I issues eliminated"
- "Compliance jumped from 85% to 97.8% in one remediation cycle"
- "Safe: DSC was idempotent, can be re-applied without harm"

#### Step 4: Schedule Continuous Compliance Validation (1 min)
Show PowerShell DSC LCM (Local Configuration Manager) setup:

```powershell
# Configure LCM for continuous compliance validation
[DscLocalConfigurationManager()]
configuration LCMConfig {
  Node localhost {
    Settings {
      RefreshMode                    = 'Pull'
      RefreshFrequencyMins           = 15
      ConfigurationModeFrequencyMins = 15
      ConfigurationMode              = 'ApplyAndAutoCorrect'
      RebootNodeIfNeeded             = $true
      AllowModuleOverwrite           = $true
      CertificateID                  = $null
    }

    ConfigurationRepositoryWeb DSCServer {
      ServerURL           = "https://dsc.example.com/PSDscPullServer.svc"
      RegistrationKey     = $RegistrationKey
      ConfigurationNames  = @("RemediateStigWindowsServer2022")
    }
  }
}

# Apply LCM configuration
Set-DscLocalConfigurationManager -Path .\LCMConfig -Force
```

**Talking Points:**
- "LCM checks server compliance every 15 minutes"
- "If configuration drifts (someone manually changed a setting), LCM auto-corrects"
- "STIG compliance becomes continuous, not quarterly"
- "Drift detected and logged - audit evidence of compliance maintenance"

**Key Takeaway:** Copilot generates STIG remediation scripts using DSC that safely apply fixes with validation. Auto-remediation handles most CAT II/III issues. CAT I requires review but is automated. Compliance drifts are detected and corrected automatically.

---

## 🎬 Demo 4: Incident Response Playbook Automation
**Time: 10 minutes | Learning Objective: Generate and automate IR workflows**

### Pre-Demo Setup (1 min)
```bash
cd github-security-testbed/lesson-05/demo-04-ir-playbooks
ls -la  # Show existing IR scripts and Azure Log Analytics
code .  # Open VS Code
```

### Demo Flow

#### Step 1: Show Incident Response Challenge (1.5 min)
Open Azure Sentinel / Log Analytics showing simulated ransomware detection:

```
Alert: Suspicious PowerShell Execution Detected
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Severity:        HIGH
Detection Time:  2025-11-26 19:45:23 UTC
Source:          vm-prod-database-01
Command Line:    powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "net user hacker P@ssw0rd123 /add /active:yes"
Parent Process:  C:\Windows\Temp\update.exe
Filename:        C:\Windows\Temp\update.exe (MD5: 7a2f3c8d9e1b4a6c)
```

**Talking Points:**
- "This is a real threat - someone created a new admin account"
- "Ransomware often creates persistence accounts before encrypting files"
- "You need to move fast: isolate the host, collect evidence, block the attacker"
- "Manual IR takes hours: 'Who do I call? What do I do first? Did I collect all evidence?'"
- "Let's use Copilot to generate an automated IR playbook"

#### Step 2: Generate IR Playbook with Copilot (3 min)
Open Copilot Chat

**Copilot Prompt:**
```
Generate automated incident response playbook for ransomware compromise (suspicious admin account creation).
Target environment: Azure with Windows VMs, Log Analytics, Azure Automation.

For suspected ransomware incident with suspicious PowerShell account creation:

**Phase 1: DETECTION & VALIDATION (automated)**
- Query Log Analytics for similar suspicious account creation events in past 24 hours
- Check for file encryption patterns (common ransomware extensions: .locked, .encryptor, etc.)
- Cross-reference with malware databases (VirusTotal, etc.)
- Alert SOC team with findings

**Phase 2: CONTAINMENT (semi-automated, requires approval)**
- Isolate affected VM (disconnect from network, keep power on for forensics)
- Terminate suspicious processes by PID
- Revoke all active sessions for the compromised account
- Reset passwords for all privileged accounts that may have been exposed
- Block suspicious IPs at firewall/WAF

**Phase 3: ERADICATION (automated)**
- Remove suspicious user accounts
- Remove persistence mechanisms (scheduled tasks, auto-start registry keys)
- Delete malware files (preserve for forensics first)
- Patch the vulnerability that enabled initial compromise

**Phase 4: RECOVERY (manual)**
- Restore VM from clean backup
- Validate backups not encrypted by ransomware
- Verify business systems operational
- Document recovery time and data loss

**Phase 5: EVIDENCE COLLECTION (automated)**
- Export all relevant logs (Event Viewer, PowerShell, network)
- Calculate hash of suspicious files (for law enforcement)
- Screenshot current state
- Archive all evidence with cryptographic hash

Output:
1. PowerShell script for automated containment (stop processes, disconnect network)
2. KQL (Kusto Query Language) for Log Analytics hunting
3. Azure Automation runbook for orchestration
4. Incident response checklist
5. Evidence collection script
6. Notification/escalation templates

Include error handling. Assume running with SOC automation service account (elevated privileges).
```

**Expected Copilot Response:**
- Multi-phase IR workflow
- PowerShell scripts for each phase
- Log Analytics KQL queries
- Azure Automation runbook
- Evidence preservation procedures

**Show Generated IR Script Example:**
```powershell
# Ransomware Incident Response Playbook - Automated Containment
# Triggered by: Azure Sentinel Alert (High severity)
# Approval: Required before Phase 2 execution

param(
    [Parameter(Mandatory)]
    [string]$VirtualMachineName,

    [Parameter(Mandatory)]
    [string]$ResourceGroupName,

    [Parameter(Mandatory)]
    [string]$SubscriptionId,

    [switch]$ExecuteContainment = $false
)

# Phase 1: Detection & Investigation
Write-Host "=== PHASE 1: DETECTION & INVESTIGATION ===" -ForegroundColor Yellow

# Query Log Analytics for similar suspicious account creation
$KQL = @'
SecurityEvent
| where EventID == 4720  # Account created
| where TimeGenerated > ago(24h)
| where Account contains "hacker" or Account contains "admin" or Account contains "test"
| project TimeGenerated, Computer, Account, SubjectUserName, NewAccountName
'@

# Query for file encryption patterns
$EncryptionKQL = @'
SecurityEvent
| where EventID in (4689, 4688)  # Process termination/creation
| where CommandLine contains ".encryptor" or CommandLine contains ".locked" or CommandLine contains ".crypto"
| where TimeGenerated > ago(24h)
| project TimeGenerated, Computer, CommandLine
'@

# Phase 2: Containment (requires approval)
if ($ExecuteContainment) {
    Write-Host "=== PHASE 2: CONTAINMENT ===" -ForegroundColor Red

    # Get VM object
    $VM = Get-AzVM -ResourceGroupName $ResourceGroupName -Name $VirtualMachineName

    # Isolate VM: Remove network interface (preserves VM for forensics)
    $NIC = Get-AzNetworkInterface -ResourceId $VM.NetworkProfile.NetworkInterfaces[0].Id
    Remove-AzNetworkInterfaceIpConfig -Name $NIC.IpConfigurations[0].Name -NetworkInterface $NIC -Force
    Set-AzNetworkInterface -NetworkInterface $NIC
    Write-Host "✓ VM network interface removed (isolated)" -ForegroundColor Green

    # Collect evidence before remediation
    Write-Host "Collecting forensic evidence..." -ForegroundColor Yellow

    # Stop processes by command line match
    $SuspiciousProcesses = Invoke-AzVMRunCommand -ResourceGroupName $ResourceGroupName -VMName $VirtualMachineName -CommandId "RunPowerShellScript" -ScriptString @'
Get-Process | Where-Object { $_.CommandLine -match "update.exe" -or $_.CommandLine -match "msiexec" } | Select-Object -Property Id, ProcessName, CommandLine, StartTime
'@

    Write-Host $SuspiciousProcesses.Value[0].Message -ForegroundColor Yellow

    # Phase 3: Eradication
    Write-Host "=== PHASE 3: ERADICATION ===" -ForegroundColor Red

    # Remove suspicious user account
    Invoke-AzVMRunCommand -ResourceGroupName $ResourceGroupName -VMName $VirtualMachineName -CommandId "RunPowerShellScript" -ScriptString @'
# Remove the suspicious account
net user hacker /delete
Write-Host "✓ Suspicious account removed"
'@
}

# Phase 5: Evidence Collection & Logging
Write-Host "=== PHASE 5: EVIDENCE COLLECTION ===" -ForegroundColor Cyan

# Export Windows Event Log
Invoke-AzVMRunCommand -ResourceGroupName $ResourceGroupName -VMName $VirtualMachineName -CommandId "RunPowerShellScript" -ScriptString @'
$EventPath = "C:\IREvidence\SecurityLog-$(Get-Date -Format yyyy-MM-dd-HHmmss).evtx"
New-Item -ItemType Directory -Path "C:\IREvidence" -Force | Out-Null
wevtutil export-log Security $EventPath /overwrite:true
Write-Host "✓ Security Event Log exported: $EventPath"
'@

# Hash suspicious files
Write-Host "Computing cryptographic hashes of suspicious files..." -ForegroundColor Yellow
Invoke-AzVMRunCommand -ResourceGroupName $ResourceGroupName -VMName $VirtualMachineName -CommandId "RunPowerShellScript" -ScriptString @'
Get-FileHash -Path "C:\Windows\Temp\update.exe" -Algorithm SHA256 | Format-List
'@

Write-Host "✓ Incident response playbook complete. Evidence preserved." -ForegroundColor Green
```

**Show Log Analytics Query for Threat Hunting:**
```kusto
// KQL: Hunt for ransomware indicators in past 7 days
SecurityEvent
| union ProcessCreatedOutside30DaysSLA
| where TimeGenerated > ago(7d)
| where EventID in (4720, 4722, 4688, 4699, 4689)  // Account/process events
| where (CommandLine contains "net user" and CommandLine contains "/add")  // Persistence account creation
   or (CommandLine contains ".encryptor" or CommandLine contains ".locked")  // Encryption behavior
   or (CommandLine contains "wbadmin" or CommandLine contains "vssadmin delete")  // Backup deletion
| summarize EventCount = count(), FirstEvent = min(TimeGenerated), LastEvent = max(TimeGenerated) by Computer, CommandLine, Account
| where EventCount > 1
| project Computer, Account, CommandLine, EventCount, FirstEvent, LastEvent
```

**Talking Points:**
- "This playbook does in seconds what humans would take hours to do"
- "Phase 1: Automatically queries all logs for similar suspicious behavior"
- "Phase 2: Requires human approval before isolation (prevents accidental outages)"
- "Phase 3: Removes persistence once approved"
- "Phase 5: Preserves evidence - you can give this to law enforcement"

#### Step 3: Deploy Playbook to Azure Automation (2 min)
Show Azure Automation integration:

```powershell
# Register IR playbook as Azure Automation runbook
Import-AzAutomationRunbook -Path .\Ransomware-IR-Playbook.ps1 -ResourceGroupName 'security-automation' -AutomationAccountName 'security-ops' -Type 'PowerShell' -Published

# Create webhook for SIEM integration (Azure Sentinel)
Register-AzAutomationScheduledWebhook -RunbookName 'Ransomware-IR-Playbook' -WebhookName 'SentinelRansomwareDetection' -ResourceGroupName 'security-automation' -AutomationAccountName 'security-ops'

# Azure Sentinel alert triggers webhook → IR playbook runs automatically
# SOC team reviews containment recommendations before approval
```

**Show Workflow:**
```
Azure Sentinel Alert (HIGH: Suspicious PowerShell)
  ↓
Trigger Webhook: Ransomware-IR-Playbook
  ↓
Phase 1: Automated Detection & Investigation
  - Query logs for similar events
  - Calculate impact scope
  - Send report to SOC team
  ↓
SOC Team Reviews & Approves Containment
  ↓
Phase 2: Automated Containment
  - Isolate affected VM(s)
  - Terminate malicious processes
  - Revoke sessions
  ↓
Phase 3-5: Automated Eradication & Evidence Collection
  ↓
Incident Closed: Evidence Chain Preserved
```

**Talking Points:**
- "Detection to automated investigation: seconds"
- "Human review: minutes (SOC team reviews findings)"
- "Approval to containment: seconds"
- "What used to take 2+ hours now takes 15 minutes"
- "Evidence is automatically preserved - no 'I forgot to collect logs'"

#### Step 4: Practice with Tabletop Exercise (1.5 min)
Mention best practices:

**Talking Points:**
- "Generated IR playbooks are only effective if practiced"
- "Quarterly tabletop exercises: walk through the playbook with team"
- "Find gaps, refine procedures, build muscle memory"
- "When real incident occurs, team executes playbook confidently"
- "Automation handles tactical response, humans handle strategic decisions"

**Mention Post-Incident Actions:**
```
Post-Incident Review (within 48 hours):
1. What worked? What didn't?
2. How fast was detection → containment?
3. Did we preserve all evidence?
4. What would we do differently?
5. Update playbook with learnings
```

**Key Takeaway:** Copilot generates incident response playbooks that automate tactical response while preserving human judgment on strategic decisions. Practice regularly. When incidents occur, execute with confidence and speed.

---

## 📋 Post-Demo Summary

You've demonstrated the complete compliance and incident response automation lifecycle:

1. **IaC Templates** encode security controls into infrastructure (deterministic security)
2. **Compliance Scripts** transform manual audits into automated checks (continuous validation)
3. **STIG Remediation** automates remediation with safety validation (compliance through automation)
4. **IR Playbooks** automate tactical response while preserving human judgment (fast, reliable incident handling)

**The transformation:**
- Quarterly compliance audits → Continuous automated checking
- Manual STIG hardening → Automated remediation with drift detection
- Chaotic incident response → Orchestrated playbooks with evidence preservation
- Stale documentation → Living documentation generated from code

---

## 🎯 Key Messages to Reinforce

**Compliance Automation Philosophy:**
- "Compliance is continuous, not quarterly"
- "Encode security in infrastructure, not as afterthought"
- "Audit evidence is generated automatically, not collected manually"

**STIG & CIS Benchmarks:**
- "Benchmarks define security, automation enforces compliance"
- "CAT I (critical) blocks deployment. CAT II/III should auto-remediate"
- "Configuration drift is detected and corrected automatically"

**Incident Response:**
- "Detection is fast. Investigation should be automatic. Remediation requires approval."
- "Playbooks ensure consistency - every incident handled the same way"
- "Evidence preservation is automated - no 'I forgot to collect logs'"

**Living Documentation:**
- "Code is source of truth. Documentation is generated from code."
- "When infrastructure changes, documentation updates automatically"
- "Auditors always see current-state documentation, never stale PDFs"

---

## ⚠️ Common Demo Pitfalls to Avoid

**During IaC Demo:**
- ❌ Don't actually deploy to production (use dev/test)
- ❌ Don't expose credentials in Terraform (use Azure Key Vault)
- ❌ Don't skip validation before deployment

**During Compliance Demo:**
- ❌ Don't scan with real credentials exposed (use service principal)
- ❌ Don't show actual internal IP ranges or hostnames
- ❌ Don't imply compliance scripts replace human auditors (they augment)

**During STIG Demo:**
- ❌ Don't auto-remediate without approval (use semi-automated workflows)
- ❌ Don't skip post-remediation validation
- ❌ Don't assume DSC applies perfectly first try (test in dev first)

**During IR Demo:**
- ❌ Don't trigger actual isolations (demo with pre-recorded outputs)
- ❌ Don't skip evidence collection steps
- ❌ Don't imply automation replaces incident management team

---

## 🚀 Demo Preparation Checklist

**Code & Environment:**
- [ ] TerraGoat repository cloned and accessible
- [ ] Azure subscription authorized (az login)
- [ ] PowerShell 7.x installed and tested
- [ ] Python environment ready for compliance scripts
- [ ] VS Code extensions: Terraform, PowerShell, Azure Tools
- [ ] GitHub repository initialized for demo code

**Pre-Recording:**
- [ ] All 4 demo environments tested end-to-end
- [ ] Copilot Chat tested with all prompts
- [ ] TerraGoat modules verified for syntax/validation
- [ ] PowerShell scripts tested for execution
- [ ] Log Analytics queries tested for accuracy
- [ ] Azure Automation runbooks tested

**Demo Data:**
- [ ] Pre-recorded STIG scan results (for timing)
- [ ] Sample compliance reports (JSON/CSV)
- [ ] Example IR playbook outputs
- [ ] Azure Sentinel screenshot showing alert

**Recording Setup:**
- [ ] Zoom/font size readable at 1080p
- [ ] Terminal positioned for visibility
- [ ] VS Code theme set (dark recommended)
- [ ] Notifications disabled
---

## 💪 Confidence Boosters

You're ready because:

✅ **Your outline maps perfectly to these 4 demos** - each lesson objective has a clear demo walkthrough
✅ **TerraGoat provides real vulnerable infrastructure** - not toy examples
✅ **Copilot generates production-quality scripts** - not academic prototypes
✅ **Your voice and style are locked in** - this is authentically Tim Warner teaching security
✅ **4 demos × 10 minutes = 40 minutes exactly** - timing is proven
✅ **Enterprise examples are specific** - 6 companies with measurable outcomes
✅ **Teaching strategy is sound** - FRAMER methodology tested on Lessons 1, 3, 4

This is lesson 5 of 5. You've got this. **Go demonstrate security automation at scale.**

---

**Files Referenced:**
- `copilot-cybersecurity-lesson-05-v2.pptx` (12 slides, 4,131 words)
- `Lesson-05-Demo-Runbook-PROPER.md` (this file, 557 lines, 20 KB)
- Repository: `https://github.com/timothywarner-org/github-security-testbed`

---

**Last Reminder:** This isn't just about compliance automation. This is about **transforming how organizations think about security**: from "we hope we're secure" to "we know we're secure because we measure it continuously."

**Now go show the world how Copilot powers that transformation.**
