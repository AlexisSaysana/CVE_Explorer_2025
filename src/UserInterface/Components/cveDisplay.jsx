// src/UserInterface/Components/cveDisplay.jsx

import React from 'react';
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

  const getSeverityColor = (score) => {
    if (score >= 9) return '#d32f2f';
    if (score >= 7) return '#f57c00';
    if (score >= 4) return '#fbc02d';
    return '#388e3c';
  };

  const getSeverityLabel = (score) => {
    if (score >= 9) return 'CRITICAL';
    if (score >= 7) return 'HIGH';
    if (score >= 4) return 'MEDIUM';
    return 'LOW';
  };

  const cvssScore = data.cvssScore?.baseScore || 0;
  const epssScore = data.epssScore || 0;

  return (
    <div className="cve-display-container">
      <div className="cve-header">
        <h2>CVE Details: {data.id}</h2>
        <p className="cve-published">Published: {data.published || 'N/A'}</p>
      </div>

      {/* Description */}
      {data.description && (
        <div className="cve-card">
          <h3>Description</h3>
          <p>{data.description}</p>
        </div>
      )}

      {/* Scores Section */}
      <div className="cve-scores-grid">
        {/* CVSS Score */}
        <div className="cve-score-card" style={{ borderLeftColor: getSeverityColor(cvssScore) }}>
          <h3>CVSS Score</h3>
          <div className="score-display">
            <span className="score-value">{cvssScore.toFixed(1)}</span>
            <span className="score-label" style={{ color: getSeverityColor(cvssScore) }}>
              {getSeverityLabel(cvssScore)}
            </span>
          </div>
          <p className="score-info">{data.cvssScore?.vector || 'N/A'}</p>
        </div>

        {/* EPSS Score */}
        <div className="cve-score-card" style={{ borderLeftColor: '#9c27b0' }}>
          <h3>Exploit Probability (EPSS)</h3>
          <div className="score-display">
            <span className="score-value">{(epssScore * 100).toFixed(1)}%</span>
            <span className="score-label" style={{ color: '#9c27b0' }}>
              {epssScore > 0.7 ? 'HIGH' : epssScore > 0.3 ? 'MEDIUM' : 'LOW'}
            </span>
          </div>
        </div>
      </div>

      {/* CWE Information */}
      {data.cwe && data.cwe.length > 0 && (
        <div className="cve-card">
          <h3>Related CWE</h3>
          <div className="cwe-list">
            {data.cwe.map((c, idx) => (
              <span key={idx} className="cwe-badge">
                {c.cweId}: {c.cweName}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* KEV - Active Exploit */}
      {data.kev && (
        <div className="cve-card alert-card">
          <h3>🔥 Known Exploited Vulnerability (KEV)</h3>
          <p>This CVE has known active exploits in the wild.</p>
          <p><strong>Due Date:</strong> {data.kev.dueDate || 'N/A'}</p>
        </div>
      )}

      {/* Affected Products */}
      {data.affectedProducts && data.affectedProducts.length > 0 && (
        <div className="cve-card">
          <h3>Affected Products</h3>
          <ul className="product-list">
            {data.affectedProducts.slice(0, 5).map((product, idx) => (
              <li key={idx}>{product}</li>
            ))}
            {data.affectedProducts.length > 5 && (
              <li className="more-items">+{data.affectedProducts.length - 5} more</li>
            )}
          </ul>
        </div>
      )}

      {/* Source References */}
      {data.references && data.references.length > 0 && (
        <div className="cve-card">
          <h3>References</h3>
          <ul className="reference-list">
            {data.references.slice(0, 3).map((ref, idx) => (
              <li key={idx}>
                <a href={ref} target="_blank" rel="noopener noreferrer">{ref}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}