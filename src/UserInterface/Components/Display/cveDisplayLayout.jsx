// UserInterface/Components/Display/cveDisplayLayout.jsx
// Responsabilité UNIQUE: Affichage du layout CVE (composition des composants)

import React from 'react';
import ScoreCard from '../Cards/ScoreCard.jsx';
import EpssCard from '../Cards/EpssCard.jsx';
import KEVAlert from '../Alerts/KEVAlert.jsx';
import './cveDisplay.css';

export default function CveDisplayLayout({ data }) {
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

      {/* Scores Section */}
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
            {data.cwe.slice(0, 8).map((cwe, idx) => (
              <span key={idx} className="cwe-badge">
                {cwe.cweId} — {cwe.cweName || 'Unknown'}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="cve-card">
          <h3>Related CWE (Common Weakness Enumeration)</h3>
          <p className="no-info-text">ℹ️ No specific weakness classification available from NVD for this CVE.</p>
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

      {/* References */}
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
