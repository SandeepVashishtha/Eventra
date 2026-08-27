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

from .model import DeliveryManifest, ServiceSpec, validate_policy_authority


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
        "launch_argv",
        "launch_cwd",
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


def _launch_argv(value: object) -> tuple[str, ...]:
    if (
        type(value) is not tuple
        or not value
        or any(type(argument) is not str or not argument for argument in value)
        or value[0].startswith("-")
    ):
        raise ProcessOwnershipError("launch argv must be a non-empty tuple of arguments")
    return value


def _launch_cwd(value: object) -> Path:
    if not isinstance(value, Path) or not value.is_absolute():
        raise ProcessOwnershipError("launch cwd must be an absolute path")
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
    launch_argv: tuple[str, ...]
    launch_cwd: Path

    def __post_init__(self) -> None:
        _stable(self.repository_key, "repository_key")
        _sha(self.candidate_sha)
        _stable(self.run_id, "run_id")
        _stable(self.owner_token, "owner_token")
        _stable(self.start_identity, "start_identity")
        _launch_argv(self.launch_argv)
        _launch_cwd(self.launch_cwd)
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
        _launch_argv(self.argv)
        _launch_cwd(self.cwd)


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
            type(record) is not OwnedProcess for record in records
        ):
            raise ProcessOwnershipError("owned process registry is malformed")
        result = tuple(records)
        ports: set[int] = set()
        pid_owners: dict[int, tuple[object, ...]] = {}
        for record in result:
            try:
                reconstructed = OwnedProcess(
                    repository_key=record.repository_key,
                    candidate_sha=record.candidate_sha,
                    pid=record.pid,
                    port=record.port,
                    health_url=record.health_url,
                    run_id=record.run_id,
                    owner_token=record.owner_token,
                    start_identity=record.start_identity,
                    launch_argv=record.launch_argv,
                    launch_cwd=record.launch_cwd,
                )
            except BaseException as error:
                raise ProcessOwnershipError(
                    "owned process registry is malformed"
                ) from error
            if reconstructed != record:
                raise ProcessOwnershipError("owned process registry is malformed")
            if record.port in ports:
                raise ProcessOwnershipError("duplicate owned process port")
            identity = (
                record.repository_key,
                record.candidate_sha,
                record.run_id,
                record.owner_token,
                record.start_identity,
                record.launch_argv,
                record.launch_cwd,
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
                launch_argv = value["launch_argv"]
                launch_cwd = value["launch_cwd"]
                if type(launch_argv) is not list or type(launch_cwd) is not str:
                    raise ProcessOwnershipError("owned process registry is malformed")
                records.append(
                    OwnedProcess(
                        **{
                            **value,
                            "launch_argv": tuple(launch_argv),
                            "launch_cwd": Path(launch_cwd),
                        }
                    )
                )
        except (TypeError, ValueError) as error:
            raise ProcessOwnershipError("owned process registry is malformed") from error
        return self._validated(records)

    def _write_unlocked(self, records: Sequence[OwnedProcess]) -> None:
        validated = self._validated(records)
        payload = json.dumps(
            [
                {
                    **asdict(record),
                    "launch_argv": list(record.launch_argv),
                    "launch_cwd": str(record.launch_cwd),
                }
                for record in validated
            ],
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

    __slots__ = ("_manifest", "_registry", "_backend", "_owner_token")

    def __setattr__(self, name: str, value: object) -> None:
        raise AttributeError("process authority bindings are immutable")

    @property
    def manifest(self) -> DeliveryManifest:
        return self._manifest

    @property
    def registry(self) -> ProcessRegistry:
        return self._registry

    @property
    def backend(self) -> ProcessBackend:
        return self._backend

    @property
    def owner_token(self) -> str:
        return self._owner_token

    def __init__(
        self,
        registry: ProcessRegistry,
        backend: ProcessBackend,
        *,
        owner_token: str,
        manifest: DeliveryManifest,
    ) -> None:
        if type(manifest) is not DeliveryManifest:
            raise TypeError("manifest must be an exact DeliveryManifest")
        validate_policy_authority(manifest.policy)
        if not isinstance(registry, ProcessRegistry):
            raise TypeError("registry must be a ProcessRegistry")
        _stable(owner_token, "owner_token")
        object.__setattr__(self, "_manifest", manifest)
        object.__setattr__(self, "_registry", registry)
        object.__setattr__(self, "_backend", backend)
        object.__setattr__(self, "_owner_token", owner_token)

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
            and record.launch_argv == run.argv
            and record.launch_cwd == run.cwd
        )

    def _require_manifest_launch(
        self,
        services: tuple[ServiceSpec, ...],
        run: ProcessRun,
    ) -> None:
        try:
            specification = self.manifest.repositories.get(run.repository_key)
            matches = (
                specification is not None
                and services == specification.services
                and run.argv == specification.commands.get("start")
                and run.cwd == specification.local_path
            )
        except BaseException:
            matches = False
        if not matches:
            raise ProcessOwnershipError("service ownership is outside the manifest")

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
            type(services) is not tuple
            or not services
            or any(type(service) is not ServiceSpec for service in services)
            or type(run) is not ProcessRun
        ):
            raise TypeError("services and run must be typed process values")
        self._require_manifest_launch(services, run)
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
                        launch_argv=run.argv,
                        launch_cwd=run.cwd,
                    )
                    for service in services
                )
                transaction.write((*records, *owned))
            except Exception as error:
                cleanup(error)
            return owned

    def verify_services(
        self,
        services: tuple[ServiceSpec, ...],
        run: ProcessRun,
        records: tuple[OwnedProcess, ...],
        *,
        candidate_sha: str,
    ) -> tuple[OwnedProcess, ...]:
        """Re-read registry and host ownership for one manifest service set."""

        if (
            type(services) is not tuple
            or not services
            or any(type(service) is not ServiceSpec for service in services)
            or type(run) is not ProcessRun
            or type(records) is not tuple
            or any(type(record) is not OwnedProcess for record in records)
        ):
            raise TypeError("service ownership values must be concrete typed values")
        self._require_manifest_launch(services, run)
        candidate_sha = _sha(candidate_sha)
        specification = self.manifest.repositories.get(run.repository_key)
        if (
            len(records) != len(services)
            or not records
        ):
            raise ProcessOwnershipError("service ownership is outside the manifest")
        expected_services = {
            (service.port, service.health_url) for service in services
        }
        observed_services = {
            (record.port, record.health_url) for record in records
        }
        if (
            observed_services != expected_services
            or len(observed_services) != len(records)
            or len({record.pid for record in records}) != 1
            or len({record.start_identity for record in records}) != 1
            or any(
                record.repository_key != run.repository_key
                or record.candidate_sha != candidate_sha
                or record.run_id != run.run_id
                or record.owner_token != self.owner_token
                or record.launch_argv != run.argv
                or record.launch_cwd != run.cwd
                for record in records
            )
        ):
            raise ProcessOwnershipError("declared services lack exact owned records")
        pid = records[0].pid
        identity = records[0].start_identity
        with self.registry.transaction() as transaction:
            registered = transaction.read()
            registered_pid_records = tuple(
                record for record in registered if record.pid == pid
            )
            if (
                any(record not in registered for record in records)
                or set(registered_pid_records) != set(records)
            ):
                raise ProcessOwnershipError(
                    "declared services lack registry ownership"
                )
            self._verify_start_identity(pid, identity)
            if not self.backend.is_alive(pid):
                raise ProcessOwnershipError("PID ownership is unknown")
            for record in records:
                if (
                    self.backend.port_owner(record.port) != pid
                    or not self.backend.wait_healthy(record.health_url, pid)
                ):
                    raise ProcessOwnershipError(
                        "declared service ownership is not healthy"
                    )
        return records

    def stop(
        self,
        record: OwnedProcess,
        *,
        run_id: str,
        repository_key: str,
        candidate_sha: str,
    ) -> None:
        if type(record) is not OwnedProcess:
            raise TypeError("record must be an OwnedProcess")
        _stable(run_id, "run_id")
        _stable(repository_key, "repository_key")
        _sha(candidate_sha)
        if (
            record.run_id != run_id
            or record.repository_key != repository_key
            or record.candidate_sha != candidate_sha
            or record.owner_token != self.owner_token
            or self.manifest.repositories.get(repository_key) is None
            or record.launch_argv
            != self.manifest.repositories[repository_key].commands.get("start")
            or record.launch_cwd
            != self.manifest.repositories[repository_key].local_path
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
                or item.launch_argv != record.launch_argv
                or item.launch_cwd != record.launch_cwd
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
