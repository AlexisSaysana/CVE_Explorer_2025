// CVE input with autocomplete suggestions from NVD API

import React, { useState, useEffect, useRef } from 'react';
import { CVE_PATTERN } from '../../../Application/constants/messages.js';
import './CveInput.css';

export default function CveInput({ cveId, setCveId, onAnalyze, loading }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const abortControllerRef = useRef(null);

  const getLastPart = (value) => {
    const parts = value.split(',');
    return parts[parts.length - 1].trim();
  };

  const cveList = cveId.split(',').map(c => c.trim()).filter(c => c.length > 0);
  const hasValidCve = cveList.some(c => CVE_PATTERN.test(c));
  const isDisabled = loading || !hasValidCve;

  // Fetch autocomplete suggestions for the last CVE being typed
  useEffect(() => {
    const lastPart = getLastPart(cveId).toUpperCase();

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    if (!lastPart || lastPart.length < 5 || CVE_PATTERN.test(lastPart)) {
      return undefined;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    (async () => {
      try {
        const url = `https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=${lastPart}&resultsPerPage=10`;
        const res = await fetch(url, { signal: controller.signal });

        if (res.ok) {
          const data = await res.json();
          if (data?.vulnerabilities) {
            let ids = data.vulnerabilities.map(v => v.cve.id);

            // Prioritize matches starting with input, then sort by CVE number descending
            ids.sort((a, b) => {
              const aStartsWith = a.startsWith(lastPart) ? 0 : 1;
              const bStartsWith = b.startsWith(lastPart) ? 0 : 1;
              if (aStartsWith !== bStartsWith) return aStartsWith - bStartsWith;
              const aNum = parseInt(a.split('-')[2], 10);
              const bNum = parseInt(b.split('-')[2], 10);
              return bNum - aNum;
            });

            setSuggestions(ids.slice(0, 5));
          }
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('NVD API error:', err);
        }
        setSuggestions([]);
      } finally {
        abortControllerRef.current = null;
      }
    })();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [cveId]);

  const handleSelectSuggestion = (suggestion) => {
    // Replace the last CVE with the suggestion
    const parts = cveId.split(',');
    parts[parts.length - 1] = suggestion;
    setCveId(parts.join(', '));
    setShowSuggestions(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isDisabled) {
      onAnalyze();
      setShowSuggestions(false);
    }
  };

  return (
    <div className="cve-input-wrapper">
      <div className="cve-input-container">
        <input
          type="text"
          className="cve-input"
          placeholder="Enter CVE ID(s) - separate with commas (ex: CVE-2024-XXXX, CVE-2023-XXXX)"
          value={cveId}
          onChange={(e) => {
            const nextValue = e.target.value.toUpperCase();
            setCveId(nextValue);

            const lastPart = getLastPart(nextValue);

            if (abortControllerRef.current) {
              abortControllerRef.current.abort();
              abortControllerRef.current = null;
            }

            if (!lastPart || lastPart.length < 5) {
              setSuggestions([]);
              setShowSuggestions(false);
              return;
            }

            if (CVE_PATTERN.test(lastPart.toUpperCase())) {
              setSuggestions([lastPart.toUpperCase()]);
              setShowSuggestions(true);
              return;
            }

            setShowSuggestions(true);
          }}
          onKeyPress={handleKeyPress}
          onFocus={() => cveId.length > 0 && suggestions.length > 0 && setShowSuggestions(true)}
          disabled={loading}
        />
        <button
          className="cve-button"
          onClick={() => {
            onAnalyze();
            setShowSuggestions(false);
          }}
          disabled={isDisabled}
        >
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="cve-suggestions-dropdown">
          {suggestions.map((suggestion, idx) => (
            <div
              key={idx}
              className="cve-suggestion-item"
              onClick={() => handleSelectSuggestion(suggestion)}
            >
              <span className="cve-suggestion-icon">🔍</span>
              <span className="cve-suggestion-text">{suggestion}</span>
            </div>
          ))}
        </div>
      )}

      {showSuggestions && (
        <div
          className="cve-suggestions-overlay"
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
}
