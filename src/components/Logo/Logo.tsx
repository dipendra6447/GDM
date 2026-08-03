"use client";
import React from 'react';
import './Logo.css';

interface LogoProps {
  size?: number;
  showText?: boolean;
  textColor?: 'default' | 'white';
}

export const LogoIcon: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="logo-globe-svg"
  >
    <defs>
      <radialGradient id="logoGlobeGrad" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#00D2FF" />
        <stop offset="45%" stopColor="#0072FF" />
        <stop offset="100%" stopColor="#0044CC" />
      </radialGradient>
      <linearGradient id="logoOrbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFDC00" />
        <stop offset="50%" stopColor="#FFB800" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
    </defs>

    {/* Back Orbit Rings */}
    <ellipse
      cx="50"
      cy="50"
      rx="43"
      ry="17"
      transform="rotate(-28 50 50)"
      stroke="url(#logoOrbitGrad)"
      strokeWidth="4.5"
      strokeDasharray="140"
      strokeDashoffset="42"
    />
    <ellipse
      cx="50"
      cy="50"
      rx="43"
      ry="17"
      transform="rotate(28 50 50)"
      stroke="url(#logoOrbitGrad)"
      strokeWidth="4.5"
      strokeDasharray="140"
      strokeDashoffset="42"
    />

    {/* Main Globe Sphere */}
    <circle cx="50" cy="50" r="30" fill="url(#logoGlobeGrad)" stroke="#0072FF" strokeWidth="1.5" />

    {/* Continents */}
    <path
      d="M38 30 C40 26 46 25 49 28 C52 32 47 36 44 40 C42 44 46 49 49 51 C51 53 47 59 44 63 C40 67 36 60 38 52 C36 46 34 38 38 30 Z"
      fill="#39D327"
    />
    <path
      d="M58 25 C64 23 71 28 68 34 C64 38 67 42 65 46 C62 48 59 41 58 37 C56 31 54 27 58 25 Z"
      fill="#39D327"
    />

    {/* Front Orbit Rings */}
    <ellipse
      cx="50"
      cy="50"
      rx="43"
      ry="17"
      transform="rotate(-28 50 50)"
      stroke="url(#logoOrbitGrad)"
      strokeWidth="4.5"
      strokeDasharray="140"
      strokeDashoffset="-65"
    />
    <ellipse
      cx="50"
      cy="50"
      rx="43"
      ry="17"
      transform="rotate(28 50 50)"
      stroke="url(#logoOrbitGrad)"
      strokeWidth="4.5"
      strokeDasharray="140"
      strokeDashoffset="-65"
    />
  </svg>
);

const Logo: React.FC<LogoProps> = ({ size = 36, showText = true, textColor = 'default' }) => {
  return (
    <div className="godiscover-logo-mark">
      <LogoIcon size={size} />
      {showText && (
        <span className={`godiscover-logo-text ${textColor === 'white' ? 'text-white' : ''}`}>
          <span className="logo-go">Go</span>
          <span className="logo-discover">Discover</span>
          <span className="logo-me">Me</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
