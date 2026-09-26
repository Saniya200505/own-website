'use client';

import { useEffect, useRef } from 'react';
import { loadThree } from '../lib/loadThree';
import initButterfly from '../lib/initButterfly';

/* the butterfly that follows the reader (assets/butterfly.glb) */
export default function Butterfly() {
  const canvasRef = useRef(null);

  useEffect(() => {
    let cleanup = null, cancelled = false;
    loadThree().then(() => {
      if (!cancelled) cleanup = initButterfly(canvasRef.current);
    });
    return () => { cancelled = true; if (cleanup) cleanup(); };
  }, []);

  return <canvas className="butterfly" id="butterflyCanvas" ref={canvasRef} aria-hidden="true"></canvas>;
}
