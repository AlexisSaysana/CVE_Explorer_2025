// src/UserInterface/Components/cveDisplay.jsx

import React from 'react';
import './cveDisplay.css';
// utility functions are available in `cveDisplayUtils` but not used here yet
import ScoreCard from './ScoreCard';
import EpssCard from './EpssCard';
import KEVAlert from './KEVAlert';

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

  const cvssObj = data.cvssScore || null;

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

      {/* Scores Section - use dedicated small components */}
      <div className="cve-scores-grid">
        <ScoreCard cvss={cvssObj} risk={data.risk} impact={data.impact} />
        <EpssCard epss={data.epss} />
      </div>

      {/* KEV Alert */}
      {data.kev && <KEVAlert kev={data.kev} />}

      {/* CWE Information */}
      {data.cwe && data.cwe.length > 0 ? (
        <div className="cve-card">
          <h3>Related CWE (Common Weakness Enumeration)</h3>
          <div className="cwe-list">
            {(() => {
              const seen = new Set();
              return data.cwe
                .map((c) => {
                  const cweIdText = c.cweId || c.id || '';
                  const cweNumber = (cweIdText || '').match(/\d+/)?.[0];
                  const label = `${cweIdText}: ${c.cweName}`;
                  const key = `${cweNumber || cweIdText}-${c.cweName || ''}`.toLowerCase();
                  return { cweIdText, cweNumber, label, key };
                })
                .filter(({ key }) => {
                  if (seen.has(key)) return false;
                  seen.add(key);
                  return true;
                })
                .map(({ cweNumber, label }, idx) => {
                  const cweUrl = cweNumber ? `https://cwe.mitre.org/data/definitions/${cweNumber}.html` : null;
                  return cweUrl ? (
                    <a
                      key={idx}
                      className="cwe-badge"
                      href={cweUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {label}
                    </a>
                  ) : (
                    <span key={idx} className="cwe-badge">{label}</span>
                  );
                });
            })()}
          </div>
        </div>
      ) : (
        <div className="cve-card">
          <h3>Related CWE (Common Weakness Enumeration)</h3>
          <p className="no-info-text">ℹ️ No specific weakness classification available from NVD for this CVE.</p>
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