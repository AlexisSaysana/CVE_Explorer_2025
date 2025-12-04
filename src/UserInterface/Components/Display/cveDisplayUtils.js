// Helper functions for CVE display logic (colors, labels, formatting)

export function getSeverityColor(score) {
  if (typeof score !== 'number') return '#388e3c';
  if (score >= 9) return '#d32f2f';
  if (score >= 7) return '#f57c00';
  if (score >= 4) return '#fbc02d';
  return '#388e3c';
}

export function getSeverityLabel(score) {
  if (typeof score !== 'number') return 'UNKNOWN';
  if (score >= 9) return 'CRITICAL';
  if (score >= 7) return 'HIGH';
  if (score >= 4) return 'MEDIUM';
  return 'LOW';
}

export function formatEpssPercent(epssScore) {
  if (typeof epssScore !== 'number') return 'N/A';
  return `${(epssScore * 100).toFixed(1)}%`;
}

export function formatCvssValue(cvssObj) {
  const val = (cvssObj && (cvssObj.baseScore ?? null)) ?? null;
  if (typeof val === 'number') return val.toFixed(1);
  return 'N/A';
}

export default {
  getSeverityColor,
  getSeverityLabel,
  formatEpssPercent,
  formatCvssValue,
};
