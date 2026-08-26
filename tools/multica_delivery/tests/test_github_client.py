"""Behavioral tests for the manifest-scoped GitHub boundary."""

import unittest

from tools.multica_delivery.github_client import GitHubBoundaryError, GitHubClient
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
        self.runner.replies = [{"number": 4, "state": "open", "head": {"sha": actual}, "mergeable": True}]

        with self.assertRaisesRegex(GitHubBoundaryError, "head SHA changed"):
            self.client.merge_pull_request("codeExploreHub/api", 4, expected_sha=expected)

        self.assertEqual(len(self.runner.calls), 1)
        self.assertEqual(self.runner.calls[0][0][:2], ("gh", "api"))

    def test_pull_request_read_rejects_noncanonical_head_sha(self):
        self.runner.replies = [
            {"number": 4, "state": "open", "head": {"sha": "main"}, "mergeable": True}
        ]

        with self.assertRaisesRegex(GitHubBoundaryError, "malformed pull request"):
            self.client.get_pull_request("codeExploreHub/api", 4)

    def test_merge_rereads_open_mergeable_pr_and_required_checks_immediately(self):
        sha = "a" * 40
        self.runner.replies = [
            {"number": 4, "state": "open", "head": {"sha": sha}, "mergeable": True},
            {"sha": sha, "check_runs": [{"name": "test", "head_sha": sha, "status": "completed", "conclusion": "success"}]},
            {"merged": True, "sha": "c" * 40},
        ]

        merged = self.client.merge_pull_request("codeExploreHub/api", 4, expected_sha=sha)

        self.assertTrue(merged.merged)
        self.assertEqual(merged.merged_sha, "c" * 40)
        self.assertEqual(len(self.runner.calls), 3)
        self.assertEqual(self.runner.calls[1][0][:2], ("gh", "api"))
        self.assertIn(f"repos/codeExploreHub/api/commits/{sha}/check-runs", self.runner.calls[1][0])
        self.assertEqual(self.runner.calls[-1][0][:3], ("gh", "api", "-X"))
        self.assertIn(f"sha={sha}", self.runner.calls[-1][0])

    def test_merge_refuses_missing_or_failed_required_checks(self):
        sha = "a" * 40
        self.runner.replies = [
            {"number": 4, "state": "open", "head": {"sha": sha}, "mergeable": True},
            {"sha": sha, "check_runs": [{"name": "test", "head_sha": sha, "status": "completed", "conclusion": "failure"}]},
        ]

        with self.assertRaisesRegex(GitHubBoundaryError, "required checks"):
            self.client.merge_pull_request("codeExploreHub/api", 4, expected_sha=sha)

        self.assertEqual(len(self.runner.calls), 2)

    def test_exact_sha_check_response_rejects_mismatched_sha(self):
        sha = "a" * 40
        self.runner.replies = [
            {"sha": "b" * 40, "check_runs": [{"name": "test", "head_sha": "b" * 40, "status": "completed", "conclusion": "success"}]}
        ]

        with self.assertRaisesRegex(GitHubBoundaryError, "required checks"):
            self.client.get_required_checks("codeExploreHub/api", sha)

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
