import React, { useCallback, useState } from 'react';
import { BsCloudUpload } from 'react-icons/bs';

const Upload = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragging(true);
    else if (e.type === 'dragleave') setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith('image/')) onUpload(file);
    else if (file) alert("Please upload a valid image (JPG, PNG, WEBP)");
  }, [onUpload]);

  const handleChange = (e) => {
    if (e.target.files?.[0]) onUpload(e.target.files[0]);
  };

  return (
    <div
      className={`upload-zone ${isDragging ? 'drag-active' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-upload').click()}
    >
      <div className="upload-icon-ring">
        <BsCloudUpload className="icon" />
      </div>

      <div className="upload-title">Drop your image here</div>
      <div className="upload-subtitle">or click to browse your files</div>

      <button className="btn-ghost" onClick={(e) => { e.stopPropagation(); document.getElementById('file-upload').click(); }}>
        Choose Image
      </button>

      <div className="supported-formats" style={{ position: 'relative', zIndex: 1 }}>
        {['JPG', 'PNG', 'WEBP', '10MB max'].map(f => (
          <span key={f} className="format-badge">{f}</span>
        ))}
      </div>

      <input
        id="file-upload"
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleChange}
      />
    </div>
  );
};

export default Upload;
