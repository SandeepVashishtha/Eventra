from pathlib import Path
import unittest

from tools.multica_delivery.model import RepositorySpec
from tools.multica_delivery.topology import TopologyError, merge_order, topological_waves


def repository(key: str, depends_on: tuple[str, ...] = ()) -> RepositorySpec:
    return RepositorySpec(
        key=key,
        github=f"example/{key}",
        project_title=key,
        local_path=Path(f"/tmp/{key}"),
        default_branch="main",
        depends_on=depends_on,
        commands={},
        skills=(),
    )


class TopologyTests(unittest.TestCase):
    def setUp(self) -> None:
        self.repositories = {
            "web": repository("web", ("api",)),
            "api": repository("api"),
            "notifications": repository("notifications", ("api",)),
        }

    def test_selected_subgraph_builds_dependencies_before_dependents(self):
        waves = topological_waves(self.repositories, frozenset({"api", "web", "notifications"}))
        self.assertEqual(waves, (("api",), ("notifications", "web")))

    def test_subset_omits_unselected_dependents(self):
        self.assertEqual(topological_waves(self.repositories, frozenset({"api"})), (("api",),))

    def test_selected_repo_requires_selected_dependency(self):
        with self.assertRaisesRegex(TopologyError, "web requires api"):
            topological_waves(self.repositories, frozenset({"web"}))

    def test_frozen_contract_allows_dependent_in_same_wave(self):
        waves = topological_waves(
            self.repositories,
            frozenset({"api", "web"}),
            satisfied_dependencies=frozenset({("web", "api")}),
        )
        self.assertEqual(waves, (("api", "web"),))

    def test_frozen_contract_never_allows_a_dependent_before_its_producer(self):
        repositories = {
            "db": repository("db"),
            "api": repository("api", ("db",)),
            "web": repository("web", ("api",)),
        }
        self.assertEqual(
            topological_waves(
                repositories,
                frozenset(repositories),
                satisfied_dependencies=frozenset({("web", "api")}),
            ),
            (("db",), ("api", "web")),
        )

    def test_unknown_selected_repository_is_rejected(self):
        with self.assertRaisesRegex(TopologyError, "unknown selected repositories: missing"):
            topological_waves(self.repositories, frozenset({"missing"}))

    def test_cycle_reports_remaining_keys(self):
        repositories = {
            "api": repository("api", ("web",)),
            "web": repository("web", ("api",)),
        }
        with self.assertRaisesRegex(TopologyError, "cycle.*api.*web"):
            topological_waves(repositories, frozenset(repositories))

    def test_malformed_satisfied_edge_is_rejected_as_a_topology_error(self):
        with self.assertRaisesRegex(TopologyError, "satisfied dependency edge"):
            topological_waves(
                self.repositories,
                frozenset({"api", "web"}),
                satisfied_dependencies=frozenset({"not-an-edge"}),  # type: ignore[arg-type]
            )

    def test_mixed_malformed_satisfied_edges_never_leak_a_type_error(self):
        with self.assertRaisesRegex(TopologyError, "satisfied dependency edge"):
            topological_waves(
                self.repositories,
                frozenset({"api", "web"}),
                satisfied_dependencies=frozenset({("web", "api"), "not-an-edge"}),  # type: ignore[arg-type]
            )

    def test_multiple_malformed_satisfied_edges_have_a_stable_error(self):
        messages = []
        for _ in range(3):
            with self.assertRaises(TopologyError) as error:
                topological_waves(
                    self.repositories,
                    frozenset({"api", "web"}),
                    satisfied_dependencies=frozenset({1, ("web",)}),  # type: ignore[arg-type]
                )
            messages.append(str(error.exception))
        self.assertEqual(messages, ["satisfied dependency edge 1 must be a (dependent, dependency) pair"] * 3)

    def test_merge_order_is_deterministic(self):
        self.assertEqual(
            merge_order(self.repositories, frozenset({"api", "web", "notifications"})),
            ("api", "notifications", "web"),
        )

    def test_merge_order_rejects_confirmed_order_inconsistent_with_dag(self):
        with self.assertRaisesRegex(TopologyError, "inconsistent with repository dependencies"):
            merge_order(
                self.repositories,
                frozenset({"api", "web"}),
                confirmed_order=("web", "api"),
            )
