import "./WaveBanner.css";

// Builds a smooth, evenly-periodic sine-like path so two copies placed
// side by side loop seamlessly when scrolled.
function buildWavePath(width, amplitude, period, baseline) {
  let d = `M0,${baseline}`;
  let x = 0;
  let up = true;
  while (x < width) {
    const cx = x + period / 4;
    const cy = up ? baseline - amplitude : baseline + amplitude;
    x += period / 2;
    d += ` Q${cx},${cy} ${x},${baseline}`;
    up = !up;
  }
  return d;
}

const WIDTH = 800;
const PATH = buildWavePath(WIDTH, 26, 160, 60);

export default function WaveBanner({ intensity = "idle" }) {
  return (
    <svg
      className={`wave-banner wave-banner-${intensity}`}
      viewBox={`0 0 ${WIDTH} 120`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="waveGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2f8cff" stopOpacity="0" />
          <stop offset="18%" stopColor="#2f8cff" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#6fd0ff" stopOpacity="1" />
          <stop offset="82%" stopColor="#2f8cff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#2f8cff" stopOpacity="0" />
        </linearGradient>
        <filter id="waveGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g className="wave-banner-scroll">
        <path d={PATH} fill="none" stroke="url(#waveGradient)" strokeWidth="2.5" filter="url(#waveGlow)" />
        <path
          d={PATH}
          fill="none"
          stroke="url(#waveGradient)"
          strokeWidth="2.5"
          filter="url(#waveGlow)"
          transform={`translate(${WIDTH}, 0)`}
        />
      </g>
    </svg>
  );
}
