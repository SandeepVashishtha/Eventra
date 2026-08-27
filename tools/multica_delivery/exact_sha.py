"""Closed local command execution bound to manifest repository SHAs."""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass
from pathlib import Path
import re
import subprocess
from types import MappingProxyType
from typing import Protocol

from .model import DeliveryManifest, validate_policy_authority


_SHA = re.compile(r"[0-9a-f]{40}\Z")
_SAFE_REPOSITORY_KEY = re.compile(r"[A-Za-z0-9][A-Za-z0-9._:-]{0,255}\Z")
_GIT_HEAD = ("git", "rev-parse", "HEAD")


class ExactShaBoundaryError(RuntimeError):
    """A fail-closed local checkout or command boundary failure."""

    def __init__(self, message: str, repository_key: object = "unknown") -> None:
        super().__init__(message)
        self.repository_key = (
            repository_key
            if isinstance(repository_key, str)
            and _SAFE_REPOSITORY_KEY.fullmatch(repository_key) is not None
            else "unknown"
        )


@dataclass(frozen=True)
class ClosedCommandResult:
    returncode: int
    stdout: str
    stderr: str


class ClosedCommandBackend(Protocol):
    def run(self, argv: tuple[str, ...], cwd: Path) -> ClosedCommandResult: ...


class SubprocessCommandBackend:
    def run(self, argv: tuple[str, ...], cwd: Path) -> ClosedCommandResult:
        completed = subprocess.run(
            list(argv),
            cwd=cwd,
            shell=False,
            stdin=subprocess.DEVNULL,
            capture_output=True,
            text=True,
            check=False,
        )
        return ClosedCommandResult(
            completed.returncode,
            completed.stdout,
            completed.stderr,
        )


def _check_git_head(
    backend: ClosedCommandBackend,
    path: Path,
    expected_sha: str,
) -> str:
    """Reduce captured output to a closed status before the caller may raise."""

    backend_failed = False
    try:
        completed = backend.run(_GIT_HEAD, path)
    except (OSError, RuntimeError, TypeError, ValueError):
        backend_failed = True
    if backend_failed or not isinstance(completed, ClosedCommandResult):
        return "command-failed"
    if completed.returncode != 0:
        return "command-failed"
    try:
        match = re.fullmatch(r"([0-9a-f]{40})\n?", completed.stdout)
    except TypeError:
        return "malformed-output"
    if match is None:
        return "malformed-output"
    if match.group(1) != expected_sha:
        return "mismatch"
    return "match"


def _run_closed_command(
    backend: ClosedCommandBackend,
    argv: tuple[str, ...],
    cwd: Path,
) -> str:
    """Discard captured smoke output before post-command verification."""

    backend_failed = False
    try:
        completed = backend.run(argv, cwd)
    except (OSError, RuntimeError, TypeError, ValueError):
        backend_failed = True
    if backend_failed:
        return "execution-failed"
    if not isinstance(completed, ClosedCommandResult):
        return "malformed-result"
    return "pass" if completed.returncode == 0 else "fail"


@dataclass(frozen=True)
class ExactShaVerification:
    repository_key: str
    expected_sha: str
    observed_sha: str
    argv: tuple[str, ...]

    def __post_init__(self) -> None:
        if (
            not isinstance(self.repository_key, str)
            or not self.repository_key
            or _SHA.fullmatch(self.expected_sha) is None
            or _SHA.fullmatch(self.observed_sha) is None
            or self.argv != _GIT_HEAD
        ):
            raise ExactShaBoundaryError("checkout verification result is malformed")


@dataclass(frozen=True)
class ExactShaCommandResult:
    passed: bool
    verified_shas: Mapping[str, str]

    def __post_init__(self) -> None:
        values = dict(self.verified_shas)
        if (
            not isinstance(self.passed, bool)
            or not values
            or any(
                not isinstance(key, str)
                or not key
                or not isinstance(sha, str)
                or _SHA.fullmatch(sha) is None
                for key, sha in values.items()
            )
        ):
            raise ExactShaBoundaryError("exact-SHA command result is malformed")
        object.__setattr__(
            self,
            "verified_shas",
            MappingProxyType(dict(sorted(values.items()))),
        )


class LocalExactShaCommandRunner:
    """Own Git HEAD verification before and after a closed smoke command."""

    __slots__ = ("_manifest", "_backend")

    def __setattr__(self, name: str, value: object) -> None:
        raise AttributeError("exact-SHA runner authority bindings are immutable")

    @property
    def manifest(self) -> DeliveryManifest:
        return self._manifest

    def __init__(
        self,
        manifest: DeliveryManifest,
        backend: ClosedCommandBackend | None = None,
    ) -> None:
        if not isinstance(manifest, DeliveryManifest):
            raise TypeError("manifest must be a DeliveryManifest")
        validate_policy_authority(manifest.policy)
        if backend is not None and not callable(getattr(backend, "run", None)):
            raise TypeError("backend must implement ClosedCommandBackend")
        object.__setattr__(self, "_manifest", manifest)
        object.__setattr__(
            self,
            "_backend",
            backend if backend is not None else SubprocessCommandBackend(),
        )

    def _repository_path(self, repository_key: str, cwd: Path) -> Path:
        if repository_key not in self.manifest.repositories:
            raise ExactShaBoundaryError("repository is not declared", repository_key)
        expected_path = self.manifest.repositories[repository_key].local_path
        if not isinstance(cwd, Path) or cwd != expected_path:
            raise ExactShaBoundaryError(
                "command working directory is not declared", repository_key
            )
        return expected_path

    def verify(
        self,
        repository_key: str,
        expected_sha: str,
        cwd: Path,
        *,
        argv: tuple[str, ...],
    ) -> ExactShaVerification:
        path = self._repository_path(repository_key, cwd)
        if not isinstance(expected_sha, str) or _SHA.fullmatch(expected_sha) is None:
            raise ExactShaBoundaryError("expected SHA is malformed", repository_key)
        if argv != _GIT_HEAD:
            raise ExactShaBoundaryError(
                "checkout verification argv is not closed", repository_key
            )
        status = _check_git_head(self._backend, path, expected_sha)
        if status == "command-failed":
            raise ExactShaBoundaryError(
                "checkout verification command failed", repository_key
            )
        if status == "malformed-output":
            raise ExactShaBoundaryError(
                "checkout verification output is malformed", repository_key
            )
        if status != "match":
            raise ExactShaBoundaryError(
                "local checkout does not match expected SHA", repository_key
            )
        return ExactShaVerification(repository_key, expected_sha, expected_sha, _GIT_HEAD)

    def _validate_smoke_command(
        self,
        repository_key: str,
        argv: tuple[str, ...],
    ) -> None:
        repository = self.manifest.repositories[repository_key]
        allowed = {repository.commands["smoke"]}
        allowed.update(
            suite.command
            for suite in self.manifest.integration_suites
            if suite.command_repository == repository_key
        )
        if not isinstance(argv, tuple) or argv not in allowed:
            raise ExactShaBoundaryError(
                "smoke command argv is not declared", repository_key
            )

    def run(
        self,
        repository_key: str,
        candidate_shas: Mapping[str, str],
        argv: tuple[str, ...],
        cwd: Path,
    ) -> ExactShaCommandResult:
        self._repository_path(repository_key, cwd)
        self._validate_smoke_command(repository_key, argv)
        if not isinstance(candidate_shas, Mapping):
            raise ExactShaBoundaryError(
                "candidate SHA map is malformed", repository_key
            )
        exact = dict(candidate_shas)
        if (
            not exact
            or repository_key not in exact
            or set(exact) - self.manifest.repositories.keys()
            or any(
                not isinstance(key, str)
                or not isinstance(sha, str)
                or _SHA.fullmatch(sha) is None
                for key, sha in exact.items()
            )
        ):
            raise ExactShaBoundaryError(
                "candidate SHA map is malformed", repository_key
            )

        def verify_all() -> dict[str, str]:
            return {
                key: self.verify(
                    key,
                    exact[key],
                    self.manifest.repositories[key].local_path,
                    argv=_GIT_HEAD,
                ).observed_sha
                for key in sorted(exact)
            }

        before = verify_all()
        command_status = _run_closed_command(self._backend, argv, cwd)
        if command_status == "execution-failed":
            raise ExactShaBoundaryError(
                "smoke command failed to execute", repository_key
            )
        if command_status == "malformed-result":
            raise ExactShaBoundaryError(
                "smoke command result is malformed", repository_key
            )
        after = verify_all()
        if before != exact or after != exact or before != after:
            raise ExactShaBoundaryError(
                "checkout binding changed during smoke command", repository_key
            )
        return ExactShaCommandResult(command_status == "pass", after)
