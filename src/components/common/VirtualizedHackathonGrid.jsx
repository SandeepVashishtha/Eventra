import { useMemo, useCallback } from "react";
import { FixedSizeGrid as Grid } from "react-window";
import { AutoSizer } from "react-virtualized-auto-sizer";
import HackathonCard from "../../Pages/Hackathons/HackathonCard";

const CARD_HEIGHT = 320;
const GAP = 32; // gap-8 = 2rem = 32px
const BREAKPOINTS = { sm: 768, lg: 1024 };

const getColumnCount = (width) => {
    if (width >= BREAKPOINTS.lg) return 3;
    if (width >= BREAKPOINTS.sm) return 2;
    return 1;
};

/**
 * VirtualizedHackathonGrid
 *
 * Drop-in replacement for the filteredHackathons.map() render in HackathonPage.
 * Uses react-window Grid to render only the cards visible in the
 * current viewport, preventing layout thrashing when the list exceeds 50 items.
 *
 * Props:
 *   hackathons — array of hackathon objects (same shape as HackathonCard expects)
 */
const VirtualizedHackathonGrid = ({ hackathons }) => {
    const Cell = useCallback(
        ({ columnIndex, rowIndex, style, data }) => {
            const { items, columnCount, columnWidth } = data;
            const index = rowIndex * columnCount + columnIndex;
            if (index >= items.length) return null;

            const hackathon = items[index];
            const paddingLeft = columnIndex > 0 ? GAP : 0;
            const paddingTop = rowIndex > 0 ? GAP : 0;

            return (
                <div
                    style={{
                        ...style,
                        paddingLeft,
                        paddingTop,
                        width: columnWidth + paddingLeft,
                        height: CARD_HEIGHT + paddingTop,
                    }}
                >
                    <HackathonCard hackathon={hackathon} />
                </div>
            );
        },
        []
    );

    return (
        <div style={{ width: "100%", height: Math.min(hackathons.length * CARD_HEIGHT, 800) }}>
            <AutoSizer>
                {({ width, height }) => {
                    const columnCount = getColumnCount(width);
                    const columnWidth = (width - GAP * (columnCount - 1)) / columnCount;
                    const rowCount = Math.ceil(hackathons.length / columnCount);
                    const rowHeight = CARD_HEIGHT + GAP;

                    return (
                        <Grid
                            columnCount={columnCount}
                            columnWidth={columnWidth + GAP / columnCount}
                            rowCount={rowCount}
                            rowHeight={rowHeight}
                            width={width}
                            height={height}
                            itemData={{ items: hackathons, columnCount, columnWidth }}
                            overscanRowCount={2}
                            overscanColumnCount={2}
                        >
                            {Cell}
                        </Grid>
                    );
                }}
            </AutoSizer>
        </div>
    );
};

export default VirtualizedHackathonGrid;