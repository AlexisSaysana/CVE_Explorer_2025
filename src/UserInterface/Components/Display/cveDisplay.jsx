// src/UserInterface/Components/Display/cveDisplay.jsx
// Responsabilité UNIQUE: Gérer les états (loading, error, empty) et déléguer au layout

import React from 'react';
import CveDisplayLayout from './cveDisplayLayout.jsx';
import './cveDisplay.css';

export default function CveDisplay({ data, loading, error }) {
  if (loading) {
    return (
      <div className="cve-display-loading">
        <div className="spinner"></div>
        <p>Fetching CVE data from NVD, EPSS, KEV...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cve-display-error">
        <p>⚠️ {error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="cve-display-empty">
        <p>🎯 Enter a CVE ID to start the visual analysis.</p>
      </div>
    );
  }

  return <CveDisplayLayout data={data} />;
}

