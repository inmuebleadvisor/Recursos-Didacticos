import React, { useEffect, useRef } from 'react';
import ConfettiGenerator from "confetti-js";

export const Confetti = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const confettiSettings = { target: 'my-canvas', max: 150, size: 2, animate: true, props: ['circle', 'square', 'triangle', 'line'], colors: [[165,104,246],[230,61,135],[0,199,228],[253,214,126]] };
    const confetti = new ConfettiGenerator(confettiSettings);
    confetti.render();

    return () => confetti.clear();
  }, []);

  return <canvas id="my-canvas" ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none z-50" />;
};