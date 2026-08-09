import {
  Mail,
  User,
  X,
} from "lucide-react";

const TeamMemberCard = ({
  member = {},
  isTeamMember = false,
  actionLabel = "Invite",
  actionIcon: ActionIcon,
  onAction,
  onRemove,
}) => {
  const name =
    member.name ||
    member.displayName ||
    member.username ||
    "Participant";

  const role =
    member.role ||
    member.position ||
    "Team Member";

  const skills = getSkills(member);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
          {member.avatar ||
          member.profileImage ? (
            <img
              src={
                member.avatar ||
                member.profileImage
              }
              alt={`${name} profile`}
              className="h-full w-full object-cover"
            />
          ) : (
            <User
              size={23}
              className="text-indigo-600 dark:text-indigo-400"
            />
          )}
        </div>

        {/* Member information */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-slate-800 dark:text-white">
            {name}
          </h3>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {role}
          </p>

          {member.email && (
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Mail size={13} />
              <span className="truncate">
                {member.email}
              </span>
            </div>
          )}
        </div>

        {/* Remove button */}
        {isTeamMember &&
          onRemove && (
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove ${name} from team`}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            >
              <X size={17} />
            </button>
          )}
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            Skills
          </p>

          <div className="flex flex-wrap gap-2">
            {skills.map(
              (skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                >
                  {skill}
                </span>
              )
            )}
          </div>
        </div>
      )}

      {/* Action */}
      {!isTeamMember &&
        onAction && (
          <button
            type="button"
            onClick={onAction}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            {ActionIcon ? (
              <ActionIcon size={16} />
            ) : null}

            {actionLabel}
          </button>
        )}
    </article>
  );
};

const getSkills = (member) => {
  const value =
    member.skills ||
    member.skillSet ||
    member.technologies ||
    [];

  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  }

  return [];
};

export default TeamMemberCard;