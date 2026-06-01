import { useEffect, useRef } from "react";

const ConfettiCanvas = ({ 
  particleCount = 150, 
  duration = 4000, 
  colors = ["#6366f1", "#a855f7", "#ec4899", "#10b981", "#3b82f6", "#f59e0b"] 
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height - 20,
        size: Math.random() * 8 + 4,
        speedX: Math.random() * 4 - 2,
        speedY: Math.random() * 3 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI,
        rotationSpeed: Math.random() * 0.05 - 0.025,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let finished = true;

      particles.forEach((p) => {
        if (p.y < canvas.height) {
          finished = false;
        }
        
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();

        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
      });

      if (!finished) {
        animationFrameId = requestAnimationFrame(draw);
      }
    };

    draw();

    const timer = setTimeout(() => {
      if (canvas) {
        canvas.style.opacity = "0";
        canvas.style.transition = "opacity 1.5s ease-out";
      }
    }, duration);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [particleCount, duration]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ mixBlendMode: "screen" }}
    />
  );
};

export default ConfettiCanvas;
