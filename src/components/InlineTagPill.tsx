import React from 'react';

interface InlineTagPillProps {
  label: string;
  accentColor?: string;
  secondaryAccentColor?: string;
  variant?: 'solid' | 'soft' | 'outline' | 'gradient';
  className?: string;
  size?: 'xs' | 'sm' | 'md';
}

export const InlineTagPill: React.FC<InlineTagPillProps> = ({
  label,
  accentColor = '#0284C7',
  secondaryAccentColor = '#E0F2FE',
  variant = 'soft',
  className = '',
  size = 'xs'
}) => {
  if (!label) return null;

  const sizeClasses = {
    xs: 'text-[8.5px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider',
    sm: 'text-[9.5px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider',
    md: 'text-[10.5px] px-2.5 py-1 rounded-full font-extrabold uppercase tracking-wide'
  }[size];

  const getStyle = (): React.CSSProperties => {
    switch (variant) {
      case 'solid':
        return {
          backgroundColor: accentColor,
          color: '#FFFFFF'
        };
      case 'outline':
        return {
          border: `1px solid ${accentColor}`,
          color: accentColor,
          backgroundColor: 'transparent'
        };
      case 'gradient':
        return {
          background: `linear-gradient(135deg, ${accentColor}, ${secondaryAccentColor})`,
          color: '#FFFFFF'
        };
      case 'soft':
      default:
        return {
          backgroundColor: secondaryAccentColor || `${accentColor}1A`,
          color: accentColor
        };
    }
  };

  return (
    <span
      className={`inline-flex items-center justify-center whitespace-nowrap shadow-2xs leading-none select-none ${sizeClasses} ${className}`}
      style={getStyle()}
    >
      {label}
    </span>
  );
};
