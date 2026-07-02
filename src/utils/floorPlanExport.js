export const getCleanExportSvgString = (canvasRef) => {
  const svgElement = canvasRef.current;
  if (!svgElement) return "";

  const clonedSvg = svgElement.cloneNode(true);
  clonedSvg.style.transform = "none";
  clonedSvg.style.transformOrigin = "initial";
  clonedSvg.style.transition = "none";
  clonedSvg.setAttribute("width", "1000");
  clonedSvg.setAttribute("height", "800");
  const selectedShape = clonedSvg.querySelector(".fp-svg-element-selected");
  if (selectedShape) {
    selectedShape.classList.remove("fp-svg-element-selected");
  }
  const serializer = new XMLSerializer();
  return serializer.serializeToString(clonedSvg);
};

export const exportAsSVG = (canvasRef, eventId) => {
  try {
    const svgString = getCleanExportSvgString(canvasRef);
    if (!svgString) return;
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `eventra-floorplan-${eventId}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("SVG Export failed:", error);
  }
};

export const exportAsPNG = (canvasRef, eventId) => {
  try {
    const svgElement = canvasRef.current;
    if (!svgElement) return;
    const svgString = getCleanExportSvgString(canvasRef);
    if (!svgString) return;

    const computedStyle = window.getComputedStyle(svgElement);
    const bgColor = computedStyle.backgroundColor || "#0b0b14";

    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    // Guard: revoke the blob URL and clean up listeners unconditionally after
    // 10 s. Without this timeout the URL leaks when the browser suspends image
    // decoding (background tab throttling, opaque SVG security policy, mobile
    // memory pressure) because neither onload nor onerror fires.
    const cleanupTimeout = setTimeout(() => {
      img.onload = null;
      img.onerror = null;
      URL.revokeObjectURL(url);
      console.warn(
        "exportAsPNG: image load timed out after 10 s — blob URL revoked"
      );
    }, 10_000);

    img.onload = () => {
      clearTimeout(cleanupTimeout);

      const canvas = document.createElement("canvas");
      canvas.width = 1000;
      canvas.height = 800;

      // getContext("2d") returns null when the browser has exhausted its canvas
      // context limit, the GPU process has crashed, or in headless environments.
      // Without this guard the next line throws TypeError and the blob URL leaks.
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        console.error(
          "exportAsPNG: 2D canvas context unavailable — too many open canvases or GPU unavailable"
        );
        return;
      }

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, 1000, 800);
      ctx.drawImage(img, 0, 0, 1000, 800);

      canvas.toBlob((pngBlob) => {
        if (!pngBlob) {
          URL.revokeObjectURL(url);
          return;
        }
        const pngUrl = URL.createObjectURL(pngBlob);
        const link = document.createElement("a");
        link.href = pngUrl;
        link.download = `eventra-floorplan-${eventId}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(pngUrl);
        URL.revokeObjectURL(url);
      }, "image/png");
    };

    img.onerror = () => {
      clearTimeout(cleanupTimeout);
      URL.revokeObjectURL(url);
      console.error("exportAsPNG: SVG image failed to load");
    };

    img.src = url;
  } catch (error) {
    console.error("PNG Export failed:", error);
  }
};

export const downloadLayoutJSON = (elements, eventId) => {
  try {
    const jsonBlob = new Blob([JSON.stringify(elements, null, 2)], { type: "application/json" });
    const jsonUrl = URL.createObjectURL(jsonBlob);
    const link = document.createElement("a");
    link.href = jsonUrl;
    link.download = `eventra-floorplan-${eventId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(jsonUrl);
  } catch (error) {
    console.error("JSON Export failed:", error);
  }
};

export const importLayoutJSON = (e, onImport) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const importedData = JSON.parse(event.target.result);
      if (!Array.isArray(importedData)) {
        throw new Error("Floor plan config layout must be a valid JSON array.");
      }
      const isValid = importedData.every(el =>
        el && typeof el === "object" && "id" in el && "type" in el && "x" in el && "y" in el
      );
      if (!isValid) {
        throw new Error("One or more grid elements are missing mandatory properties (id, type, x, y).");
      }
      onImport(importedData);
    } catch (err) {
      console.error("JSON import failed:", err);
    }
  };
  reader.readAsText(file);
  e.target.value = "";
};
