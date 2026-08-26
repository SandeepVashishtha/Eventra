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
        with self.assertRaisesRegex(TopologyError, "satisfied dependency edges"):
            topological_waves(
                self.repositories,
                frozenset({"api", "web"}),
                satisfied_dependencies=frozenset({"not-an-edge"}),  # type: ignore[arg-type]
            )

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
