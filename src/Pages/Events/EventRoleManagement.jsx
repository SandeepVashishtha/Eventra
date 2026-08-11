import usePaginatedFetch from "hooks/usePaginatedFetch";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";

import { API_ENDPOINTS, apiUtils } from "../../config/api.js";

const EVENT_ROLES = ["ORGANIZER", "MODERATOR", "ATTENDEE"];

export default function EventRoleManagement() {
  const { eventId } = useParams();
  const [userEmail, setUserEmail] = useState("");
  const [role, setRole] = useState("MODERATOR");
  const [saving, setSaving] = useState(false);

  // Fix: usePaginatedFetch replaces manual loading/error/data state +
  // bare fetch calls with no AbortController. Auto-cancels on unmount.
  const {
    data: rolesData,
    isLoading: loading,
    error: rolesError,
    refetch: loadRoles,
  } = usePaginatedFetch(
    async (signal) => {
      const [teamResponse, auditResponse] = await Promise.all([
        apiUtils.get(API_ENDPOINTS.EVENTS.ROLES(eventId), { signal }),
        apiUtils.get(API_ENDPOINTS.EVENTS.ROLE_AUDIT(eventId), { signal }),
      ]);
      return { data: { members: teamResponse.data, auditLog: auditResponse.data } };
    },
    { dependencies: [eventId], enabled: !!eventId }
  );

  const members = rolesData?.members ?? [];
  const auditLog = rolesData?.auditLog ?? [];

  useEffect(() => {
    if (rolesError) toast.error(rolesError);
  }, [rolesError]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await apiUtils.put(API_ENDPOINTS.EVENTS.ROLES(eventId), {
        userEmail,
        role,
      });
      setUserEmail("");
      toast.success("Event role updated.");
      loadRoles();
    } catch (error) {
      toast.error(error.message || "Unable to update event role.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-emerald-600" aria-hidden="true" />
          <div>
            <h1 className="text-2xl font-semibold">Event Roles</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">Assign organizer, moderator, and attendee access for event #{eventId}.</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-[1fr_180px_auto]">
          <input
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            type="email"
            value={userEmail}
            onChange={(event) => setUserEmail(event.target.value)}
            placeholder="team.member@example.com"
            required
          />
          <select
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            {EVENT_ROLES.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <button
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            type="submit"
            disabled={saving}
          >
            {saving ? "Saving..." : "Assign Role"}
          </button>
        </form>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-3 text-lg font-semibold">Team Members</h2>
            {loading ? (
              <p className="text-sm text-slate-500">Loading roles...</p>
            ) : members.length === 0 ? (
              <p className="text-sm text-slate-500">No team members assigned yet.</p>
            ) : (
              <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                {members.map((member) => (
                  <li key={member.userId} className="flex items-center justify-between gap-3 py-3">
                    <div>
                      <p className="text-sm font-medium">{member.email}</p>
                      <p className="text-xs text-slate-500">{member.username}</p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">{member.role}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-3 text-lg font-semibold">Audit Log</h2>
            {auditLog.length === 0 ? (
              <p className="text-sm text-slate-500">No role changes recorded.</p>
            ) : (
              <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                {auditLog.slice(0, 12).map((entry) => (
                  <li key={entry.id} className="py-3 text-sm">
                    <p className="font-medium">User #{entry.targetUserId}: {entry.previousRole || "NONE"} to {entry.newRole}</p>
                    <p className="text-xs text-slate-500">{new Date(entry.changedAt).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
