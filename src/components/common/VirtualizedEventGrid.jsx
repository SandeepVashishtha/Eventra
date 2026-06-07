import { FixedSizeGrid as Grid } from "react-window";
import EventCard from "../../Pages/Events/EventCard";

const COLUMN_COUNT = 3;
const CARD_WIDTH = 380;
const CARD_HEIGHT = 420;

const EventGridCell = ({ columnIndex, rowIndex, style, data }) => {
  const { events } = data;
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
      itemData={{ events }}
      columnCount={COLUMN_COUNT}
      columnWidth={CARD_WIDTH}
      height={900}
      width={1200}
      rowCount={rowCount}
      rowHeight={CARD_HEIGHT}
      style={{ maxWidth: 1200 }}
    >
      {EventGridCell}
    </Grid>
  );
};

export default VirtualizedEventGrid;
