import React from 'react';
import FastMarquee from 'react-fast-marquee';

export default function Marquee() {
  const items = [
    'UPCOMING EVENTS',
    'VIP TABLES',
    'EXCLUSIVE BOOKING',
    'NEON NIGHTS',
    'GOLDEN LUXE',
    'TECHNO TEMPLE',
    'JOIN THE PARTY',
  ];

  return (
    <div className="py-4 bg-[#0A0A0A] border-y border-white/5" data-testid="marquee">
      <FastMarquee speed={50} gradient={false} pauseOnHover>
        {items.map((item, index) => (
          <span key={index} className="marquee-text mx-8">
            {item} <span>•</span>
          </span>
        ))}
      </FastMarquee>
    </div>
  );
}
