"""Read-only, product-neutral contract audit tests."""

import unittest

from tools.multica_delivery.contract_audit import audit_contracts
from tools.multica_delivery.manifest import load_manifest


class RecordingMultica:
    def __init__(self):
        self.calls = []

    def _read(self, name, value):
        self.calls.append(name)
        return value

    def version(self): return self._read("version", "0.4.33")
    def get_runtime(self, runtime_id, daemon_id): return self._read("get_runtime", {"id": runtime_id, "daemon_id": daemon_id})
    def list_projects(self): return self._read("list_projects", ())
    def list_agents(self): return self._read("list_agents", ())
    def list_skills(self): return self._read("list_skills", ())
    def inspect_skill_import(self): return self._read("inspect_skill_import", {"dry_run": False})

    def import_skill(self, *_):
        raise AssertionError("audit invoked mutation")


class RecordingGitHub:
    def __init__(self):
        self.calls = []

    def _read(self, name, value):
        self.calls.append(name)
        return value

    def auth_status(self): return self._read("auth_status", {"authenticated": True})
    def get_repository(self, repository): return self._read("get_repository", {"nameWithOwner": repository})
    def list_projects(self, repository): return self._read("list_projects", ())
    def list_pull_requests(self, repository): return self._read("list_pull_requests", ())

    def merge_pull_request(self, *_args, **_kwargs):
        raise AssertionError("audit invoked mutation")


class ContractAuditTests(unittest.TestCase):
    def setUp(self):
        fixture = "tools/multica_delivery/tests/fixtures/three-repository-delivery.yaml"
        self.manifest = load_manifest(fixture)

    def test_audit_is_read_only_and_returns_frozen_classified_entries(self):
        multica = RecordingMultica()
        github = RecordingGitHub()

        report = audit_contracts(multica, github, self.manifest)

        self.assertTrue(report.entries)
        self.assertTrue({entry.status for entry in report.entries} <= {"pass", "warn", "fail"})
        self.assertNotIn("import_skill", multica.calls)
        self.assertNotIn("merge_pull_request", github.calls)
        with self.assertRaises(AttributeError):
            report.entries += ()

    def test_audit_checks_control_and_every_repository_without_product_names(self):
        multica = RecordingMultica()
        github = RecordingGitHub()

        report = audit_contracts(multica, github, self.manifest)

        allowed = {self.manifest.control.github} | {repo.github for repo in self.manifest.repositories.values()}
        repository_entries = {entry.subject.removeprefix("github.repository.") for entry in report.entries if entry.subject.startswith("github.repository.")}
        self.assertEqual(repository_entries, allowed)

    def test_missing_samples_are_warnings_not_mutating_probes(self):
        report = audit_contracts(RecordingMultica(), RecordingGitHub(), self.manifest)

        statuses = {entry.subject: entry.status for entry in report.entries}
        self.assertEqual(statuses["multica.agent_environment"], "warn")
        self.assertEqual(statuses["github.pull_request_shape"], "warn")

    def test_audit_failures_never_retain_external_error_values(self):
        secret = "SECRET_VALUE_SENTINEL"
        multica = RecordingMultica()
        multica.version = lambda: (_ for _ in ()).throw(RuntimeError(secret))

        report = audit_contracts(multica, RecordingGitHub(), self.manifest)

        self.assertNotIn(secret, repr(report))
        statuses = {entry.subject: entry.status for entry in report.entries}
        self.assertEqual(statuses["multica.version"], "fail")


if __name__ == "__main__":
    unittest.main()
