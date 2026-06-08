import { FixedSizeGrid as Grid } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import EventCard from "../../Pages/Events/EventCard";

const CARD_WIDTH = 380;
const CARD_HEIGHT = 420;

const VirtualizedEventGrid = ({ events }) => {
  return (
    <div style={{ width: "100%", height: "900px" }}>
      <AutoSizer>
        {({ height, width }) => {
          const columnCount = Math.max(1, Math.floor(width / CARD_WIDTH));
          const rowCount = Math.ceil(events.length / columnCount);

          const Cell = ({ columnIndex, rowIndex, style }) => {
            const index = rowIndex * columnCount + columnIndex;
            const event = events[index];

            if (!event) return null;

            return (
              <div style={{ ...style, display: "flex", justifyContent: "center" }}>
                <EventCard event={event} />
              </div>
            );
          };

          return (
            <Grid
              columnCount={columnCount}
              columnWidth={width / columnCount}
              height={height}
              rowCount={rowCount}
              rowHeight={CARD_HEIGHT}
              width={width}
            >
              {Cell}
            </Grid>
          );
        }}
      </AutoSizer>
    </div>
  );
};

export default VirtualizedEventGrid;