"""Assertions for values reachable from a retained exception graph."""

from __future__ import annotations

from collections.abc import Mapping
from pathlib import Path
import traceback


def object_reaches_text(value: object, sentinel: str, seen: set[int]) -> bool:
    identity = id(value)
    if identity in seen:
        return False
    seen.add(identity)
    if isinstance(value, str):
        return sentinel in value
    if isinstance(value, bytes):
        return sentinel.encode() in value
    if value is None or isinstance(value, (bool, int, float, Path, type)):
        return False
    if isinstance(value, Mapping):
        return any(
            object_reaches_text(item, sentinel, seen)
            for pair in value.items()
            for item in pair
        )
    if isinstance(value, (tuple, list, set, frozenset)):
        return any(object_reaches_text(item, sentinel, seen) for item in value)
    if isinstance(value, BaseException):
        if sentinel in str(value):
            return True
        return any(
            object_reaches_text(item, sentinel, seen)
            for item in value.args
        )
    attributes = getattr(value, "__dict__", None)
    if isinstance(attributes, dict) and object_reaches_text(
        attributes, sentinel, seen
    ):
        return True
    slots = getattr(type(value), "__slots__", ())
    if isinstance(slots, str):
        slots = (slots,)
    return any(
        hasattr(value, slot)
        and object_reaches_text(getattr(value, slot), sentinel, seen)
        for slot in slots
    )


def assert_exception_graph_redacted(test, error: BaseException, sentinel: str) -> None:
    pending = [error]
    seen_errors: set[int] = set()
    while pending:
        current_error = pending.pop()
        if id(current_error) in seen_errors:
            continue
        seen_errors.add(id(current_error))
        test.assertNotIn(sentinel, str(current_error))
        current = current_error.__traceback__
        while current is not None:
            for value in current.tb_frame.f_locals.values():
                test.assertFalse(
                    object_reaches_text(value, sentinel, set()),
                    msg=(
                        f"{sentinel!r} is reachable from "
                        f"{current.tb_frame.f_code.co_name} traceback locals"
                    ),
                )
            current = current.tb_next
        if current_error.__cause__ is not None:
            pending.append(current_error.__cause__)
        if current_error.__context__ is not None:
            pending.append(current_error.__context__)
    test.assertNotIn(sentinel, "".join(traceback.format_exception(error)))
