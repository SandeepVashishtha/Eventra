import React, { useMemo, useState } from "react";

type TaskStatus = "pending" | "completed";

interface OrganizerTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
}

interface OrganizerNotesTasksProps {
  eventId: string;
  initialTasks?: OrganizerTask[];
  initialNotes?: string;
  isOrganizer?: boolean;
  onSaveNotes?: (
    eventId: string,
    notes: string,
  ) => Promise<void> | void;
  onCreateTask?: (
    eventId: string,
    task: OrganizerTask,
  ) => Promise<void> | void;
  onUpdateTask?: (
    eventId: string,
    task: OrganizerTask,
  ) => Promise<void> | void;
  onDeleteTask?: (
    eventId: string,
    taskId: string,
  ) => Promise<void> | void;
}

const OrganizerNotesTasks: React.FC<
  OrganizerNotesTasksProps
> = ({
  eventId,
  initialTasks = [],
  initialNotes = "",
  isOrganizer = false,
  onSaveNotes,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
}) => {
  const [notes, setNotes] = useState(initialNotes);

  const [tasks, setTasks] =
    useState<OrganizerTask[]>(initialTasks);

  const [taskTitle, setTaskTitle] = useState("");

  const [taskDescription, setTaskDescription] =
    useState("");

  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState<string | null>(
    null,
  );

  const [error, setError] = useState<string | null>(
    null,
  );

  const completedTasks = useMemo(
    () =>
      tasks.filter(
        (task) => task.status === "completed",
      ).length,
    [tasks],
  );

  const pendingTasks = useMemo(
    () =>
      tasks.filter(
        (task) => task.status === "pending",
      ).length,
    [tasks],
  );

  const handleSaveNotes = async () => {
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      if (onSaveNotes) {
        await onSaveNotes(eventId, notes);
      }

      setMessage("Organizer notes saved successfully.");
    } catch (saveError) {
      console.error(
        "Unable to save organizer notes:",
        saveError,
      );

      setError("Unable to save organizer notes.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTask = async () => {
    const title = taskTitle.trim();
    const description = taskDescription.trim();

    if (!title) {
      setError("Please enter a task title.");
      return;
    }

    setSaving(true);
    setMessage(null);
    setError(null);

    const newTask: OrganizerTask = {
      id: `task-${Date.now()}`,
      title,
      description,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    try {
      if (onCreateTask) {
        await onCreateTask(eventId, newTask);
      }

      setTasks((current) => [
        ...current,
        newTask,
      ]);

      setTaskTitle("");
      setTaskDescription("");

      setMessage("Task created successfully.");
    } catch (createError) {
      console.error(
        "Unable to create organizer task:",
        createError,
      );

      setError("Unable to create organizer task.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleTask = async (
    task: OrganizerTask,
  ) => {
    const updatedTask: OrganizerTask = {
      ...task,
      status:
        task.status === "pending"
          ? "completed"
          : "pending",
    };

    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      if (onUpdateTask) {
        await onUpdateTask(
          eventId,
          updatedTask,
        );
      }

      setTasks((current) =>
        current.map((item) =>
          item.id === task.id
            ? updatedTask
            : item,
        ),
      );

      setMessage(
        updatedTask.status === "completed"
          ? "Task marked as completed."
          : "Task moved back to pending.",
      );
    } catch (updateError) {
      console.error(
        "Unable to update organizer task:",
        updateError,
      );

      setError("Unable to update organizer task.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async (
    taskId: string,
  ) => {
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      if (onDeleteTask) {
        await onDeleteTask(eventId, taskId);
      }

      setTasks((current) =>
        current.filter(
          (task) => task.id !== taskId,
        ),
      );

      setMessage("Task deleted successfully.");
    } catch (deleteError) {
      console.error(
        "Unable to delete organizer task:",
        deleteError,
      );

      setError("Unable to delete organizer task.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOrganizer) {
    return (
      <section
        className="
          w-full
          rounded-2xl
          border
          border-gray-200
          bg-white
          p-6
          shadow-sm
          dark:border-gray-700
          dark:bg-gray-900
        "
      >
        <h2
          className="
            text-xl
            font-bold
            text-gray-900
            dark:text-white
          "
        >
          Organizer Workspace
        </h2>

        <p
          className="
            mt-2
            text-sm
            text-gray-500
            dark:text-gray-400
          "
        >
          Organizer notes and internal tasks are
          private and are only available to authorized
          event organizers.
        </p>
      </section>
    );
  }

  return (
    <section
      className="
        w-full
        space-y-6
        rounded-2xl
        border
        border-gray-200
        bg-white
        p-6
        shadow-sm
        dark:border-gray-700
        dark:bg-gray-900
      "
      aria-labelledby="organizer-workspace-title"
    >
      <div
        className="
          flex
          flex-col
          gap-3
          sm:flex-row
          sm:items-start
          sm:justify-between
        "
      >
        <div>
          <h2
            id="organizer-workspace-title"
            className="
              text-2xl
              font-bold
              text-gray-900
              dark:text-white
            "
          >
            Organizer Workspace
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-gray-500
              dark:text-gray-400
            "
          >
            Keep private notes and track internal
            event preparation tasks.
          </p>
        </div>

        <span
          className="
            w-fit
            rounded-full
            bg-blue-100
            px-3
            py-1
            text-xs
            font-semibold
            text-blue-800
            dark:bg-blue-900/30
            dark:text-blue-300
          "
        >
          Organizer Only
        </span>
      </div>

      {message && (
        <div
          role="status"
          className="
            rounded-lg
            border
            border-green-200
            bg-green-50
            px-4
            py-3
            text-sm
            text-green-700
            dark:border-green-900
            dark:bg-green-900/20
            dark:text-green-300
          "
        >
          {message}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="
            rounded-lg
            border
            border-red-200
            bg-red-50
            px-4
            py-3
            text-sm
            text-red-700
            dark:border-red-900
            dark:bg-red-900/20
            dark:text-red-300
          "
        >
          {error}
        </div>
      )}

      <div
        className="
          rounded-xl
          border
          border-gray-200
          bg-gray-50
          p-5
          dark:border-gray-700
          dark:bg-gray-800
        "
      >
        <div
          className="
            flex
            flex-col
            gap-2
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div>
            <h3
              className="
                text-lg
                font-semibold
                text-gray-900
                dark:text-white
              "
            >
              Private Event Notes
            </h3>

            <p
              className="
                mt-1
                text-sm
                text-gray-500
                dark:text-gray-400
              "
            >
              These notes are intended only for
              authorized organizers.
            </p>
          </div>

          <span
            className="
              text-xs
              font-medium
              text-gray-500
              dark:text-gray-400
            "
          >
            Event: {eventId}
          </span>
        </div>

        <textarea
          value={notes}
          onChange={(event) =>
            setNotes(event.target.value)
          }
          placeholder="Add private planning notes..."
          rows={7}
          className="
            mt-4
            w-full
            resize-y
            rounded-xl
            border
            border-gray-300
            bg-white
            p-4
            text-sm
            text-gray-900
            outline-none
            transition
            focus:border-blue-500
            focus:ring-2
            focus:ring-blue-500/20
            dark:border-gray-600
            dark:bg-gray-900
            dark:text-white
          "
        />

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleSaveNotes}
            disabled={saving}
            className="
              rounded-lg
              bg-blue-600
              px-4
              py-2
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-blue-700
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {saving ? "Saving..." : "Save Notes"}
          </button>
        </div>
      </div>

      <div
        className="
          rounded-xl
          border
          border-gray-200
          bg-gray-50
          p-5
          dark:border-gray-700
          dark:bg-gray-800
        "
      >
        <div
          className="
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div>
            <h3
              className="
                text-lg
                font-semibold
                text-gray-900
                dark:text-white
              "
            >
              Internal Tasks
            </h3>

            <p
              className="
                mt-1
                text-sm
                text-gray-500
                dark:text-gray-400
              "
            >
              Track preparation work for this event.
            </p>
          </div>

          <div
            className="
              flex
              gap-2
            "
          >
            <span
              className="
                rounded-full
                bg-yellow-100
                px-3
                py-1
                text-xs
                font-semibold
                text-yellow-800
                dark:bg-yellow-900/30
                dark:text-yellow-300
              "
            >
              Pending: {pendingTasks}
            </span>

            <span
              className="
                rounded-full
                bg-green-100
                px-3
                py-1
                text-xs
                font-semibold
                text-green-800
                dark:bg-green-900/30
                dark:text-green-300
              "
            >
              Done: {completedTasks}
            </span>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <input
            type="text"
            value={taskTitle}
            onChange={(event) =>
              setTaskTitle(event.target.value)
            }
            placeholder="Task title"
            className="
              w-full
              rounded-xl
              border
              border-gray-300
              bg-white
              px-4
              py-3
              text-sm
              text-gray-900
              outline-none
              focus:border-blue-500
              focus:ring-2
              focus:ring-blue-500/20
              dark:border-gray-600
              dark:bg-gray-900
              dark:text-white
            "
          />

          <textarea
            value={taskDescription}
            onChange={(event) =>
              setTaskDescription(
                event.target.value,
              )
            }
            placeholder="Task description (optional)"
            rows={3}
            className="
              w-full
              resize-y
              rounded-xl
              border
              border-gray-300
              bg-white
              px-4
              py-3
              text-sm
              text-gray-900
              outline-none
              focus:border-blue-500
              focus:ring-2
              focus:ring-blue-500/20
              dark:border-gray-600
              dark:bg-gray-900
              dark:text-white
            "
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleCreateTask}
              disabled={saving}
              className="
                rounded-lg
                bg-blue-600
                px-4
                py-2
                text-sm
                font-semibold
                text-white
                hover:bg-blue-700
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {saving
                ? "Saving..."
                : "Add Task"}
            </button>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div
            className="
              mt-6
              rounded-xl
              border
              border-dashed
              border-gray-300
              p-8
              text-center
              dark:border-gray-700
            "
          >
            <h4
              className="
                font-semibold
                text-gray-900
                dark:text-white
              "
            >
              No internal tasks
            </h4>

            <p
              className="
                mt-2
                text-sm
                text-gray-500
                dark:text-gray-400
              "
            >
              Add a task to start organizing your
              event preparation.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {tasks.map((task) => (
              <article
                key={task.id}
                className="
                  rounded-xl
                  border
                  border-gray-200
                  bg-white
                  p-4
                  dark:border-gray-700
                  dark:bg-gray-900
                "
              >
                <div
                  className="
                    flex
                    flex-col
                    gap-4
                    sm:flex-row
                    sm:items-start
                    sm:justify-between
                  "
                >
                  <div
                    className="
                      flex
                      min-w-0
                      gap-3
                    "
                  >
                    <input
                      type="checkbox"
                      checked={
                        task.status ===
                        "completed"
                      }
                      onChange={() =>
                        handleToggleTask(task)
                      }
                      disabled={saving}
                      className="
                        mt-1
                        h-5
                        w-5
                        rounded
                        border-gray-300
                        text-blue-600
                        focus:ring-blue-500
                      "
                      aria-label={`Mark ${task.title} as ${
                        task.status ===
                        "completed"
                          ? "pending"
                          : "completed"
                      }`}
                    />

                    <div className="min-w-0">
                      <h4
                        className={`
                          font-semibold
                          ${
                            task.status ===
                            "completed"
                              ? "text-gray-400 line-through"
                              : "text-gray-900 dark:text-white"
                          }
                        `}
                      >
                        {task.title}
                      </h4>

                      {task.description && (
                        <p
                          className="
                            mt-1
                            text-sm
                            text-gray-500
                            dark:text-gray-400
                          "
                        >
                          {task.description}
                        </p>
                      )}

                      <p
                        className="
                          mt-2
                          text-xs
                          text-gray-400
                        "
                      >
                        Created{" "}
                        {new Date(
                          task.createdAt,
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div
                    className="
                      flex
                      shrink-0
                      items-center
                      gap-2
                    "
                  >
                    <span
                      className={`
                        rounded-full
                        px-3
                        py-1
                        text-xs
                        font-semibold
                        ${
                          task.status ===
                          "completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                        }
                      `}
                    >
                      {task.status ===
                      "completed"
                        ? "Completed"
                        : "Pending"}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteTask(
                          task.id,
                        )
                      }
                      disabled={saving}
                      className="
                        rounded-lg
                        border
                        border-red-200
                        px-3
                        py-1
                        text-xs
                        font-semibold
                        text-red-600
                        hover:bg-red-50
                        disabled:opacity-50
                        dark:border-red-900
                        dark:text-red-400
                        dark:hover:bg-red-900/20
                      "
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div
        className="
          rounded-xl
          border
          border-blue-200
          bg-blue-50
          p-4
          text-sm
          text-blue-800
          dark:border-blue-900
          dark:bg-blue-900/20
          dark:text-blue-300
        "
      >
        <strong>Privacy:</strong> Organizer notes
        and internal tasks are intended to remain
        private. Backend authorization should be the
        authoritative security layer preventing
        participants and unauthorized users from
        accessing this information.
      </div>
    </section>
  );
};

export default OrganizerNotesTasks;