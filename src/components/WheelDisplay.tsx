import { useRef, useEffect, useState } from 'react';
import './WheelDisplay.css';

interface Spectrum {
  left: string;
  right: string;
}

interface WheelDisplayProps {
  spectrum: Spectrum;
  targetPosition: number | null;
  guessPosition: number | null;
  revealed: boolean;
  isClueGiver: boolean;
  onGuess: (position: number) => void;
  clueSubmitted: boolean;
}

// Scoring zone configuration
// Total range is ~28 degrees (7 zones * 4 degrees each)
// Each zone is about 4 degrees
const ZONE_ANGLE_DEGREES = 4;
const ZONE_ANGLE = ZONE_ANGLE_DEGREES * Math.PI / 180; // Convert degrees to radians
const HALF_PI = Math.PI / 2;
const ZONE_SCORES = [
  { offset: 0, score: 4, color: '#ff4081' },        // Center: 4 points
  { offset: 1, score: 3, color: '#ff6e40' },        // Adjacent: 3 points
  { offset: -1, score: 3, color: '#ff6e40' },
  { offset: 2, score: 2, color: '#ffab40' },        // Next: 2 points
  { offset: -2, score: 2, color: '#ffab40' },
  { offset: 3, score: 1, color: '#ffd740' },        // Outer: 1 point
  { offset: -3, score: 1, color: '#ffd740' },
];

function WheelDisplay({
  spectrum,
  targetPosition,
  guessPosition,
  revealed,
  isClueGiver,
  onGuess,
  clueSubmitted
}: WheelDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredPosition, setHoveredPosition] = useState<number | null>(null);
  // Initialize cover to fully closed for guessers, open for clue givers
  const [coverProgress, setCoverProgress] = useState(isClueGiver ? 0 : 1);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);
  const hasAnimatedRef = useRef(false);

  // Animate cover opening when clue is submitted and not revealed
  useEffect(() => {
    // For clue givers, always keep cover open
    if (isClueGiver) {
      setCoverProgress(0);
      return;
    }

    if (clueSubmitted && !revealed && !hasAnimatedRef.current) {
      // Start cover animation (opening) - only once when clue is first submitted
      hasAnimatedRef.current = true;
      setIsAnimating(true);
      setCoverProgress(1); // Start fully covered
      
      const startTime = performance.now();
      const duration = 1500; // 1.5 seconds for animation
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out animation
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        setCoverProgress(1 - easeProgress);
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
          setCoverProgress(0);
        }
      };
      
      animationRef.current = requestAnimationFrame(animate);
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    } else if (!clueSubmitted) {
      setCoverProgress(1); // Keep covered when no clue submitted
      hasAnimatedRef.current = false; // Reset for next round
    } else if (revealed) {
      setCoverProgress(0); // Fully open when revealed
    }
  }, [clueSubmitted, revealed, isClueGiver]);

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height - 50;
    const radius = 250;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw semicircle with solid color background
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, 0);
    ctx.fillStyle = '#667eea'; // Single solid color (purple/blue)
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw tick marks
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    for (let i = 0; i <= 10; i++) {
      const angle = Math.PI - (i / 10) * Math.PI;
      const x1 = centerX + Math.cos(angle) * (radius - 10);
      const y1 = centerY + Math.sin(angle) * (radius - 10);
      const x2 = centerX + Math.cos(angle) * radius;
      const y2 = centerY + Math.sin(angle) * radius;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Draw target scoring zones (if visible)
    if (targetPosition !== null) {
      const targetAngle = Math.PI - (targetPosition / 100) * Math.PI;
      
      // Draw scoring zones from outer to inner (so inner zones appear on top)
      const sortedZones = [...ZONE_SCORES].sort((a, b) => Math.abs(b.offset) - Math.abs(a.offset));
      
      for (const zone of sortedZones) {
        const zoneStartAngle = targetAngle - ZONE_ANGLE / 2 + zone.offset * ZONE_ANGLE;
        const zoneEndAngle = targetAngle + ZONE_ANGLE / 2 + zone.offset * ZONE_ANGLE;
        
        // Draw the zone as a pie slice
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius - 5, zoneStartAngle, zoneEndAngle);
        ctx.closePath();
        ctx.fillStyle = zone.color;
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
        
        // Draw score label for this zone
        const labelAngle = (zoneStartAngle + zoneEndAngle) / 2;
        const labelRadius = radius - 40;
        const labelX = centerX + Math.cos(labelAngle) * labelRadius;
        const labelY = centerY + Math.sin(labelAngle) * labelRadius;
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(zone.score.toString(), labelX, labelY);
      }

      // Draw center target marker
      const targetX = centerX + Math.cos(targetAngle) * (radius - 70);
      const targetY = centerY + Math.sin(targetAngle) * (radius - 70);
      
      ctx.beginPath();
      ctx.arc(targetX, targetY, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw guess position (if exists)
    if (guessPosition !== null) {
      const guessAngle = Math.PI - (guessPosition / 100) * Math.PI;
      const guessX = centerX + Math.cos(guessAngle) * radius;
      const guessY = centerY + Math.sin(guessAngle) * radius;

      // Draw pointer from center
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(guessX, guessY);
      ctx.strokeStyle = '#2196f3';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Draw guess marker
      ctx.beginPath();
      ctx.arc(guessX, guessY, 15, 0, Math.PI * 2);
      ctx.fillStyle = '#2196f3';
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw label
      ctx.fillStyle = '#2196f3';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('GUESS', guessX, guessY - 25);
    }

    // Draw hovered position (if hovering and can guess)
    if (hoveredPosition !== null && !isClueGiver && clueSubmitted && !revealed) {
      const hoverAngle = Math.PI - (hoveredPosition / 100) * Math.PI;
      const hoverX = centerX + Math.cos(hoverAngle) * radius;
      const hoverY = centerY + Math.sin(hoverAngle) * radius;

      ctx.beginPath();
      ctx.arc(hoverX, hoverY, 10, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(33, 150, 243, 0.5)';
      ctx.fill();
    }

    // Draw cover (if animating or waiting for clue)
    if (coverProgress > 0 && !isClueGiver) {
      // The top of the semicircle is at angle -HALF_PI in canvas coordinates
      // Left edge is at PI, right edge is at 0
      
      // Draw left cover - covers from left side (Math.PI) towards top (-HALF_PI)
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      // When coverProgress = 1, cover goes from Math.PI to HALF_PI (full left half going counterclockwise/up)
      // When coverProgress = 0, cover is gone (stays at Math.PI)
      const leftCoverAngle = Math.PI - HALF_PI * coverProgress;
      ctx.arc(centerX, centerY, radius + 5, Math.PI, leftCoverAngle, true);
      ctx.closePath();
      ctx.fillStyle = '#2c3e50';
      ctx.fill();
      ctx.restore();
      
      // Draw right cover - covers from right side (0) towards top (-HALF_PI)
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      // When coverProgress = 1, cover goes from 0 to -HALF_PI (full right half going counterclockwise/up)
      // When coverProgress = 0, cover is gone (stays at 0)
      const rightCoverAngle = -HALF_PI * coverProgress;
      ctx.arc(centerX, centerY, radius + 5, 0, rightCoverAngle, true);
      ctx.closePath();
      ctx.fillStyle = '#2c3e50';
      ctx.fill();
      ctx.restore();
    }
  };

  useEffect(() => {
    drawWheel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetPosition, guessPosition, revealed, hoveredPosition, coverProgress]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isClueGiver || !clueSubmitted || revealed) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height - 50;

    // Calculate angle from click position
    const dx = x - centerX;
    const dy = y - centerY;
    const angle = Math.atan2(dy, dx);

    // Convert to position (0-100)
    let position = ((Math.PI - angle) / Math.PI) * 100;
    position = Math.max(0, Math.min(100, position));

    onGuess(Math.round(position));
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isClueGiver || !clueSubmitted || revealed) {
      setHoveredPosition(null);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height - 50;

    const dx = x - centerX;
    const dy = y - centerY;
    const angle = Math.atan2(dy, dx);

    let position = ((Math.PI - angle) / Math.PI) * 100;
    position = Math.max(0, Math.min(100, position));

    setHoveredPosition(Math.round(position));
  };

  const handleCanvasMouseLeave = () => {
    setHoveredPosition(null);
  };

  return (
    <div className="wheel-display">
      <div className="spectrum-labels">
        <div className="spectrum-label left">{spectrum.left}</div>
        <div className="spectrum-label right">{spectrum.right}</div>
      </div>
      <canvas
        ref={canvasRef}
        width={600}
        height={350}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={handleCanvasMouseLeave}
        className="wheel-canvas"
        style={{ cursor: (!isClueGiver && clueSubmitted && !revealed) ? 'pointer' : 'default' }}
      />
    </div>
  );
}

export default WheelDisplay;
