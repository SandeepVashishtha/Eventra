import { memo } from "react";
import { FixedSizeGrid as Grid } from "react-window";
import EventCard from "../../Pages/Events/EventCard";
import AutoSizer from "react-virtualized-auto-sizer";

const COLUMN_COUNT = 3;
const CARD_WIDTH = 380;
const CARD_HEIGHT = 420;

const Cell = memo(({ columnIndex, rowIndex, style, data }) => {
  const { items } = data;
  const index = rowIndex * COLUMN_COUNT + columnIndex;
  const event = items[index];

  if (!event) return null;

  return (
    <div style={style}>
      <EventCard event={event} />
    </div>
  );
});
Cell.displayName = "Cell";

// Fix (Issue #9410): Replace hardcoded width/height with AutoSizer so the
// grid fills its container and responds to window resize. Fixed dimensions
// caused the grid to overflow on mobile and never reclaim space on resize,
// contributing to layout thrash and memory growth.
import AutoSizer from "react-virtualized-auto-sizer";

const VirtualizedEventGrid = ({ events }) => {
  const rowCount = Math.ceil(events.length / COLUMN_COUNT);

  return (
    <div style={{ width: "100%", height: "80vh" }}>
      <AutoSizer>
        {({ height, width }) => {
          const colCount = Math.max(1, Math.floor(width / CARD_WIDTH));
          const colWidth = Math.floor(width / colCount);
          return (
            <Grid
              columnCount={colCount}
              columnWidth={colWidth}
              height={height}
              rowCount={Math.ceil(events.length / colCount)}
              rowHeight={CARD_HEIGHT}
              width={width}
              itemData={{ items: events }}
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
