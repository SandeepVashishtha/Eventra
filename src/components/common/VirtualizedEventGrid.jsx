import { FixedSizeGrid as Grid } from "react-window";
import EventCard from "../../Pages/Events/EventCard";

const COLUMN_COUNT = 3;
const CARD_WIDTH = 380;
const CARD_HEIGHT = 420;

const EventGridCell = ({ columnIndex, rowIndex, style, events }) => {
  const index = rowIndex * COLUMN_COUNT + columnIndex;
  const event = events[index];

  if (!event) return null;

  return (
    <div style={style}>
      <EventCard event={event} />
    </div>
  );
};

const VirtualizedEventGrid = ({ events }) => {
  const rowCount = Math.ceil(events.length / COLUMN_COUNT);

  return (
    <Grid
      cellComponent={EventGridCell}
      cellProps={{ events }}
      columnCount={COLUMN_COUNT}
      columnWidth={CARD_WIDTH}
      defaultHeight={900}
      defaultWidth={1200}
      rowCount={rowCount}
      rowHeight={CARD_HEIGHT}
      style={{ height: 900, width: "100%", maxWidth: 1200 }}
    />
  );
};

export default VirtualizedEventGrid;
