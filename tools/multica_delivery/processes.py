"""Owned local-process lifecycle with a strict atomic runtime registry."""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import asdict, dataclass
import json
import os
from pathlib import Path
import re
import signal
import subprocess
import tempfile
import time
from typing import Protocol
from urllib.error import URLError
from urllib.parse import urlsplit
from urllib.request import urlopen

from .model import ServiceSpec


_SHA = re.compile(r"[0-9a-f]{40}\Z")
_STABLE_KEY = re.compile(r"[A-Za-z0-9][A-Za-z0-9._:/-]*\Z")
_OWNED_FIELDS = frozenset(
    {
        "repository_key",
        "candidate_sha",
        "pid",
        "port",
        "health_url",
        "run_id",
        "owner_token",
    }
)


class ProcessOwnershipError(RuntimeError):
    """Raised when a local PID or port cannot be proven framework-owned."""


def _stable(value: object, field_name: str) -> str:
    if not isinstance(value, str) or _STABLE_KEY.fullmatch(value) is None:
        raise ProcessOwnershipError(f"{field_name} must be a stable non-empty key")
    return value


def _sha(value: object) -> str:
    if not isinstance(value, str) or _SHA.fullmatch(value) is None:
        raise ProcessOwnershipError("candidate_sha must be a lowercase 40-character SHA")
    return value


def _local_health_url(value: object) -> str:
    if not isinstance(value, str):
        raise ProcessOwnershipError("health_url must be a local HTTP URL")
    parsed = urlsplit(value)
    if (
        parsed.scheme not in {"http", "https"}
        or parsed.hostname not in {"localhost", "127.0.0.1", "::1"}
        or parsed.port is None
        or parsed.username is not None
        or parsed.password is not None
        or parsed.fragment
    ):
        raise ProcessOwnershipError("health_url must be a local HTTP URL")
    return value


@dataclass(frozen=True)
class OwnedProcess:
    """The complete proof needed to reuse or stop one local process."""

    repository_key: str
    candidate_sha: str
    pid: int
    port: int
    health_url: str
    run_id: str
    owner_token: str

    def __post_init__(self) -> None:
        _stable(self.repository_key, "repository_key")
        _sha(self.candidate_sha)
        _stable(self.run_id, "run_id")
        _stable(self.owner_token, "owner_token")
        if not isinstance(self.pid, int) or isinstance(self.pid, bool) or self.pid < 1:
            raise ProcessOwnershipError("pid must be a positive integer")
        if (
            not isinstance(self.port, int)
            or isinstance(self.port, bool)
            or not 1 <= self.port <= 65535
        ):
            raise ProcessOwnershipError("port must be between 1 and 65535")
        health_url = _local_health_url(self.health_url)
        if urlsplit(health_url).port != self.port:
            raise ProcessOwnershipError("health_url port must match the owned process port")


@dataclass(frozen=True)
class ProcessRun:
    """A single run's immutable launch request."""

    repository_key: str
    run_id: str
    argv: tuple[str, ...]
    cwd: Path

    def __post_init__(self) -> None:
        _stable(self.repository_key, "repository_key")
        _stable(self.run_id, "run_id")
        if (
            not isinstance(self.argv, tuple)
            or not self.argv
            or any(not isinstance(argument, str) or not argument for argument in self.argv)
            or self.argv[0].startswith("-")
        ):
            raise ProcessOwnershipError("argv must be a non-empty tuple of arguments")
        if not isinstance(self.cwd, Path) or not self.cwd.is_absolute():
            raise ProcessOwnershipError("cwd must be an absolute path")


class ProcessBackend(Protocol):
    """Injectable host boundary; tests never touch actual local services."""

    def port_owner(self, port: int) -> int | None: ...

    def spawn(self, argv: tuple[str, ...], cwd: Path) -> int: ...

    def wait_healthy(self, health_url: str, pid: int) -> bool: ...

    def is_alive(self, pid: int) -> bool: ...

    def stop(self, pid: int) -> None: ...


class LocalProcessBackend:
    """Explicit real-host implementation; every command uses an argv tuple."""

    def __init__(self, *, health_timeout_seconds: float = 10.0) -> None:
        if health_timeout_seconds <= 0:
            raise ValueError("health_timeout_seconds must be positive")
        self.health_timeout_seconds = health_timeout_seconds
        self._children: dict[int, subprocess.Popen[bytes]] = {}

    def port_owner(self, port: int) -> int | None:
        try:
            completed = subprocess.run(
                ("lsof", "-nP", f"-iTCP:{port}", "-sTCP:LISTEN", "-t"),
                stdin=subprocess.DEVNULL,
                stdout=subprocess.PIPE,
                stderr=subprocess.DEVNULL,
                check=False,
                timeout=5,
                text=True,
            )
        except (OSError, subprocess.TimeoutExpired) as error:
            raise ProcessOwnershipError("port ownership could not be determined") from error
        if completed.returncode == 1 and not completed.stdout.strip():
            return None
        if completed.returncode != 0:
            raise ProcessOwnershipError("port ownership could not be determined")
        values = tuple(line.strip() for line in completed.stdout.splitlines() if line.strip())
        if len(values) != 1 or not values[0].isdigit() or int(values[0]) < 1:
            raise ProcessOwnershipError("port ownership could not be determined")
        return int(values[0])

    def spawn(self, argv: tuple[str, ...], cwd: Path) -> int:
        try:
            process = subprocess.Popen(
                argv,
                cwd=cwd,
                stdin=subprocess.DEVNULL,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                start_new_session=True,
                shell=False,
            )
        except OSError as error:
            raise ProcessOwnershipError("owned process could not be started") from error
        self._children[process.pid] = process
        return process.pid

    def wait_healthy(self, health_url: str, pid: int) -> bool:
        deadline = time.monotonic() + self.health_timeout_seconds
        while time.monotonic() < deadline:
            if not self.is_alive(pid):
                return False
            try:
                with urlopen(health_url, timeout=1) as response:  # noqa: S310 - URL is local-only validated
                    if 200 <= response.status < 400:
                        return True
            except (OSError, TimeoutError, URLError):
                pass
            time.sleep(0.1)
        return False

    def is_alive(self, pid: int) -> bool:
        process = self._children.get(pid)
        if process is not None:
            return process.poll() is None
        try:
            os.kill(pid, 0)
        except ProcessLookupError:
            return False
        except PermissionError as error:
            raise ProcessOwnershipError("PID ownership is unknown") from error
        return True

    def stop(self, pid: int) -> None:
        try:
            os.kill(pid, signal.SIGTERM)
        except ProcessLookupError as error:
            raise ProcessOwnershipError("PID ownership is unknown") from error
        except PermissionError as error:
            raise ProcessOwnershipError("PID ownership is unknown") from error
        process = self._children.get(pid)
        if process is not None:
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired as error:
                raise ProcessOwnershipError("owned process did not stop") from error


class ProcessRegistry:
    """Strict JSON registry whose writes replace one same-directory temp file."""

    def __init__(self, path: Path) -> None:
        if not isinstance(path, Path) or not path.is_absolute():
            raise ProcessOwnershipError("registry path must be absolute runtime state")
        self.path = path

    @staticmethod
    def _validated(records: Sequence[OwnedProcess]) -> tuple[OwnedProcess, ...]:
        if not isinstance(records, (tuple, list)) or any(
            not isinstance(record, OwnedProcess) for record in records
        ):
            raise ProcessOwnershipError("owned process registry is malformed")
        result = tuple(records)
        ports: set[int] = set()
        pids: set[int] = set()
        for record in result:
            if record.port in ports:
                raise ProcessOwnershipError("duplicate owned process port")
            if record.pid in pids:
                raise ProcessOwnershipError("duplicate owned process PID")
            ports.add(record.port)
            pids.add(record.pid)
        return tuple(sorted(result, key=lambda item: (item.port, item.repository_key, item.run_id)))

    def read(self) -> tuple[OwnedProcess, ...]:
        if not self.path.exists():
            return ()
        try:
            raw = json.loads(self.path.read_text(encoding="utf-8"))
        except (OSError, UnicodeError, json.JSONDecodeError) as error:
            raise ProcessOwnershipError("owned process registry is malformed") from error
        if not isinstance(raw, list):
            raise ProcessOwnershipError("owned process registry is malformed")
        records: list[OwnedProcess] = []
        try:
            for value in raw:
                if not isinstance(value, dict) or set(value) != _OWNED_FIELDS:
                    raise ProcessOwnershipError("owned process registry is malformed")
                records.append(OwnedProcess(**value))
        except TypeError as error:
            raise ProcessOwnershipError("owned process registry is malformed") from error
        return self._validated(records)

    def write(self, records: Sequence[OwnedProcess]) -> None:
        validated = self._validated(records)
        payload = json.dumps(
            [asdict(record) for record in validated],
            ensure_ascii=False,
            sort_keys=True,
            separators=(",", ":"),
            allow_nan=False,
        )
        try:
            self.path.parent.mkdir(parents=True, exist_ok=True)
            descriptor, temporary_name = tempfile.mkstemp(
                prefix=f".{self.path.name}.",
                dir=self.path.parent,
                text=True,
            )
            try:
                with os.fdopen(descriptor, "w", encoding="utf-8", newline="") as stream:
                    stream.write(payload)
                    stream.flush()
                    os.fsync(stream.fileno())
                os.chmod(temporary_name, 0o600)
                os.replace(temporary_name, self.path)
            except BaseException:
                try:
                    os.unlink(temporary_name)
                except FileNotFoundError:
                    pass
                raise
        except OSError as error:
            raise ProcessOwnershipError("owned process registry write failed") from error


def default_registry_path(instance_key: str) -> Path:
    """Return untracked OS runtime state, never a repository path."""

    stable_instance = _stable(instance_key, "instance_key")
    return Path(tempfile.gettempdir()) / "multica-delivery" / stable_instance / "owned-processes.json"


class ProcessManager:
    """Start, reuse, and stop only processes proven to match all owner fields."""

    def __init__(
        self,
        registry: ProcessRegistry,
        backend: ProcessBackend,
        *,
        owner_token: str,
    ) -> None:
        if not isinstance(registry, ProcessRegistry):
            raise TypeError("registry must be a ProcessRegistry")
        _stable(owner_token, "owner_token")
        self.registry = registry
        self.backend = backend
        self.owner_token = owner_token

    def _matching_record(
        self,
        record: OwnedProcess,
        service: ServiceSpec,
        run: ProcessRun,
        candidate_sha: str,
    ) -> bool:
        return (
            record.repository_key == run.repository_key
            and record.candidate_sha == candidate_sha
            and record.port == service.port
            and record.health_url == service.health_url
            and record.run_id == run.run_id
            and record.owner_token == self.owner_token
        )

    def start(
        self,
        service: ServiceSpec,
        run: ProcessRun,
        *,
        candidate_sha: str,
    ) -> OwnedProcess:
        if not isinstance(service, ServiceSpec) or not isinstance(run, ProcessRun):
            raise TypeError("service and run must be typed process values")
        candidate_sha = _sha(candidate_sha)
        if service.port != urlsplit(_local_health_url(service.health_url)).port:
            raise ProcessOwnershipError("service health URL port does not match service port")
        records = self.registry.read()
        registered = next((record for record in records if record.port == service.port), None)
        observed_pid = self.backend.port_owner(service.port)

        if observed_pid is not None:
            if registered is None or registered.pid != observed_pid:
                raise ProcessOwnershipError(f"port {service.port} is not framework-owned")
            if not self._matching_record(registered, service, run, candidate_sha):
                raise ProcessOwnershipError("owner mismatch")
            if not self.backend.is_alive(registered.pid):
                raise ProcessOwnershipError("PID ownership is unknown")
            if not self.backend.wait_healthy(registered.health_url, registered.pid):
                raise ProcessOwnershipError("owned process health is unknown")
            return registered

        if registered is not None:
            if not self._matching_record(registered, service, run, candidate_sha):
                raise ProcessOwnershipError("owner mismatch")
            raise ProcessOwnershipError("PID ownership is unknown")

        pid = self.backend.spawn(run.argv, run.cwd)
        if not isinstance(pid, int) or isinstance(pid, bool) or pid < 1:
            raise ProcessOwnershipError("spawn returned an invalid PID")
        if not self.backend.wait_healthy(service.health_url, pid):
            if self.backend.is_alive(pid):
                self.backend.stop(pid)
            raise ProcessOwnershipError("owned process failed health check")
        if self.backend.port_owner(service.port) != pid or not self.backend.is_alive(pid):
            if self.backend.is_alive(pid):
                self.backend.stop(pid)
            raise ProcessOwnershipError("started PID ownership is unknown")
        record = OwnedProcess(
            repository_key=run.repository_key,
            candidate_sha=candidate_sha,
            pid=pid,
            port=service.port,
            health_url=service.health_url,
            run_id=run.run_id,
            owner_token=self.owner_token,
        )
        latest = self.registry.read()
        if latest != records:
            if self.backend.is_alive(pid):
                self.backend.stop(pid)
            raise ProcessOwnershipError("owned process registry changed during start")
        try:
            self.registry.write((*records, record))
        except Exception as error:
            try:
                if self.backend.is_alive(pid):
                    self.backend.stop(pid)
            except (OSError, ProcessOwnershipError, RuntimeError, TypeError, ValueError):
                raise ProcessOwnershipError(
                    "owned process registry write and process cleanup failed"
                ) from error
            raise
        return record

    def stop(
        self,
        record: OwnedProcess,
        *,
        run_id: str,
        repository_key: str,
        candidate_sha: str,
    ) -> None:
        if not isinstance(record, OwnedProcess):
            raise TypeError("record must be an OwnedProcess")
        _stable(run_id, "run_id")
        _stable(repository_key, "repository_key")
        _sha(candidate_sha)
        if (
            record.run_id != run_id
            or record.repository_key != repository_key
            or record.candidate_sha != candidate_sha
            or record.owner_token != self.owner_token
        ):
            raise ProcessOwnershipError("owner mismatch")
        records = self.registry.read()
        if record not in records:
            raise ProcessOwnershipError("owner mismatch")
        if (
            self.backend.port_owner(record.port) != record.pid
            or not self.backend.is_alive(record.pid)
        ):
            raise ProcessOwnershipError("PID ownership is unknown")
        self.backend.stop(record.pid)
        if self.backend.is_alive(record.pid):
            raise ProcessOwnershipError("owned process did not stop")
        latest = self.registry.read()
        if latest != records:
            raise ProcessOwnershipError("owned process registry changed during stop")
        self.registry.write(tuple(item for item in records if item != record))
