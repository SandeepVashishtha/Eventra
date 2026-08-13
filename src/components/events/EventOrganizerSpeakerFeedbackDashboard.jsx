import {
  BarChart3,
  MessageSquare,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_SPEAKERS = [
  {
    id: 1,
    name: "Dr. Priya Sharma",
    session: "AI & Future Technologies",
    averageRating: 4.8,
    responses: 124,
    attendance: 180,
    contentRating: 4.9,
    presentationRating: 4.7,
    comments: [
      "Very informative and well structured.",
      "Excellent examples and explanations.",
    ],
  },
  {
    id: 2,
    name: "Rahul Mehta",
    session: "Modern Web Development",
    averageRating: 4.5,
    responses: 98,
    attendance: 150,
    contentRating: 4.6,
    presentationRating: 4.4,
    comments: [
      "Good practical session.",
      "Would like more live demonstrations.",
    ],
  },
  {
    id: 3,
    name: "Ananya Patel",
    session: "Data Science Workshop",
    averageRating: 4.2,
    responses: 76,
    attendance: 120,
    contentRating: 4.3,
    presentationRating: 4.1,
    comments: [
      "Useful content for beginners.",
      "Session could have been slightly longer.",
    ],
  },
];

const EventOrganizerSpeakerFeedbackDashboard = ({
  speakers = DEFAULT_SPEAKERS,
}) => {
  const [selectedSpeaker, setSelectedSpeaker] = useState(
    speakers[0]?.id ?? null
  );

  const selected = speakers.find(
    (speaker) => speaker.id === selectedSpeaker
  );

  const analytics = useMemo(() => {
    if (!speakers.length) {
      return {
        averageRating: 0,
        totalResponses: 0,
        totalAttendance: 0,
        averageContent: 0,
        averagePresentation: 0,
      };
    }

    return {
      averageRating:
        speakers.reduce(
          (sum, speaker) => sum + speaker.averageRating,
          0
        ) / speakers.length,

      totalResponses: speakers.reduce(
        (sum, speaker) => sum + speaker.responses,
        0
      ),

      totalAttendance: speakers.reduce(
        (sum, speaker) => sum + speaker.attendance,
        0
      ),

      averageContent:
        speakers.reduce(
          (sum, speaker) => sum + speaker.contentRating,
          0
        ) / speakers.length,

      averagePresentation:
        speakers.reduce(
          (sum, speaker) =>
            sum + speaker.presentationRating,
          0
        ) / speakers.length,
    };
  }, [speakers]);

  if (!speakers.length) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950">
        <div className="py-12 text-center">
          <MessageSquare
            size={28}
            className="mx-auto text-slate-400"
          />

          <h2 className="mt-4 text-sm font-bold text-slate-800 dark:text-white">
            No Speaker Feedback Available
          </h2>

          <p className="mt-2 text-xs text-slate-400">
            Speaker feedback will appear here once participants
            submit their responses.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <BarChart3 size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Organizer Analytics
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Speaker Feedback Dashboard
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Review speaker-specific ratings, attendance,
              presentation quality, and participant feedback.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
            Speakers
          </p>

          <p className="mt-1 text-lg font-black text-indigo-600 dark:text-indigo-400">
            {speakers.length}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          icon={Star}
          label="Average Rating"
          value={analytics.averageRating.toFixed(1)}
        />

        <MetricCard
          icon={MessageSquare}
          label="Responses"
          value={analytics.totalResponses}
        />

        <MetricCard
          icon={Users}
          label="Attendance"
          value={analytics.totalAttendance}
        />

        <MetricCard
          icon={BarChart3}
          label="Content Rating"
          value={analytics.averageContent.toFixed(1)}
        />

        <MetricCard
          icon={TrendingUp}
          label="Presentation"
          value={analytics.averagePresentation.toFixed(1)}
        />
      </div>

      {/* Speaker Selector */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
            Speakers
          </h3>

          <p className="mt-1 text-[7px] text-slate-400">
            Select a speaker to view detailed feedback.
          </p>

          <div className="mt-4 space-y-2">
            {speakers.map((speaker) => (
              <button
                key={speaker.id}
                type="button"
                onClick={() =>
                  setSelectedSpeaker(speaker.id)
                }
                className={`w-full rounded-xl p-3 text-left transition ${
                  selectedSpeaker === speaker.id
                    ? "bg-indigo-50 ring-1 ring-indigo-200 dark:bg-indigo-900/20 dark:ring-indigo-800"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[8px] font-bold text-slate-800 dark:text-white">
                      {speaker.name}
                    </p>

                    <p className="mt-1 truncate text-[6px] text-slate-400">
                      {speaker.session}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <Star
                      size={10}
                      className="fill-current text-amber-400"
                    />

                    <span className="text-[7px] font-black text-slate-600 dark:text-slate-300">
                      {speaker.averageRating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Speaker */}
        {selected && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[7px] font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                  Selected Speaker
                </p>

                <h3 className="mt-1 text-lg font-black text-slate-800 dark:text-white">
                  {selected.name}
                </h3>

                <p className="mt-1 text-[7px] text-slate-400">
                  {selected.session}
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 dark:bg-amber-900/10">
                <Star
                  size={15}
                  className="fill-current text-amber-400"
                />

                <div>
                  <p className="text-[6px] font-bold text-slate-400">
                    Average Rating
                  </p>

                  <p className="text-sm font-black text-amber-600 dark:text-amber-400">
                    {selected.averageRating.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>

            {/* Speaker Metrics */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <SmallMetric
                label="Responses"
                value={selected.responses}
              />

              <SmallMetric
                label="Attendance"
                value={selected.attendance}
              />

              <SmallMetric
                label="Content Rating"
                value={`${selected.contentRating.toFixed(1)}/5`}
              />

              <SmallMetric
                label="Presentation"
                value={`${selected.presentationRating.toFixed(
                  1
                )}/5`}
              />
            </div>

            {/* Rating Bars */}
            <div className="mt-6 rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
              <h4 className="text-[9px] font-bold text-slate-800 dark:text-white">
                Feedback Ratings
              </h4>

              <div className="mt-5 space-y-5">
                <RatingBar
                  label="Overall Rating"
                  value={selected.averageRating}
                />

                <RatingBar
                  label="Content Quality"
                  value={selected.contentRating}
                />

                <RatingBar
                  label="Presentation Quality"
                  value={selected.presentationRating}
                />
              </div>
            </div>

            {/* Comments */}
            <div className="mt-6">
              <div className="flex items-center gap-2">
                <MessageSquare
                  size={14}
                  className="text-indigo-600 dark:text-indigo-400"
                />

                <h4 className="text-[9px] font-bold text-slate-800 dark:text-white">
                  Participant Comments
                </h4>
              </div>

              <div className="mt-4 space-y-3">
                {selected.comments?.length ? (
                  selected.comments.map((comment, index) => (
                    <div
                      key={`${comment}-${index}`}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800"
                    >
                      <div className="flex items-start gap-3">
                        <MessageSquare
                          size={12}
                          className="mt-0.5 shrink-0 text-slate-400"
                        />

                        <p className="text-[7px] leading-4 text-slate-600 dark:text-slate-300">
                          {comment}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="rounded-xl bg-slate-50 p-4 text-[7px] text-slate-400 dark:bg-slate-800">
                    No participant comments available.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Speaker Ranking */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <TrendingUp
            size={16}
            className="text-indigo-600 dark:text-indigo-400"
          />

          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Speaker Performance Ranking
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Speakers ranked by average participant rating.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {[...speakers]
            .sort(
              (a, b) =>
                b.averageRating - a.averageRating
            )
            .map((speaker, index) => (
              <div
                key={speaker.id}
                className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-[7px] font-black text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                  #{index + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[8px] font-bold text-slate-700 dark:text-slate-300">
                    {speaker.name}
                  </p>

                  <p className="mt-1 text-[6px] text-slate-400">
                    {speaker.responses} responses
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <Star
                    size={11}
                    className="fill-current text-amber-400"
                  />

                  <span className="text-[8px] font-black text-slate-700 dark:text-slate-300">
                    {speaker.averageRating.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};

const MetricCard = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-center gap-3">
      <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
        <Icon size={15} />
      </div>

      <div>
        <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-lg font-black text-slate-800 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  </div>
);

const SmallMetric = ({
  label,
  value,
}) => (
  <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
    <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <p className="mt-1 text-sm font-black text-slate-800 dark:text-white">
      {value}
    </p>
  </div>
);

const RatingBar = ({
  label,
  value,
}) => {
  const percentage = Math.min(
    (value / 5) * 100,
    100
  );

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[7px] font-bold text-slate-600 dark:text-slate-300">
          {label}
        </span>

        <span className="text-[7px] font-black text-indigo-600 dark:text-indigo-400">
          {value.toFixed(1)}/5
        </span>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all duration-500"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
};

export default EventOrganizerSpeakerFeedbackDashboard;