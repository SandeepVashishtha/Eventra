import { FixedSizeGrid as Grid } from "react-window";

const VirtualizedGrid = ({
  items,
  columnCount = 3,
  columnWidth = 380,
  rowHeight = 420,
  height = 900,
  renderItem,
}) => {
  const rowCount = Math.ceil(items.length / columnCount);

  return (
    <Grid
      columnCount={columnCount}
      columnWidth={columnWidth}
      height={height}
      rowCount={rowCount}
      rowHeight={rowHeight}
      width={columnCount * columnWidth}
    >
      {({ columnIndex, rowIndex, style }) => {
        const index = rowIndex * columnCount + columnIndex;

        if (index >= items.length) return null;

        return (
          <div style={style} className="p-3">
            {renderItem(items[index], index)}
          </div>
        );
      }}
    </Grid>
  );
};

export default VirtualizedGrid;