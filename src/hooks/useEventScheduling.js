import { useCallback, useEffect, useMemo, useState } from "react";
import { API_ENDPOINTS, apiUtils } from "../config/api";
import {
  applyScheduleToEvent,
  buildScheduleUpdatePayload,
  detectScheduleConflicts,
  getEventDurationMinutes,
  getEventIdentity,
  normalizeScheduledEvents,
  validateScheduleRange,
} from "../utils/eventSchedulingUtils";

const findEvent = (events, eventId) =>
  events.find((event) => String(getEventIdentity(event)) === String(eventId));

const defaultPersistSchedule = async ({ eventId, start, end }) => {
  const endpoint = API_ENDPOINTS.EVENTS.SCHEDULE
    ? API_ENDPOINTS.EVENTS.SCHEDULE(eventId)
    : API_ENDPOINTS.EVENTS.DETAIL(eventId);
  const payload = buildScheduleUpdatePayload(eventId, start, end);
  return apiUtils.patch(endpoint, payload);
};

export const useEventScheduling = ({
  initialEvents = [],
  persistSchedule = defaultPersistSchedule,
  onScheduleUpdated,
} = {}) => {
  const [events, setEvents] = useState(initialEvents);
  const [isSaving, setIsSaving] = useState(false);
  const [scheduleError, setScheduleError] = useState("");
  const [lastChange, setLastChange] = useState(null);
  const [pendingConflict, setPendingConflict] = useState(null);

  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  const scheduledEvents = useMemo(() => normalizeScheduledEvents(events), [events]);

  const commitScheduleChange = useCallback(
    async ({ eventId, start, overrideConflicts = false }) => {
      const originalEvent = findEvent(events, eventId);
      if (!originalEvent) {
        const error = "Event could not be found.";
        setScheduleError(error);
        return { ok: false, error };
      }

      const durationMinutes = getEventDurationMinutes(originalEvent);
      const end = new Date(start.getTime() + durationMinutes * 60000);
      const validation = validateScheduleRange({ start, end });
      if (!validation.ok) {
        setScheduleError(validation.reason);
        return { ok: false, error: validation.reason };
      }

      const updatedEvent = applyScheduleToEvent(originalEvent, start, durationMinutes);
      const conflicts = detectScheduleConflicts(updatedEvent, events);
      if (conflicts.length > 0 && !overrideConflicts) {
        setPendingConflict({ eventId, start, updatedEvent, conflicts });
        setScheduleError("");
        return { ok: false, conflicts };
      }

      const previousEvents = events;
      const nextEvents = events.map((event) =>
        String(getEventIdentity(event)) === String(eventId) ? updatedEvent : event,
      );

      setEvents(nextEvents);
      setLastChange({ eventId, before: originalEvent, after: updatedEvent });
      setPendingConflict(null);
      setScheduleError("");
      setIsSaving(true);

      try {
        await persistSchedule({ eventId, start, end, event: updatedEvent, overrideConflicts });
        onScheduleUpdated?.(updatedEvent);
        return { ok: true, event: updatedEvent, conflicts };
      } catch (error) {
        setEvents(previousEvents);
        setLastChange(null);
        const message = error?.message || "Failed to update event schedule.";
        setScheduleError(message);
        return { ok: false, error: message };
      } finally {
        setIsSaving(false);
      }
    },
    [events, onScheduleUpdated, persistSchedule],
  );

  const scheduleEvent = useCallback(
    (eventId, start, options = {}) =>
      commitScheduleChange({
        eventId,
        start,
        overrideConflicts: options.overrideConflicts || false,
      }),
    [commitScheduleChange],
  );

  const overridePendingConflict = useCallback(() => {
    if (!pendingConflict) return Promise.resolve({ ok: false, error: "No conflict to override." });
    return commitScheduleChange({
      eventId: pendingConflict.eventId,
      start: pendingConflict.start,
      overrideConflicts: true,
    });
  }, [commitScheduleChange, pendingConflict]);

  const cancelPendingConflict = useCallback(() => {
    setPendingConflict(null);
  }, []);

  const undoLastChange = useCallback(async () => {
    if (!lastChange) {
      return { ok: false, error: "No schedule change to undo." };
    }

    const previousEvents = events;
    const restoredEvents = events.map((event) =>
      String(getEventIdentity(event)) === String(lastChange.eventId) ? lastChange.before : event,
    );

    setEvents(restoredEvents);
    setIsSaving(true);
    setScheduleError("");

    try {
      const start = new Date(lastChange.before.startDate || lastChange.before.date);
      const normalizedBefore = normalizeScheduledEvents([lastChange.before])[0];
      await persistSchedule({
        eventId: lastChange.eventId,
        start: normalizedBefore?.start || start,
        end: normalizedBefore?.end || new Date(start.getTime() + getEventDurationMinutes(lastChange.before) * 60000),
        event: lastChange.before,
        isUndo: true,
      });
      setLastChange(null);
      onScheduleUpdated?.(lastChange.before);
      return { ok: true, event: lastChange.before };
    } catch (error) {
      setEvents(previousEvents);
      const message = error?.message || "Failed to undo schedule change.";
      setScheduleError(message);
      return { ok: false, error: message };
    } finally {
      setIsSaving(false);
    }
  }, [events, lastChange, onScheduleUpdated, persistSchedule]);

  return {
    events,
    scheduledEvents,
    isSaving,
    scheduleError,
    lastChange,
    pendingConflict,
    setEvents,
    scheduleEvent,
    undoLastChange,
    overridePendingConflict,
    cancelPendingConflict,
  };
};

export default useEventScheduling;
