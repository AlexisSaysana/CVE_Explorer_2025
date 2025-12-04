// src/UserInterface/Components/cveInput.jsx

import './cveInput.css';

export default function CveInput({ cveId, setCveId, onAnalyze, loading }) {
  const isDisabled = loading || cveId.length < 5;

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isDisabled) {
      onAnalyze();
    }
  };

  return (
    <div className="cve-input-container">
      <input
        type="text"
        className="cve-input"
        placeholder="Enter a CVE ID (ex: CVE-2024-XXXX)"
        value={cveId}
        onChange={(e) => setCveId(e.target.value.toUpperCase())}
        onKeyPress={handleKeyPress}
        disabled={loading}
      />
      <button
        className="cve-button"
        onClick={onAnalyze}
        disabled={isDisabled}
      >
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>
    </div>
  );
}
