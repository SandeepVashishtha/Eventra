import { FixedSizeGrid as Grid } from "react-window";
import EventCard from "../../Pages/Events/EventCard";

const VirtualizedEventGrid = ({ events }) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard
          key={event.id || event._id}
          event={event}
        />
      ))}
    </div>
    );
  };

export default VirtualizedEventGrid;
