/**
 * Floor Plan Algorithmic Auto-Solver
 * Generates optimal seating and table placement grid based on constraints.
 */

export const PRESET_TEMPLATES = {
  conference: { name: "Conference Keynote", tableShape: "round", seatsPerTable: 8 },
  banquet: { name: "Banquet / Gala Dinner", tableShape: "round", seatsPerTable: 10 },
  hackathon: { name: "Hackathon Team Workspaces", tableShape: "rectangular", seatsPerTable: 6 },
  expo: { name: "Expo Booths & Sponsors", tableShape: "rectangular", seatsPerTable: 4 },
};

export function solveFloorPlanLayout({
  venueWidthMeters = 30,
  venueHeightMeters = 20,
  targetAttendees = 120,
  template = "hackathon",
  aisleWidthMeters = 1.5,
}) {
  const config = PRESET_TEMPLATES[template] || PRESET_TEMPLATES.hackathon;
  const seatsPerTable = config.seatsPerTable;
  const totalTables = Math.ceil(targetAttendees / seatsPerTable);

  const canvasWidth = venueWidthMeters * 30; // 30px per meter
  const canvasHeight = venueHeightMeters * 30;

  const tableWidth = config.tableShape === "round" ? 60 : 80;
  const tableHeight = config.tableShape === "round" ? 60 : 50;
  const gap = aisleWidthMeters * 30;

  const tables = [];
  let currentX = gap * 2;
  let currentY = gap * 2;

  for (let i = 1; i <= totalTables; i++) {
    if (currentX + tableWidth + gap > canvasWidth - gap) {
      currentX = gap * 2;
      currentY += tableHeight + gap * 1.5;
    }

    if (currentY + tableHeight > canvasHeight - gap) {
      break; // Venue capacity reached
    }

    tables.push({
      id: i,
      name: `Table ${i}`,
      shape: config.tableShape,
      x: currentX,
      y: currentY,
      width: tableWidth,
      height: tableHeight,
      seats: seatsPerTable,
    });

    currentX += tableWidth + gap * 1.5;
  }

  const exits = [
    { id: "exit-a", name: "Main Emergency Exit A", x: 40, y: canvasHeight / 2 },
    { id: "exit-b", name: "Rear Exit B", x: canvasWidth - 40, y: canvasHeight / 2 },
  ];

  return {
    canvasDimensions: { width: canvasWidth, height: canvasHeight },
    tables,
    exits,
    totalPlacedSeats: tables.length * seatsPerTable,
    templateName: config.name,
  };
}
