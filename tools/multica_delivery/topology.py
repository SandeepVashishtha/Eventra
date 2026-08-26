"""Pure deterministic dependency ordering for multi-repository delivery."""

from collections.abc import Mapping, Sequence

from .model import RepositorySpec


class TopologyError(ValueError):
    """Raised when a selected repository graph cannot be ordered safely."""


def _validate_selected(repositories: Mapping[str, RepositorySpec], selected: frozenset[str]) -> None:
    unknown = sorted(selected - repositories.keys())
    if unknown:
        raise TopologyError(f"unknown selected repositories: {', '.join(unknown)}")
    for dependent in sorted(selected):
        for dependency in repositories[dependent].depends_on:
            if dependency not in selected:
                raise TopologyError(f"{dependent} requires {dependency} to be selected")


def _validate_satisfied_edges(
    repositories: Mapping[str, RepositorySpec],
    selected: frozenset[str],
    satisfied_dependencies: frozenset[tuple[str, str]],
) -> None:
    for edge in satisfied_dependencies:
        if not isinstance(edge, tuple) or len(edge) != 2:
            raise TopologyError("satisfied dependency edges must be (dependent, dependency) pairs")
        dependent, dependency = edge
        if not isinstance(dependent, str) or not isinstance(dependency, str):
            raise TopologyError("satisfied dependency edges must be (dependent, dependency) pairs")
        if dependent not in selected or dependency not in selected:
            raise TopologyError(f"satisfied dependency edge {dependent!r}, {dependency!r} is not selected")
        if dependency not in repositories[dependent].depends_on:
            raise TopologyError(f"{dependent} does not depend on {dependency}")


def _declared_topological_order(
    repositories: Mapping[str, RepositorySpec], selected: frozenset[str]
) -> tuple[str, ...]:
    """Order every declared edge, including frozen-contract edges, for safety."""
    pending = {key: set(repositories[key].depends_on) for key in selected}
    order: list[str] = []
    while pending:
        wave = tuple(sorted(key for key, dependencies in pending.items() if not dependencies))
        if not wave:
            raise TopologyError("repository dependency cycle among: " + ", ".join(sorted(pending)))
        order.extend(wave)
        resolved = set(wave)
        for key in wave:
            del pending[key]
        for dependencies in pending.values():
            dependencies.difference_update(resolved)
    return tuple(order)


def topological_waves(
    repositories: Mapping[str, RepositorySpec],
    selected: frozenset[str],
    satisfied_dependencies: frozenset[tuple[str, str]] = frozenset(),
) -> tuple[tuple[str, ...], ...]:
    """Return lexically stable Kahn waves for a dependency-closed selection.

    A satisfied edge represents an already frozen interface contract, so it does
    not delay the dependent from starting in the dependency's wave.
    """
    _validate_selected(repositories, selected)
    _validate_satisfied_edges(repositories, selected, satisfied_dependencies)
    order = _declared_topological_order(repositories, selected)
    levels: dict[str, int] = {}
    for key in order:
        levels[key] = max(
            (
                levels[dependency] + (0 if (key, dependency) in satisfied_dependencies else 1)
                for dependency in repositories[key].depends_on
            ),
            default=0,
        )
    return tuple(
        tuple(sorted(key for key in selected if levels[key] == level))
        for level in range(max(levels.values(), default=-1) + 1)
    )


def merge_order(
    repositories: Mapping[str, RepositorySpec],
    selected: frozenset[str],
    confirmed_order: Sequence[str] = (),
) -> tuple[str, ...]:
    """Return the confirmed DAG-valid merge order, or a deterministic default."""
    _validate_selected(repositories, selected)
    if not confirmed_order:
        return tuple(key for wave in topological_waves(repositories, selected) for key in wave)
    order = tuple(confirmed_order)
    if len(order) != len(selected) or set(order) != selected:
        raise TopologyError("confirmed merge order must list selected repositories exactly once")
    positions = {key: position for position, key in enumerate(order)}
    for dependent in order:
        for dependency in repositories[dependent].depends_on:
            if positions[dependency] > positions[dependent]:
                raise TopologyError("confirmed merge order is inconsistent with repository dependencies")
    return order
