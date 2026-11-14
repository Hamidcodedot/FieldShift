import React from 'react';

interface NasaLogoProps {
  className?: string;
  showText?: boolean;
  label?: string;
}

/**
 * Official NASA "Meatball" Insignia SVG component.
 * Renders the deep-blue sphere (#0B3D91), red aerodynamic vector (#FC3D21),
 * white orbital trajectory, starfield, and NASA wordmark.
 */
export const NasaLogo: React.FC<NasaLogoProps> = ({
  className = 'h-6 w-6',
  showText = false,
  label = 'NASA Earth Observations',
}) => {
  return (
    <span className="inline-flex items-center gap-1.5 shrink-0">
      <svg
        viewBox="0 0 110 92"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        role="img"
        aria-label="NASA Insignia"
      >
        {/* Deep Space Blue Sphere */}
        <circle cx="54" cy="46" r="42" fill="#0B3D91" />

        {/* Subtle Starfield */}
        <circle cx="34" cy="24" r="1.3" fill="#FFFFFF" opacity="0.9" />
        <circle cx="44" cy="18" r="1" fill="#FFFFFF" opacity="0.8" />
        <circle cx="67" cy="22" r="1.2" fill="#FFFFFF" opacity="0.9" />
        <circle cx="75" cy="31" r="0.9" fill="#FFFFFF" opacity="0.75" />
        <circle cx="32" cy="64" r="1.1" fill="#FFFFFF" opacity="0.85" />
        <circle cx="66" cy="70" r="1.2" fill="#FFFFFF" opacity="0.85" />
        <circle cx="50" cy="75" r="0.9" fill="#FFFFFF" opacity="0.7" />

        {/* White Orbital Trajectory Ring */}
        <ellipse
          cx="54"
          cy="47"
          rx="44"
          ry="13"
          transform="rotate(-24 54 47)"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.4"
          opacity="0.95"
        />

        {/* Red Aerodynamic Chevron / Vector */}
        <path
          d="M11 66 L52 17 L64 46 L98 20 L62 56 L49 32 Z"
          fill="#FC3D21"
        />

        {/* Bold NASA Wordmark */}
        <text
          x="54"
          y="53"
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontWeight="900"
          fontSize="21"
          letterSpacing="1.5"
        >
          NASA
        </text>
      </svg>

      {showText && (
        <span className="font-montserrat font-bold tracking-tight">
          {label}
        </span>
      )}
    </span>
  );
};

export default NasaLogo;
