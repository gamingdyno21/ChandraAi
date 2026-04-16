import React, { useState } from 'react';
import Upload from './components/Upload';
import Controls from './components/Controls';
import ImagePreview from './components/ImagePreview';
import { processImage } from './services/api';
import { BsStars } from 'react-icons/bs';
import { FiZap, FiMenu, FiX } from 'react-icons/fi';

function App() {
  const [originalFile, setOriginalFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState(null);
  const [processedUrl, setProcessedUrl] = useState(null);
  const [metrics, setMetrics] = useState({ psnr: null, ssim: null });
  const [loading, setLoading] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false); // Mobile sidebar toggle

  const handleImageUpload = (file) => {
    if (!file) {
      setOriginalFile(null);
      setOriginalUrl(null);
      setProcessedUrl(null);
      setMetrics({ psnr: null, ssim: null });
      return;
    }
    setOriginalFile(file);
    setOriginalUrl(URL.createObjectURL(file));
    setProcessedUrl(null);
    setMetrics({ psnr: null, ssim: null });
  };

  const handleApplyAction = async (action, value) => {
    if (!originalFile) return;
    setLoading(true);
    setToolsOpen(false); // Close mobile drawer after apply
    try {
      const result = await processImage(originalFile, action, value);
      setProcessedUrl(result.imageUrl);
      setMetrics(result.metrics);
    } catch (error) {
      alert("Failed to process image. Make sure the backend is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!processedUrl) return;
    const link = document.createElement('a');
    link.href = processedUrl;
    link.download = `chandraai_enhanced_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="workspace">

      {/* ── Header ── */}
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon-wrap">
            <BsStars color="white" />
          </div>
          <div>
            <div className="brand-title">ChandraAi Image Enhancer</div>
            <div className="brand-sub hide-mobile">Advanced AI Image Processing Studio</div>
          </div>
        </div>

        <div className="header-right">
          <div className="status-badge hide-mobile">
            <span className="status-dot"></span> Engine Online
          </div>
          {/* Mobile tools toggle */}
          <button
            className="btn-ghost mobile-tools-toggle"
            onClick={() => setToolsOpen(!toolsOpen)}
            aria-label="Toggle tools"
          >
            {toolsOpen ? <FiX size={18} /> : <><FiZap size={16} style={{ marginRight: 6 }} /> Tools</>}
          </button>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <div className="main-grid">

        {/* Left — Canvas */}
        <div className="panel canvas-panel">
          <div className="panel-header">
            <div className="panel-header-icon" style={{ background: 'rgba(138,100,255,0.15)' }}>🖼️</div>
            <h5>Canvas</h5>
            {originalFile && (
              <span className="file-chip">
                {originalFile.name.length > 18 ? originalFile.name.slice(0, 18) + '…' : originalFile.name}
                &nbsp;·&nbsp;{(originalFile.size / 1024).toFixed(0)} KB
              </span>
            )}
          </div>

          <div className="panel-body canvas-body">
            {loading && (
              <div className="loading-overlay">
                <div className="loader-ring"></div>
                <div className="loading-text">Processing with AI...</div>
              </div>
            )}

            {!originalUrl ? (
              <Upload onUpload={handleImageUpload} />
            ) : (
              <div className="canvas-inner">
                <div className="preview-wrap">
                  <ImagePreview original={originalUrl} processed={processedUrl} />
                </div>
                <div className="canvas-footer">
                  <span className="text-muted-sm">
                    {processedUrl ? 'Drag the slider to compare ↔' : 'Select a tool from the right panel'}
                  </span>
                  <button className="btn-ghost btn-sm" onClick={() => handleImageUpload(null)}>
                    ✕ Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right — Controls (desktop always visible, mobile slide-in drawer) */}
        <aside className={`panel tools-panel ${toolsOpen ? 'tools-open' : ''}`}>
          <div className="panel-header">
            <div className="panel-header-icon" style={{ background: 'rgba(224,64,251,0.15)' }}>
              <FiZap color="#e040fb" />
            </div>
            <h5>Processing Tools</h5>
            <button className="btn-ghost btn-sm mobile-close-tools" onClick={() => setToolsOpen(false)}>
              <FiX size={16} />
            </button>
          </div>

          <div className="controls-scroll panel-body">
            <Controls
              onApply={handleApplyAction}
              disabled={!originalFile || loading}
              metrics={metrics}
              hasProcessed={!!processedUrl}
            />
          </div>

          <div className="export-bar">
            <button className="btn-download" onClick={handleDownload} disabled={!processedUrl}>
              ⬇ Export Enhanced Image
            </button>
          </div>
        </aside>
      </div>

      {/* Mobile overlay backdrop */}
      {toolsOpen && <div className="tools-backdrop" onClick={() => setToolsOpen(false)} />}
    </div>
  );
}

export default App;
