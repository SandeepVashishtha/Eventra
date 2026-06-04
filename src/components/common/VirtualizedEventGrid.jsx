import { FixedSizeGrid as Grid } from "react-window";
import EventCard from "../../Pages/Events/EventCard";

const COLUMN_COUNT = 3;
const CARD_WIDTH = 380;
const CARD_HEIGHT = 420;

const VirtualizedEventGrid = ({ events }) => {
  const rowCount = Math.ceil(events.length / COLUMN_COUNT);

  const Cell = ({ columnIndex, rowIndex, style }) => {
    const index = rowIndex * COLUMN_COUNT + columnIndex;
    const event = events[index];

    if (!event) return null;

    return (
      <div style={style}>
        <EventCard event={event} />
      </div>
    );
  };

  return (
    <Grid
      columnCount={COLUMN_COUNT}
      columnWidth={CARD_WIDTH}
      height={900}
      rowCount={rowCount}
      rowHeight={CARD_HEIGHT}
      width={1200}
    >
      {Cell}
    </Grid>
  );
};

export default VirtualizedEventGrid;