import React, { useState, useRef, useEffect } from 'react';

const ImagePreview = ({ original, processed }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const updatePos = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    setSliderPos(Math.max(0, Math.min(100, (x / rect.width) * 100)));
  };

  const onMouseDown = (e) => { setIsDragging(true); updatePos(e); };
  const onMouseMove = (e) => { if (isDragging) updatePos(e); };
  const onMouseUp = () => setIsDragging(false);

  useEffect(() => {
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchend', onMouseUp);
    return () => {
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchend', onMouseUp);
    };
  }, []);

  if (!processed) {
    return (
      <div className="single-image-view">
        <img src={original} alt="Original" />
      </div>
    );
  }

  return (
    <div
      className="comparison-container"
      ref={containerRef}
      onMouseMove={onMouseMove}
      onMouseDown={onMouseDown}
      onTouchStart={(e) => { setIsDragging(true); updatePos(e); }}
      onTouchMove={(e) => { if (isDragging) updatePos(e); }}
    >
      {/* Enhanced (base layer) */}
      <img
        src={processed}
        alt="Enhanced"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }}
      />

      {/* Original (clipped overlay) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
          transition: isDragging ? 'none' : 'clip-path 0.05s',
        }}
      >
        <img
          src={original}
          alt="Original"
          style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none', display: 'block' }}
        />
      </div>

      {/* Divider line */}
      <div className="slider-divider" style={{ left: `${sliderPos}%` }} />

      {/* Handle */}
      <div className="slider-handle" style={{ left: `${sliderPos}%` }}>
        ⟺
      </div>

      {/* Labels */}
      <span className="comparison-label label-original">Original</span>
      <span className="comparison-label label-enhanced">Enhanced</span>
    </div>
  );
};

export default ImagePreview;
