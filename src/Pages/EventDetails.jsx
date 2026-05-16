import React from "react";
import { useParams } from "react-router-dom";

const EventDetails = () => {
  const { id } = useParams();

  return (
    <div className="pt-32 px-6">
      <h1 className="text-4xl font-bold">
        Event Details
      </h1>

      <p>Event ID: {id}</p>
    </div>
  );
};

export default EventDetails;