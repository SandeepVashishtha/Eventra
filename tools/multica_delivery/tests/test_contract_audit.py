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
    def get_runtime(self, runtime_id, daemon_id): return self._read("get_runtime", {"id": runtime_id, "daemon_id": daemon_id, "status": "online"})
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

    def auth_status(self): return self._read("auth_status", {"active": True, "login": "tester"})
    def get_repository(self, repository): return self._read("get_repository", {"repository": repository, "visibility": "private"})
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

    def test_malformed_capability_and_repository_visibility_are_fail_entries(self):
        multica = RecordingMultica()
        github = RecordingGitHub()
        multica.inspect_skill_import = lambda: {"dry_run": "false"}
        github.get_repository = lambda repository: {"repository": repository}

        report = audit_contracts(multica, github, self.manifest)

        statuses = {entry.subject: entry.status for entry in report.entries}
        self.assertEqual(statuses["multica.skill_import_capability"], "fail")
        self.assertTrue(all(statuses[f"github.repository.{slug}"] == "fail" for slug in ({self.manifest.control.github} | {repo.github for repo in self.manifest.repositories.values()})))

    def test_malformed_sample_shapes_become_fail_entries_instead_of_exceptions(self):
        multica = RecordingMultica()
        github = RecordingGitHub()
        multica.list_agents = lambda: (object(),)
        github.list_projects = lambda repository: (object(),)
        github.list_pull_requests = lambda repository: (object(),)

        report = audit_contracts(multica, github, self.manifest)

        statuses = {entry.subject: entry.status for entry in report.entries}
        self.assertEqual(statuses["multica.agents"], "fail")
        self.assertTrue(all(statuses[f"github.projects.{slug}"] == "fail" for slug in ({self.manifest.control.github} | {repo.github for repo in self.manifest.repositories.values()})))
        self.assertTrue(all(statuses[f"github.pull_requests.{slug}"] == "fail" for slug in ({self.manifest.control.github} | {repo.github for repo in self.manifest.repositories.values()})))

    def test_malformed_pr_detail_fails_detail_and_overall_summary(self):
        sha = "a" * 40
        github = RecordingGitHub()
        github.list_pull_requests = lambda repository: (
            {
                "repository": repository,
                "number": 4,
                "state": "open",
                "head_sha": sha,
                "base_ref": "main",
                "mergeable": True,
            },
        )
        github.get_pull_request = lambda repository, number: {
            "repository": repository,
            "number": number,
            "state": "unknown",
            "head_sha": "main",
            "base_ref": "",
            "mergeable": "yes",
        }

        report = audit_contracts(RecordingMultica(), github, self.manifest)

        statuses = {entry.subject: entry.status for entry in report.entries}
        self.assertTrue(all(statuses[f"github.pull_request.{slug}"] == "fail" for slug in ({self.manifest.control.github} | {repo.github for repo in self.manifest.repositories.values()})))
        self.assertEqual(statuses["github.pull_request_shape"], "fail")

    def test_malformed_required_check_detail_keeps_overall_summary_failed(self):
        sha = "a" * 40
        github = RecordingGitHub()

        def pull(repository):
            return {
                "repository": repository,
                "number": 4,
                "state": "open",
                "head_sha": sha,
                "base_ref": "main",
                "mergeable": True,
            }

        github.list_pull_requests = lambda repository: (pull(repository),)
        github.get_pull_request = lambda repository, number: pull(repository)
        github.required_status_checks = lambda repository, base_ref, head_sha: {
            "repository": repository,
            "base_ref": base_ref,
            "sha": head_sha,
            "strict": "true",
            "required_contexts": ("ci",),
            "successful_contexts": ("ci",),
            "passing": True,
        }

        report = audit_contracts(RecordingMultica(), github, self.manifest)

        statuses = {entry.subject: entry.status for entry in report.entries}
        self.assertTrue(all(statuses[f"github.required_status_checks.{slug}"] == "fail" for slug in ({self.manifest.control.github} | {repo.github for repo in self.manifest.repositories.values()})))
        self.assertEqual(statuses["github.pull_request_shape"], "fail")


if __name__ == "__main__":
    unittest.main()
