import React, { useState } from 'react';

// Minimal CSV/TSV reader; calls onData(rows) where rows is an array of string arrays
export default function ReadFile({ onData }) {
  const [error, setError] = useState(null);

  const handleFile = (evt) => {
    const file = evt.target.files?.[0];
    if (!file) return;
    setError(null);

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result || '';
      const rows = text
        .split(/\r?\n/)
        .filter(Boolean)
        .map((line) => line.split(/[,\t]/));
      try {
        onData?.(rows);
      } catch (e) {
        console.error('onData handler error', e);
        setError('Unable to process file.');
      }
    };
    reader.onerror = () => setError('Failed to read file.');
    reader.readAsText(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontWeight: 600 }}>Upload CSV / TSV</label>
      <input type="file" accept=".csv,.tsv,text/csv,text/tab-separated-values" onChange={handleFile} />
      {error && <span style={{ color: '#c62828', fontSize: 12 }}>{error}</span>}
    </div>
  );
}
