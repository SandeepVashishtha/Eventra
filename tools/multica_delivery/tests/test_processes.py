from pathlib import Path
import subprocess
from tempfile import TemporaryDirectory
import threading
import unittest
from unittest.mock import patch
from urllib.parse import urlsplit

from tools.multica_delivery.manifest import load_manifest
from tools.multica_delivery.model import ServiceSpec
from tools.multica_delivery.processes import (
    OwnedProcess,
    LocalProcessBackend,
    ProcessManager,
    ProcessOwnershipError,
    ProcessRegistry,
    ProcessRun,
)


SHA = "a" * 40
FIXTURE = Path(__file__).parent / "fixtures" / "three-repository-delivery.yaml"


class FakeProcessBackend:
    def __init__(self) -> None:
        self.port_owners: dict[int, int] = {}
        self.alive: set[int] = set()
        self.healthy_urls: set[str] = set()
        self.next_pid = 4100
        self.spawned: list[tuple[tuple[str, ...], Path]] = []
        self.stopped: list[int] = []
        self.start_identities: dict[int, str] = {}
        self.identity_lookup_failures: set[int] = set()

    def port_owner(self, port: int) -> int | None:
        return self.port_owners.get(port)

    def spawn(self, argv: tuple[str, ...], cwd: Path) -> int:
        pid = self.next_pid
        self.next_pid += 1
        self.spawned.append((argv, cwd))
        self.alive.add(pid)
        self.start_identities[pid] = f"start-{pid}-generation-1"
        return pid

    def start_identity(self, pid: int) -> str:
        if pid in self.identity_lookup_failures or pid not in self.start_identities:
            raise ProcessOwnershipError("process start identity could not be determined")
        return self.start_identities[pid]

    def wait_healthy(self, health_url: str, pid: int) -> bool:
        healthy = pid in self.alive and health_url in self.healthy_urls
        if healthy:
            port = urlsplit(health_url).port
            if port is not None:
                self.port_owners[port] = pid
        return healthy

    def is_alive(self, pid: int) -> bool:
        return pid in self.alive

    def stop(self, pid: int) -> None:
        self.stopped.append(pid)
        self.alive.discard(pid)
        self.start_identities.pop(pid, None)
        for port, owner in tuple(self.port_owners.items()):
            if owner == pid:
                del self.port_owners[port]


class ProcessManagerTests(unittest.TestCase):
    def setUp(self) -> None:
        self.manifest = load_manifest(FIXTURE)
        self.temporary = TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.registry = ProcessRegistry(Path(self.temporary.name) / "owned-processes.json")
        self.backend = FakeProcessBackend()
        self.manager = ProcessManager(
            self.registry,
            self.backend,
            owner_token="owner-1",
            manifest=self.manifest,
        )
        self.service = ServiceSpec("api", 8080, "http://localhost:8080/health")
        self.run = ProcessRun(
            repository_key="api",
            run_id="run-1",
            argv=("./scripts/start.sh",),
            cwd=Path("/workspace/api"),
        )

    def test_unknown_port_owner_blocks_service_start(self):
        self.backend.port_owners[8080] = 9999
        self.backend.alive.add(9999)

        with self.assertRaisesRegex(
            ProcessOwnershipError,
            "port 8080 is not framework-owned",
        ):
            self.manager.start(self.service, self.run, candidate_sha=SHA)

        self.assertEqual(self.backend.spawned, [])
        self.assertEqual(self.registry.read(), ())

    def test_successful_start_is_recorded_only_after_health_passes(self):
        self.backend.healthy_urls.add(self.service.health_url)

        record = self.manager.start(self.service, self.run, candidate_sha=SHA)

        self.assertIsInstance(record, OwnedProcess)
        self.assertEqual(self.registry.read(), (record,))
        self.assertEqual(record.repository_key, "api")
        self.assertEqual(record.candidate_sha, SHA)
        self.assertEqual(record.run_id, "run-1")
        self.assertEqual(record.owner_token, "owner-1")
        self.assertEqual(record.start_identity, "start-4100-generation-1")

    def test_manifest_service_records_must_be_complete_and_registry_owned(self):
        specification = self.manifest.repositories["api"]
        run = ProcessRun(
            "api",
            "smoke-run",
            specification.commands["start"],
            specification.local_path,
        )
        self.backend.healthy_urls.update(
            service.health_url for service in specification.services
        )
        records = self.manager.start_services(
            specification.services,
            run,
            candidate_sha=SHA,
        )

        self.assertEqual(
            self.manager.verify_services(
                specification.services,
                run,
                records,
                candidate_sha=SHA,
            ),
            records,
        )
        with self.assertRaisesRegex(ProcessOwnershipError, "outside the manifest"):
            self.manager.verify_services(
                specification.services,
                run,
                (),
                candidate_sha=SHA,
            )

    def test_failed_health_never_leaves_a_registry_record(self):
        with self.assertRaisesRegex(ProcessOwnershipError, "failed health check"):
            self.manager.start(self.service, self.run, candidate_sha=SHA)

        self.assertEqual(self.registry.read(), ())
        self.assertEqual(self.backend.stopped, [4100])

    def test_registry_write_failure_stops_the_newly_spawned_process(self):
        class FailingWriteRegistry(ProcessRegistry):
            def _write_unlocked(self, records) -> None:
                raise ProcessOwnershipError("owned process registry write failed")

        manager = ProcessManager(
            FailingWriteRegistry(Path(self.temporary.name) / "unwritable.json"),
            self.backend,
            owner_token="owner-1",
            manifest=self.manifest,
        )
        self.backend.healthy_urls.add(self.service.health_url)

        with self.assertRaisesRegex(ProcessOwnershipError, "registry write failed"):
            manager.start(self.service, self.run, candidate_sha=SHA)

        self.assertEqual(self.backend.stopped, [4100])

    def test_reuse_requires_same_run_repository_sha_and_owner(self):
        record = OwnedProcess(
            repository_key="api",
            candidate_sha=SHA,
            pid=777,
            port=8080,
            health_url=self.service.health_url,
            run_id="run-1",
            owner_token="owner-1",
            start_identity="start-777-generation-1",
        )
        self.registry.write((record,))
        self.backend.port_owners[8080] = 777
        self.backend.alive.add(777)
        self.backend.start_identities[777] = "start-777-generation-1"
        self.backend.healthy_urls.add(self.service.health_url)

        reused = self.manager.start(self.service, self.run, candidate_sha=SHA)
        self.assertEqual(reused, record)
        self.assertEqual(self.backend.spawned, [])

        other_run = ProcessRun("api", "run-2", self.run.argv, self.run.cwd)
        with self.assertRaisesRegex(ProcessOwnershipError, "owner mismatch"):
            self.manager.start(self.service, other_run, candidate_sha=SHA)

    def test_only_same_run_repository_sha_owner_can_stop(self):
        record = OwnedProcess(
            repository_key="api",
            candidate_sha=SHA,
            pid=777,
            port=8080,
            health_url=self.service.health_url,
            run_id="run-1",
            owner_token="owner-1",
            start_identity="start-777-generation-1",
        )
        self.registry.write((record,))
        self.backend.port_owners[8080] = 777
        self.backend.alive.add(777)
        self.backend.start_identities[777] = "start-777-generation-1"

        with self.assertRaisesRegex(ProcessOwnershipError, "owner mismatch"):
            self.manager.stop(
                record,
                run_id="run-2",
                repository_key="api",
                candidate_sha=SHA,
            )

        self.assertEqual(self.backend.stopped, [])
        self.assertEqual(self.registry.read(), (record,))

    def test_stop_blocks_when_recorded_pid_no_longer_owns_the_port(self):
        record = OwnedProcess(
            repository_key="api",
            candidate_sha=SHA,
            pid=777,
            port=8080,
            health_url=self.service.health_url,
            run_id="run-1",
            owner_token="owner-1",
            start_identity="start-777-generation-1",
        )
        self.registry.write((record,))
        self.backend.port_owners[8080] = 9999
        self.backend.alive.update({777, 9999})
        self.backend.start_identities.update(
            {777: "start-777-generation-1", 9999: "start-9999-generation-1"}
        )

        with self.assertRaisesRegex(ProcessOwnershipError, "PID ownership is unknown"):
            self.manager.stop(
                record,
                run_id="run-1",
                repository_key="api",
                candidate_sha=SHA,
            )

        self.assertEqual(self.backend.stopped, [])

    def test_exact_owned_process_can_be_stopped_and_removed(self):
        record = OwnedProcess(
            repository_key="api",
            candidate_sha=SHA,
            pid=777,
            port=8080,
            health_url=self.service.health_url,
            run_id="run-1",
            owner_token="owner-1",
            start_identity="start-777-generation-1",
        )
        self.registry.write((record,))
        self.backend.port_owners[8080] = 777
        self.backend.alive.add(777)
        self.backend.start_identities[777] = "start-777-generation-1"

        self.manager.stop(
            record,
            run_id="run-1",
            repository_key="api",
            candidate_sha=SHA,
        )

        self.assertEqual(self.backend.stopped, [777])
        self.assertEqual(self.registry.read(), ())

    def test_registry_rejects_malformed_or_duplicate_runtime_state(self):
        first = OwnedProcess(
            repository_key="api",
            candidate_sha=SHA,
            pid=777,
            port=8080,
            health_url=self.service.health_url,
            run_id="run-1",
            owner_token="owner-1",
            start_identity="start-777-generation-1",
        )
        second = OwnedProcess(
            repository_key="web",
            candidate_sha="b" * 40,
            pid=778,
            port=8080,
            health_url="http://localhost:8080/other",
            run_id="run-2",
            owner_token="owner-1",
            start_identity="start-778-generation-1",
        )

        with self.assertRaisesRegex(ProcessOwnershipError, "duplicate owned process port"):
            self.registry.write((first, second))

    def test_one_spawn_owns_all_repository_services_and_stop_removes_the_pid_group(self):
        second = ServiceSpec("admin", 8081, "http://localhost:8081/health")
        self.backend.healthy_urls.update(
            {self.service.health_url, second.health_url}
        )

        records = self.manager.start_services(
            (self.service, second),
            self.run,
            candidate_sha=SHA,
        )

        self.assertEqual(len(self.backend.spawned), 1)
        self.assertEqual({record.pid for record in records}, {4100})
        self.assertEqual({record.port for record in records}, {8080, 8081})
        self.assertEqual(
            {record.start_identity for record in records},
            {"start-4100-generation-1"},
        )
        self.assertEqual(self.registry.read(), records)

        self.manager.stop(
            records[0],
            run_id="run-1",
            repository_key="api",
            candidate_sha=SHA,
        )

        self.assertEqual(self.backend.stopped, [4100])
        self.assertEqual(self.registry.read(), ())

    def test_reused_pid_with_a_different_start_identity_is_never_reused(self):
        record = OwnedProcess(
            repository_key="api",
            candidate_sha=SHA,
            pid=777,
            port=8080,
            health_url=self.service.health_url,
            run_id="run-1",
            owner_token="owner-1",
            start_identity="start-777-generation-1",
        )
        self.registry.write((record,))
        self.backend.port_owners[8080] = 777
        self.backend.alive.add(777)
        self.backend.healthy_urls.add(self.service.health_url)
        self.backend.start_identities[777] = "start-777-generation-2"

        with self.assertRaisesRegex(ProcessOwnershipError, "start identity"):
            self.manager.start(self.service, self.run, candidate_sha=SHA)

        self.assertEqual(self.backend.spawned, [])
        self.assertEqual(self.backend.stopped, [])
        self.assertEqual(self.registry.read(), (record,))

    def test_failed_start_cleanup_never_stops_a_reused_pid(self):
        class ReusingPidBackend(FakeProcessBackend):
            def wait_healthy(self, health_url: str, pid: int) -> bool:
                self.start_identities[pid] = f"start-{pid}-generation-2"
                return False

        backend = ReusingPidBackend()
        manager = ProcessManager(
            self.registry,
            backend,
            owner_token="owner-1",
            manifest=self.manifest,
        )

        with self.assertRaisesRegex(ProcessOwnershipError, "cleanup failed"):
            manager.start(self.service, self.run, candidate_sha=SHA)

        self.assertEqual(backend.stopped, [])
        self.assertEqual(self.registry.read(), ())

    def test_spawn_identity_lookup_failure_never_sends_an_unverified_stop(self):
        class UnknownSpawnIdentityBackend(FakeProcessBackend):
            def start_identity(self, pid: int) -> str:
                raise ProcessOwnershipError(
                    "process start identity could not be determined"
                )

        backend = UnknownSpawnIdentityBackend()
        manager = ProcessManager(
            self.registry,
            backend,
            owner_token="owner-1",
            manifest=self.manifest,
        )

        with self.assertRaisesRegex(ProcessOwnershipError, "identity could not"):
            manager.start(self.service, self.run, candidate_sha=SHA)

        self.assertEqual(backend.stopped, [])
        self.assertEqual(self.registry.read(), ())

    def test_reused_pid_with_a_different_start_identity_is_never_stopped(self):
        record = OwnedProcess(
            repository_key="api",
            candidate_sha=SHA,
            pid=777,
            port=8080,
            health_url=self.service.health_url,
            run_id="run-1",
            owner_token="owner-1",
            start_identity="start-777-generation-1",
        )
        self.registry.write((record,))
        self.backend.port_owners[8080] = 777
        self.backend.alive.add(777)
        self.backend.start_identities[777] = "start-777-generation-2"

        with self.assertRaisesRegex(ProcessOwnershipError, "start identity"):
            self.manager.stop(
                record,
                run_id="run-1",
                repository_key="api",
                candidate_sha=SHA,
            )

        self.assertEqual(self.backend.stopped, [])
        self.assertEqual(self.registry.read(), (record,))

    def test_start_identity_lookup_failure_fails_closed_for_reuse_and_stop(self):
        record = OwnedProcess(
            repository_key="api",
            candidate_sha=SHA,
            pid=777,
            port=8080,
            health_url=self.service.health_url,
            run_id="run-1",
            owner_token="owner-1",
            start_identity="start-777-generation-1",
        )
        self.registry.write((record,))
        self.backend.port_owners[8080] = 777
        self.backend.alive.add(777)
        self.backend.healthy_urls.add(self.service.health_url)
        self.backend.identity_lookup_failures.add(777)

        with self.assertRaisesRegex(ProcessOwnershipError, "identity could not"):
            self.manager.start(self.service, self.run, candidate_sha=SHA)
        with self.assertRaisesRegex(ProcessOwnershipError, "identity could not"):
            self.manager.stop(
                record,
                run_id="run-1",
                repository_key="api",
                candidate_sha=SHA,
            )

        self.assertEqual(self.backend.spawned, [])
        self.assertEqual(self.backend.stopped, [])
        self.assertEqual(self.registry.read(), (record,))

    def test_registry_rejects_legacy_record_without_start_identity(self):
        self.registry.path.write_text(
            '[{"candidate_sha":"' + SHA
            + '","health_url":"http://localhost:8080/health",'
            '"owner_token":"owner-1","pid":777,"port":8080,'
            '"repository_key":"api","run_id":"run-1"}]',
            encoding="utf-8",
        )

        with self.assertRaisesRegex(ProcessOwnershipError, "registry is malformed"):
            self.registry.read()

    def test_registry_transaction_serializes_competing_writers(self):
        competing = ProcessRegistry(self.registry.path)
        first_entered = threading.Event()
        release_first = threading.Event()
        second_entered = threading.Event()

        def hold_first_lock() -> None:
            with self.registry.transaction():
                first_entered.set()
                release_first.wait(timeout=2)

        def acquire_second_lock() -> None:
            first_entered.wait(timeout=2)
            with competing.transaction():
                second_entered.set()

        first = threading.Thread(target=hold_first_lock)
        second = threading.Thread(target=acquire_second_lock)
        first.start()
        self.assertTrue(first_entered.wait(timeout=1))
        second.start()
        self.assertFalse(second_entered.wait(timeout=0.05))
        release_first.set()
        self.assertTrue(second_entered.wait(timeout=1))
        first.join(timeout=1)
        second.join(timeout=1)
        self.assertFalse(first.is_alive())
        self.assertFalse(second.is_alive())


class LocalProcessBackendTests(unittest.TestCase):
    @patch("tools.multica_delivery.processes.subprocess.run")
    def test_start_identity_is_stable_for_one_process_generation(self, run):
        run.side_effect = (
            subprocess.CompletedProcess(
                args=("ps",),
                returncode=0,
                stdout="Mon Aug 24 10:20:30 2026\n",
            ),
            subprocess.CompletedProcess(
                args=("ps",),
                returncode=0,
                stdout="Mon Aug 24 10:20:30 2026\n",
            ),
            subprocess.CompletedProcess(
                args=("ps",),
                returncode=0,
                stdout="Mon Aug 24 10:20:31 2026\n",
            ),
        )
        backend = LocalProcessBackend()

        first = backend.start_identity(123)
        same = backend.start_identity(123)
        replaced = backend.start_identity(123)

        self.assertEqual(first, same)
        self.assertNotEqual(first, replaced)

    @patch("tools.multica_delivery.processes.subprocess.run")
    def test_start_identity_rejects_malformed_host_output(self, run):
        run.return_value = subprocess.CompletedProcess(
            args=("ps",),
            returncode=0,
            stdout=None,
        )

        with self.assertRaisesRegex(ProcessOwnershipError, "could not be determined"):
            LocalProcessBackend().start_identity(123)


if __name__ == "__main__":
    unittest.main()
