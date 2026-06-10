import { AlertTriangle, HeartPulse } from "lucide-react";

const EventHealthScore = () => {
  const registrations = 75;
  const attendanceForecast = 68;
  const volunteerAvailability = 90;
  const sessionOccupancy = 70;
  const feedbackTrend = 80;

  const healthScore = Math.round(
    (
      registrations +
      attendanceForecast +
      volunteerAvailability +
      sessionOccupancy +
      feedbackTrend
    ) / 5
  );

  const risks = [];

  if (registrations < 50)
    risks.push("Low registration growth");

  if (attendanceForecast < 60)
    risks.push("Weak attendance forecast");

  if (volunteerAvailability < 60)
    risks.push("Volunteer shortage");

  if (sessionOccupancy < 60)
    risks.push("Low session occupancy");

  if (feedbackTrend < 60)
    risks.push("Negative feedback trend");

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-white/10 mt-6">

      <div className="flex items-center gap-2 mb-4">
        <HeartPulse className="text-emerald-500" />
        <h2 className="text-lg font-black">
          Event Health Score
        </h2>
      </div>

      <div className="text-5xl font-black text-indigo-600 mb-4">
        {healthScore}/100
      </div>

      <div className="space-y-2 text-sm">
        <p>Registrations: {registrations}%</p>
        <p>Attendance Forecast: {attendanceForecast}%</p>
        <p>Volunteer Availability: {volunteerAvailability}%</p>
        <p>Session Occupancy: {sessionOccupancy}%</p>
        <p>Feedback Trend: {feedbackTrend}%</p>
      </div>

      <div className="mt-6">
        <h3 className="font-bold flex items-center gap-2 mb-2">
          <AlertTriangle size={16} />
          Risk Alerts
        </h3>

        {risks.length > 0 ? (
          <ul className="list-disc ml-6 text-sm">
            {risks.map((risk, index) => (
              <li key={index}>{risk}</li>
            ))}
          </ul>
        ) : (
          <p className="text-emerald-500 text-sm">
            No major risks detected
          </p>
        )}
      </div>

      <div className="mt-6">
        <h3 className="font-bold mb-2">
          Recommendations
        </h3>

        <ul className="list-disc ml-6 text-sm">
          <li>Increase marketing campaigns</li>
          <li>Recruit additional volunteers</li>
          <li>Promote underperforming sessions</li>
          <li>Engage attendees through reminders</li>
        </ul>
      </div>
    </div>
  );
};

export default EventHealthScore;