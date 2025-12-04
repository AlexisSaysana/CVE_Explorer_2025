// src/UserInterface/Components/cveInput.jsx

import React, { useState, useEffect, useRef } from 'react';
import './cveInput.css';

// Simple in-memory cache for suggestions
const suggestionCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default function CveInput({ cveId, setCveId, onAnalyze, loading }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const abortControllerRef = useRef(null);
  const isDisabled = loading || cveId.length < 5;

  // Auto-complete with optimized debounce and cache
  useEffect(() => {
    if (!cveId || cveId.length < 3) {
      setSuggestions([]);
      return;
    }

    // Cancel previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const timer = setTimeout(async () => {
      const cveUpper = cveId.trim().toUpperCase();
      const cvePattern = /^CVE-\d{4}-\d{4,}$/;

      // Check cache first
      if (suggestionCache.has(cveUpper)) {
        const cached = suggestionCache.get(cveUpper);
        if (Date.now() - cached.timestamp < CACHE_DURATION) {
          setSuggestions(cached.data);
          return;
        } else {
          suggestionCache.delete(cveUpper);
        }
      }

      // If input matches CVE format exactly, suggest it immediately
      if (cvePattern.test(cveUpper)) {
        const result = [cveUpper];
        suggestionCache.set(cveUpper, { data: result, timestamp: Date.now() });
        setSuggestions(result);
        return;
      }

      // Try API for partial matches
      try {
        const url = `https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=${cveUpper}&resultsPerPage=10`;
        const res = await fetch(url, { signal: abortControllerRef.current.signal });

        if (res.ok) {
          const data = await res.json();
          if (data?.vulnerabilities) {
            let ids = data.vulnerabilities.map(v => v.cve.id);
            
            // Sort to prioritize matches that start with the input year
            ids.sort((a, b) => {
              const aStartsWith = a.startsWith(cveUpper) ? 0 : 1;
              const bStartsWith = b.startsWith(cveUpper) ? 0 : 1;
              if (aStartsWith !== bStartsWith) return aStartsWith - bStartsWith;
              // Then sort by CVE ID numerically (descending = newest first)
              const aNum = parseInt(a.split('-')[2], 10);
              const bNum = parseInt(b.split('-')[2], 10);
              return bNum - aNum;
            });
            
            ids = ids.slice(0, 5);
            suggestionCache.set(cveUpper, { data: ids, timestamp: Date.now() });
            setSuggestions(ids);
            return;
          }
        }
      } catch {
        // API failed or request aborted
      }

      // Fallback: just suggest the input if it looks like CVE
      setSuggestions([]);
    }, 150); // Reduced from 400ms to 150ms

    return () => {
      clearTimeout(timer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [cveId]);

  const handleSelectSuggestion = (suggestion) => {
    setCveId(suggestion);
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
          placeholder="Enter a CVE ID (ex: CVE-2024-XXXX)"
          value={cveId}
          onChange={(e) => {
            setCveId(e.target.value.toUpperCase());
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
