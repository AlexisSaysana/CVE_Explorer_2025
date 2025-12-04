import React from 'react';

export default function KEVAlert({ kev }) {
  if (!kev) return null;
  const vendor = kev.vendorProject || kev.vendor || null;
  const product = kev.product || null;
  const dueDate = kev.dueDate || kev.dateAdded || null;

  return (
    <div className="cve-card alert-card kev-alert">
      <h3>🔥 Known Exploited Vulnerability (KEV)</h3>
      <p>This CVE is listed in CISA's KEV catalog{vendor || product ? ` for ${vendor || ''} ${product || ''}` : ''}.</p>
      {dueDate && <p><strong>Reported:</strong> {dueDate}</p>}
      {kev.notes && <p style={{ color: '#5a3a00' }}>{kev.notes}</p>}
      <p><a href="https://www.cisa.gov/known-exploited-vulnerabilities-catalog" target="_blank" rel="noreferrer">View CISA KEV</a></p>
    </div>
  );
}
