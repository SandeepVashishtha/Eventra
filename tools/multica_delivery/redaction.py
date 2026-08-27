"""Closed exception relays for boundaries that handle raw output or secrets."""

from __future__ import annotations

from dataclasses import dataclass
from functools import wraps
import traceback
from typing import Callable, TypeVar


_T = TypeVar("_T")


@dataclass(frozen=True)
class ClosedFailure:
    error_type: type[Exception]
    message: str


@dataclass(frozen=True)
class ClosedCall:
    succeeded: bool
    value: object = None
    failure: ClosedFailure | None = None


def _discard_exception_graph(error: BaseException) -> None:
    pending = [error]
    seen: set[int] = set()
    while pending:
        current = pending.pop()
        if id(current) in seen:
            continue
        seen.add(id(current))
        links: list[BaseException] = []
        for name in ("__cause__", "__context__"):
            try:
                linked = getattr(current, name)
            except BaseException:
                linked = None
            if isinstance(linked, BaseException):
                links.append(linked)
        pending.extend(links)
        try:
            current_traceback = getattr(current, "__traceback__")
        except BaseException:
            current_traceback = None
        if current_traceback is not None:
            try:
                traceback.clear_frames(current_traceback)
            except BaseException:
                pass
        for name in ("__traceback__", "__cause__", "__context__"):
            try:
                setattr(current, name, None)
            except BaseException:
                pass


def exception_originates_in(error: BaseException, module_name: str) -> bool:
    """Return whether the innermost raising frame belongs to a trusted module."""

    try:
        current = error.__traceback__
        if current is None:
            return False
        while current.tb_next is not None:
            current = current.tb_next
        return current.tb_frame.f_globals.get("__name__") == module_name
    except BaseException:
        return False


def _invoke_closed(
    function: Callable[..., object],
    arguments: tuple[object, ...],
    keywords: dict[str, object],
    classify: Callable[[Exception], ClosedFailure],
) -> ClosedCall:
    try:
        return ClosedCall(True, function(*arguments, **keywords))
    except Exception as error:
        try:
            failure = classify(error)
        except BaseException:
            try:
                failure = classify(Exception())
            except BaseException:
                failure = ClosedFailure(RuntimeError, "boundary failed")
        _discard_exception_graph(error)
        return ClosedCall(False, failure=failure)


def _raise_closed(failure: ClosedFailure) -> None:
    raise failure.error_type(failure.message)


def redact_public_methods(
    classify: Callable[[Exception], ClosedFailure],
) -> Callable[[type[_T]], type[_T]]:
    """Wrap every public instance method in a raw-data-discarding relay."""

    def decorate(cls: type[_T]) -> type[_T]:
        for name, method in tuple(vars(cls).items()):
            if name.startswith("_") or not callable(method):
                continue

            @wraps(method)
            def boundary(*arguments, __method=method, **keywords):
                outcome = _invoke_closed(
                    __method,
                    arguments,
                    keywords,
                    classify,
                )
                del arguments
                del keywords
                if outcome.succeeded:
                    return outcome.value
                failure = outcome.failure
                del outcome
                assert failure is not None
                return _raise_closed(failure)

            setattr(cls, name, boundary)
        return cls

    return decorate
