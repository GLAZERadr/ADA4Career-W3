'use client';

import { useEffect, useState } from 'react';

interface CircularProgressIndicatorProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  colors?: string[];
  segments?: number[];
  text?: string;
  animate?: boolean;
  animationDuration?: number;
  maxScore?: number;
  label?: string;
  className?: string;
}

export function CircularProgressIndicator({
  percentage,
  size = 120,
  strokeWidth = 10,
  colors = ['#8b5cf6', '#3b82f6', '#ec4899'],
  segments = [0.3, 0.4, 0.3],
  text = 'Score',
  animate = true,
  animationDuration = 1000,
  maxScore = 100,
  label = 'Progress indicator',
  className = '',
}: CircularProgressIndicatorProps) {
  const [progress, setProgress] = useState(0);
  // Scale percentage relative to maxScore
  const scaledPercentage = (percentage / maxScore) * 100;
  const clampedPercentage = Math.min(100, Math.max(0, scaledPercentage));

  // Responsive size calculation
  const [responsiveSize, setResponsiveSize] = useState(size);
  const [responsiveStrokeWidth, setResponsiveStrokeWidth] =
    useState(strokeWidth);

  // Handle resize for responsiveness
  useEffect(() => {
    const updateSize = () => {
      const windowWidth = window.innerWidth;
      if (windowWidth < 640) {
        // Small screens
        setResponsiveSize(Math.max(80, size * 0.7));
        setResponsiveStrokeWidth(Math.max(6, strokeWidth * 0.7));
      } else if (windowWidth < 1024) {
        // Medium screens
        setResponsiveSize(Math.max(100, size * 0.85));
        setResponsiveStrokeWidth(Math.max(8, strokeWidth * 0.85));
      } else {
        // Large screens
        setResponsiveSize(size);
        setResponsiveStrokeWidth(strokeWidth);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [size, strokeWidth]);

  // Animation effect
  useEffect(() => {
    if (!animate) {
      setProgress(clampedPercentage);
      return;
    }

    let startTimestamp: number;
    const startValue = progress;
    const duration = animationDuration;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;

      const nextProgress =
        elapsed >= duration
          ? clampedPercentage
          : startValue +
            (clampedPercentage - startValue) * (elapsed / duration);

      setProgress(nextProgress);

      if (elapsed < duration) {
        window.requestAnimationFrame(step);
      }
    };

    const animationFrame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [clampedPercentage, animate, animationDuration]);

  // Calculate values for SVG
  const radius = (responsiveSize - responsiveStrokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  // Validate segments
  const normalizedSegments = [...segments];
  const segmentsSum = normalizedSegments.reduce(
    (sum, segment) => sum + segment,
    0
  );
  if (Math.abs(segmentsSum - 1) > 0.001) {
    // Normalize segments to sum to 1
    for (let i = 0; i < normalizedSegments.length; i++) {
      normalizedSegments[i] = normalizedSegments[i] / segmentsSum;
    }
  }

  // Calculate segment offsets
  const segmentOffsets = normalizedSegments.reduce(
    (acc: number[], segment, index) => {
      const prevOffset = index > 0 ? acc[index - 1] : 0;
      acc.push(prevOffset + segment);
      return acc;
    },
    []
  );

  // Ensure we have enough colors for all segments
  const extendedColors = [...colors];
  while (extendedColors.length < normalizedSegments.length) {
    extendedColors.push(colors[extendedColors.length % colors.length]);
  }

  // Calculate the actual score value based on percentage and maxScore
  const actualScore = Math.round((percentage / maxScore) * 100);

  // Determine text size based on responsive size
  const textSizeClass =
    responsiveSize < 100
      ? 'text-xl'
      : responsiveSize < 150
      ? 'text-2xl'
      : 'text-3xl';

  const subtextSizeClass =
    responsiveSize < 100
      ? 'text-xs'
      : responsiveSize < 150
      ? 'text-sm'
      : 'text-base';

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        width={responsiveSize}
        height={responsiveSize}
        viewBox={`0 0 ${responsiveSize} ${responsiveSize}`}
        className='transform -rotate-90'
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        role='progressbar'
        aria-label={`${label}: ${Math.round(
          percentage
        )} out of ${maxScore} (${actualScore}%)`}
      >
        {/* Background circle */}
        <circle
          cx={responsiveSize / 2}
          cy={responsiveSize / 2}
          r={radius}
          fill='transparent'
          stroke='rgba(255, 255, 255, 0.1)'
          strokeWidth={responsiveStrokeWidth}
        />

        {/* Only render segment circles if there's actual progress */}
        {progress > 0 &&
          normalizedSegments.map((segment, index) => {
            const offset = index > 0 ? segmentOffsets[index - 1] : 0;
            const segmentProgress =
              Math.min(segment, Math.max(0, progress / 100 - offset)) / segment;

            // Only render if this segment has some progress
            if (segmentProgress <= 0) return null;

            return (
              <circle
                key={index}
                cx={responsiveSize / 2}
                cy={responsiveSize / 2}
                r={radius}
                fill='transparent'
                stroke={extendedColors[index]}
                strokeWidth={responsiveStrokeWidth}
                strokeDasharray={`${
                  circumference * segment * segmentProgress
                } ${circumference}`}
                strokeDashoffset={-circumference * offset}
                strokeLinecap='round'
                aria-hidden='true'
              />
            );
          })}
      </svg>

      <div
        className='absolute flex flex-col items-center justify-center text-white'
        aria-hidden='true'
      >
        <span className={`font-bold ${textSizeClass}`}>
          {Math.round(percentage)}
          {maxScore !== 100 && (
            <span className={subtextSizeClass}> / {maxScore}</span>
          )}
        </span>
        {text && <span className={subtextSizeClass}>{text}</span>}
      </div>
    </div>
  );
}
