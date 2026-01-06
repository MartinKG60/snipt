import React, { useState, useEffect, useRef } from 'react';

function AreaSelectApp() {
  const [screenshot, setScreenshot] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onFullScreenCapture((dataUrl) => {
        setScreenshot(dataUrl);
        // Load image
        const img = new Image();
        img.onload = () => {
          imageRef.current = img;
          drawCanvas();
        };
        img.src = dataUrl;
      });
    }
  }, []);

  useEffect(() => {
    if (screenshot && imageRef.current) {
      drawCanvas();
    }
  }, [startPos, currentPos, isSelecting]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Draw the screenshot
    ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);

    // Draw dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (isSelecting) {
      const x = Math.min(startPos.x, currentPos.x);
      const y = Math.min(startPos.y, currentPos.y);
      const width = Math.abs(currentPos.x - startPos.x);
      const height = Math.abs(currentPos.y - startPos.y);

      // Clear the selected area
      ctx.clearRect(x, y, width, height);
      ctx.drawImage(imageRef.current, x, y, width, height, x, y, width, height);

      // Draw selection border
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);

      // Draw dimensions
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(x, y - 25, 100, 20);
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.fillText(`${Math.round(width)} × ${Math.round(height)}`, x + 5, y - 10);
    }
  };

  const handleMouseDown = (e) => {
    if (!screenshot) return;
    setIsSelecting(true);
    const rect = canvasRef.current.getBoundingClientRect();
    setStartPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setCurrentPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseMove = (e) => {
    if (!isSelecting) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setCurrentPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseUp = async () => {
    if (!isSelecting) return;
    setIsSelecting(false);

    const x = Math.min(startPos.x, currentPos.x);
    const y = Math.min(startPos.y, currentPos.y);
    const width = Math.abs(currentPos.x - startPos.x);
    const height = Math.abs(currentPos.y - startPos.y);

    // Only capture if area is significant
    if (width > 10 && height > 10) {
      await captureArea(x, y, width, height);
    }
  };

  const captureArea = async (x, y, width, height) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = height;

    // Draw the selected area
    ctx.drawImage(imageRef.current, x, y, width, height, 0, 0, width, height);

    // Convert to data URL
    const dataUrl = canvas.toDataURL('image/png');

    // Send back to main window
    if (window.electronAPI) {
      window.electronAPI.areaSelected(dataUrl);
      window.electronAPI.closeAreaSelect();
    }
  };

  const handleCancel = () => {
    if (window.electronAPI) {
      window.electronAPI.closeAreaSelect();
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden cursor-crosshair bg-black">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-6 py-3 rounded-lg flex items-center gap-4">
        <span>Click and drag to select an area</span>
        <button
          onClick={handleCancel}
          className="px-4 py-1 bg-red-500 hover:bg-red-600 rounded transition-colors"
        >
          Cancel (Esc)
        </button>
      </div>

      {isSelecting && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded">
          Release mouse to capture
        </div>
      )}
    </div>
  );
}

export default AreaSelectApp;
