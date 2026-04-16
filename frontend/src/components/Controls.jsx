import React, { useState } from 'react';
import { BsStars, BsSun, BsDroplet, BsBoundingBoxCircles, BsBarChartFill, BsLightning } from 'react-icons/bs';
import { FiZap, FiWind } from 'react-icons/fi';
import { MdAutoFixHigh, MdBlurOff } from 'react-icons/md';

const Controls = ({ onApply, disabled, metrics, hasProcessed }) => {
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(1.0);
  const [gaussianK, setGaussianK] = useState(3);
  const [sharpness, setSharpness] = useState(1.5);

  return (
    <div>

      {/* ── AI Enhancement (HERO section - top) ── */}
      <div className="ai-card" style={{ marginBottom: '4px' }}>
        <div className="ai-card-title">
          <FiZap size={15} /> EDSR x4 Super Resolution  
          <span style={{ fontSize:'0.68rem', background: 'rgba(138,100,255,0.25)', padding: '2px 8px', borderRadius: 20, marginLeft: 8, fontWeight: 500 }}>Best Quality</span>
        </div>
        <div className="ai-card-desc">
          Full 5-stage AI pipeline: Deblur → CLAHE contrast fix → Sharpen → EDSR neural upscale → Detail polish. 
          Removes blur and restores lost texture with deep learning.
        </div>
        <button className="btn-ai" onClick={() => onApply('ai_enhance')} disabled={disabled}>
          ✦ Full AI Restore & Enhance
        </button>
      </div>

      {/* ── Quick Restore Tools ── */}
      <div className="section-title" style={{ marginTop: 24 }}>
        <MdBlurOff size={12} style={{ marginRight: 6 }} />Quick Restoration
      </div>

      <div className="btn-row" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 8 }}>
        <button className="btn-tool" onClick={() => onApply('deblur')} disabled={disabled} 
          style={{ borderColor: 'rgba(68,138,255,0.3)', gridColumn: 'span 1' }}>
          💧 Remove Blur
        </button>
        <button className="btn-tool" onClick={() => onApply('clahe')} disabled={disabled}
          style={{ borderColor: 'rgba(68,138,255,0.3)' }}>
          🌟 Boost Contrast
        </button>
      </div>

      <div className="range-wrap mb-3">
        <div className="range-label">
          <span>🔪 Sharpness</span>
          <span>{parseFloat(sharpness).toFixed(1)}×</span>
        </div>
        <input type="range" min="0.5" max="3.0" step="0.1" value={sharpness}
          onChange={(e) => setSharpness(e.target.value)}
          onMouseUp={() => onApply('sharpen', sharpness)}
          disabled={disabled}
        />
      </div>

      {/* ── Intensity ── */}
      <div className="section-title"><BsSun size={11} style={{ marginRight: 6 }} />Intensity</div>

      <div className="range-wrap mb-3">
        <div className="range-label">
          <span>Brightness</span>
          <span>{brightness}</span>
        </div>
        <input type="range" min="-100" max="100" value={brightness}
          onChange={(e) => setBrightness(e.target.value)}
          onMouseUp={() => onApply('brightness', brightness)}
          disabled={disabled}
        />
      </div>

      <div className="range-wrap mb-3">
        <div className="range-label">
          <span>Contrast</span>
          <span>{contrast}×</span>
        </div>
        <input type="range" min="0.1" max="3.0" step="0.1" value={contrast}
          onChange={(e) => setContrast(e.target.value)}
          onMouseUp={() => onApply('contrast', contrast)}
          disabled={disabled}
        />
      </div>

      <div className="btn-row">
        <button className="btn-tool" onClick={() => onApply('grayscale')} disabled={disabled}>🌑 Grayscale</button>
        <button className="btn-tool" onClick={() => onApply('histogram')} disabled={disabled}>📊 Equalize</button>
      </div>

      {/* ── Noise ── */}
      <div className="section-title"><BsDroplet size={11} style={{ marginRight: 6 }} />Noise Reduction</div>

      <div className="range-wrap mb-3">
        <div className="range-label">
          <span>Gaussian Kernel</span>
          <span>{gaussianK}px</span>
        </div>
        <input type="range" min="1" max="15" step="2" value={gaussianK}
          onChange={(e) => setGaussianK(e.target.value)}
          onMouseUp={() => onApply('gaussian', gaussianK)}
          disabled={disabled}
        />
      </div>

      <div className="btn-row">
        <button className="btn-tool" onClick={() => onApply('median', 5)} disabled={disabled}>🔵 Median</button>
        <button className="btn-tool" onClick={() => onApply('bilateral', 9)} disabled={disabled}>⬡ Bilateral</button>
      </div>

      {/* ── Edge ── */}
      <div className="section-title"><BsBoundingBoxCircles size={11} style={{ marginRight: 6 }} />Edge Detection</div>

      <div className="btn-row">
        <button className="btn-tool" onClick={() => onApply('canny')} disabled={disabled}>⚡ Canny</button>
        <button className="btn-tool" onClick={() => onApply('sobel')} disabled={disabled}>🔲 Sobel</button>
      </div>

      {/* ── Metrics ── */}
      {hasProcessed && metrics && (
        <>
          <div className="section-title"><BsBarChartFill size={11} style={{ marginRight: 6 }} />Quality Metrics</div>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">PSNR</div>
              <div className="metric-val">{metrics.psnr ? `${metrics.psnr}` : '—'}</div>
              {metrics.psnr && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>dB</div>}
            </div>
            <div className="metric-card">
              <div className="metric-label">SSIM</div>
              <div className="metric-val">{metrics.ssim ? parseFloat(metrics.ssim).toFixed(3) : '—'}</div>
              {metrics.ssim && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>/ 1.000</div>}
            </div>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 10, lineHeight: 1.5 }}>
            Higher PSNR → less noise · SSIM closer to 1 → better structure preservation
          </div>
        </>
      )}
    </div>
  );
};

export default Controls;
