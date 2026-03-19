import React from 'react';

interface SocietyXpressIconProps {
  className?: string;
  size?: number;
}

const SocietyXpressIcon: React.FC<SocietyXpressIconProps> = ({ className = "", size = 40 }) => {
  return (
    <img 
      src="/SocietyXpress_IconOnly.png"
      alt="SocietyXpress"
      width={size} 
      height={size}
      className={className}
    />
  );
};

export default SocietyXpressIcon;