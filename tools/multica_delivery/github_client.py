"""Manifest-scoped, injectable GitHub boundary."""

from __future__ import annotations

from dataclasses import dataclass
import json
import re
from typing import Mapping

from .multica_client import CommandFailure, CommandResult, CommandRunner


class GitHubBoundaryError(RuntimeError):
    """A sanitized GitHub scope or contract failure."""


@dataclass(frozen=True)
class GitHubAuth:
    login: str


@dataclass(frozen=True)
class RepositoryInfo:
    repository: str
    visibility: str | None
    default_branch: str | None


@dataclass(frozen=True)
class ProjectInfo:
    id: str
    title: str


@dataclass(frozen=True)
class PullRequest:
    repository: str
    number: int
    state: str
    head_sha: str
    mergeable: bool | None


@dataclass(frozen=True)
class CheckSummary:
    sha: str
    required_count: int
    passing: bool


@dataclass(frozen=True)
class MergeResult:
    repository: str
    number: int
    merged: bool
    head_sha: str
    merged_sha: str


class GitHubClient:
    """Only operates on repositories frozen into the delivery manifest."""

    def __init__(self, runner: CommandRunner, allowed_repositories: frozenset[str]):
        if not isinstance(allowed_repositories, frozenset) or not allowed_repositories:
            raise TypeError("allowed_repositories must be a non-empty frozenset")
        self._runner = runner
        self.allowed_repositories = allowed_repositories

    def _allow(self, repository: str) -> None:
        if repository not in self.allowed_repositories:
            raise GitHubBoundaryError(f"repository {repository!r} is not managed")

    def _run(self, argv: tuple[str, ...], operation: str, *, read_only: bool) -> object:
        attempts = 2 if read_only else 1
        for attempt in range(attempts):
            try:
                value = self._runner.run(argv)
                if isinstance(value, CommandResult):
                    if value.returncode != 0:
                        raise CommandFailure(transient=value.transient)
                    try:
                        value = json.loads(value.stdout)
                    except (json.JSONDecodeError, TypeError):
                        raise GitHubBoundaryError(f"malformed {operation} JSON response") from None
                return value
            except CommandFailure as error:
                if not (read_only and error.transient and attempt == 0):
                    raise GitHubBoundaryError(f"{operation} failed") from None
            except (OSError, TimeoutError):
                if not (read_only and attempt == 0):
                    raise GitHubBoundaryError(f"{operation} failed") from None
        raise AssertionError("unreachable")

    @staticmethod
    def _mapping(value: object, operation: str) -> Mapping[str, object]:
        if not isinstance(value, Mapping):
            raise GitHubBoundaryError(f"malformed {operation} response")
        return value

    def auth_status(self) -> GitHubAuth:
        raw = self._mapping(
            self._run(
                ("gh", "auth", "status", "--json", "active,login"),
                "GitHub auth",
                read_only=True,
            ),
            "GitHub auth",
        )
        login = raw.get("login")
        if raw.get("active") is not True or not isinstance(login, str) or not login:
            raise GitHubBoundaryError("GitHub is not authenticated")
        return GitHubAuth(login)

    def get_repository(self, repository: str) -> RepositoryInfo:
        self._allow(repository)
        raw = self._mapping(
            self._run(("gh", "api", f"repos/{repository}"), "repository read", read_only=True),
            "repository",
        )
        full_name = raw.get("full_name", raw.get("nameWithOwner"))
        visibility = raw.get("visibility")
        default_branch = raw.get("default_branch", raw.get("defaultBranch"))
        if (
            full_name != repository
            or (visibility is not None and not isinstance(visibility, str))
            or (default_branch is not None and not isinstance(default_branch, str))
        ):
            raise GitHubBoundaryError("malformed repository response")
        return RepositoryInfo(repository, visibility, default_branch)

    def list_projects(self, repository: str) -> tuple[ProjectInfo, ...]:
        self._allow(repository)
        raw = self._run(("gh", "api", f"repos/{repository}/projects"), "Projects read", read_only=True)
        if isinstance(raw, Mapping):
            raw = raw.get("projects")
        if not isinstance(raw, list) or not all(isinstance(item, Mapping) for item in raw):
            raise GitHubBoundaryError("malformed Projects response")
        projects = []
        for item in raw:
            project_id = item.get("id")
            title = item.get("title", item.get("name"))
            if not isinstance(project_id, (str, int)) or isinstance(project_id, bool) or not isinstance(title, str) or not title:
                raise GitHubBoundaryError("malformed Projects response")
            projects.append(ProjectInfo(str(project_id), title))
        return tuple(projects)

    def list_pull_requests(self, repository: str) -> tuple[PullRequest, ...]:
        self._allow(repository)
        raw = self._run(("gh", "api", f"repos/{repository}/pulls?state=all"), "pull request list", read_only=True)
        if not isinstance(raw, list):
            raise GitHubBoundaryError("malformed pull request list response")
        return tuple(self._decode_pull_request(repository, item) for item in raw)

    def get_pull_request(self, repository: str, number: int) -> PullRequest:
        self._allow(repository)
        raw = self._run(("gh", "api", f"repos/{repository}/pulls/{number}"), "pull request read", read_only=True)
        return self._decode_pull_request(repository, raw, expected_number=number)

    @staticmethod
    def _decode_pull_request(repository: str, raw: object, expected_number: int | None = None) -> PullRequest:
        if not isinstance(raw, Mapping):
            raise GitHubBoundaryError("malformed pull request response")
        number = raw.get("number")
        state = raw.get("state")
        head = raw.get("head")
        sha = head.get("sha") if isinstance(head, Mapping) else None
        mergeable = raw.get("mergeable")
        if (
            not isinstance(number, int)
            or isinstance(number, bool)
            or number < 1
            or (expected_number is not None and number != expected_number)
            or state not in {"open", "closed"}
            or not isinstance(sha, str)
            or re.fullmatch(r"[0-9a-f]{40}", sha) is None
            or mergeable not in {True, False, None}
        ):
            raise GitHubBoundaryError("malformed pull request response")
        return PullRequest(repository, number, state, sha, mergeable)

    def get_required_checks(self, repository: str, number: int, sha: str) -> CheckSummary:
        self._allow(repository)
        raw = self._run(
            (
                "gh",
                "pr",
                "checks",
                str(number),
                "--repo",
                repository,
                "--required",
                "--json",
                "name,state,bucket",
            ),
            "required checks read",
            read_only=True,
        )
        if not isinstance(raw, list):
            raise GitHubBoundaryError("malformed required checks response")
        valid = all(
            isinstance(check, Mapping)
            and isinstance(check.get("name"), str)
            and check.get("bucket") == "pass"
            for check in raw
        )
        return CheckSummary(sha, len(raw), bool(raw) and valid)

    def merge_pull_request(self, repository: str, number: int, *, expected_sha: str) -> MergeResult:
        """Authoritatively reread every gate immediately before one mutation."""

        self._allow(repository)
        if re.fullmatch(r"[0-9a-f]{40}", expected_sha) is None:
            raise GitHubBoundaryError("expected SHA is malformed")
        pull_request = self.get_pull_request(repository, number)
        if pull_request.head_sha != expected_sha:
            raise GitHubBoundaryError("pull request head SHA changed")
        if pull_request.state != "open":
            raise GitHubBoundaryError("pull request is not open")
        if pull_request.mergeable is not True:
            raise GitHubBoundaryError("pull request is not mergeable")
        checks = self.get_required_checks(repository, number, expected_sha)
        if not checks.passing:
            raise GitHubBoundaryError("required checks are not passing")
        raw = self._mapping(
            self._run(
                ("gh", "api", "-X", "PUT", f"repos/{repository}/pulls/{number}/merge", "-f", "merge_method=merge", "-f", f"sha={expected_sha}"),
                "pull request merge",
                read_only=False,
            ),
            "pull request merge",
        )
        merged = raw.get("merged")
        merged_sha = raw.get("sha")
        if merged is not True or not isinstance(merged_sha, str) or re.fullmatch(r"[0-9a-f]{40}", merged_sha) is None:
            raise GitHubBoundaryError("malformed pull request merge response")
        return MergeResult(repository, number, True, expected_sha, merged_sha)
