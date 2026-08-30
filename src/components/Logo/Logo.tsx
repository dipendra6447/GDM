"use client";
import React from 'react';
import Image from 'next/image';
import './Logo.css';

interface LogoProps {
  size?: number;
  showText?: boolean;
  textColor?: 'default' | 'white';
  className?: string;
}

export const LogoIcon: React.FC<{ size?: number; className?: string }> = ({ size = 36, className = '' }) => (
  <Image
    src="/images/logo_icon.png"
    alt="GoDiscoverMe Icon"
    width={size}
    height={size}
    className={`godiscover-logo-icon-img ${className}`}
    style={{ objectFit: 'contain', width: `${size}px`, height: 'auto', maxHeight: `${size}px` }}
    priority
  />
);

const Logo: React.FC<LogoProps> = ({
  size = 36,
  showText = true,
  textColor = 'default',
  className = '',
}) => {
  const width = Math.round(size * 5.146);

  if (!showText) {
    return (
      <div className={`godiscover-logo-mark ${className}`}>
        <LogoIcon size={size} />
      </div>
    );
  }

  return (
    <div className={`godiscover-logo-mark ${textColor === 'white' ? 'logo-theme-dark' : ''} ${className}`}>
      <Image
        src="/images/logo.png"
        alt="GoDiscoverMe"
        width={width}
        height={size}
        className="godiscover-logo-full-img"
        style={{
          height: `${size}px`,
          width: 'auto',
          maxWidth: '100%',
          objectFit: 'contain',
          display: 'block',
        }}
        priority
      />
    </div>
  );
};

export default Logo;

