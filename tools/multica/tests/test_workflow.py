"""Behavior tests for deterministic Eventra Multica workflow transitions."""

import copy
import io
import unittest
from contextlib import redirect_stdout

from tools.multica.workflow import (
    PhaseCompletion,
    build_phase_metadata,
    build_workflow_parser,
    finish_phase,
    print_phase_result,
)


ISSUE_ID = "01a00000-0000-7000-8000-000000000002"
PARENT_ID = "01a00000-0000-7000-8000-000000000001"
AGENT_ID = "00000000-0000-4000-8000-000000000004"
PROJECT_ID = "00000000-0000-4000-8000-000000000003"
COMMENT_ID = "01a00000-0000-7000-8000-000000000010"
FRONTEND_SHA = "a" * 40
FRONTEND_PR = "https://github.com/codeExploreHub/Eventra/pull/6"


def raw_issue(**overrides):
    value = {
        "id": ISSUE_ID,
        "identifier": "PRO-36",
        "parent_issue_id": PARENT_ID,
        "stage": 1,
        "status": "in_review",
        "assignee_id": AGENT_ID,
        "assignee_type": "agent",
        "project_id": PROJECT_ID,
        "updated_at": "2026-08-25T08:50:06Z",
    }
    value.update(overrides)
    return value


class FakeWorkflowRunner:
    """Stateful argv fake at the Multica process boundary."""

    def __init__(self):
        self.issue = raw_issue()
        self.metadata = {}
        self.calls = []
        self.fail_metadata_key = None
        self.corrupt_metadata_key = None
        self.inject_metadata_after_sets = None
        self.freeze_status = False

    @property
    def mutation_count(self):
        return sum(call[0:3] in {
            ("issue", "metadata", "set"),
            ("issue", "status", "PRO-36"),
        } for call in self.calls)

    def run(self, args, *, stdin_json=None):
        if stdin_json is not None:
            raise AssertionError("workflow commands never accept stdin JSON")
        call = tuple(args)
        self.calls.append(call)
        if call == ("issue", "get", "PRO-36", "--output", "json"):
            return copy.deepcopy(self.issue)
        if call == (
            "issue", "metadata", "list", "PRO-36", "--output", "json"
        ):
            value = copy.deepcopy(self.metadata)
            if self.corrupt_metadata_key is not None and any(
                previous[:3] == ("issue", "metadata", "set")
                for previous in self.calls[:-1]
            ):
                value[self.corrupt_metadata_key] = "corrupt"
            if self.inject_metadata_after_sets is not None and any(
                previous[:3] == ("issue", "metadata", "set")
                for previous in self.calls[:-1]
            ):
                key, item = self.inject_metadata_after_sets
                value[key] = item
            return value
        if call[:3] == ("issue", "metadata", "set"):
            self.assert_metadata_set_grammar(call)
            key = call[5]
            if key == self.fail_metadata_key:
                raise RuntimeError("Multica command failed with exit 1")
            self.metadata[key] = call[7]
            return {"ignored": "mutation acknowledgement"}
        if call == (
            "issue", "status", "PRO-36", "done", "--no-start", "--output", "json"
        ):
            if not self.freeze_status:
                self.issue["status"] = "done"
                self.issue["updated_at"] = "2026-08-25T09:00:00Z"
            return {"ignored": "mutation acknowledgement"}
        raise AssertionError(f"unsupported argv: {call!r}")

    def assert_metadata_set_grammar(self, call):
        self.assertEqual(call[0:4], ("issue", "metadata", "set", "PRO-36"))
        self.assertEqual(call[4], "--key")
        self.assertEqual(call[6], "--value")
        self.assertEqual(call[8:12], ("--type", "string", "--output", "json"))

    def assertEqual(self, left, right):
        if left != right:
            raise AssertionError(f"{left!r} != {right!r}")


def implementation_completion(**overrides):
    values = {
        "kind": "implementation",
        "result": "pass",
        "attempt": 0,
        "evidence_comment": COMMENT_ID,
        "frontend_sha": FRONTEND_SHA,
        "backend_sha": None,
        "pr_url": FRONTEND_PR,
    }
    values.update(overrides)
    return PhaseCompletion(**values)


class PhaseCompletionTests(unittest.TestCase):
    def test_build_metadata_uses_exact_string_contract(self):
        self.assertEqual(
            build_phase_metadata(implementation_completion()),
            {
                "eventra.workflow.version": "1",
                "eventra.phase.kind": "implementation",
                "eventra.phase.result": "pass",
                "eventra.phase.attempt": "0",
                "eventra.phase.evidence_comment": COMMENT_ID,
                "eventra.phase.sha.frontend": FRONTEND_SHA,
                "eventra.phase.pr": FRONTEND_PR,
            },
        )

    def test_build_metadata_rejects_invalid_values_before_any_mutation(self):
        cases = (
            {"kind": "unknown"},
            {"result": "unknown"},
            {"attempt": -1},
            {"attempt": True},
            {"evidence_comment": "not-a-uuid"},
            {"frontend_sha": "abc"},
            {"frontend_sha": "A" * 40},
            {"frontend_sha": None},
            {"pr_url": "http://github.com/codeExploreHub/Eventra/pull/6"},
            {"pr_url": "https://github.com/Aprim-OPC/Eventra/pull/6"},
            {"pr_url": None},
        )
        for overrides in cases:
            with self.subTest(overrides=overrides):
                with self.assertRaisesRegex(ValueError, "invalid phase completion"):
                    build_phase_metadata(implementation_completion(**overrides))

    def test_implementation_pr_must_match_its_single_repository_sha(self):
        backend_pr = "https://github.com/codeExploreHub/Eventra-Backend/pull/7"
        cases = (
            {"backend_sha": "b" * 40},
            {
                "frontend_sha": None,
                "backend_sha": "b" * 40,
                "pr_url": FRONTEND_PR,
            },
            {"frontend_sha": FRONTEND_SHA, "pr_url": backend_pr},
        )
        for overrides in cases:
            with self.subTest(overrides=overrides):
                with self.assertRaisesRegex(ValueError, "invalid phase completion"):
                    build_phase_metadata(implementation_completion(**overrides))

        metadata = build_phase_metadata(
            implementation_completion(
                frontend_sha=None,
                backend_sha="b" * 40,
                pr_url=backend_pr,
            )
        )
        self.assertEqual(metadata["eventra.phase.sha.backend"], "b" * 40)
        self.assertNotIn("eventra.phase.sha.frontend", metadata)

    def test_finish_phase_writes_verified_metadata_before_done(self):
        runner = FakeWorkflowRunner()
        result = finish_phase(runner, "PRO-36", implementation_completion())

        self.assertEqual(result.issue_id, ISSUE_ID)
        self.assertEqual(result.issue_key, "PRO-36")
        self.assertEqual(result.status, "done")
        self.assertEqual(result.kind, "implementation")
        self.assertEqual(result.result, "pass")
        self.assertEqual(result.mutation_count, 8)
        self.assertEqual(runner.calls[-2][0:3], ("issue", "status", "PRO-36"))
        self.assertEqual(
            runner.metadata["eventra.phase.result"],
            "pass",
        )

    def test_finish_phase_is_idempotent_when_done_metadata_matches(self):
        runner = FakeWorkflowRunner()
        wanted = build_phase_metadata(implementation_completion())
        runner.issue["status"] = "done"
        runner.metadata.update(wanted)

        result = finish_phase(runner, "PRO-36", implementation_completion())

        self.assertEqual(result.mutation_count, 0)
        self.assertFalse(any(call[:3] == ("issue", "metadata", "set") for call in runner.calls))
        self.assertFalse(any(call[:2] == ("issue", "status") for call in runner.calls))

    def test_terminal_conflicting_metadata_fails_closed(self):
        runner = FakeWorkflowRunner()
        runner.issue["status"] = "done"
        runner.metadata.update(build_phase_metadata(implementation_completion()))
        runner.metadata["eventra.phase.result"] = "blocked"

        with self.assertRaisesRegex(RuntimeError, "terminal phase metadata conflicts"):
            finish_phase(runner, "PRO-36", implementation_completion())
        self.assertEqual(runner.mutation_count, 0)

    def test_partial_metadata_failure_leaves_issue_nonterminal(self):
        runner = FakeWorkflowRunner()
        runner.fail_metadata_key = "eventra.phase.result"

        with self.assertRaisesRegex(RuntimeError, "Multica command failed"):
            finish_phase(runner, "PRO-36", implementation_completion())
        self.assertEqual(runner.issue["status"], "in_review")
        self.assertFalse(any(call[:2] == ("issue", "status") for call in runner.calls))

    def test_read_after_write_mismatch_leaves_issue_nonterminal(self):
        runner = FakeWorkflowRunner()
        runner.corrupt_metadata_key = "eventra.phase.result"

        with self.assertRaisesRegex(RuntimeError, "phase metadata reconciliation failed"):
            finish_phase(runner, "PRO-36", implementation_completion())
        self.assertEqual(runner.issue["status"], "in_review")

    def test_read_after_write_rejects_unexpected_controlled_metadata(self):
        runner = FakeWorkflowRunner()
        runner.inject_metadata_after_sets = (
            "eventra.phase.sha.backend",
            "b" * 40,
        )

        with self.assertRaisesRegex(RuntimeError, "phase metadata reconciliation failed"):
            finish_phase(runner, "PRO-36", implementation_completion())
        self.assertEqual(runner.issue["status"], "in_review")

    def test_status_read_after_write_is_authoritative(self):
        runner = FakeWorkflowRunner()
        runner.freeze_status = True

        with self.assertRaisesRegex(RuntimeError, "phase completion failed"):
            finish_phase(runner, "PRO-36", implementation_completion())

    def test_nonchild_unstaged_and_terminal_blocked_issue_are_rejected(self):
        cases = (
            {"parent_issue_id": None},
            {"stage": None},
            {"status": "blocked"},
            {"status": "cancelled"},
        )
        for overrides in cases:
            runner = FakeWorkflowRunner()
            runner.issue.update(overrides)
            with self.subTest(overrides=overrides):
                with self.assertRaises(RuntimeError):
                    finish_phase(runner, "PRO-36", implementation_completion())
                self.assertEqual(runner.mutation_count, 0)

    def test_parser_accepts_only_phase_arguments_and_prints_scalar_summary(self):
        parser = build_workflow_parser()
        args = parser.parse_args(
            [
                "finish-phase", "PRO-36",
                "--kind", "implementation",
                "--result", "pass",
                "--attempt", "0",
                "--frontend-sha", FRONTEND_SHA,
                "--evidence-comment", COMMENT_ID,
                "--pr", FRONTEND_PR,
            ]
        )
        self.assertEqual(args.command, "finish-phase")
        self.assertFalse(hasattr(args, "jwt_secret"))

        runner = FakeWorkflowRunner()
        result = finish_phase(runner, "PRO-36", implementation_completion())
        output = io.StringIO()
        with redirect_stdout(output):
            print_phase_result(result)
        self.assertEqual(
            output.getvalue(),
            "issue=PRO-36 status=done kind=implementation result=pass mutations=8\n",
        )
        self.assertNotIn(FRONTEND_SHA, output.getvalue())
        self.assertNotIn(FRONTEND_PR, output.getvalue())


if __name__ == "__main__":
    unittest.main()
