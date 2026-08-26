"""Manifest-scoped, injectable GitHub boundary."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
import json
import re
from typing import Mapping
from urllib.parse import quote

from .multica_client import (
    CommandFailure,
    CommandResult,
    CommandRunner,
    TransientCommandError,
)


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
    url: str
    public: bool
    closed: bool
    linked_repositories: tuple[str, ...]


@dataclass(frozen=True)
class PullRequestInfo:
    repository: str
    number: int
    state: str
    head_sha: str
    base_ref: str
    mergeable: bool | None
    merged_at: str | None = None
    merge_commit_sha: str | None = None

    def __post_init__(self) -> None:
        merged_time_valid = False
        if isinstance(self.merged_at, str) and self.merged_at:
            try:
                merged_time_valid = datetime.fromisoformat(
                    self.merged_at.replace("Z", "+00:00")
                ).tzinfo is not None
            except ValueError:
                merged_time_valid = False
        merged_commit_valid = (
            isinstance(self.merge_commit_sha, str)
            and re.fullmatch(r"[0-9a-f]{40}", self.merge_commit_sha) is not None
        )
        if self.state not in {"open", "closed", "merged"}:
            raise ValueError("pull request state is malformed")
        if (
            not isinstance(self.repository, str)
            or not self.repository
            or not isinstance(self.number, int)
            or isinstance(self.number, bool)
            or self.number < 1
            or not isinstance(self.head_sha, str)
            or re.fullmatch(r"[0-9a-f]{40}", self.head_sha) is None
            or not isinstance(self.base_ref, str)
            or not self.base_ref
            or self.base_ref.startswith("-")
            or (self.mergeable is not None and not isinstance(self.mergeable, bool))
        ):
            raise ValueError("pull request identity is malformed")
        if self.state == "merged" and not (merged_time_valid and merged_commit_valid):
            raise ValueError("merged pull request identity is malformed")
        if self.state in {"open", "closed"} and self.merged_at is not None:
            raise ValueError("unmerged pull request has merged identity")
        if self.state == "closed" and self.merge_commit_sha is not None:
            raise ValueError("closed pull request has merged identity")
        if (
            self.state == "open"
            and self.merge_commit_sha is not None
            and not merged_commit_valid
        ):
            raise ValueError("open pull request merge commit identity is malformed")


@dataclass(frozen=True)
class RequiredCheckIdentity:
    context: str
    app_id: int


@dataclass(frozen=True)
class RequiredStatusChecks:
    repository: str
    base_ref: str
    sha: str
    strict: bool
    required_contexts: tuple[str, ...]
    required_checks: tuple[RequiredCheckIdentity, ...]
    successful_contexts: tuple[str, ...]
    successful_checks: tuple[RequiredCheckIdentity, ...]
    passing: bool


PullRequest = PullRequestInfo
CheckSummary = RequiredStatusChecks


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
                value = self._runner.run(argv, input_text=None)
                if isinstance(value, CommandResult):
                    if value.returncode != 0:
                        raise CommandFailure()
                    try:
                        value = json.loads(value.stdout)
                    except (json.JSONDecodeError, TypeError):
                        raise GitHubBoundaryError(f"malformed {operation} JSON response") from None
                return value
            except TransientCommandError:
                if read_only and attempt == 0:
                    continue
                raise GitHubBoundaryError(f"{operation} failed") from None
            except (CommandFailure, OSError, TimeoutError):
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
        if full_name != repository or visibility not in {"public", "private", "internal"} or not isinstance(default_branch, str) or not default_branch:
            raise GitHubBoundaryError("malformed repository response")
        return RepositoryInfo(repository, visibility, default_branch)

    def list_projects(self, repository: str) -> tuple[ProjectInfo, ...]:
        self._allow(repository)
        owner, name = repository.split("/", 1)
        query = """query($owner:String!,$name:String!){repository(owner:$owner,name:$name){nameWithOwner owner{... on Organization{projectsV2(first:100){nodes{id title url public closed repositories(first:100){nodes{nameWithOwner}}}}} ... on User{projectsV2(first:100){nodes{id title url public closed repositories(first:100){nodes{nameWithOwner}}}}}}}}"""
        raw = self._run(
            (
                "gh",
                "api",
                "graphql",
                "-f",
                f"query={query}",
                "-F",
                f"owner={owner}",
                "-F",
                f"name={name}",
            ),
            "Projects v2 read",
            read_only=True,
        )
        if not isinstance(raw, Mapping) or raw.get("errors") not in (None, [], ()):
            raise GitHubBoundaryError("malformed Projects response")
        data = raw.get("data")
        repository_node = data.get("repository") if isinstance(data, Mapping) else None
        owner_node = repository_node.get("owner") if isinstance(repository_node, Mapping) else None
        projects_connection = owner_node.get("projectsV2") if isinstance(owner_node, Mapping) else None
        nodes = projects_connection.get("nodes") if isinstance(projects_connection, Mapping) else None
        if (
            not isinstance(repository_node, Mapping)
            or repository_node.get("nameWithOwner") != repository
            or not isinstance(nodes, list)
        ):
            raise GitHubBoundaryError("malformed Projects response")
        projects = []
        for item in nodes:
            if not isinstance(item, Mapping):
                raise GitHubBoundaryError("malformed Projects response")
            project_id = item.get("id")
            title = item.get("title")
            url = item.get("url")
            public = item.get("public")
            closed = item.get("closed")
            repositories = item.get("repositories")
            repository_nodes = repositories.get("nodes") if isinstance(repositories, Mapping) else None
            if (
                not isinstance(project_id, str)
                or not project_id
                or not isinstance(title, str)
                or not title
                or not isinstance(url, str)
                or not url.startswith("https://github.com/")
                or not isinstance(public, bool)
                or not isinstance(closed, bool)
                or not isinstance(repository_nodes, list)
            ):
                raise GitHubBoundaryError("malformed Projects response")
            linked = []
            for linked_repository in repository_nodes:
                linked_name = linked_repository.get("nameWithOwner") if isinstance(linked_repository, Mapping) else None
                if not isinstance(linked_name, str) or not linked_name:
                    raise GitHubBoundaryError("malformed Projects response")
                linked.append(linked_name)
            linked_tuple = tuple(sorted(linked))
            if repository in linked_tuple:
                projects.append(ProjectInfo(project_id, title, url, public, closed, linked_tuple))
        return tuple(projects)

    def list_pull_requests(self, repository: str) -> tuple[PullRequestInfo, ...]:
        self._allow(repository)
        raw = self._run(("gh", "api", f"repos/{repository}/pulls?state=all"), "pull request list", read_only=True)
        if not isinstance(raw, list):
            raise GitHubBoundaryError("malformed pull request list response")
        return tuple(self._decode_pull_request(repository, item) for item in raw)

    def get_pull_request(self, repository: str, number: int) -> PullRequestInfo:
        self._allow(repository)
        raw = self._run(("gh", "api", f"repos/{repository}/pulls/{number}"), "pull request read", read_only=True)
        return self._decode_pull_request(repository, raw, expected_number=number)

    @staticmethod
    def _decode_pull_request(repository: str, raw: object, expected_number: int | None = None) -> PullRequestInfo:
        if not isinstance(raw, Mapping):
            raise GitHubBoundaryError("malformed pull request response")
        number = raw.get("number")
        state = raw.get("state")
        head = raw.get("head")
        sha = head.get("sha") if isinstance(head, Mapping) else None
        base = raw.get("base")
        base_ref = base.get("ref") if isinstance(base, Mapping) else None
        mergeable = raw.get("mergeable")
        if "merged_at" not in raw or "merge_commit_sha" not in raw:
            raise GitHubBoundaryError("malformed pull request response")
        merged_at = raw.get("merged_at")
        merge_commit_sha = raw.get("merge_commit_sha")
        merged_time_valid = False
        if isinstance(merged_at, str) and merged_at:
            try:
                merged_time_valid = datetime.fromisoformat(
                    merged_at.replace("Z", "+00:00")
                ).tzinfo is not None
            except ValueError:
                merged_time_valid = False
        merged_commit_valid = (
            isinstance(merge_commit_sha, str)
            and re.fullmatch(r"[0-9a-f]{40}", merge_commit_sha) is not None
        )
        if state == "closed" and merged_at is not None:
            normalized_state = "merged"
        else:
            normalized_state = state
        if (
            not isinstance(number, int)
            or isinstance(number, bool)
            or number < 1
            or (expected_number is not None and number != expected_number)
            or state not in {"open", "closed"}
            or not isinstance(sha, str)
            or re.fullmatch(r"[0-9a-f]{40}", sha) is None
            or not isinstance(base_ref, str)
            or not base_ref
            or base_ref.startswith("-")
            or (mergeable is not None and not isinstance(mergeable, bool))
            or (normalized_state == "merged" and not (merged_time_valid and merged_commit_valid))
            or (normalized_state == "open" and merged_at is not None)
            or (normalized_state == "closed" and (merged_at is not None or merge_commit_sha is not None))
            or (
                normalized_state == "open"
                and merge_commit_sha is not None
                and not merged_commit_valid
            )
        ):
            raise GitHubBoundaryError("malformed pull request response")
        return PullRequestInfo(
            repository,
            number,
            normalized_state,
            sha,
            base_ref,
            mergeable,
            merged_at,
            merge_commit_sha,
        )

    def required_status_checks(
        self,
        repository: str,
        base_ref: str,
        expected_sha: str,
    ) -> RequiredStatusChecks:
        self._allow(repository)
        if (
            not isinstance(base_ref, str)
            or not base_ref
            or base_ref.startswith("-")
            or re.fullmatch(r"[0-9a-f]{40}", expected_sha) is None
        ):
            raise GitHubBoundaryError("required checks target is malformed")
        encoded_ref = quote(base_ref, safe="")
        protection = self._run(
            (
                "gh",
                "api",
                f"repos/{repository}/branches/{encoded_ref}/protection/required_status_checks",
            ),
            "required checks configuration read",
            read_only=True,
        )
        if not isinstance(protection, Mapping) or not isinstance(protection.get("strict"), bool):
            raise GitHubBoundaryError("malformed required checks configuration response")
        contexts = protection.get("contexts")
        checks_config = protection.get("checks")
        if (
            not isinstance(contexts, list)
            or not all(isinstance(context, str) and context for context in contexts)
            or len(set(contexts)) != len(contexts)
            or not isinstance(checks_config, list)
        ):
            raise GitHubBoundaryError("malformed required checks configuration response")
        required_checks = []
        for check in checks_config:
            context = check.get("context") if isinstance(check, Mapping) else None
            app_id = check.get("app_id") if isinstance(check, Mapping) else None
            if (
                not isinstance(context, str)
                or not context
                or not isinstance(app_id, int)
                or isinstance(app_id, bool)
                or app_id < 1
            ):
                raise GitHubBoundaryError("malformed required checks configuration response")
            required_checks.append(RequiredCheckIdentity(context, app_id))
        if len(set(required_checks)) != len(required_checks):
            raise GitHubBoundaryError("malformed required checks configuration response")
        required_contexts = tuple(sorted(contexts))
        required_check_identities = tuple(
            sorted(required_checks, key=lambda identity: (identity.context, identity.app_id))
        )

        check_runs_response = self._run(
            ("gh", "api", f"repos/{repository}/commits/{expected_sha}/check-runs"),
            "required checks read",
            read_only=True,
        )
        if not isinstance(check_runs_response, Mapping) or not isinstance(check_runs_response.get("check_runs"), list):
            raise GitHubBoundaryError("malformed required checks response")
        response_sha = check_runs_response.get("sha")
        if response_sha is not None and response_sha != expected_sha:
            raise GitHubBoundaryError("malformed required checks response")
        check_observations: dict[RequiredCheckIdentity, list[bool]] = {}
        for check in check_runs_response["check_runs"]:
            name = check.get("name") if isinstance(check, Mapping) else None
            head_sha = check.get("head_sha") if isinstance(check, Mapping) else None
            status = check.get("status") if isinstance(check, Mapping) else None
            conclusion = check.get("conclusion") if isinstance(check, Mapping) else None
            app = check.get("app") if isinstance(check, Mapping) else None
            app_id = app.get("id") if isinstance(app, Mapping) else None
            if (
                not isinstance(name, str)
                or not name
                or head_sha != expected_sha
                or not isinstance(app_id, int)
                or isinstance(app_id, bool)
                or app_id < 1
                or status not in {"queued", "in_progress", "completed", "waiting", "pending", "requested"}
                or (
                    conclusion is not None
                    and conclusion
                    not in {
                        "success",
                        "failure",
                        "neutral",
                        "cancelled",
                        "skipped",
                        "timed_out",
                        "action_required",
                        "stale",
                        "startup_failure",
                    }
                )
            ):
                raise GitHubBoundaryError("malformed required checks response")
            identity = RequiredCheckIdentity(name, app_id)
            check_observations.setdefault(identity, []).append(
                status == "completed" and conclusion == "success"
            )

        statuses_response = self._run(
            ("gh", "api", f"repos/{repository}/commits/{expected_sha}/status"),
            "required commit statuses read",
            read_only=True,
        )
        if (
            not isinstance(statuses_response, Mapping)
            or statuses_response.get("sha") != expected_sha
            or not isinstance(statuses_response.get("statuses"), list)
        ):
            raise GitHubBoundaryError("malformed required commit statuses response")
        status_observations: dict[str, list[bool]] = {}
        for status_item in statuses_response["statuses"]:
            status_sha = status_item.get("sha") if isinstance(status_item, Mapping) else None
            context = status_item.get("context") if isinstance(status_item, Mapping) else None
            state = status_item.get("state") if isinstance(status_item, Mapping) else None
            if (
                status_sha != expected_sha
                or not isinstance(context, str)
                or not context
                or state not in {"pending", "success", "failure", "error"}
            ):
                raise GitHubBoundaryError("malformed required commit statuses response")
            status_observations.setdefault(context, []).append(state == "success")

        successful_contexts = tuple(
            context
            for context in required_contexts
            if status_observations.get(context) and all(status_observations[context])
        )
        successful_checks = tuple(
            identity
            for identity in required_check_identities
            if check_observations.get(identity) and all(check_observations[identity])
        )
        return RequiredStatusChecks(
            repository,
            base_ref,
            expected_sha,
            protection["strict"],
            required_contexts,
            required_check_identities,
            successful_contexts,
            successful_checks,
            successful_contexts == required_contexts
            and successful_checks == required_check_identities,
        )

    def get_required_checks(
        self,
        repository: str,
        sha: str,
        *,
        base_ref: str | None = None,
    ) -> RequiredStatusChecks:
        if base_ref is None:
            raise GitHubBoundaryError("required checks base ref is required")
        return self.required_status_checks(repository, base_ref, sha)

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
        checks = self.required_status_checks(
            repository,
            pull_request.base_ref,
            expected_sha,
        )
        if not checks.passing:
            raise GitHubBoundaryError("required checks are not passing")
        try:
            self._run(
                ("gh", "api", "-X", "PUT", f"repos/{repository}/pulls/{number}/merge", "-f", "merge_method=merge", "-f", f"sha={expected_sha}"),
                "pull request merge",
                read_only=False,
            )
        except Exception:
            # The mutation may have committed before its acknowledgement failed.
            pass
        authoritative = self.get_pull_request(repository, number)
        if (
            authoritative.state != "merged"
            or authoritative.head_sha != expected_sha
            or authoritative.merged_at is None
            or not isinstance(authoritative.merge_commit_sha, str)
            or re.fullmatch(r"[0-9a-f]{40}", authoritative.merge_commit_sha) is None
        ):
            raise GitHubBoundaryError("pull request merge is not authoritatively observable")
        return MergeResult(
            repository,
            number,
            True,
            expected_sha,
            authoritative.merge_commit_sha,
        )
