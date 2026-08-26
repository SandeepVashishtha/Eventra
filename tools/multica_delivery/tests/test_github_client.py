"""Behavioral tests for the manifest-scoped GitHub boundary."""

import unittest

from tools.multica_delivery.github_client import (
    GitHubBoundaryError,
    GitHubClient,
    RequiredStatusChecks,
)
from tools.multica_delivery.multica_client import TransientCommandError


class FakeRunner:
    def __init__(self, *replies):
        self.replies = list(replies)
        self.calls = []

    def run(self, argv, *, input_text=None):
        self.calls.append((argv, input_text))
        reply = self.replies.pop(0)
        if isinstance(reply, Exception):
            raise reply
        return reply


class GitHubClientTests(unittest.TestCase):
    def setUp(self):
        self.runner = FakeRunner()
        self.client = GitHubClient(self.runner, frozenset({"codeExploreHub/api"}))

    @staticmethod
    def pull(sha, *, base="main", mergeable=True):
        return {
            "number": 4,
            "state": "open",
            "head": {"sha": sha},
            "base": {"ref": base},
            "mergeable": mergeable,
        }

    def test_refuses_repository_outside_manifest_before_calling_runner(self):
        with self.assertRaisesRegex(GitHubBoundaryError, "not managed"):
            self.client.get_pull_request("other/repo", 4)

        self.assertEqual(self.runner.calls, [])

    def test_repository_and_project_reads_return_typed_immutable_values(self):
        self.runner.replies = [
            {"full_name": "codeExploreHub/api", "visibility": "private", "default_branch": "main"},
            {
                "data": {
                    "repository": {
                        "nameWithOwner": "codeExploreHub/api",
                        "owner": {
                            "projectsV2": {
                                "nodes": [
                                    {
                                        "id": "PVT_12",
                                        "title": "API Delivery",
                                        "url": "https://github.com/orgs/codeExploreHub/projects/12",
                                        "public": False,
                                        "closed": False,
                                        "repositories": {"nodes": [{"nameWithOwner": "codeExploreHub/api"}]},
                                    }
                                ]
                            }
                        },
                    }
                }
            },
        ]

        repository = self.client.get_repository("codeExploreHub/api")
        projects = self.client.list_projects("codeExploreHub/api")

        self.assertEqual(repository.default_branch, "main")
        self.assertEqual(projects[0].title, "API Delivery")
        self.assertEqual(projects[0].linked_repositories, ("codeExploreHub/api",))
        self.assertFalse(projects[0].public)
        project_argv = self.runner.calls[1][0]
        self.assertEqual(project_argv[:3], ("gh", "api", "graphql"))
        self.assertIn("owner=codeExploreHub", project_argv)
        self.assertIn("name=api", project_argv)
        with self.assertRaises(AttributeError):
            repository.visibility = "public"

    def test_auth_status_fails_closed_when_no_active_account(self):
        self.runner.replies = [{"active": False, "login": "nobody"}]

        with self.assertRaisesRegex(GitHubBoundaryError, "not authenticated"):
            self.client.auth_status()

    def test_repository_visibility_is_required_and_strict(self):
        self.runner.replies = [{"full_name": "codeExploreHub/api", "default_branch": "main"}]

        with self.assertRaisesRegex(GitHubBoundaryError, "repository response"):
            self.client.get_repository("codeExploreHub/api")

    def test_merge_requires_expected_head_sha_before_mutation(self):
        expected = "a" * 40
        actual = "b" * 40
        self.runner.replies = [self.pull(actual)]

        with self.assertRaisesRegex(GitHubBoundaryError, "head SHA changed"):
            self.client.merge_pull_request("codeExploreHub/api", 4, expected_sha=expected)

        self.assertEqual(len(self.runner.calls), 1)
        self.assertEqual(self.runner.calls[0][0][:2], ("gh", "api"))

    def test_pull_request_read_rejects_noncanonical_head_sha(self):
        self.runner.replies = [
            self.pull("main")
        ]

        with self.assertRaisesRegex(GitHubBoundaryError, "malformed pull request"):
            self.client.get_pull_request("codeExploreHub/api", 4)

    def test_merge_rereads_open_mergeable_pr_and_required_checks_immediately(self):
        sha = "a" * 40
        self.runner.replies = [
            self.pull(sha),
            {"strict": True, "contexts": ["legacy-ci"], "checks": [{"context": "check-ci", "app_id": 7}]},
            {
                "check_runs": [
                    {"name": "check-ci", "head_sha": sha, "status": "completed", "conclusion": "success"},
                    {"name": "optional-lint", "head_sha": sha, "status": "completed", "conclusion": "failure"},
                ]
            },
            {
                "sha": sha,
                "statuses": [
                    {"sha": sha, "context": "legacy-ci", "state": "success"},
                    {"sha": sha, "context": "optional-status", "state": "failure"},
                ],
            },
            {"merged": True, "sha": "c" * 40},
        ]

        merged = self.client.merge_pull_request("codeExploreHub/api", 4, expected_sha=sha)

        self.assertTrue(merged.merged)
        self.assertEqual(merged.merged_sha, "c" * 40)
        self.assertEqual(len(self.runner.calls), 5)
        self.assertIn("repos/codeExploreHub/api/branches/main/protection/required_status_checks", self.runner.calls[1][0])
        self.assertIn(f"repos/codeExploreHub/api/commits/{sha}/check-runs", self.runner.calls[2][0])
        self.assertIn(f"repos/codeExploreHub/api/commits/{sha}/status", self.runner.calls[3][0])
        self.assertEqual(self.runner.calls[-1][0][:3], ("gh", "api", "-X"))
        self.assertIn(f"sha={sha}", self.runner.calls[-1][0])

    def test_merge_refuses_missing_or_failed_required_checks(self):
        sha = "a" * 40
        self.runner.replies = [
            self.pull(sha),
            {"strict": True, "contexts": ["test"], "checks": []},
            {"check_runs": [{"name": "optional", "head_sha": sha, "status": "completed", "conclusion": "success"}]},
            {"sha": sha, "statuses": [{"sha": sha, "context": "test", "state": "failure"}]},
        ]

        with self.assertRaisesRegex(GitHubBoundaryError, "required checks"):
            self.client.merge_pull_request("codeExploreHub/api", 4, expected_sha=sha)

        self.assertEqual(len(self.runner.calls), 4)

    def test_exact_sha_check_response_rejects_mismatched_sha(self):
        sha = "a" * 40
        self.runner.replies = [
            {"strict": True, "contexts": ["test"], "checks": []},
            {"check_runs": [{"name": "test", "head_sha": "b" * 40, "status": "completed", "conclusion": "success"}]},
        ]

        with self.assertRaisesRegex(GitHubBoundaryError, "required checks"):
            self.client.required_status_checks("codeExploreHub/api", "main", sha)

    def test_required_contexts_accept_status_or_check_and_ignore_optional_failures(self):
        sha = "a" * 40
        self.runner.replies = [
            {"strict": True, "contexts": ["legacy"], "checks": [{"context": "modern", "app_id": 1}]},
            {
                "check_runs": [
                    {"name": "modern", "head_sha": sha, "status": "completed", "conclusion": "success"},
                    {"name": "optional", "head_sha": sha, "status": "completed", "conclusion": "failure"},
                ]
            },
            {"sha": sha, "statuses": [{"sha": sha, "context": "legacy", "state": "success"}]},
        ]

        summary = self.client.required_status_checks("codeExploreHub/api", "release/v1", sha)

        self.assertIsInstance(summary, RequiredStatusChecks)
        self.assertEqual(summary.required_contexts, ("legacy", "modern"))
        self.assertTrue(summary.passing)
        self.assertIn("branches/release%2Fv1/protection", self.runner.calls[0][0][-1])

    def test_required_contexts_allow_empty_authoritative_set(self):
        sha = "a" * 40
        self.runner.replies = [
            {"strict": True, "contexts": [], "checks": []},
            {"check_runs": [{"name": "optional", "head_sha": sha, "status": "completed", "conclusion": "failure"}]},
            {"sha": sha, "statuses": [{"sha": sha, "context": "optional", "state": "failure"}]},
        ]

        summary = self.client.required_status_checks("codeExploreHub/api", "main", sha)

        self.assertEqual(summary.required_contexts, ())
        self.assertTrue(summary.passing)

    def test_required_checks_reject_missing_run_head_sha_and_status_sha(self):
        sha = "a" * 40
        self.runner.replies = [
            {"strict": True, "contexts": ["test"], "checks": []},
            {"check_runs": [{"name": "test", "status": "completed", "conclusion": "success"}]},
        ]

        with self.assertRaisesRegex(GitHubBoundaryError, "required checks"):
            self.client.required_status_checks("codeExploreHub/api", "main", sha)

        self.assertEqual(len(self.runner.calls), 2)

        status_runner = FakeRunner(
            {"strict": True, "contexts": ["legacy"], "checks": []},
            {"check_runs": []},
            {"sha": sha, "statuses": [{"context": "legacy", "state": "success"}]},
        )
        with self.assertRaisesRegex(GitHubBoundaryError, "commit statuses"):
            GitHubClient(
                status_runner, frozenset({"codeExploreHub/api"})
            ).required_status_checks("codeExploreHub/api", "main", sha)
        self.assertEqual(len(status_runner.calls), 3)

    def test_missing_and_pending_required_contexts_do_not_pass(self):
        sha = "a" * 40
        cases = (
            ({"check_runs": []}, {"sha": sha, "statuses": []}),
            (
                {
                    "check_runs": [
                        {
                            "name": "required",
                            "head_sha": sha,
                            "status": "queued",
                            "conclusion": None,
                        }
                    ]
                },
                {"sha": sha, "statuses": []},
            ),
        )
        for check_runs, statuses in cases:
            with self.subTest(check_runs=check_runs):
                runner = FakeRunner(
                    {"strict": True, "contexts": ["required"], "checks": []},
                    check_runs,
                    statuses,
                )
                summary = GitHubClient(
                    runner, frozenset({"codeExploreHub/api"})
                ).required_status_checks("codeExploreHub/api", "main", sha)
                self.assertFalse(summary.passing)

    def test_pull_request_requires_base_ref(self):
        sha = "a" * 40
        response = self.pull(sha)
        del response["base"]
        self.runner.replies = [response]

        with self.assertRaisesRegex(GitHubBoundaryError, "pull request"):
            self.client.get_pull_request("codeExploreHub/api", 4)

    def test_only_explicit_transient_github_reads_are_retried(self):
        transient = FakeRunner(
            TransientCommandError("temporary"),
            {"full_name": "codeExploreHub/api", "visibility": "private", "default_branch": "main"},
        )
        permanent = FakeRunner(
            FileNotFoundError("gh missing"),
            {"full_name": "codeExploreHub/api", "visibility": "private", "default_branch": "main"},
        )

        GitHubClient(transient, frozenset({"codeExploreHub/api"})).get_repository("codeExploreHub/api")
        with self.assertRaises(GitHubBoundaryError):
            GitHubClient(permanent, frozenset({"codeExploreHub/api"})).get_repository("codeExploreHub/api")

        self.assertEqual(len(transient.calls), 2)
        self.assertEqual(len(permanent.calls), 1)

    def test_merge_refuses_malformed_expected_sha_before_any_read(self):
        with self.assertRaisesRegex(GitHubBoundaryError, "expected SHA"):
            self.client.merge_pull_request("codeExploreHub/api", 4, expected_sha="main")

        self.assertEqual(self.runner.calls, [])


if __name__ == "__main__":
    unittest.main()
