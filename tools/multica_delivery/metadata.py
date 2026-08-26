"""Strict canonical JSON envelopes for Multica delivery state."""

from dataclasses import dataclass, field
import json
import re
from types import MappingProxyType
from typing import Any, Mapping, TypeVar


_SHA = re.compile(r"[0-9a-f]{40}")
_KEY = re.compile(r"[A-Za-z0-9][A-Za-z0-9._:/-]*")
_ACTION_KINDS = frozenset({"dispatch", "stage", "review", "qa", "merge", "repair", "smoke", "resume", "recovery"})
_ACTION_KEY = re.compile(r"(?:dispatch|stage|review|qa|merge|repair|smoke|resume|recovery):[0-9a-f]{64}")
_MERGE_STATES = frozenset({"pending", "not_ready", "ready", "merging", "merged", "partial", "blocked"})
_PHASE_KINDS = frozenset({"implementation", "review", "qa", "integration_qa", "merge", "smoke", "repair"})
_PHASE_RESULTS = frozenset({"pending", "pass", "fail", "blocked"})
_RECOVERY_ACTIONS = frozenset({"noop", "rerun", "resume_parent", "block"})


class MetadataError(ValueError):
    """Raised when metadata is not a complete, safe envelope."""


def canonical_json(value: object) -> str:
    """Serialize JSON using the only accepted stable representation."""
    try:
        return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"), allow_nan=False)
    except (TypeError, ValueError) as error:
        raise MetadataError(f"value is not canonical JSON: {error}") from error


def _frozen_mapping(value: Mapping[str, str], field_name: str, *, sha_values: bool = False) -> Mapping[str, str]:
    if not isinstance(value, Mapping):
        raise MetadataError(f"{field_name} must be an object")
    result: dict[str, str] = {}
    for key, item in value.items():
        if not isinstance(key, str) or not _KEY.fullmatch(key):
            raise MetadataError(f"{field_name} keys must be stable keys")
        if not isinstance(item, str) or (sha_values and not _SHA.fullmatch(item)):
            expected = "a lowercase 40-character SHA" if sha_values else "a string"
            raise MetadataError(f"{field_name}.{key} must be {expected}")
        result[key] = item
    return MappingProxyType(dict(sorted(result.items())))


def _key(value: str, field_name: str, *, empty: bool = False) -> str:
    if not isinstance(value, str) or (not empty and not value) or (value and not _KEY.fullmatch(value)):
        raise MetadataError(f"{field_name} must be a stable key")
    return value


def _keys(values: tuple[str, ...], field_name: str) -> tuple[str, ...]:
    if not isinstance(values, tuple):
        raise MetadataError(f"{field_name} must be a tuple")
    result = tuple(_key(value, field_name) for value in values)
    if len(set(result)) != len(result):
        raise MetadataError(f"{field_name} must not contain duplicates")
    return result


def _enum(value: str, field_name: str, allowed: frozenset[str]) -> str:
    if value not in allowed:
        raise MetadataError(f"{field_name} must be one of: {', '.join(sorted(allowed))}")
    return value


def _frozen_dag(
    value: Mapping[str, tuple[str, ...]] | None, affected_repositories: tuple[str, ...]
) -> Mapping[str, tuple[str, ...]]:
    if value is None:
        value = {key: () for key in affected_repositories}
    if not isinstance(value, Mapping):
        raise MetadataError("repository_dag must be an object")
    if set(value) != set(affected_repositories):
        raise MetadataError("repository_dag keys must exactly match affected_repositories")
    dag: dict[str, tuple[str, ...]] = {}
    for repository in affected_repositories:
        dependencies = value[repository]
        if not isinstance(dependencies, tuple):
            raise MetadataError(f"repository_dag.{repository} must be a tuple")
        normalized = _keys(dependencies, f"repository_dag.{repository}")
        unknown = set(normalized) - set(affected_repositories)
        if unknown:
            raise MetadataError(f"repository_dag.{repository} has non-affected dependencies")
        dag[repository] = tuple(sorted(normalized))
    pending = {repository: set(dependencies) for repository, dependencies in dag.items()}
    while pending:
        resolved = {repository for repository, dependencies in pending.items() if not dependencies}
        if not resolved:
            raise MetadataError("repository_dag contains a cycle")
        for repository in resolved:
            del pending[repository]
        for dependencies in pending.values():
            dependencies.difference_update(resolved)
    return MappingProxyType(dict(sorted(dag.items())))


def _validate_merge_plan(
    merge_plan: tuple[str, ...],
    affected_repositories: tuple[str, ...],
    repository_dag: Mapping[str, tuple[str, ...]],
) -> None:
    if set(merge_plan) != set(affected_repositories) or len(merge_plan) != len(affected_repositories):
        raise MetadataError("merge_plan must be a permutation of affected_repositories")
    positions = {repository: position for position, repository in enumerate(merge_plan)}
    for dependent, dependencies in repository_dag.items():
        if any(positions[dependency] > positions[dependent] for dependency in dependencies):
            raise MetadataError("merge_plan is inconsistent with repository_dag")


@dataclass(frozen=True)
class ParentMetadata:
    workflow_version: int = 1
    metadata_version: int = 1
    instance_key: str = "default"
    affected_repositories: tuple[str, ...] = ()
    repository_dag: Mapping[str, tuple[str, ...]] | None = None
    candidate_shas: Mapping[str, str] = field(default_factory=dict)
    contract_hashes: Mapping[str, str] = field(default_factory=dict)
    stage_ordinal: int = 0
    merge_plan: tuple[str, ...] = ()
    merge_state: str = "pending"
    attempt: int = 0
    last_action: str = "dispatch"

    def __post_init__(self) -> None:
        for name in ("workflow_version", "metadata_version", "stage_ordinal", "attempt"):
            value = getattr(self, name)
            if not isinstance(value, int) or isinstance(value, bool) or value < 0:
                raise MetadataError(f"{name} must be a non-negative integer")
        if not self.workflow_version or not self.metadata_version:
            raise MetadataError("workflow_version and metadata_version must be positive integers")
        object.__setattr__(self, "instance_key", _key(self.instance_key, "instance_key"))
        object.__setattr__(self, "affected_repositories", _keys(self.affected_repositories, "affected_repositories"))
        object.__setattr__(self, "repository_dag", _frozen_dag(self.repository_dag, self.affected_repositories))
        object.__setattr__(self, "candidate_shas", _frozen_mapping(self.candidate_shas, "candidate_shas", sha_values=True))
        object.__setattr__(self, "contract_hashes", _frozen_mapping(self.contract_hashes, "contract_hashes", sha_values=True))
        object.__setattr__(self, "merge_plan", _keys(self.merge_plan, "merge_plan"))
        affected = set(self.affected_repositories)
        if set(self.candidate_shas) - affected:
            raise MetadataError("candidate_shas must only contain affected repositories")
        if set(self.merge_plan) - affected:
            raise MetadataError("merge_plan must only contain affected repositories")
        if self.merge_plan:
            _validate_merge_plan(self.merge_plan, self.affected_repositories, self.repository_dag)
            if set(self.candidate_shas) != affected:
                raise MetadataError("candidate_shas must cover every affected repository when merge_plan is present")
        if self.merge_state in {"ready", "merging", "merged"}:
            if not self.merge_plan or set(self.candidate_shas) != affected:
                raise MetadataError("ready, merging, and merged states require a full merge plan and candidate SHA map")
        if self.attempt > 2:
            raise MetadataError("attempt must be between 0 and 2")
        object.__setattr__(self, "merge_state", _enum(self.merge_state, "merge_state", _MERGE_STATES))
        if not isinstance(self.last_action, str) or (
            self.last_action not in _ACTION_KINDS and not _ACTION_KEY.fullmatch(self.last_action)
        ):
            raise MetadataError("last_action must be an allowed action kind or a kind with a 64-hex digest")


@dataclass(frozen=True)
class ChildMetadata(ParentMetadata):
    repository_key: str = ""
    base_sha: str = ""

    def __post_init__(self) -> None:
        super().__post_init__()
        object.__setattr__(self, "repository_key", _key(self.repository_key, "repository_key", empty=True))
        if self.base_sha and not _SHA.fullmatch(self.base_sha):
            raise MetadataError("base_sha must be a lowercase 40-character SHA")


@dataclass(frozen=True)
class PhaseMetadata(ParentMetadata):
    phase_key: str = ""
    phase_kind: str = "implementation"
    phase_result: str = "pending"

    def __post_init__(self) -> None:
        super().__post_init__()
        object.__setattr__(self, "phase_key", _key(self.phase_key, "phase_key", empty=True))
        object.__setattr__(self, "phase_kind", _enum(self.phase_kind, "phase_kind", _PHASE_KINDS))
        object.__setattr__(self, "phase_result", _enum(self.phase_result, "phase_result", _PHASE_RESULTS))


@dataclass(frozen=True)
class PullRequestMetadata(ChildMetadata):
    pull_request_number: int = 0
    branch: str = ""

    def __post_init__(self) -> None:
        super().__post_init__()
        if not isinstance(self.pull_request_number, int) or isinstance(self.pull_request_number, bool) or self.pull_request_number < 1:
            raise MetadataError("pull_request_number must be a positive integer")
        object.__setattr__(self, "branch", _key(self.branch, "branch", empty=True))


@dataclass(frozen=True)
class RecoveryMetadata(ParentMetadata):
    recovery_action: str = "noop"

    def __post_init__(self) -> None:
        super().__post_init__()
        object.__setattr__(self, "recovery_action", _enum(self.recovery_action, "recovery_action", _RECOVERY_ACTIONS))


_T = TypeVar("_T", bound=ParentMetadata)


def _encode(metadata: ParentMetadata) -> str:
    value = {
        field_name: dict(field_value) if isinstance(field_value, Mapping) else field_value
        for field_name, field_value in ((name, getattr(metadata, name)) for name in metadata.__dataclass_fields__)
    }
    return canonical_json(value)


def _decode(text: str, metadata_type: type[_T]) -> _T:
    if not isinstance(text, str):
        raise MetadataError("metadata must be a JSON string")
    try:
        value = json.loads(text)
    except json.JSONDecodeError as error:
        raise MetadataError(f"invalid JSON metadata: {error.msg}") from error
    if not isinstance(value, dict):
        raise MetadataError("metadata must be a JSON object")
    expected = set(metadata_type.__dataclass_fields__)
    actual = set(value)
    unknown = sorted(actual - expected)
    if unknown:
        raise MetadataError(f"unknown fields: {', '.join(unknown)}")
    missing = sorted(expected - actual)
    if missing:
        raise MetadataError(f"missing fields: {', '.join(missing)}")
    if text != canonical_json(value):
        raise MetadataError("metadata must use canonical JSON")
    try:
        converted = dict(value)
        for field_name in ("affected_repositories", "merge_plan"):
            if not isinstance(converted[field_name], list):
                raise MetadataError(f"{field_name} must be a JSON array")
            converted[field_name] = tuple(converted[field_name])
        if not isinstance(converted["repository_dag"], dict):
            raise MetadataError("repository_dag must be a JSON object")
        converted["repository_dag"] = {
            repository: tuple(dependencies) if isinstance(dependencies, list) else dependencies
            for repository, dependencies in converted["repository_dag"].items()
        }
        return metadata_type(**converted)
    except (TypeError, MetadataError) as error:
        if isinstance(error, MetadataError):
            raise
        raise MetadataError(f"invalid metadata values: {error}") from error


def encode_parent_metadata(metadata: ParentMetadata) -> str:
    return _encode(metadata)


def decode_parent_metadata(text: str) -> ParentMetadata:
    return _decode(text, ParentMetadata)


def encode_child_metadata(metadata: ChildMetadata) -> str:
    return _encode(metadata)


def decode_child_metadata(text: str) -> ChildMetadata:
    return _decode(text, ChildMetadata)


def encode_phase_metadata(metadata: PhaseMetadata) -> str:
    return _encode(metadata)


def decode_phase_metadata(text: str) -> PhaseMetadata:
    return _decode(text, PhaseMetadata)


def encode_pull_request_metadata(metadata: PullRequestMetadata) -> str:
    return _encode(metadata)


def decode_pull_request_metadata(text: str) -> PullRequestMetadata:
    return _decode(text, PullRequestMetadata)


def encode_recovery_metadata(metadata: RecoveryMetadata) -> str:
    return _encode(metadata)


def decode_recovery_metadata(text: str) -> RecoveryMetadata:
    return _decode(text, RecoveryMetadata)
