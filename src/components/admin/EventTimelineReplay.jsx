import { useState, useEffect } from "react";

const timelineData = [
  {
    time: "09:00 AM",
    type: "Registration",
    description: "25 new registrations",
  },
  {
    time: "10:00 AM",
    type: "Check-in",
    description: "18 attendees checked in",
  },
  {
    time: "11:00 AM",
    type: "Session",
    description: "Opening keynote started",
  },
  {
    time: "12:00 PM",
    type: "Feedback",
    description: "15 feedback forms submitted",
  },
  {
    time: "01:00 PM",
    type: "Announcement",
    description: "Lunch break announced",
  },
];

const EventTimelineReplay = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= timelineData.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "10px",
        marginTop: "20px",
      }}
    >
      <h2>Event Timeline Replay</h2>

      <div
        style={{
          padding: "15px",
          background: "#f5f5f5",
          borderRadius: "8px",
          marginTop: "10px",
        }}
      >
        <h3>{timelineData[currentIndex].type}</h3>

        <p>{timelineData[currentIndex].time}</p>

        <p>{timelineData[currentIndex].description}</p>
      </div>

      <div style={{ marginTop: "15px" }}>
        <button
          onClick={() => setIsPlaying(true)}
          style={{ marginRight: "10px" }}
        >
          Play
        </button>

        <button
          onClick={() => setCurrentIndex(0)}
        >
          Reset
        </button>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>Historical Insights</h3>

        <p>Total Registrations: 120</p>

        <p>Total Check-ins: 98</p>

        <p>Feedback Submitted: 64</p>

        <p>Announcements Sent: 5</p>
      </div>
    </div>
  );
};

export default EventTimelineReplay;