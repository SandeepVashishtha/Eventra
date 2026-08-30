import { NextResponse } from "next/server";

// Dynamic simulation / aggregation helper for event analytics
function generateEventAnalytics(eventId) {
  const parsedId = parseInt(eventId, 10) || 1;

  // Realistic synthetic numbers based on event ID seed
  const maxCapacity = 200 + (parsedId % 5) * 100; // e.g. 200, 300, 400, 500, 600
  const totalRegistered = Math.min(
    maxCapacity,
    Math.floor(maxCapacity * (0.65 + (parsedId % 4) * 0.08))
  );
  const checkedIn = Math.floor(totalRegistered * (0.78 + (parsedId % 3) * 0.06));
  const attendanceRate = totalRegistered > 0 ? ((checkedIn / totalRegistered) * 100).toFixed(1) : "0.0";
  const capacityUtilization = ((totalRegistered / maxCapacity) * 100).toFixed(1);

  // Time-series registration data leading up to event date (past 14 days)
  const timeline = [];
  const now = new Date();
  let cumulative = 0;
  const dailyTargetRatio = totalRegistered / 14;

  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayName = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    
    // Slight variation per day
    const dayFactor = 0.5 + Math.sin(i + parsedId) * 0.4 + (14 - i) * 0.05;
    let daily = Math.max(1, Math.round(dailyTargetRatio * dayFactor * 0.8));
    if (i === 0) {
      daily = Math.max(1, totalRegistered - cumulative);
    }
    cumulative += daily;
    if (cumulative > totalRegistered) cumulative = totalRegistered;

    timeline.push({
      date: dayName,
      fullDate: d.toISOString().split("T")[0],
      dailyRegistrations: daily,
      cumulativeRegistrations: cumulative,
    });
  }

  // Ensure last cumulative equals totalRegistered
  if (timeline.length > 0) {
    timeline[timeline.length - 1].cumulativeRegistrations = totalRegistered;
  }

  // Registration by Day of Week & Hour (Heatmap Matrix)
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const timeSlots = [
    { label: "12 AM - 4 AM", startHour: 0, endHour: 4 },
    { label: "4 AM - 8 AM", startHour: 4, endHour: 8 },
    { label: "8 AM - 12 PM", startHour: 8, endHour: 12 },
    { label: "12 PM - 4 PM", startHour: 12, endHour: 16 },
    { label: "4 PM - 8 PM", startHour: 16, endHour: 20 },
    { label: "8 PM - 12 AM", startHour: 20, endHour: 24 },
  ];

  const heatmap = daysOfWeek.map((day, dIdx) => {
    return {
      day,
      slots: timeSlots.map((slot, sIdx) => {
        // Higher intensity during afternoon/evening on weekdays
        const isWeekday = dIdx < 5;
        const isPeakSlot = sIdx === 2 || sIdx === 3 || sIdx === 4;
        const baseVal = isWeekday && isPeakSlot ? 18 : isPeakSlot ? 10 : 4;
        const count = Math.max(0, Math.floor(baseVal + Math.sin(dIdx * 3 + sIdx + parsedId) * 6));
        return {
          slotLabel: slot.label,
          count,
          intensity: Math.min(100, Math.round((count / 25) * 100)),
        };
      }),
    };
  });

  // Geographic Breakdown
  const geoBreakdown = [
    { city: "Bengaluru", country: "India", count: Math.round(totalRegistered * 0.34), percentage: 34 },
    { city: "San Francisco", country: "United States", count: Math.round(totalRegistered * 0.22), percentage: 22 },
    { city: "London", country: "United Kingdom", count: Math.round(totalRegistered * 0.15), percentage: 15 },
    { city: "Berlin", country: "Germany", count: Math.round(totalRegistered * 0.12), percentage: 12 },
    { city: "Singapore", country: "Singapore", count: Math.round(totalRegistered * 0.09), percentage: 9 },
    { city: "Others", country: "Global", count: Math.round(totalRegistered * 0.08), percentage: 8 },
  ];

  // Raw attendee roster for CSV export
  const attendeeRoster = Array.from({ length: Math.min(totalRegistered, 35) }).map((_, idx) => {
    const isCheckedIn = idx < Math.round(35 * (parseFloat(attendanceRate) / 100));
    const cities = ["Bengaluru, IN", "San Francisco, US", "London, UK", "Berlin, DE", "Singapore, SG", "Toronto, CA", "Tokyo, JP"];
    const roles = ["Full-stack Engineer", "Frontend Developer", "DevOps Engineer", "Product Manager", "Student", "UI/UX Designer"];
    const loc = cities[idx % cities.length];
    const role = roles[idx % roles.length];
    const regDate = new Date(Date.now() - (idx * 3600 * 1000 * 8)).toISOString();

    return {
      id: `REG-${eventId}-${1000 + idx}`,
      name: `Attendee ${idx + 1}`,
      email: `attendee.${idx + 1}@example.com`,
      role,
      location: loc,
      registeredAt: regDate,
      checkedIn: isCheckedIn,
      checkInTime: isCheckedIn ? new Date(Date.now() - (idx * 3600 * 1000 * 2)).toLocaleTimeString() : "N/A",
    };
  });

  return {
    eventId: parsedId,
    summary: {
      totalRegistered,
      checkedIn,
      absentCount: totalRegistered - checkedIn,
      attendanceRate: parseFloat(attendanceRate),
      maxCapacity,
      capacityUtilization: parseFloat(capacityUtilization),
      seatsRemaining: Math.max(0, maxCapacity - totalRegistered),
      isSoldOut: totalRegistered >= maxCapacity,
      averageRegistrationLeadDays: 8.4,
      peakRegistrationDay: "Thursday",
      topReferralSource: "Eventra Direct / Search (44%)",
    },
    timeline,
    heatmap,
    geographic: geoBreakdown,
    attendees: attendeeRoster,
  };
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const analyticsData = generateEventAnalytics(id);

    return NextResponse.json(analyticsData, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate event analytics", details: error.message },
      { status: 500 }
    );
  }
}
