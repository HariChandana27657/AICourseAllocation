/**
 * ParallaxBackground
 * Renders a multi-layer 2.5D landscape with:
 *  - Sky gradient
 *  - Drifting clouds (pan)
 *  - Far mountains (slow parallax + breathe)
 *  - Mid hills (medium parallax)
 *  - Trees (faster parallax + rock)
 *  - Foreground grass (fastest + sway)
 *  - Floating decorative blobs (existing ribbon style)
 */
export default function ParallaxBackground() {
  return (
    <div className="parallax-scene select-none" aria-hidden="true">

      {/* ── Layer 0: Sky blobs (slowest) ── */}
      <div className="parallax-layer parallax-sky" style={{ top: 0, height: '100%' }}>
        <div className="ribbon-pink delay-1 animate-wave"
          style={{ top: '-15%', right: '-10%', width: 700, height: 700, position: 'absolute', borderRadius: '50%', opacity: 0.12 }} />
        <div className="ribbon-blue delay-3 animate-float"
          style={{ bottom: '-15%', left: '-10%', width: 600, height: 600, position: 'absolute', borderRadius: '50%', opacity: 0.12 }} />
        <div className="ribbon-yellow delay-5 animate-wave"
          style={{ top: '30%', left: '40%', width: 400, height: 400, position: 'absolute', borderRadius: '50%', opacity: 0.10 }} />
      </div>

      {/* ── Layer 1: Drifting clouds (pan) ── */}
      <div className="parallax-layer" style={{ top: '4%' }}>
        {/* Cloud 1 */}
        <svg className="cloud-drift delay-1 absolute" style={{ top: 20, left: 0, width: 180, opacity: 0.35 }}
          viewBox="0 0 180 60" fill="none">
          <ellipse cx="90" cy="40" rx="80" ry="22" fill="#FFB3C6" />
          <ellipse cx="60" cy="32" rx="44" ry="28" fill="#FFB3C6" />
          <ellipse cx="120" cy="30" rx="38" ry="24" fill="#FFB3C6" />
        </svg>
        {/* Cloud 2 */}
        <svg className="cloud-drift-slow delay-4 absolute" style={{ top: 50, left: '20%', width: 140, opacity: 0.25 }}
          viewBox="0 0 140 50" fill="none">
          <ellipse cx="70" cy="34" rx="60" ry="18" fill="#93C5FD" />
          <ellipse cx="46" cy="26" rx="34" ry="22" fill="#93C5FD" />
          <ellipse cx="100" cy="24" rx="30" ry="18" fill="#93C5FD" />
        </svg>
        {/* Cloud 3 */}
        <svg className="cloud-drift-fast delay-2 absolute" style={{ top: 10, left: '55%', width: 200, opacity: 0.20 }}
          viewBox="0 0 200 65" fill="none">
          <ellipse cx="100" cy="44" rx="90" ry="24" fill="#f3fd8aff" />
          <ellipse cx="68"  cy="34" rx="50" ry="30" fill="#FDE68A" />
          <ellipse cx="140" cy="32" rx="44" ry="26" fill="#FDE68A" />
        </svg>
      </div>

      {/* ── Layer 2: Far mountains (slow parallax + breathe) ── */}
      <div className="parallax-layer parallax-mountains mountain-breathe" style={{ bottom: 0 }}>
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none"
          style={{ width: '100%', height: 320, display: 'block', opacity: 0.10 }}>
          <path d="M0,320 L0,180 L120,80 L240,160 L360,60 L480,140 L600,40 L720,120 L840,50 L960,130 L1080,70 L1200,150 L1320,90 L1440,160 L1440,320 Z"
            fill="url(#mtnGrad1)" />
          <defs>
            <linearGradient id="mtnGrad1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF9AB7" />
              <stop offset="100%" stopColor="#FFD1DC" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ── Layer 3: Mid hills (medium parallax) ── */}
      <div className="parallax-layer parallax-hills" style={{ bottom: 0 }}>
        <svg viewBox="0 0 1440 260" preserveAspectRatio="none"
          style={{ width: '100%', height: 260, display: 'block', opacity: 0.10 }}>
          <path d="M0,260 L0,160 Q180,60 360,140 Q540,220 720,100 Q900,0 1080,120 Q1260,220 1440,140 L1440,260 Z"
            fill="url(#hillGrad)" />
          <defs>
            <linearGradient id="hillGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#93C5FD" />
              <stop offset="100%" stopColor="#BAE6FD" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ── Layer 4: Trees (faster parallax + rock) ── */}
      <div className="parallax-layer parallax-trees" style={{ bottom: 0 }}>
        <svg viewBox="0 0 1440 200" preserveAspectRatio="none"
          style={{ width: '100%', height: 200, display: 'block', opacity: 0.09 }}>
          {/* Row of stylised pine trees */}
          {[60,160,260,360,460,560,660,760,860,960,1060,1160,1260,1360].map((x, i) => (
            <g key={x} className="tree-rock" style={{ animationDelay: `${i * 0.3}s` }}>
              <polygon points={`${x},200 ${x - 28},130 ${x + 28},130`} fill="#FF9AB7" opacity="0.7" />
              <polygon points={`${x},145 ${x - 22},90  ${x + 22},90`}  fill="#FF9AB7" opacity="0.9" />
              <polygon points={`${x},105 ${x - 16},60  ${x + 16},60`}  fill="#FF9AB7" />
              <rect x={x - 5} y={190} width={10} height={10} fill="#FFB3C6" opacity="0.6" />
            </g>
          ))}
        </svg>
      </div>

      {/* ── Layer 5: Foreground grass waves (fastest + sway) ── */}
      <div className="parallax-layer parallax-foreground" style={{ bottom: 0 }}>
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none"
          style={{ width: '100%', height: 120, display: 'block', opacity: 0.10 }}>
          <path className="grass-sway"
            d="M0,120 L0,80 Q90,20 180,70 Q270,110 360,50 Q450,0 540,60 Q630,110 720,45 Q810,0 900,55 Q990,110 1080,50 Q1170,0 1260,60 Q1350,110 1440,70 L1440,120 Z"
            fill="url(#grassGrad)" />
          <defs>
            <linearGradient id="grassGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="100%" stopColor="#FEF3C7" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ── Floating isometric diamond accents ── */}
      <svg className="parallax-layer parallax-zoom delay-2 absolute"
        style={{ top: '10%', right: '5%', width: 80, height: 80, opacity: 0.12 }}
        viewBox="0 0 80 80">
        <polygon points="40,4 76,40 40,76 4,40" fill="none" stroke="#ffdf9aff" strokeWidth="3" />
        <polygon points="40,16 64,40 40,64 16,40" fill="none" stroke="#93fdbdff" strokeWidth="2" />
      </svg>

      <svg className="parallax-layer parallax-zoom delay-5 absolute"
        style={{ bottom: '15%', left: '3%', width: 60, height: 60, opacity: 0.12 }}
        viewBox="0 0 60 60">
        <polygon points="30,3 57,30 30,57 3,30" fill="none" stroke="#FDE68A" strokeWidth="3" />
      </svg>

      {/* ── Dotted grid overlay (subtle depth texture) ── */}
      <svg className="parallax-layer" style={{ inset: 0, width: '100%', height: '100%', opacity: 0.04, position: 'absolute' }}>
        <defs>
          <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="2" fill="#a9ff9aff" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>

    </div>
  );
}
