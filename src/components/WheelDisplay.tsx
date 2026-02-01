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

    // Draw semicircle gradient
    const gradient = ctx.createLinearGradient(centerX - radius, 0, centerX + radius, 0);
    gradient.addColorStop(0, '#e53935');
    gradient.addColorStop(0.5, '#ffd600');
    gradient.addColorStop(1, '#43a047');

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, 0);
    ctx.fillStyle = gradient;
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

    // Draw target position (if visible)
    if (targetPosition !== null) {
      const targetAngle = Math.PI - (targetPosition / 100) * Math.PI;
      const targetX = centerX + Math.cos(targetAngle) * (radius - 30);
      const targetY = centerY + Math.sin(targetAngle) * (radius - 30);

      // Draw target zone (a narrow band)
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 20, targetAngle - 0.1, targetAngle + 0.1);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 20;
      ctx.stroke();
      ctx.restore();

      // Draw target marker
      ctx.beginPath();
      ctx.arc(targetX, targetY, 12, 0, Math.PI * 2);
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw label
      ctx.fillStyle = '#333';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('TARGET', targetX, targetY - 25);
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
  };

  useEffect(() => {
    drawWheel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetPosition, guessPosition, revealed, hoveredPosition]);

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
