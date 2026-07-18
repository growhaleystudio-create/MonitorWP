import React from 'react';
import petImage from '../assets/ddo-zvzo.webp';

interface PetLoaderProps {
  size?: number;
  state?: 'idle' | 'running' | 'jumping' | 'waiting' | 'failed';
  text?: string;
}

export default function PetLoader({ size = 48, state = 'running', text }: PetLoaderProps) {
  const width = size;
  const height = Math.round(size * (208 / 192));
  
  let rowIndex = 7; // default running
  let frameCount = 6;
  let duration = '0.7s';

  if (state === 'idle') {
    rowIndex = 0;
    frameCount = 6;
    duration = '0.8s';
  } else if (state === 'jumping') {
    rowIndex = 4;
    frameCount = 5;
    duration = '0.6s';
  } else if (state === 'waiting') {
    rowIndex = 6;
    frameCount = 6;
    duration = '0.9s';
  } else if (state === 'failed') {
    rowIndex = 5;
    frameCount = 8;
    duration = '0.9s';
  }

  const scale = size / 192;
  const bgWidth = Math.round(1536 * scale);
  const bgHeight = Math.round(1872 * scale);
  const yOffset = Math.round(rowIndex * 208 * scale);
  const xEndOffset = Math.round(frameCount * 192 * scale);

  const animationName = `play-pet-${state}-${size}`;

  React.useEffect(() => {
    const styleId = `pet-style-${animationName}`;
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes ${animationName} {
          from { background-position-x: 0px; }
          to { background-position-x: -${xEndOffset}px; }
        }
      `;
      document.head.appendChild(style);
    }
  }, [animationName, xEndOffset]);

  return (
    <div className="flex flex-col items-center justify-center gap-3 select-none">
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
          backgroundImage: `url(${petImage})`,
          backgroundSize: `${bgWidth}px ${bgHeight}px`,
          backgroundPosition: `0px -${yOffset}px`,
          imageRendering: 'pixelated',
          animation: `${animationName} ${duration} steps(${frameCount}) infinite`,
        }}
      />
      {text && (
        <span className="text-[11px] font-black text-primary-teal uppercase tracking-widest animate-pulse">
          {text}
        </span>
      )}
    </div>
  );
}
