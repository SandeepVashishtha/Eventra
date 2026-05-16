"use client";

import React, { useState, useEffect } from 'react';

export default function CountdownTimer({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    if (!targetDate) return;

    const calculateTime = () => {
      const difference = +new Date(targetDate) - +new Date();
      
      if (difference <= 0) {
        setTimeLeft((prev) => ({ ...prev, isExpired: true }));
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isExpired: false,
      });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft.isExpired) {
    return (
      <span className="text-red-500 font-semibold bg-red-100 dark:bg-red-950/40 dark:text-red-400 px-2.5 py-1 rounded-md text-xs tracking-wide">
        ● Event Started / Closed
      </span>
    );
  }

  return (
    <div className="flex gap-1.5 text-center font-mono my-3 text-xs justify-start select-none">
      <div className="bg-gray-50 dark:bg-zinc-800/80 text-gray-800 dark:text-zinc-200 p-1.5 rounded-md min-w-[42px] border border-gray-200/60 dark:border-zinc-700/50 shadow-sm">
        <span className="block text-sm font-bold tracking-tight">{timeLeft.days}</span>
        <span className="text-[8px] uppercase font-semibold tracking-wider text-gray-400 dark:text-zinc-500">Days</span>
      </div>
      <div className="bg-gray-50 dark:bg-zinc-800/80 text-gray-800 dark:text-zinc-200 p-1.5 rounded-md min-w-[42px] border border-gray-200/60 dark:border-zinc-700/50 shadow-sm">
        <span className="block text-sm font-bold tracking-tight">{timeLeft.hours}</span>
        <span className="text-[8px] uppercase font-semibold tracking-wider text-gray-400 dark:text-zinc-500">Hrs</span>
      </div>
      <div className="bg-gray-50 dark:bg-zinc-800/80 text-gray-800 dark:text-zinc-200 p-1.5 rounded-md min-w-[42px] border border-gray-200/60 dark:border-zinc-700/50 shadow-sm">
        <span className="block text-sm font-bold tracking-tight">{timeLeft.minutes}</span>
        <span className="text-[8px] uppercase font-semibold tracking-wider text-gray-400 dark:text-zinc-500">Min</span>
      </div>
      <div className="bg-gray-50 dark:bg-zinc-800/80 text-gray-800 dark:text-zinc-200 p-1.5 rounded-md min-w-[42px] border border-gray-200/60 dark:border-zinc-700/50 shadow-sm">
        <span className="block text-sm font-bold tracking-tight">{timeLeft.seconds}</span>
        <span className="text-[8px] uppercase font-semibold tracking-wider text-gray-400 dark:text-zinc-500">Sec</span>
      </div>
    </div>
  );
}