
import React from 'react';

interface LogoProps {
  variant?: 'wordmark' | 'monogram' | 'icon';
  className?: string;
  color?: string;
  // Added onClick handler to support clickable logos
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({ 
  variant = 'wordmark', 
  className = 'h-8', 
  color = '#7D6B5D',
  onClick
}) => {
  // Shared props for the SVG elements
  const commonProps = {
    className,
    onClick,
    style: onClick ? { cursor: 'pointer' } : undefined
  };

  if (variant === 'monogram') {
    return (
      <svg 
        viewBox="0 0 100 100" 
        {...commonProps}
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Everalume Monogram"
      >
        <text 
          x="50%" 
          y="50%" 
          dominantBaseline="middle" 
          textAnchor="middle" 
          fill={color} 
          style={{ 
            fontFamily: "'Playfair Display', serif", 
            fontSize: '60px', 
            fontWeight: 400,
            letterSpacing: '-0.05em'
          }}
        >
          EL
        </text>
        <path 
          d="M20 50H80" 
          stroke={color} 
          strokeWidth="0.5" 
          strokeOpacity="0.3"
        />
      </svg>
    );
  }

  if (variant === 'icon') {
    return (
      <svg 
        viewBox="0 0 100 100" 
        {...commonProps}
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Everalume Icon"
      >
        <rect width="100" height="100" rx="4" fill={color} fillOpacity="0.05" />
        <text 
          x="50%" 
          y="52%" 
          dominantBaseline="middle" 
          textAnchor="middle" 
          fill={color} 
          style={{ 
            fontFamily: "'Playfair Display', serif", 
            fontSize: '50px', 
            fontWeight: 700,
            fontStyle: 'italic'
          }}
        >
          E
        </text>
      </svg>
    );
  }

  // Primary Wordmark with the cinematic arc
  return (
    <svg 
      viewBox="0 0 400 160" 
      {...commonProps}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Everalume Wordmark"
    >
      <defs>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0" />
          <stop offset="50%" stopColor={color} stopOpacity="0.8" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {/* The cinematic light arc */}
      <path 
        d="M60 90 Q200 10 340 90" 
        stroke="url(#arcGradient)" 
        strokeWidth="1.5" 
        fill="none" 
        filter="url(#glow)"
        opacity="0.6"
      />
      
      <text 
        x="50%" 
        y="110" 
        dominantBaseline="middle" 
        textAnchor="middle" 
        fill={color} 
        style={{ 
          fontFamily: "'Playfair Display', serif", 
          fontSize: '56px', 
          fontWeight: 400,
          letterSpacing: '0.08em'
        }}
      >
        Everalume
      </text>
      
      {/* Refined baseline accent */}
      <rect 
        x="130" 
        y="135" 
        width="140" 
        height="0.5" 
        fill={color} 
        fillOpacity="0.2" 
      />
    </svg>
  );
};
