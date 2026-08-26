import json
from types import MappingProxyType
import unittest

from tools.multica_delivery.metadata import (
    ChildMetadata,
    MetadataError,
    ParentMetadata,
    PullRequestMetadata,
    canonical_json,
    decode_child_metadata,
    decode_parent_metadata,
    decode_pull_request_metadata,
    encode_child_metadata,
    encode_parent_metadata,
    encode_pull_request_metadata,
)


class MetadataTests(unittest.TestCase):
    def test_parent_envelope_is_canonical_json(self):
        encoded = encode_parent_metadata(
            ParentMetadata(
                affected_repositories=("api", "web"),
                attempt=1,
                last_action="dispatch",
                merge_state="pending",
                candidate_shas={"api": "a" * 40, "web": "b" * 40},
            )
        )
        self.assertEqual(encoded, canonical_json(json.loads(encoded)))
        self.assertEqual(decode_parent_metadata(encoded).attempt, 1)

    def test_decode_rejects_unknown_fields(self):
        with self.assertRaisesRegex(MetadataError, "unknown fields"):
            decode_parent_metadata('{"attempt":1,"surprise":true}')

    def test_decode_rejects_missing_fields(self):
        with self.assertRaisesRegex(MetadataError, "missing fields"):
            decode_parent_metadata('{"attempt":1}')

    def test_decode_rejects_invalid_sha_and_non_object(self):
        encoded = encode_parent_metadata(ParentMetadata(candidate_shas={"api": "a" * 40}))
        with self.assertRaisesRegex(MetadataError, "candidate_shas.api"):
            decode_parent_metadata(encoded.replace("a" * 40, "A" * 40))
        with self.assertRaisesRegex(MetadataError, "JSON object"):
            decode_parent_metadata("[]")

    def test_child_round_trip_returns_immutable_mapping(self):
        decoded = decode_child_metadata(
            encode_child_metadata(ChildMetadata(repository_key="api", candidate_shas={"api": "a" * 40}))
        )
        self.assertIsInstance(decoded.candidate_shas, MappingProxyType)
        with self.assertRaises(TypeError):
            decoded.candidate_shas["web"] = "b" * 40

    def test_pull_request_requires_a_positive_number(self):
        encoded = encode_pull_request_metadata(PullRequestMetadata(repository_key="api", pull_request_number=1))
        self.assertEqual(decode_pull_request_metadata(encoded).pull_request_number, 1)
        with self.assertRaisesRegex(MetadataError, "pull_request_number"):
            decode_pull_request_metadata(encoded.replace('"pull_request_number":1', '"pull_request_number":0'))
