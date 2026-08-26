from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from urllib.parse import urlsplit

from tools.multica_delivery.model import ServiceSpec
from tools.multica_delivery.processes import (
    OwnedProcess,
    ProcessManager,
    ProcessOwnershipError,
    ProcessRegistry,
    ProcessRun,
)


SHA = "a" * 40


class FakeProcessBackend:
    def __init__(self) -> None:
        self.port_owners: dict[int, int] = {}
        self.alive: set[int] = set()
        self.healthy_urls: set[str] = set()
        self.next_pid = 4100
        self.spawned: list[tuple[tuple[str, ...], Path]] = []
        self.stopped: list[int] = []

    def port_owner(self, port: int) -> int | None:
        return self.port_owners.get(port)

    def spawn(self, argv: tuple[str, ...], cwd: Path) -> int:
        pid = self.next_pid
        self.next_pid += 1
        self.spawned.append((argv, cwd))
        self.alive.add(pid)
        return pid

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
        for port, owner in tuple(self.port_owners.items()):
            if owner == pid:
                del self.port_owners[port]


class ProcessManagerTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary = TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.registry = ProcessRegistry(Path(self.temporary.name) / "owned-processes.json")
        self.backend = FakeProcessBackend()
        self.manager = ProcessManager(
            self.registry,
            self.backend,
            owner_token="owner-1",
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

    def test_failed_health_never_leaves_a_registry_record(self):
        with self.assertRaisesRegex(ProcessOwnershipError, "failed health check"):
            self.manager.start(self.service, self.run, candidate_sha=SHA)

        self.assertEqual(self.registry.read(), ())
        self.assertEqual(self.backend.stopped, [4100])

    def test_registry_write_failure_stops_the_newly_spawned_process(self):
        class FailingWriteRegistry(ProcessRegistry):
            def write(self, records) -> None:
                raise ProcessOwnershipError("owned process registry write failed")

        manager = ProcessManager(
            FailingWriteRegistry(Path(self.temporary.name) / "unwritable.json"),
            self.backend,
            owner_token="owner-1",
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
        )
        self.registry.write((record,))
        self.backend.port_owners[8080] = 777
        self.backend.alive.add(777)
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
        )
        self.registry.write((record,))
        self.backend.port_owners[8080] = 777
        self.backend.alive.add(777)

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
        )
        self.registry.write((record,))
        self.backend.port_owners[8080] = 9999
        self.backend.alive.update({777, 9999})

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
        )
        self.registry.write((record,))
        self.backend.port_owners[8080] = 777
        self.backend.alive.add(777)

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
        )
        second = OwnedProcess(
            repository_key="web",
            candidate_sha="b" * 40,
            pid=778,
            port=8080,
            health_url="http://localhost:8080/other",
            run_id="run-2",
            owner_token="owner-1",
        )

        with self.assertRaisesRegex(ProcessOwnershipError, "duplicate owned process port"):
            self.registry.write((first, second))


if __name__ == "__main__":
    unittest.main()
