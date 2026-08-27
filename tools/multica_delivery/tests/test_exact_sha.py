from dataclasses import replace
from pathlib import Path
import subprocess
import tempfile
import traceback
from types import MappingProxyType
import unittest
from unittest.mock import patch

from tools.multica_delivery.exact_sha import (
    ClosedCommandResult,
    ExactShaBoundaryError,
    LocalExactShaCommandRunner,
    SubprocessCommandBackend,
)
from tools.multica_delivery.manifest import load_manifest


FIXTURE = Path(__file__).parent / "fixtures" / "three-repository-delivery.yaml"


class QueueBackend:
    def __init__(self, results: list[ClosedCommandResult | Exception]) -> None:
        self.results = list(results)
        self.calls: list[tuple[tuple[str, ...], Path]] = []

    def run(self, argv: tuple[str, ...], cwd: Path) -> ClosedCommandResult:
        self.calls.append((argv, cwd))
        if not self.results:
            raise AssertionError("unexpected backend call")
        result = self.results.pop(0)
        if isinstance(result, Exception):
            raise result
        return result


def result(returncode: int, stdout: str = "", stderr: str = "") -> ClosedCommandResult:
    return ClosedCommandResult(returncode, stdout, stderr)


def exact_sha_traceback_locals(error: BaseException) -> tuple[dict[str, object], ...]:
    frames = []
    current = error.__traceback__
    while current is not None:
        if current.tb_frame.f_globals.get("__name__") == "tools.multica_delivery.exact_sha":
            frames.append(dict(current.tb_frame.f_locals))
        current = current.tb_next
    return tuple(frames)


def manifest_with_paths(paths: dict[str, Path]):
    manifest = load_manifest(FIXTURE)
    repositories = {
        key: replace(repository, local_path=paths.get(key, repository.local_path))
        for key, repository in manifest.repositories.items()
    }
    return replace(manifest, repositories=MappingProxyType(repositories))


class LocalExactShaCommandRunnerTests(unittest.TestCase):
    def test_runner_has_no_instance_dict_and_rejects_authority_binding_or_method_replacement(self):
        manifest = load_manifest(FIXTURE)
        for attribute, replacement in (
            ("verify", lambda *args, **kwargs: None),
            ("run", lambda *args, **kwargs: ExactShaCommandResult(True, {"api": "a" * 40})),
            ("manifest", replace(manifest)),
            ("_backend", QueueBackend([])),
        ):
            with self.subTest(attribute=attribute):
                backend = QueueBackend([])
                runner = LocalExactShaCommandRunner(manifest, backend)
                self.assertFalse(hasattr(runner, "__dict__"))

                with self.assertRaises(AttributeError):
                    setattr(runner, attribute, replacement)

                self.assertEqual(backend.calls, [])

    def test_production_backend_uses_closed_noninteractive_subprocess_options(self):
        completed = subprocess.CompletedProcess(["safe", "arg"], 0, "out", "err")
        cwd = Path("/declared/repository")
        with patch("tools.multica_delivery.exact_sha.subprocess.run", return_value=completed) as run:
            observed = SubprocessCommandBackend().run(("safe", "arg"), cwd)

        run.assert_called_once_with(
            ["safe", "arg"],
            cwd=cwd,
            shell=False,
            stdin=subprocess.DEVNULL,
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(observed, ClosedCommandResult(0, "out", "err"))

    def test_production_backend_reads_real_temporary_git_head_and_rejects_stale_sha(self):
        with tempfile.TemporaryDirectory() as directory:
            api_path = Path(directory) / "api"
            api_path.mkdir()
            subprocess.run(["git", "init", "-q"], cwd=api_path, check=True)
            subprocess.run(
                ["git", "-c", "user.name=Test", "-c", "user.email=test@example.test", "commit", "--allow-empty", "-qm", "first"],
                cwd=api_path,
                check=True,
            )
            first_sha = subprocess.run(
                ["git", "rev-parse", "HEAD"], cwd=api_path, check=True,
                capture_output=True, text=True,
            ).stdout.strip()
            subprocess.run(
                ["git", "-c", "user.name=Test", "-c", "user.email=test@example.test", "commit", "--allow-empty", "-qm", "second"],
                cwd=api_path,
                check=True,
            )
            second_sha = subprocess.run(
                ["git", "rev-parse", "HEAD"], cwd=api_path, check=True,
                capture_output=True, text=True,
            ).stdout.strip()
            subprocess.run(["git", "checkout", "-q", first_sha], cwd=api_path, check=True)
            manifest = manifest_with_paths({"api": api_path})

            runner = LocalExactShaCommandRunner(manifest)
            verification = runner.verify(
                "api",
                first_sha,
                api_path,
                argv=("git", "rev-parse", "HEAD"),
            )
            self.assertEqual(verification.observed_sha, first_sha)

            with self.assertRaises(ExactShaBoundaryError) as raised:
                runner.verify("api", second_sha, api_path, argv=("git", "rev-parse", "HEAD"))

            self.assertEqual(raised.exception.repository_key, "api")

    def test_boundary_error_replaces_unsafe_repository_input_with_safe_key(self):
        manifest = load_manifest(FIXTURE)
        backend = QueueBackend([])
        runner = LocalExactShaCommandRunner(manifest, backend)

        with self.assertRaises(ExactShaBoundaryError) as raised:
            runner.verify(
                "api\nDO-NOT-LEAK", "a" * 40,
                manifest.repositories["api"].local_path,
                argv=("git", "rev-parse", "HEAD"),
            )

        self.assertEqual(raised.exception.repository_key, "unknown")
        self.assertRegex(raised.exception.repository_key, r"[A-Za-z0-9][A-Za-z0-9._:-]{0,255}\Z")
        self.assertNotIn("DO-NOT-LEAK", str(raised.exception))
        self.assertEqual(backend.calls, [])

    def test_git_nonzero_exit_is_a_redacted_boundary_failure(self):
        manifest = load_manifest(FIXTURE)
        backend = QueueBackend([result(128, "sensitive stdout", "sensitive stderr")])
        runner = LocalExactShaCommandRunner(manifest, backend)

        with self.assertRaises(ExactShaBoundaryError) as raised:
            runner.verify(
                "api", "a" * 40, manifest.repositories["api"].local_path,
                argv=("git", "rev-parse", "HEAD"),
            )

        message = str(raised.exception)
        self.assertNotIn("sensitive stdout", message)
        self.assertNotIn("sensitive stderr", message)

    def test_nonzero_git_output_is_absent_from_exact_sha_traceback_locals(self):
        manifest = load_manifest(FIXTURE)
        sentinel = "DO-NOT-LEAK-NONZERO-OUTPUT"
        runner = LocalExactShaCommandRunner(
            manifest, QueueBackend([result(128, sentinel, sentinel)])
        )

        captured = None
        try:
            runner.verify(
                "api", "a" * 40, manifest.repositories["api"].local_path,
                argv=("git", "rev-parse", "HEAD"),
            )
        except ExactShaBoundaryError as error:
            captured = error

        self.assertIsNotNone(captured)
        error = captured
        for values in exact_sha_traceback_locals(error):
            self.assertNotIn(sentinel, repr(values))
            self.assertFalse({"completed", "result", "match", "error"} & values.keys())
        self.assertNotIn(sentinel, "".join(traceback.format_exception(error)))
        self.assertIsNone(error.__cause__)
        self.assertIsNone(error.__context__)

    def test_malformed_git_output_is_absent_from_exact_sha_traceback_locals(self):
        manifest = load_manifest(FIXTURE)
        sentinel = "DO-NOT-LEAK-MALFORMED-OUTPUT"
        runner = LocalExactShaCommandRunner(
            manifest, QueueBackend([result(0, sentinel + "\n", sentinel)])
        )

        captured = None
        try:
            runner.verify(
                "api", "a" * 40, manifest.repositories["api"].local_path,
                argv=("git", "rev-parse", "HEAD"),
            )
        except ExactShaBoundaryError as error:
            captured = error

        self.assertIsNotNone(captured)
        error = captured
        for values in exact_sha_traceback_locals(error):
            self.assertNotIn(sentinel, repr(values))
            self.assertFalse({"completed", "result", "match", "error"} & values.keys())
        self.assertNotIn(sentinel, "".join(traceback.format_exception(error)))
        self.assertIsNone(error.__cause__)
        self.assertIsNone(error.__context__)

    def test_backend_runtime_error_is_not_retained_in_verification_exception_chain(self):
        manifest = load_manifest(FIXTURE)
        sentinel = "DO-NOT-LEAK-RUNTIME-SENTINEL"
        runner = LocalExactShaCommandRunner(
            manifest, QueueBackend([RuntimeError(sentinel)])
        )

        with self.assertRaises(ExactShaBoundaryError) as raised:
            runner.verify(
                "api", "a" * 40, manifest.repositories["api"].local_path,
                argv=("git", "rev-parse", "HEAD"),
            )

        error = raised.exception
        self.assertEqual(str(error), "checkout verification command failed")
        self.assertIsNone(error.__cause__)
        self.assertIsNone(error.__context__)
        self.assertNotIn(sentinel, "".join(traceback.format_exception(error)))

    def test_unicode_decode_error_is_not_retained_in_smoke_exception_chain(self):
        manifest = load_manifest(FIXTURE)
        sha = "a" * 40
        decode_error = UnicodeDecodeError(
            "utf-8", b"\xffprivate-output", 0, 1, "DO-NOT-LEAK-DECODE-SENTINEL"
        )
        runner = LocalExactShaCommandRunner(
            manifest,
            QueueBackend([result(0, sha + "\n"), decode_error]),
        )

        with self.assertRaises(ExactShaBoundaryError) as raised:
            runner.run(
                "api", {"api": sha}, manifest.repositories["api"].commands["smoke"],
                manifest.repositories["api"].local_path,
            )

        error = raised.exception
        rendered = "".join(traceback.format_exception(error))
        self.assertEqual(str(error), "smoke command failed to execute")
        self.assertIsNone(error.__cause__)
        self.assertIsNone(error.__context__)
        self.assertNotIn("private-output", rendered)
        self.assertNotIn("DO-NOT-LEAK-DECODE-SENTINEL", rendered)

    def test_git_stdout_must_be_exactly_one_lowercase_sha_line(self):
        invalid_outputs = (
            "",
            "a" * 40 + "\n" + "b" * 40 + "\n",
            "A" * 40 + "\n",
            "not-a-sha\n",
        )
        for stdout in invalid_outputs:
            with self.subTest(stdout=stdout):
                manifest = load_manifest(FIXTURE)
                runner = LocalExactShaCommandRunner(
                    manifest, QueueBackend([result(0, stdout)])
                )
                with self.assertRaises(ExactShaBoundaryError):
                    runner.verify(
                        "api", "a" * 40, manifest.repositories["api"].local_path,
                        argv=("git", "rev-parse", "HEAD"),
                    )

    def test_verify_rejects_cwd_other_than_declared_repository_path_without_backend_call(self):
        manifest = load_manifest(FIXTURE)
        backend = QueueBackend([])
        runner = LocalExactShaCommandRunner(manifest, backend)

        with self.assertRaises(ExactShaBoundaryError):
            runner.verify(
                "api", "a" * 40, Path("/wrong/repository"),
                argv=("git", "rev-parse", "HEAD"),
            )

        self.assertEqual(backend.calls, [])

    def test_run_rejects_argv_not_declared_for_repository_or_integration_smoke(self):
        manifest = load_manifest(FIXTURE)
        backend = QueueBackend([])
        runner = LocalExactShaCommandRunner(manifest, backend)

        with self.assertRaises(ExactShaBoundaryError):
            runner.run(
                "api", {"api": "a" * 40}, ("python", "unreviewed.py"),
                manifest.repositories["api"].local_path,
            )

        self.assertEqual(backend.calls, [])

    def test_nonzero_smoke_is_authoritative_failure_when_both_sha_maps_match(self):
        manifest = load_manifest(FIXTURE)
        api_path = manifest.repositories["api"].local_path
        sha = "a" * 40
        backend = QueueBackend(
            [result(0, sha + "\n"), result(7, "secret", "secret"), result(0, sha + "\n")]
        )
        runner = LocalExactShaCommandRunner(manifest, backend)

        command = runner.run(
            "api", {"api": sha}, manifest.repositories["api"].commands["smoke"], api_path
        )

        self.assertFalse(command.passed)
        self.assertEqual(dict(command.verified_shas), {"api": sha})

    def test_checkout_change_during_smoke_raises_boundary_failure(self):
        manifest = load_manifest(FIXTURE)
        api_path = manifest.repositories["api"].local_path
        first_sha = "a" * 40
        second_sha = "b" * 40
        backend = QueueBackend(
            [result(0, first_sha + "\n"), result(0), result(0, second_sha + "\n")]
        )
        runner = LocalExactShaCommandRunner(manifest, backend)

        with self.assertRaises(ExactShaBoundaryError):
            runner.run(
                "api", {"api": first_sha},
                manifest.repositories["api"].commands["smoke"], api_path,
            )


if __name__ == "__main__":
    unittest.main()
