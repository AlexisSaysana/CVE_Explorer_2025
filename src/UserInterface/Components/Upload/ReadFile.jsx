import React, { useState } from 'react';
import './ReadFile.css';

// CSV/TSV reader with drag-and-drop and file preview
export default function ReadFile({ onData }) {
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [rowCount, setRowCount] = useState(0);
  const fileInputRef = React.useRef(null);

  const processFile = (file) => {
    if (!file) return;
    
    // Validate file type
    const validTypes = ['text/csv', 'text/tab-separated-values', 'text/plain', 'application/vnd.ms-excel'];
    const ext = file.name.split('.').pop().toLowerCase();
    if (!validTypes.includes(file.type) && !['csv', 'tsv', 'txt', 'xls'].includes(ext)) {
      setError('Please upload a CSV, TSV, or TXT file.');
      return;
    }

    setError(null);
    const reader = new FileReader();
    
    reader.onload = () => {
      try {
        const text = reader.result || '';
        const rows = text
          .split(/\r?\n/)
          .filter((line) => line.trim().length > 0)
          .map((line) => line.split(/[,\t]/).map((cell) => cell.trim()));
        
        if (rows.length === 0) {
          setError('File is empty.');
          return;
        }
        
        setFileName(file.name);
        setRowCount(rows.length);
        onData?.(rows);
      } catch (e) {
        console.error('File parsing error', e);
        setError('Unable to parse file. Ensure it\'s valid CSV/TSV.');
      }
    };
    
    reader.onerror = () => setError('Failed to read file.');
    reader.readAsText(file);
  };

  const handleFileInput = (evt) => {
    processFile(evt.target.files?.[0]);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
    setIsDragging(false);
    const file = evt.dataTransfer?.files?.[0];
    processFile(file);
  };

  return (
    <div className="read-file-container">
      <div
        className={`upload-zone ${isDragging ? 'dragging' : ''} ${fileName ? 'has-file' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        <div className="upload-content">
          <div className="upload-icon">📄</div>
          <h3>Bulk Upload CVEs</h3>
          <p className="upload-text">
            {fileName ? (
              <>
                <strong>{fileName}</strong> — {rowCount} rows loaded
              </>
            ) : (
              <>
                Drag & drop a CSV/TSV file here or <span className="upload-link">click to browse</span>
              </>
            )}
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.tsv,.txt"
          onChange={handleFileInput}
          className="file-input"
        />
      </div>

      {error && (
        <div className="upload-error">
          ⚠️ {error}
        </div>
      )}

      {fileName && !error && (
        <div className="upload-success">
          ✅ File ready: <strong>{fileName}</strong>
        </div>
      )}
    </div>
  );
}
