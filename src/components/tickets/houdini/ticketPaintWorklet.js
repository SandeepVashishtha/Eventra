/**
 * CSS Houdini Paint Worklet Class Source Code string exporter (#16271)
 */

export function getTicketPaintWorkletSource() {
  return `
    class TicketPaintWorklet {
      static get inputProperties() {
        return ['--ticket-glow-x', '--ticket-glow-y'];
      }

      paint(ctx, geom, properties) {
        const x = parseFloat(properties.get('--ticket-glow-x').toString() || '0');
        const y = parseFloat(properties.get('--ticket-glow-y').toString() || '0');

        const grad = ctx.createRadialGradient(
          (x / 100) * geom.width,
          (y / 100) * geom.height,
          0,
          (x / 100) * geom.width,
          (y / 100) * geom.height,
          geom.width * 0.6
        );

        grad.addColorStop(0, 'rgba(99, 102, 241, 0.2)');
        grad.addColorStop(1, 'rgba(15, 23, 42, 0.05)');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, geom.width, geom.height);
      }
    }

    registerPaint('ticketPaintWorklet', TicketPaintWorklet);
  `;
}
