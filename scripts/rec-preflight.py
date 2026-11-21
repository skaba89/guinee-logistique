#!/usr/bin/env python3
"""Read-only REC preflight; never prints resolved Compose configuration."""
import json
import os
import re
import shutil
import socket
import stat
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROJECT = "guinee-logistique-rec"
PORT = 8401
KEYS = {"COMPOSE_PROJECT_NAME", "GL_HTTP_PORT", "GL_PUBLIC_ORIGIN",
        "GL_DB_PASSWORD", "GL_AUTH_PASSWORD", "GL_TENANT_PASSWORD"}
ENV = {k: v for k, v in os.environ.items() if k not in KEYS and k not in
       {"COMPOSE_FILE", "COMPOSE_PROFILES", "COMPOSE_ENV_FILES", "COMPOSE_DISABLE_ENV_FILE"}}


def docker(*args):
    return subprocess.run(["docker", *args], cwd=ROOT, env=ENV,
                          capture_output=True, text=True, check=True, timeout=30).stdout


def compose(*args):
    return docker("compose", "--env-file", ".env.rec", "-p", PROJECT,
                  "-f", "compose.yaml", *args)


def require(condition, label):
    if not condition:
        raise ValueError(label)


def config():
    path = ROOT / ".env.rec"
    require(path.is_file() and not path.is_symlink(), "REC configuration missing or symlink")
    require(stat.S_IMODE(path.stat().st_mode) & 0o077 == 0, "REC configuration must be private (chmod 600)")
    values = {}
    for line in path.read_text().splitlines():
        if not line or line.startswith("#"):
            continue
        key, sep, value = line.partition("=")
        require(sep and key in KEYS and key not in values, "Unexpected or duplicate REC configuration key")
        values[key] = value
    require(set(values) == KEYS, "Incomplete REC configuration")
    require(values["COMPOSE_PROJECT_NAME"] == PROJECT and values["GL_HTTP_PORT"] == str(PORT), "REC project or port mismatch")
    require(re.fullmatch(r"https://[a-zA-Z0-9.-]+(?::[0-9]+)?", values["GL_PUBLIC_ORIGIN"]), "Invalid HTTPS origin")
    passwords = [values[key] for key in ("GL_DB_PASSWORD", "GL_AUTH_PASSWORD", "GL_TENANT_PASSWORD")]
    require(all(re.fullmatch(r"[0-9a-f]{64}", value) for value in passwords) and len(set(passwords)) == 3, "Invalid or reused REC secrets")
    return values


def manifest():
    model = json.loads(compose("config", "--format", "json"))
    services = model["services"]
    require(model["name"] == PROJECT, "Unexpected Compose project")
    require(not services["db"].get("ports"), "Database must not publish ports")
    ports = services["app"].get("ports", [])
    require(len(ports) == 1 and ports[0]["host_ip"] == "127.0.0.1"
            and str(ports[0]["published"]) == str(PORT) and ports[0]["target"] == 3000,
            "App must publish exclusively on REC loopback port")
    require(model["volumes"]["pgdata"]["name"] == PROJECT + "_pgdata"
            and not model["volumes"]["pgdata"].get("external"), "Unexpected database volume")
    return model


def inspect_service(service):
    ids = compose("ps", "-q", service).splitlines()
    require(len(ids) <= 1, "Unexpected replica count")
    if not ids:
        return None
    container = json.loads(docker("inspect", ids[0]))[0]
    require(container["Config"]["Labels"]["com.docker.compose.project"] == PROJECT, "Wrong container project")
    return container


def main():
    config()
    manifest()
    app = inspect_service("app")
    db = inspect_service("db")
    if db:
        require(not db["HostConfig"].get("PortBindings"), "Running database exposes ports")
        require(any(m["Name"] == PROJECT + "_pgdata" and m["Destination"] == "/var/lib/postgresql/data"
                    for m in db["Mounts"] if m["Type"] == "volume"), "Running database volume mismatch")
    if app:
        bindings = app["HostConfig"].get("PortBindings") or {}
        require(bindings == {"3000/tcp": [{"HostIp": "127.0.0.1", "HostPort": str(PORT)}]},
                "Running app port binding mismatch")
    else:
        with socket.socket() as sock:
            try:
                sock.bind(("127.0.0.1", PORT))
            except OSError:
                raise ValueError("REC port occupied by another service") from None
    free_gib = round(shutil.disk_usage(ROOT).free / (1024 ** 3), 2)
    require(free_gib >= 2, "Less than 2 GiB free on checkout filesystem")
    print(json.dumps({"status": "PASS", "environment": "rec", "project": PROJECT,
                      "port": PORT, "app_exists": bool(app), "db_exists": bool(db),
                      "checkout_free_gib": free_gib}))


if __name__ == "__main__":
    try:
        main()
    except ValueError as error:
        # JSON decode errors may contain the resolved configuration; never print them.
        print(json.dumps({"status": "FAIL", "reason": "Malformed configuration or failed check"
                          if isinstance(error, json.JSONDecodeError) else str(error)}))
        sys.exit(1)
    except (OSError, KeyError, TypeError, subprocess.SubprocessError):
        print(json.dumps({"status": "FAIL", "reason": "Docker or configuration inspection failed"}))
        sys.exit(1)
