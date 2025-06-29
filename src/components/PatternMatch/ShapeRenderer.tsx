import React from 'react';
import { Shape, Pattern } from './types';

interface ShapeRendererProps {
  shape: Shape;
  pattern: Pattern;
  size?: string;
  rotation?: number;
}

const ShapeRenderer: React.FC<ShapeRendererProps> = ({ 
  shape, 
  pattern, 
  size = "w-16 h-16",
  rotation = 0 
}) => {
  const style = rotation ? { transform: `rotate(${rotation}deg)` } : {};
  
  // SVG Dots pattern for all shapes
  if (pattern === 'dots' && (shape === 'circle' || shape === 'square' || shape === 'triangle' || shape === 'hexagon' || shape === 'star')) {
    if (shape === 'triangle') {
      return (
        <svg className={size} viewBox="0 0 64 64" style={{ display: 'block', ...style }}>
          <defs>
            <clipPath id="shape-clip-triangle">
              <polygon points="32,8 8,56 56,56" />
            </clipPath>
          </defs>
          <g clipPath="url(#shape-clip-triangle)">
            {[...Array(6)].map((_, row) =>
              [...Array(6)].map((_, col) => (
                <circle
                  key={`${row}-${col}`}
                  cx={12 + col * 8}
                  cy={12 + row * 8}
                  r={2}
                  fill="#333"
                />
              ))
            )}
          </g>
          <polygon points="32,8 8,56 56,56" fill="none" stroke="#333" strokeWidth="3" />
        </svg>
      );
    }
    if (shape === 'hexagon') {
      return (
        <svg className={size} viewBox="0 0 64 64" style={{ display: 'block', ...style }}>
          <defs>
            <clipPath id="shape-clip-hexagon">
              <polygon points="16,8 48,8 60,32 48,56 16,56 4,32" />
            </clipPath>
          </defs>
          <g clipPath="url(#shape-clip-hexagon)">
            {[...Array(6)].map((_, row) =>
              [...Array(6)].map((_, col) => (
                <circle
                  key={`${row}-${col}`}
                  cx={12 + col * 8}
                  cy={12 + row * 8}
                  r={2}
                  fill="#333"
                />
              ))
            )}
          </g>
          <polygon points="16,8 48,8 60,32 48,56 16,56 4,32" fill="none" stroke="#333" strokeWidth="3" />
        </svg>
      );
    }
    if (shape === 'star') {
      return (
        <svg className={size} viewBox="0 0 64 64" style={{ display: 'block', ...style }}>
          <defs>
            <clipPath id="shape-clip-star">
              <polygon points="32,8 39,26 58,26 42,38 48,56 32,45 16,56 22,38 6,26 25,26" />
            </clipPath>
          </defs>
          <g clipPath="url(#shape-clip-star)">
            {[...Array(6)].map((_, row) =>
              [...Array(6)].map((_, col) => (
                <circle
                  key={`${row}-${col}`}
                  cx={12 + col * 8}
                  cy={12 + row * 8}
                  r={2}
                  fill="#333"
                />
              ))
            )}
          </g>
          <polygon points="32,8 39,26 58,26 42,38 48,56 32,45 16,56 22,38 6,26 25,26" fill="none" stroke="#333" strokeWidth="3" />
        </svg>
      );
    }
    return (
      <svg
        className={size}
        viewBox="0 0 64 64"
        style={{ display: 'block', ...style }}
      >
        <defs>
          <clipPath id={`shape-clip-${shape}`}> 
            {shape === 'circle' && <circle cx="32" cy="32" r="28" />}
            {shape === 'square' && <rect x="8" y="8" width="48" height="48" rx="0" />}
          </clipPath>
        </defs>
        <g clipPath={`url(#shape-clip-${shape})`}>
          {[...Array(6)].map((_, row) =>
            [...Array(6)].map((_, col) => (
              <circle
                key={`${row}-${col}`}
                cx={12 + col * 8}
                cy={12 + row * 8}
                r={2}
                fill="#333"
              />
            ))
          )}
        </g>
        {shape === 'circle' && <circle cx="32" cy="32" r="28" fill="none" stroke="#333" strokeWidth="3" />}
        {shape === 'square' && <rect x="8" y="8" width="48" height="48" rx="0" fill="none" stroke="#333" strokeWidth="3" />}
      </svg>
    );
  }

  // Stripes pattern
  if (pattern === 'stripes') {
    if (shape === 'triangle') {
      return (
        <svg className={size} viewBox="0 0 64 64" style={{ display: 'block', ...style }}>
          <defs>
            <clipPath id="shape-clip-triangle-stripes">
              <polygon points="32,8 8,56 56,56" />
            </clipPath>
          </defs>
          <g clipPath="url(#shape-clip-triangle-stripes)">
            {[...Array(8)].map((_, i) => (
              <rect
                key={i}
                x={8 + i * 6}
                y={8}
                width="3"
                height="48"
                fill="#333"
              />
            ))}
          </g>
          <polygon points="32,8 8,56 56,56" fill="none" stroke="#333" strokeWidth="3" />
        </svg>
      );
    }
    if (shape === 'hexagon') {
      return (
        <svg className={size} viewBox="0 0 64 64" style={{ display: 'block', ...style }}>
          <defs>
            <clipPath id="shape-clip-hexagon-stripes">
              <polygon points="16,8 48,8 60,32 48,56 16,56 4,32" />
            </clipPath>
          </defs>
          <g clipPath="url(#shape-clip-hexagon-stripes)">
            {[...Array(8)].map((_, i) => (
              <rect
                key={i}
                x={4 + i * 7}
                y={8}
                width="3"
                height="48"
                fill="#333"
              />
            ))}
          </g>
          <polygon points="16,8 48,8 60,32 48,56 16,56 4,32" fill="none" stroke="#333" strokeWidth="3" />
        </svg>
      );
    }
    if (shape === 'star') {
      return (
        <svg className={size} viewBox="0 0 64 64" style={{ display: 'block', ...style }}>
          <defs>
            <clipPath id="shape-clip-star-stripes">
              <polygon points="32,8 39,26 58,26 42,38 48,56 32,45 16,56 22,38 6,26 25,26" />
            </clipPath>
          </defs>
          <g clipPath="url(#shape-clip-star-stripes)">
            {[...Array(8)].map((_, i) => (
              <rect
                key={i}
                x={6 + i * 7}
                y={8}
                width="3"
                height="48"
                fill="#333"
              />
            ))}
          </g>
          <polygon points="32,8 39,26 58,26 42,38 48,56 32,45 16,56 22,38 6,26 25,26" fill="none" stroke="#333" strokeWidth="3" />
        </svg>
      );
    }
    return (
      <svg
        className={size}
        viewBox="0 0 64 64"
        style={{ display: 'block', ...style }}
      >
        <defs>
          <clipPath id={`shape-clip-${shape}-stripes`}> 
            {shape === 'circle' && <circle cx="32" cy="32" r="28" />}
            {shape === 'square' && <rect x="8" y="8" width="48" height="48" rx="0" />}
          </clipPath>
        </defs>
        <g clipPath={`url(#shape-clip-${shape}-stripes)`}>
          {[...Array(8)].map((_, i) => (
            <rect
              key={i}
              x={8 + i * 6}
              y={8}
              width="3"
              height="48"
              fill="#333"
            />
          ))}
        </g>
        {shape === 'circle' && <circle cx="32" cy="32" r="28" fill="none" stroke="#333" strokeWidth="3" />}
        {shape === 'square' && <rect x="8" y="8" width="48" height="48" rx="0" fill="none" stroke="#333" strokeWidth="3" />}
      </svg>
    );
  }

  // Checkered pattern
  if (pattern === 'checkered') {
    if (shape === 'triangle') {
      return (
        <svg className={size} viewBox="0 0 64 64" style={{ display: 'block', ...style }}>
          <defs>
            <clipPath id="shape-clip-triangle-checkered">
              <polygon points="32,8 8,56 56,56" />
            </clipPath>
          </defs>
          <g clipPath="url(#shape-clip-triangle-checkered)">
            {[...Array(8)].map((_, row) =>
              [...Array(8)].map((_, col) => (
                <rect
                  key={`${row}-${col}`}
                  x={8 + col * 6}
                  y={8 + row * 6}
                  width="6"
                  height="6"
                  fill={(row + col) % 2 === 0 ? "#333" : "transparent"}
                />
              ))
            )}
          </g>
          <polygon points="32,8 8,56 56,56" fill="none" stroke="#333" strokeWidth="3" />
        </svg>
      );
    }
    if (shape === 'hexagon') {
      return (
        <svg className={size} viewBox="0 0 64 64" style={{ display: 'block', ...style }}>
          <defs>
            <clipPath id="shape-clip-hexagon-checkered">
              <polygon points="16,8 48,8 60,32 48,56 16,56 4,32" />
            </clipPath>
          </defs>
          <g clipPath="url(#shape-clip-hexagon-checkered)">
            {[...Array(8)].map((_, row) =>
              [...Array(8)].map((_, col) => (
                <rect
                  key={`${row}-${col}`}
                  x={4 + col * 7}
                  y={8 + row * 6}
                  width="7"
                  height="6"
                  fill={(row + col) % 2 === 0 ? "#333" : "transparent"}
                />
              ))
            )}
          </g>
          <polygon points="16,8 48,8 60,32 48,56 16,56 4,32" fill="none" stroke="#333" strokeWidth="3" />
        </svg>
      );
    }
    if (shape === 'star') {
      return (
        <svg className={size} viewBox="0 0 64 64" style={{ display: 'block', ...style }}>
          <defs>
            <clipPath id="shape-clip-star-checkered">
              <polygon points="32,8 39,26 58,26 42,38 48,56 32,45 16,56 22,38 6,26 25,26" />
            </clipPath>
          </defs>
          <g clipPath="url(#shape-clip-star-checkered)">
            {[...Array(8)].map((_, row) =>
              [...Array(8)].map((_, col) => (
                <rect
                  key={`${row}-${col}`}
                  x={6 + col * 7}
                  y={8 + row * 6}
                  width="7"
                  height="6"
                  fill={(row + col) % 2 === 0 ? "#333" : "transparent"}
                />
              ))
            )}
          </g>
          <polygon points="32,8 39,26 58,26 42,38 48,56 32,45 16,56 22,38 6,26 25,26" fill="none" stroke="#333" strokeWidth="3" />
        </svg>
      );
    }
    return (
      <svg
        className={size}
        viewBox="0 0 64 64"
        style={{ display: 'block', ...style }}
      >
        <defs>
          <clipPath id={`shape-clip-${shape}-checkered`}> 
            {shape === 'circle' && <circle cx="32" cy="32" r="28" />}
            {shape === 'square' && <rect x="8" y="8" width="48" height="48" rx="0" />}
          </clipPath>
        </defs>
        <g clipPath={`url(#shape-clip-${shape}-checkered)`}>
          {[...Array(8)].map((_, row) =>
            [...Array(8)].map((_, col) => (
              <rect
                key={`${row}-${col}`}
                x={8 + col * 6}
                y={8 + row * 6}
                width="6"
                height="6"
                fill={(row + col) % 2 === 0 ? "#333" : "transparent"}
              />
            ))
          )}
        </g>
        {shape === 'circle' && <circle cx="32" cy="32" r="28" fill="none" stroke="#333" strokeWidth="3" />}
        {shape === 'square' && <rect x="8" y="8" width="48" height="48" rx="0" fill="none" stroke="#333" strokeWidth="3" />}
      </svg>
    );
  }

  // Solid pattern
  if (pattern === 'solid') {
    if (shape === 'triangle') {
      return (
        <svg className={size} viewBox="0 0 64 64" style={{ display: 'block', ...style }}>
          <polygon points="32,8 8,56 56,56" fill="#333" stroke="#333" strokeWidth="3" />
        </svg>
      );
    }
    if (shape === 'hexagon') {
      return (
        <svg className={size} viewBox="0 0 64 64" style={{ display: 'block', ...style }}>
          <polygon points="16,8 48,8 60,32 48,56 16,56 4,32" fill="#333" stroke="#333" strokeWidth="3" />
        </svg>
      );
    }
    if (shape === 'star') {
      return (
        <svg className={size} viewBox="0 0 64 64" style={{ display: 'block', ...style }}>
          <polygon points="32,8 39,26 58,26 42,38 48,56 32,45 16,56 22,38 6,26 25,26" fill="#333" stroke="#333" strokeWidth="3" />
        </svg>
      );
    }
    return (
      <svg
        className={size}
        viewBox="0 0 64 64"
        style={{ display: 'block', ...style }}
      >
        {shape === 'circle' && <circle cx="32" cy="32" r="28" fill="#333" stroke="#333" strokeWidth="3" />}
        {shape === 'square' && <rect x="8" y="8" width="48" height="48" rx="0" fill="#333" stroke="#333" strokeWidth="3" />}
      </svg>
    );
  }

  // Zigzag pattern
  if (pattern === 'zigzag') {
    if (shape === 'triangle') {
      return (
        <svg className={size} viewBox="0 0 64 64" style={{ display: 'block', ...style }}>
          <defs>
            <clipPath id="shape-clip-triangle-zigzag">
              <polygon points="32,8 8,56 56,56" />
            </clipPath>
          </defs>
          <g clipPath="url(#shape-clip-triangle-zigzag)">
            {[...Array(6)].map((_, i) => (
              <path
                key={i}
                d={`M ${8 + i * 8} ${12 + i * 8} L ${16 + i * 8} ${20 + i * 8} L ${24 + i * 8} ${12 + i * 8}`}
                stroke="#333"
                strokeWidth="2"
                fill="none"
              />
            ))}
          </g>
          <polygon points="32,8 8,56 56,56" fill="none" stroke="#333" strokeWidth="3" />
        </svg>
      );
    }
    if (shape === 'hexagon') {
      return (
        <svg className={size} viewBox="0 0 64 64" style={{ display: 'block', ...style }}>
          <defs>
            <clipPath id="shape-clip-hexagon-zigzag">
              <polygon points="16,8 48,8 60,32 48,56 16,56 4,32" />
            </clipPath>
          </defs>
          <g clipPath="url(#shape-clip-hexagon-zigzag)">
            {[...Array(6)].map((_, i) => (
              <path
                key={i}
                d={`M ${4 + i * 9} ${12 + i * 8} L ${13 + i * 9} ${20 + i * 8} L ${22 + i * 9} ${12 + i * 8}`}
                stroke="#333"
                strokeWidth="2"
                fill="none"
              />
            ))}
          </g>
          <polygon points="16,8 48,8 60,32 48,56 16,56 4,32" fill="none" stroke="#333" strokeWidth="3" />
        </svg>
      );
    }
    if (shape === 'star') {
      return (
        <svg className={size} viewBox="0 0 64 64" style={{ display: 'block', ...style }}>
          <defs>
            <clipPath id="shape-clip-star-zigzag">
              <polygon points="32,8 39,26 58,26 42,38 48,56 32,45 16,56 22,38 6,26 25,26" />
            </clipPath>
          </defs>
          <g clipPath="url(#shape-clip-star-zigzag)">
            {[...Array(6)].map((_, i) => (
              <path
                key={i}
                d={`M ${6 + i * 9} ${12 + i * 8} L ${15 + i * 9} ${20 + i * 8} L ${24 + i * 9} ${12 + i * 8}`}
                stroke="#333"
                strokeWidth="2"
                fill="none"
              />
            ))}
          </g>
          <polygon points="32,8 39,26 58,26 42,38 48,56 32,45 16,56 22,38 6,26 25,26" fill="none" stroke="#333" strokeWidth="3" />
        </svg>
      );
    }
    return (
      <svg
        className={size}
        viewBox="0 0 64 64"
        style={{ display: 'block', ...style }}
      >
        <defs>
          <clipPath id={`shape-clip-${shape}-zigzag`}> 
            {shape === 'circle' && <circle cx="32" cy="32" r="28" />}
            {shape === 'square' && <rect x="8" y="8" width="48" height="48" rx="0" />}
          </clipPath>
        </defs>
        <g clipPath={`url(#shape-clip-${shape}-zigzag)`}>
          {[...Array(6)].map((_, i) => (
            <path
              key={i}
              d={`M ${8 + i * 8} ${12 + i * 8} L ${16 + i * 8} ${20 + i * 8} L ${24 + i * 8} ${12 + i * 8}`}
              stroke="#333"
              strokeWidth="2"
              fill="none"
            />
          ))}
        </g>
        {shape === 'circle' && <circle cx="32" cy="32" r="28" fill="none" stroke="#333" strokeWidth="3" />}
        {shape === 'square' && <rect x="8" y="8" width="48" height="48" rx="0" fill="none" stroke="#333" strokeWidth="3" />}
      </svg>
    );
  }

  // Fallback for unknown patterns
  return (
    <div className={`${size} border-3 border-gray-800 flex items-center justify-center shadow-lg`} style={style}>
      <span className="text-gray-600 text-xs">{shape}</span>
    </div>
  );
};

export default ShapeRenderer; 