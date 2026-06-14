import './AuroraBackground.css';

/**
 * AuroraBackground renders three overlapping gradient layers that animate
 * gently to create an aurora‑like effect. The component is 
 * GPU‑friendly – it only uses CSS transforms and opacity changes.
 * It respects prefers‑reduced‑motion and switches to a static gradient.
 */
const AuroraBackground = () => {
  return (
    <div className="aurora-bg relative -z-10">
      <div className="aurora-layer layer-1" />
      <div className="aurora-layer layer-2" />
      <div className="aurora-layer layer-3" />
    </div>
  );
};

export default AuroraBackground;
