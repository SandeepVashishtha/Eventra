/**
 * CSS Houdini Sponsor Background Paint Worklet Class Source Code string exporter (#16281)
 */

export function getSponsorPaintWorkletSource() {
  return `
    class SponsorBackgroundWorklet {
      static get inputProperties() {
        return ['--sponsor-hover-x', '--sponsor-hover-y'];
      }

      paint(ctx, geom, properties) {
        const x = parseFloat(properties.get('--sponsor-hover-x').toString() || '0');
        const y = parseFloat(properties.get('--sponsor-hover-y').toString() || '0');

        const grad = ctx.createLinearGradient(0, 0, geom.width, geom.height);
        grad.addColorStop(0, 'rgba(30, 41, 59, 0.9)');
        grad.addColorStop(1, 'rgba(79, 70, 229, 0.4)');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, geom.width, geom.height);
      }
    }

    registerPaint('sponsorBackgroundWorklet', SponsorBackgroundWorklet);
  `;
}
