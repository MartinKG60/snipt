import React, { useRef, useEffect, useState } from 'react';
import { ANNOTATION_TOOLS, DEFAULT_ANNOTATION_SETTINGS, ANNOTATION_COLORS } from '../utils/constants';

const AnnotationCanvas = ({ imageData, onSave, onCancel }) => {
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const [activeTool, setActiveTool] = useState(ANNOTATION_TOOLS.NONE);
  const [annotations, setAnnotations] = useState([]);
  const [currentAnnotation, setCurrentAnnotation] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState(DEFAULT_ANNOTATION_SETTINGS.color);
  const [image, setImage] = useState(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImage(img);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const overlayCanvas = overlayCanvasRef.current;
      overlayCanvas.width = img.width;
      overlayCanvas.height = img.height;
    };
    img.src = imageData;
  }, [imageData]);

  useEffect(() => {
    if (!image) return;

    const canvas = overlayCanvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    annotations.forEach(annotation => {
      drawAnnotation(ctx, annotation);
    });

    if (currentAnnotation) {
      drawAnnotation(ctx, currentAnnotation);
    }
  }, [annotations, currentAnnotation, image]);

  const drawAnnotation = (ctx, annotation) => {
    ctx.strokeStyle = annotation.color;
    ctx.fillStyle = annotation.color;
    ctx.lineWidth = DEFAULT_ANNOTATION_SETTINGS.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (annotation.type) {
      case ANNOTATION_TOOLS.ARROW:
        drawArrow(ctx, annotation.start, annotation.end);
        break;
      case ANNOTATION_TOOLS.BOX:
        drawBox(ctx, annotation.start, annotation.end);
        break;
      case ANNOTATION_TOOLS.HIGHLIGHT:
        drawHighlight(ctx, annotation.start, annotation.end);
        break;
      case ANNOTATION_TOOLS.TEXT:
        drawText(ctx, annotation.position, annotation.text, annotation.color);
        break;
      default:
        break;
    }
  };

  const drawArrow = (ctx, start, end) => {
    const headLength = 15;
    const angle = Math.atan2(end.y - start.y, end.x - start.x);

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(
      end.x - headLength * Math.cos(angle - Math.PI / 6),
      end.y - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(
      end.x - headLength * Math.cos(angle + Math.PI / 6),
      end.y - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  };

  const drawBox = (ctx, start, end) => {
    const width = end.x - start.x;
    const height = end.y - start.y;
    ctx.strokeRect(start.x, start.y, width, height);
  };

  const drawHighlight = (ctx, start, end) => {
    const width = end.x - start.x;
    const height = end.y - start.y;
    ctx.globalAlpha = DEFAULT_ANNOTATION_SETTINGS.highlightOpacity;
    ctx.fillRect(start.x, start.y, width, height);
    ctx.globalAlpha = 1.0;
  };

  const drawText = (ctx, position, text, color) => {
    ctx.font = `${DEFAULT_ANNOTATION_SETTINGS.fontSize}px sans-serif`;
    ctx.fillStyle = color;
    ctx.fillText(text, position.x, position.y);
  };

  const getMousePos = (e) => {
    const canvas = overlayCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleMouseDown = (e) => {
    if (activeTool === ANNOTATION_TOOLS.NONE) return;

    const pos = getMousePos(e);
    setIsDrawing(true);

    if (activeTool === ANNOTATION_TOOLS.TEXT) {
      const text = prompt('Enter text:');
      if (text) {
        const newAnnotation = {
          type: ANNOTATION_TOOLS.TEXT,
          position: pos,
          text,
          color
        };
        setAnnotations([...annotations, newAnnotation]);
      }
      setActiveTool(ANNOTATION_TOOLS.NONE);
    } else {
      setCurrentAnnotation({
        type: activeTool,
        start: pos,
        end: pos,
        color
      });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !currentAnnotation || activeTool === ANNOTATION_TOOLS.TEXT) return;

    const pos = getMousePos(e);
    setCurrentAnnotation({
      ...currentAnnotation,
      end: pos
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;

    if (currentAnnotation && activeTool !== ANNOTATION_TOOLS.TEXT) {
      setAnnotations([...annotations, currentAnnotation]);
      setCurrentAnnotation(null);
    }

    setIsDrawing(false);
  };

  const handleSave = async () => {
    const finalCanvas = document.createElement('canvas');
    const ctx = finalCanvas.getContext('2d');
    finalCanvas.width = canvasRef.current.width;
    finalCanvas.height = canvasRef.current.height;

    ctx.drawImage(canvasRef.current, 0, 0);
    ctx.drawImage(overlayCanvasRef.current, 0, 0);

    finalCanvas.toBlob((blob) => {
      onSave(blob);
    }, 'image/png');
  };

  const handleUndo = () => {
    setAnnotations(annotations.slice(0, -1));
  };

  const colorOptions = [
    { name: 'Red', value: ANNOTATION_COLORS.RED },
    { name: 'Blue', value: ANNOTATION_COLORS.BLUE },
    { name: 'Green', value: ANNOTATION_COLORS.GREEN },
    { name: 'Yellow', value: ANNOTATION_COLORS.YELLOW },
    { name: 'Orange', value: ANNOTATION_COLORS.ORANGE },
    { name: 'Purple', value: ANNOTATION_COLORS.PURPLE },
    { name: 'Black', value: ANNOTATION_COLORS.BLACK },
    { name: 'White', value: ANNOTATION_COLORS.WHITE },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex flex-col">
      <div className="bg-gray-800 text-white p-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTool(ANNOTATION_TOOLS.ARROW)}
            className={`px-4 py-2 rounded transition-colors ${
              activeTool === ANNOTATION_TOOLS.ARROW ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            ➡️ Arrow
          </button>
          <button
            onClick={() => setActiveTool(ANNOTATION_TOOLS.BOX)}
            className={`px-4 py-2 rounded transition-colors ${
              activeTool === ANNOTATION_TOOLS.BOX ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            ⬜ Box
          </button>
          <button
            onClick={() => setActiveTool(ANNOTATION_TOOLS.HIGHLIGHT)}
            className={`px-4 py-2 rounded transition-colors ${
              activeTool === ANNOTATION_TOOLS.HIGHLIGHT ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            🎨 Highlight
          </button>
          <button
            onClick={() => setActiveTool(ANNOTATION_TOOLS.TEXT)}
            className={`px-4 py-2 rounded transition-colors ${
              activeTool === ANNOTATION_TOOLS.TEXT ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            📝 Text
          </button>

          <div className="w-px h-8 bg-gray-600 mx-2"></div>

          <div className="flex gap-1">
            {colorOptions.map((colorOption) => (
              <button
                key={colorOption.value}
                onClick={() => setColor(colorOption.value)}
                className={`w-8 h-8 rounded border-2 ${
                  color === colorOption.value ? 'border-white' : 'border-gray-600'
                }`}
                style={{ backgroundColor: colorOption.value }}
                title={colorOption.name}
              />
            ))}
          </div>

          <div className="w-px h-8 bg-gray-600 mx-2"></div>

          <button
            onClick={handleUndo}
            disabled={annotations.length === 0}
            className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ↩️ Undo
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="px-6 py-2 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto flex items-center justify-center p-4">
        <div className="relative inline-block">
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0"
            style={{ maxWidth: '100%', maxHeight: 'calc(100vh - 100px)' }}
          />
          <canvas
            ref={overlayCanvasRef}
            className="absolute top-0 left-0 cursor-crosshair"
            style={{ maxWidth: '100%', maxHeight: 'calc(100vh - 100px)' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>
      </div>
    </div>
  );
};

export default AnnotationCanvas;
