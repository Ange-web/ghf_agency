import React, { useState, useEffect } from 'react';

export default function CountdownTimer({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = new Date(targetDate) - new Date();
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const formatNumber = (num) => String(num).padStart(2, '0');

  return (
    <div className="flex gap-3 md:gap-4" data-testid="countdown-timer">
      <div className="countdown-item text-center rounded-lg">
        <div className="countdown-number">{formatNumber(timeLeft.days)}</div>
        <div className="text-xs text-white/50 uppercase tracking-wider mt-1">Jours</div>
      </div>
      <div className="countdown-item text-center rounded-lg">
        <div className="countdown-number">{formatNumber(timeLeft.hours)}</div>
        <div className="text-xs text-white/50 uppercase tracking-wider mt-1">Heures</div>
      </div>
      <div className="countdown-item text-center rounded-lg">
        <div className="countdown-number">{formatNumber(timeLeft.minutes)}</div>
        <div className="text-xs text-white/50 uppercase tracking-wider mt-1">Min</div>
      </div>
      <div className="countdown-item text-center rounded-lg">
        <div className="countdown-number">{formatNumber(timeLeft.seconds)}</div>
        <div className="text-xs text-white/50 uppercase tracking-wider mt-1">Sec</div>
      </div>
    </div>
  );
}
