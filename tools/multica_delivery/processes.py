"""Owned local-process lifecycle with a strict atomic runtime registry."""

from __future__ import annotations

from collections.abc import Iterator, Sequence
from contextlib import contextmanager
from dataclasses import asdict, dataclass
import fcntl
import hashlib
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
        "start_identity",
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
    start_identity: str

    def __post_init__(self) -> None:
        _stable(self.repository_key, "repository_key")
        _sha(self.candidate_sha)
        _stable(self.run_id, "run_id")
        _stable(self.owner_token, "owner_token")
        _stable(self.start_identity, "start_identity")
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

    def start_identity(self, pid: int) -> str: ...

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
                shell=False,
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

    def start_identity(self, pid: int) -> str:
        if not isinstance(pid, int) or isinstance(pid, bool) or pid < 1:
            raise ProcessOwnershipError("process start identity could not be determined")
        try:
            completed = subprocess.run(
                ("ps", "-o", "lstart=", "-p", str(pid)),
                stdin=subprocess.DEVNULL,
                stdout=subprocess.PIPE,
                stderr=subprocess.DEVNULL,
                check=False,
                shell=False,
                timeout=5,
                text=True,
            )
        except (OSError, subprocess.TimeoutExpired) as error:
            raise ProcessOwnershipError(
                "process start identity could not be determined"
            ) from error
        if not isinstance(completed.stdout, str):
            raise ProcessOwnershipError(
                "process start identity could not be determined"
            )
        started = tuple(
            line.strip() for line in completed.stdout.splitlines() if line.strip()
        )
        if completed.returncode != 0 or len(started) != 1:
            raise ProcessOwnershipError(
                "process start identity could not be determined"
            )
        material = f"pid={pid}\nstarted={started[0]}".encode("utf-8")
        return hashlib.sha256(material).hexdigest()

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
        pid_owners: dict[int, tuple[str, str, str, str, str]] = {}
        for record in result:
            if record.port in ports:
                raise ProcessOwnershipError("duplicate owned process port")
            identity = (
                record.repository_key,
                record.candidate_sha,
                record.run_id,
                record.owner_token,
                record.start_identity,
            )
            existing_identity = pid_owners.get(record.pid)
            if existing_identity is not None and existing_identity != identity:
                raise ProcessOwnershipError("duplicate owned process PID has conflicting ownership")
            ports.add(record.port)
            pid_owners[record.pid] = identity
        return tuple(sorted(result, key=lambda item: (item.port, item.repository_key, item.run_id)))

    def _read_unlocked(self) -> tuple[OwnedProcess, ...]:
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

    def _write_unlocked(self, records: Sequence[OwnedProcess]) -> None:
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

    @contextmanager
    def transaction(self) -> Iterator["_RegistryTransaction"]:
        """Hold one advisory interprocess lock across read/compare/write."""

        try:
            self.path.parent.mkdir(parents=True, exist_ok=True)
            lock_path = self.path.with_name(f".{self.path.name}.lock")
            descriptor = os.open(lock_path, os.O_CREAT | os.O_RDWR, 0o600)
        except OSError as error:
            raise ProcessOwnershipError("owned process registry lock failed") from error
        with os.fdopen(descriptor, "a+b") as stream:
            try:
                fcntl.flock(stream.fileno(), fcntl.LOCK_EX)
            except OSError as error:
                raise ProcessOwnershipError("owned process registry lock failed") from error
            try:
                yield _RegistryTransaction(self)
            finally:
                try:
                    fcntl.flock(stream.fileno(), fcntl.LOCK_UN)
                except OSError:
                    pass

    def read(self) -> tuple[OwnedProcess, ...]:
        with self.transaction() as transaction:
            return transaction.read()

    def write(self, records: Sequence[OwnedProcess]) -> None:
        with self.transaction() as transaction:
            transaction.write(records)


class _RegistryTransaction:
    def __init__(self, registry: ProcessRegistry) -> None:
        self._registry = registry

    def read(self) -> tuple[OwnedProcess, ...]:
        return self._registry._read_unlocked()

    def write(self, records: Sequence[OwnedProcess]) -> None:
        self._registry._write_unlocked(records)


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

    def _start_identity(self, pid: int) -> str:
        try:
            identity = self.backend.start_identity(pid)
        except ProcessOwnershipError:
            raise
        except (OSError, RuntimeError, TypeError, ValueError) as error:
            raise ProcessOwnershipError(
                "process start identity could not be determined"
            ) from error
        try:
            return _stable(identity, "start_identity")
        except ProcessOwnershipError as error:
            raise ProcessOwnershipError(
                "process start identity could not be determined"
            ) from error

    def _verify_start_identity(self, pid: int, expected: str) -> None:
        if self._start_identity(pid) != expected:
            raise ProcessOwnershipError("process start identity mismatch")

    def start(
        self,
        service: ServiceSpec,
        run: ProcessRun,
        *,
        candidate_sha: str,
    ) -> OwnedProcess:
        return self.start_services((service,), run, candidate_sha=candidate_sha)[0]

    def start_services(
        self,
        services: tuple[ServiceSpec, ...],
        run: ProcessRun,
        *,
        candidate_sha: str,
    ) -> tuple[OwnedProcess, ...]:
        if (
            not isinstance(services, tuple)
            or not services
            or any(not isinstance(service, ServiceSpec) for service in services)
            or not isinstance(run, ProcessRun)
        ):
            raise TypeError("services and run must be typed process values")
        candidate_sha = _sha(candidate_sha)
        if len({service.port for service in services}) != len(services):
            raise ProcessOwnershipError("repository services contain a duplicate port")
        for service in services:
            if service.port != urlsplit(_local_health_url(service.health_url)).port:
                raise ProcessOwnershipError("service health URL port does not match service port")

        with self.registry.transaction() as transaction:
            records = transaction.read()
            registered = {
                service.port: next(
                    (record for record in records if record.port == service.port),
                    None,
                )
                for service in services
            }
            observed = {
                service.port: self.backend.port_owner(service.port)
                for service in services
            }
            for service in services:
                if observed[service.port] is not None and registered[service.port] is None:
                    raise ProcessOwnershipError(
                        f"port {service.port} is not framework-owned"
                    )
                if observed[service.port] is None and registered[service.port] is not None:
                    existing = registered[service.port]
                    assert existing is not None
                    if not self._matching_record(existing, service, run, candidate_sha):
                        raise ProcessOwnershipError("owner mismatch")
                    raise ProcessOwnershipError("PID ownership is unknown")
            if any(pid is not None for pid in observed.values()) or any(
                record is not None for record in registered.values()
            ):
                if any(pid is None for pid in observed.values()) or any(
                    record is None for record in registered.values()
                ):
                    raise ProcessOwnershipError("repository service ownership is incomplete")
                observed_pids = {pid for pid in observed.values() if pid is not None}
                if len(observed_pids) != 1:
                    raise ProcessOwnershipError("repository services are not owned by one PID")
                pid = next(iter(observed_pids))
                reused: list[OwnedProcess] = []
                for service in services:
                    record = registered[service.port]
                    assert record is not None
                    if record.pid != pid or not self._matching_record(
                        record,
                        service,
                        run,
                        candidate_sha,
                    ):
                        raise ProcessOwnershipError("owner mismatch")
                    reused.append(record)
                identities = {record.start_identity for record in reused}
                if len(identities) != 1:
                    raise ProcessOwnershipError("process start identity mismatch")
                self._verify_start_identity(pid, next(iter(identities)))
                if not self.backend.is_alive(pid):
                    raise ProcessOwnershipError("PID ownership is unknown")
                for record in reused:
                    if not self.backend.wait_healthy(record.health_url, pid):
                        raise ProcessOwnershipError("owned process health is unknown")
                return tuple(reused)

            pid = self.backend.spawn(run.argv, run.cwd)
            if not isinstance(pid, int) or isinstance(pid, bool) or pid < 1:
                raise ProcessOwnershipError("spawn returned an invalid PID")

            start_identity = self._start_identity(pid)

            def cleanup(error: BaseException) -> None:
                try:
                    self._verify_start_identity(pid, start_identity)
                except ProcessOwnershipError as cleanup_error:
                    raise ProcessOwnershipError(
                        "owned process start failed and process cleanup failed"
                    ) from cleanup_error
                try:
                    self.backend.stop(pid)
                except (OSError, ProcessOwnershipError, RuntimeError, TypeError, ValueError):
                    try:
                        still_alive = self.backend.is_alive(pid)
                    except (OSError, ProcessOwnershipError, RuntimeError, TypeError, ValueError) as cleanup_error:
                        raise ProcessOwnershipError(
                            "owned process start failed and process cleanup failed"
                        ) from cleanup_error
                    if still_alive:
                        raise ProcessOwnershipError(
                            "owned process start failed and process cleanup failed"
                        ) from error
                try:
                    if self.backend.is_alive(pid):
                        raise ProcessOwnershipError("owned process did not stop")
                except (OSError, ProcessOwnershipError, RuntimeError, TypeError, ValueError) as cleanup_error:
                    raise ProcessOwnershipError(
                        "owned process start failed and process cleanup failed"
                    ) from cleanup_error
                raise error

            try:
                for service in services:
                    if not self.backend.wait_healthy(service.health_url, pid):
                        raise ProcessOwnershipError("owned process failed health check")
                if not self.backend.is_alive(pid) or any(
                    self.backend.port_owner(service.port) != pid for service in services
                ):
                    raise ProcessOwnershipError("started PID ownership is unknown")
                self._verify_start_identity(pid, start_identity)
                owned = tuple(
                    OwnedProcess(
                        repository_key=run.repository_key,
                        candidate_sha=candidate_sha,
                        pid=pid,
                        port=service.port,
                        health_url=service.health_url,
                        run_id=run.run_id,
                        owner_token=self.owner_token,
                        start_identity=start_identity,
                    )
                    for service in services
                )
                transaction.write((*records, *owned))
            except Exception as error:
                cleanup(error)
            return owned

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
        with self.registry.transaction() as transaction:
            records = transaction.read()
            if record not in records:
                raise ProcessOwnershipError("owner mismatch")
            owned_pid_records = tuple(item for item in records if item.pid == record.pid)
            if any(
                item.run_id != run_id
                or item.repository_key != repository_key
                or item.candidate_sha != candidate_sha
                or item.owner_token != self.owner_token
                for item in owned_pid_records
            ):
                raise ProcessOwnershipError("owner mismatch")
            identities = {item.start_identity for item in owned_pid_records}
            if len(identities) != 1:
                raise ProcessOwnershipError("process start identity mismatch")
            self._verify_start_identity(record.pid, next(iter(identities)))
            if not self.backend.is_alive(record.pid) or any(
                self.backend.port_owner(item.port) != record.pid
                for item in owned_pid_records
            ):
                raise ProcessOwnershipError("PID ownership is unknown")
            self.backend.stop(record.pid)
            if self.backend.is_alive(record.pid):
                raise ProcessOwnershipError("owned process did not stop")
            transaction.write(
                tuple(item for item in records if item.pid != record.pid)
            )
