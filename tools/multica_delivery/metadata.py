"""Strict canonical JSON envelopes for Multica delivery state."""

from dataclasses import dataclass, field
import json
import re
from types import MappingProxyType
from typing import Any, Mapping, TypeVar


_SHA = re.compile(r"[0-9a-f]{40}")
_KEY = re.compile(r"[A-Za-z0-9][A-Za-z0-9._:/-]*")


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


@dataclass(frozen=True)
class ParentMetadata:
    workflow_version: int = 1
    metadata_version: int = 1
    instance_key: str = "default"
    affected_repositories: tuple[str, ...] = ()
    candidate_shas: Mapping[str, str] = field(default_factory=dict)
    contract_hashes: Mapping[str, str] = field(default_factory=dict)
    stage_ordinal: int = 0
    merge_plan: tuple[str, ...] = ()
    merge_state: str = "pending"
    attempt: int = 0
    last_action: str = "initial"

    def __post_init__(self) -> None:
        for name in ("workflow_version", "metadata_version", "stage_ordinal", "attempt"):
            value = getattr(self, name)
            if not isinstance(value, int) or isinstance(value, bool) or value < 0:
                raise MetadataError(f"{name} must be a non-negative integer")
        if not self.workflow_version or not self.metadata_version:
            raise MetadataError("workflow_version and metadata_version must be positive integers")
        object.__setattr__(self, "instance_key", _key(self.instance_key, "instance_key"))
        object.__setattr__(self, "affected_repositories", _keys(self.affected_repositories, "affected_repositories"))
        object.__setattr__(self, "candidate_shas", _frozen_mapping(self.candidate_shas, "candidate_shas", sha_values=True))
        object.__setattr__(self, "contract_hashes", _frozen_mapping(self.contract_hashes, "contract_hashes", sha_values=True))
        object.__setattr__(self, "merge_plan", _keys(self.merge_plan, "merge_plan"))
        object.__setattr__(self, "merge_state", _key(self.merge_state, "merge_state", empty=True))
        object.__setattr__(self, "last_action", _key(self.last_action, "last_action", empty=True))


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

    def __post_init__(self) -> None:
        super().__post_init__()
        object.__setattr__(self, "phase_key", _key(self.phase_key, "phase_key", empty=True))


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
    recovery_action: str = ""

    def __post_init__(self) -> None:
        super().__post_init__()
        object.__setattr__(self, "recovery_action", _key(self.recovery_action, "recovery_action", empty=True))


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
