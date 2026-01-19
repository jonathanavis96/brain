# Waiver System

Human-gated escape hatches for noisy AC rules. Ralph can REQUEST waivers, but only Jono can APPROVE them via TOTP.

## Quick Reference

### Ralph: Create a waiver request
```bash
./.verify/request_waiver.sh <RULE_ID> <FILE_PATH> "<REASON>"
```

### Jono: Approve a waiver
```bash
source .venv/bin/activate
python .verify/approve_waiver_totp.py .verify/waiver_requests/<WAIVER_ID>.json
# Enter 6-digit OTP from Google Authenticator
```

---

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│  1. Ralph hits a gate that needs an exception               │
│                         ↓                                   │
│  2. Ralph creates request: .verify/waiver_requests/*.json   │
│                         ↓                                   │
│  3. Ralph prompts Jono to approve                           │
│                         ↓                                   │
│  4. Jono runs approve_waiver_totp.py in WSL                 │
│                         ↓                                   │
│  5. Jono enters OTP from Google Authenticator               │
│                         ↓                                   │
│  6. Script creates: .verify/waivers/<ID>.approved           │
│                         ↓                                   │
│  7. Verifier honors waiver for that rule + file             │
└─────────────────────────────────────────────────────────────┘
```

---

## Security Model

### What Ralph CAN do:
- Create waiver request JSON files
- Run the approval script (but it requires OTP)
- Reference waiver IDs in commits/docs

### What Ralph CANNOT do:
- Generate valid OTPs (secret is outside repo)
- Create `.approved` files without valid OTP
- Modify approved waivers (hash verification fails)
- Use wildcards or repo-wide scopes

### Key storage:
- **TOTP secret**: `/mnt/e/11 - Code/RalphKey/totp_secret.b32` (Windows, NOT in repo)
- **Public verification**: Hash of request is stored in `.approved` file

---

## File Layout

```
.verify/
├── waiver_requests/           # Unsigned requests (Ralph creates)
│   └── WVR-2026-01-19-001.json
├── waivers/                   # Approved waivers (Jono creates via TOTP)
│   ├── README.md              # This file
│   ├── WVR-2026-01-19-001.approved
│   └── public_key.pub         # (Future: for SSH signing upgrade)
├── request_waiver.sh          # Helper to create requests
└── approve_waiver_totp.py     # TOTP approval script
```

---

## Request Format

Ralph writes `.verify/waiver_requests/<WAIVER_ID>.json`:

```json
{
  "waiver_id": "WVR-2026-01-19-001",
  "rule_id": "Hygiene.MarkdownFenceLang",
  "scope": {
    "paths": ["docs/snippets.md"]
  },
  "reason": "File intentionally uses plain fences for copy/paste UX.",
  "created_by": "ralph",
  "created_at": "2026-01-19",
  "expires": "2026-02-15"
}
```

### Rules:
| Field | Requirement |
|-------|-------------|
| `waiver_id` | Must start with `WVR-`, unique |
| `rule_id` | Must be a known AC gate ID |
| `scope.paths` | Explicit file paths only (NO wildcards) |
| `reason` | Non-empty explanation |
| `expires` | Required, max 60 days from created_at |

---

## Approval Artifact

After TOTP verification, `.verify/waivers/<WAIVER_ID>.approved` contains:

```
WAIVER_ID=WVR-2026-01-19-001
RULE_ID=Hygiene.MarkdownFenceLang
PATHS=docs/snippets.md
EXPIRES=2026-02-15
REASON=File intentionally uses plain fences for copy/paste UX.
REQUEST_SHA256=a1b2c3d4e5f6...
APPROVED_BY=Jono
APPROVED_AT=2026-01-19T15:30:00Z
METHOD=TOTP
```

### Hash verification:
If Ralph edits the request JSON after approval, `REQUEST_SHA256` won't match → waiver is invalid.

---

## Verifier Behavior

A waiver is **valid** only if ALL conditions are met:
1. `.verify/waivers/<WAIVER_ID>.approved` exists
2. `REQUEST_SHA256` matches current hash of request JSON
3. `EXPIRES` date has not passed
4. `RULE_ID` matches the gate being bypassed
5. `PATHS` includes the file being exempted

If invalid → gate FAILS with message about missing/invalid waiver.

---

## Constraints

| Constraint | Value |
|------------|-------|
| Max active waivers | 10 |
| Max expiry | 60 days |
| Wildcards in scope | Forbidden |
| Repo-wide scope (`.`, `*`) | Forbidden |

---

## Best Practices

1. **Prefer fixing over waiving** - Waivers are exceptional, not normal workflow
2. **Keep expiries short** - Default 30 days, reassess when expired
3. **One file per waiver** - Don't bundle unrelated files
4. **Clear reasons** - Document WHY the rule doesn't apply
5. **Clean up expired waivers** - Delete old `.approved` files periodically

---

## Troubleshooting

### "TOTP secret not found"
The secret file must exist at `/mnt/e/11 - Code/RalphKey/totp_secret.b32` (Windows path via WSL mount).

### "pyotp not installed"
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install pyotp
```

### "Waiver already approved"
Delete the existing `.approved` file if you need to re-approve with changes.

### "REQUEST_SHA256 mismatch"
The request JSON was modified after approval. Delete the `.approved` file and re-approve.

---

## Future: SSH Signing Upgrade

When hardware key (YubiKey) is available, we can upgrade to cryptographic signatures:
- Store `public_key.pub` in this directory
- Keep private key on hardware
- Replace TOTP verification with `ssh-keygen -Y verify`

The file format and workflow remain the same; only the verification method changes.
