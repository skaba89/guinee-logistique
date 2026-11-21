#!/usr/bin/env python3
"""Read-only deployment evidence. Does not authorize production."""
import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
import importlib.util

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("preflight", ROOT / "scripts/rec-preflight.py")
preflight = importlib.util.module_from_spec(spec)
spec.loader.exec_module(preflight)


def check(command):
    try:
        return subprocess.run(command, cwd=ROOT, capture_output=True, timeout=60).returncode == 0
    except (OSError, subprocess.SubprocessError):
        return False


def main():
    checks = {"preflight": check([sys.executable, "scripts/rec-preflight.py"]),
              "local_health_ready": check(["node", "scripts/monitor.mjs", "rec"])}
    try:
        origin = preflight.config()["GL_PUBLIC_ORIGIN"]
        checks["https_health_ready"] = check(["node", "scripts/monitor.mjs", "rec", origin])
        app = preflight.inspect_service("app")
        db = preflight.inspect_service("db")
        checks["containers_healthy"] = all(c and c["State"]["Health"]["Status"] == "healthy" for c in (app, db))
    except (ValueError, OSError, KeyError, TypeError, subprocess.SubprocessError):
        checks["https_health_ready"] = False
        checks["containers_healthy"] = False
    commit = subprocess.run(["git", "rev-parse", "HEAD"], cwd=ROOT, capture_output=True, text=True)
    checks["git_revision_known"] = commit.returncode == 0
    passed = all(checks.values())
    print(json.dumps({"timestamp": datetime.now(timezone.utc).isoformat(), "environment": "rec",
                      "checkout_revision": commit.stdout.strip() if commit.returncode == 0 else None,
                      "technical_status": "PASS" if passed else "FAIL", "checks": checks,
                      "production_authorized": False,
                      "remaining": ["business_acceptance", "external_backup_restore", "external_alert_test",
                                    "capacity_on_vps", "commercial_and_fiscal_validation"]}, indent=2))
    return 0 if passed else 1


if __name__ == "__main__":
    sys.exit(main())
