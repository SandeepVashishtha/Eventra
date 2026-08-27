"""Closed local command execution bound to manifest repository SHAs."""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass
from pathlib import Path
import re
import subprocess
from types import MappingProxyType
from typing import Protocol

from .model import DeliveryManifest


_SHA = re.compile(r"[0-9a-f]{40}\Z")
_GIT_HEAD = ("git", "rev-parse", "HEAD")


class ExactShaBoundaryError(RuntimeError):
    """A fail-closed local checkout or command boundary failure."""


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

    def __init__(
        self,
        manifest: DeliveryManifest,
        backend: ClosedCommandBackend | None = None,
    ) -> None:
        if not isinstance(manifest, DeliveryManifest):
            raise TypeError("manifest must be a DeliveryManifest")
        if backend is not None and not callable(getattr(backend, "run", None)):
            raise TypeError("backend must implement ClosedCommandBackend")
        self.manifest = manifest
        self._backend = backend if backend is not None else SubprocessCommandBackend()

    def _repository_path(self, repository_key: str, cwd: Path) -> Path:
        if repository_key not in self.manifest.repositories:
            raise ExactShaBoundaryError("repository is not declared")
        expected_path = self.manifest.repositories[repository_key].local_path
        if not isinstance(cwd, Path) or cwd != expected_path:
            raise ExactShaBoundaryError("command working directory is not declared")
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
            raise ExactShaBoundaryError("expected SHA is malformed")
        if argv != _GIT_HEAD:
            raise ExactShaBoundaryError("checkout verification argv is not closed")
        try:
            completed = self._backend.run(_GIT_HEAD, path)
        except (OSError, RuntimeError, TypeError, ValueError) as error:
            raise ExactShaBoundaryError("checkout verification command failed") from error
        if not isinstance(completed, ClosedCommandResult) or completed.returncode != 0:
            raise ExactShaBoundaryError("checkout verification command failed")
        match = re.fullmatch(r"([0-9a-f]{40})\n?", completed.stdout)
        if match is None:
            raise ExactShaBoundaryError("checkout verification output is malformed")
        observed_sha = match.group(1)
        if observed_sha != expected_sha:
            raise ExactShaBoundaryError("local checkout does not match expected SHA")
        return ExactShaVerification(repository_key, expected_sha, observed_sha, _GIT_HEAD)

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
            raise ExactShaBoundaryError("smoke command argv is not declared")

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
            raise ExactShaBoundaryError("candidate SHA map is malformed")
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
            raise ExactShaBoundaryError("candidate SHA map is malformed")

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
        try:
            completed = self._backend.run(argv, cwd)
        except (OSError, RuntimeError, TypeError, ValueError) as error:
            raise ExactShaBoundaryError("smoke command failed to execute") from error
        if not isinstance(completed, ClosedCommandResult):
            raise ExactShaBoundaryError("smoke command result is malformed")
        after = verify_all()
        if before != exact or after != exact or before != after:
            raise ExactShaBoundaryError("checkout binding changed during smoke command")
        return ExactShaCommandResult(completed.returncode == 0, after)
