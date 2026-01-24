#!/usr/bin/env python3
import json
import os
import sys
import hashlib
import datetime
import pyotp


def sha256_file(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def main():
    if len(sys.argv) != 2:
        print(
            "Usage: .verify/approve_waiver_totp.py <path-to-waiver-request.json>",
            file=sys.stderr,
        )
        sys.exit(2)

    req_path = sys.argv[1]

    # Windows secret path (via WSL mount)
    default_secret_path = "/mnt/e/11 - Code/RalphKey/totp_secret.b32"
    secret_path = os.environ.get("RALPH_TOTP_SECRET_FILE", default_secret_path)

    if not os.path.exists(secret_path):
        print(f"Missing TOTP secret file: {secret_path}", file=sys.stderr)
        sys.exit(2)

    with open(req_path, "r", encoding="utf-8") as f:
        req = json.load(f)

    waiver_id = req.get("waiver_id") or os.path.splitext(os.path.basename(req_path))[0]
    req_hash = sha256_file(req_path)

    with open(secret_path, "r", encoding="utf-8") as f:
        secret = f.read().strip().replace(" ", "")
    totp = pyotp.TOTP(secret)

    print("\n=== WAIVER APPROVAL (TOTP) ===")
    print(f"waiver_id:       {waiver_id}")
    print(f"rule_id:         {req.get('rule_id')}")
    print(f"paths:           {req.get('scope', {}).get('paths')}")
    print(f"expires:         {req.get('expires')}")
    print(f"reason:          {req.get('reason')}")
    print(f"request_sha256:  {req_hash}")
    print("==============================\n")

    code = input("Enter 6-digit code from Google Authenticator: ").strip()

    # allow ±1 time-step for clock drift
    if not totp.verify(code, valid_window=1):
        print("INVALID CODE (not approved).", file=sys.stderr)
        sys.exit(1)

    approved_dir = os.path.join(".verify", "waivers")
    os.makedirs(approved_dir, exist_ok=True)

    approved_path = os.path.join(approved_dir, f"{waiver_id}.approved")
    now = datetime.datetime.utcnow().replace(microsecond=0).isoformat() + "Z"

    content = (
        "\n".join(
            [
                f"WAIVER_ID={waiver_id}",
                f"REQUEST_SHA256={req_hash}",
                f"APPROVED_AT={now}",
                "METHOD=TOTP",
            ]
        )
        + "\n"
    )

    with open(approved_path, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"\nAPPROVED ✅  wrote {approved_path}")


if __name__ == "__main__":
    main()
