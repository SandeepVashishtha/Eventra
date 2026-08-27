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
        cause = current.__cause__
        context = current.__context__
        if cause is not None:
            pending.append(cause)
        if context is not None:
            pending.append(context)
        if current.__traceback__ is not None:
            traceback.clear_frames(current.__traceback__)
        current.__traceback__ = None
        current.__cause__ = None
        current.__context__ = None


def exception_originates_in(error: BaseException, module_name: str) -> bool:
    """Return whether the innermost raising frame belongs to a trusted module."""

    current = error.__traceback__
    if current is None:
        return False
    while current.tb_next is not None:
        current = current.tb_next
    return current.tb_frame.f_globals.get("__name__") == module_name


def _invoke_closed(
    function: Callable[..., object],
    arguments: tuple[object, ...],
    keywords: dict[str, object],
    classify: Callable[[Exception], ClosedFailure],
) -> ClosedCall:
    try:
        return ClosedCall(True, function(*arguments, **keywords))
    except Exception as error:
        failure = classify(error)
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
