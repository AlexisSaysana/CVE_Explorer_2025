// src/UserInterface/Screens/HomeScreen.jsx
// Responsabilité UNIQUE: Orchestrer l'UI (input, display, upload)
// Délègue la logique métier aux services

import React, { useState } from 'react';
import CveInput from '../Components/Input/CveInput.jsx';
import CveDisplay from '../Components/Display/cveDisplay.jsx';
import { analyzeCveUseCase } from '../../Application/UseCases.js';
import { processBulkCves } from '../../Application/Services/BulkCveProcessor.js';
import ReadFile from '../Components/Upload/ReadFile.jsx';
import { parseCveList } from '../Services/CveValidator.js';
import { extractCvesFromRows } from '../Services/FileParser.js';
import './HomeScreen.css';

// Helper utility for color
function getSeverityColor(score) {
  if (typeof score !== 'number') return '#388e3c';
  if (score >= 9) return '#d32f2f';
  if (score >= 7) return '#f57c00';
  if (score >= 4) return '#fbc02d';
  return '#388e3c';
}

export default function HomeScreen() {
  const [cveId, setCveId] = useState('');
  const [cveData, setCveData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Bulk analysis state
  const [bulkCveList, setBulkCveList] = useState([]);
  const [bulkResults, setBulkResults] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState(null);

  const handleAnalyze = async () => {
    if (!cveId) {
      setError('Please enter a CVE ID.');
      return;
    }

    // Parse and validate CVE list
    const cveList = parseCveList(cveId);

    if (cveList.length === 0) {
      setError('Please enter valid CVE ID(s).');
      return;
    }

    // If single CVE, show in main display; if multiple, show as bulk
    if (cveList.length === 1) {
      setLoading(true);
      setError(null);
      setCveData(null);

      try {
        const data = await analyzeCveUseCase.execute(cveList[0]);
        setCveData(data);
      } catch (err) {
        setError(err.message || 'Error fetching CVE data. Please try again.');
        console.error('Analysis error:', err);
      } finally {
        setLoading(false);
      }
    } else {
      // Multiple CVEs: analyze as bulk
      setBulkCveList(cveList);
      setBulkResults([]);
      setBulkError(null);
      analyzeBulk(cveList);
    }
  };

  const handleUploaded = (rows) => {
    // Extract CVE IDs from uploaded file
    const cveArray = extractCvesFromRows(rows);
    setBulkCveList(cveArray);
    setBulkResults([]);
    setBulkError(null);
    
    console.log(`Found ${cveArray.length} CVE(s) in file:`, cveArray);

    // Auto-start analysis if CVEs found
    if (cveArray.length > 0) {
      analyzeBulk(cveArray);
    } else {
      setBulkError('No CVE IDs found in the uploaded file. Expected format: CVE-XXXX-XXXX');
    }
  };

  const analyzeBulk = async (cveArray) => {
    setBulkLoading(true);
    setBulkError(null);
    setBulkResults([]);

    try {
      const results = await processBulkCves(cveArray, analyzeCveUseCase, 5);
      setBulkResults(results);
    } catch (err) {
      console.error('Bulk analysis error:', err);
      setBulkError('Error analyzing CVEs. Please try again.');
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="home-screen">
      <div className="hero-section">
        <h1>CVE Explorer</h1>
        <p>Analyze and visualize Common Vulnerabilities and Exposures</p>
      </div>

      <div className="content-wrapper">
        <div className="upload-section">
          <ReadFile onData={handleUploaded} />
        </div>
        <div className="input-section">
          <CveInput
            cveId={cveId}
            setCveId={setCveId}
            onAnalyze={handleAnalyze}
            loading={loading}
          />
        </div>

        <div className="results-section">
          {/* Single CVE Results */}
          {(cveData || loading || error) && (
            <div className="single-cve-results">
              <CveDisplay
                data={cveData}
                loading={loading}
                error={error}
              />
            </div>
          )}

          {/* Bulk CVE Results */}
          {bulkResults.length > 0 && (
            <div className="bulk-cve-results">
              <div className="bulk-header">
                <h2>📊 Bulk Analysis Results ({bulkResults.length} CVEs)</h2>
                <button
                  className="clear-bulk-btn"
                  onClick={() => {
                    setBulkCveList([]);
                    setBulkResults([]);
                    setBulkError(null);
                  }}
                >
                  Clear Results
                </button>
              </div>
              <div className="bulk-grid">
                {bulkResults.map((result, idx) => (
                  <div
                    key={idx}
                    className={`bulk-item ${result.error ? 'error' : 'success'}`}
                    onClick={() => {
                      if (result.data) {
                        setCveData(result.data);
                        setCveId(result.cveId);
                        setError(null);
                      }
                    }}
                  >
                    <div className="bulk-item-header">
                      <span className="bulk-cve-id">{result.cveId}</span>
                      {result.data?.cvssScore?.baseScore && (
                        <span
                          className="bulk-cvss"
                          style={{
                            backgroundColor: getSeverityColor(result.data.cvssScore.baseScore),
                          }}
                        >
                          {result.data.cvssScore.baseScore.toFixed(1)}
                        </span>
                      )}
                    </div>
                    {result.error ? (
                      <div className="bulk-item-error">⚠️ {result.error}</div>
                    ) : (
                      <>
                        <p className="bulk-description">
                          {result.data?.description
                            ? result.data.description.substring(0, 100) + '...'
                            : 'No description'}
                        </p>
                        {result.data?.kev && (
                          <span className="bulk-kev-badge">🔥 KEV</span>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {bulkLoading && (
            <div className="bulk-loading">
              <div className="spinner"></div>
              <p>Analyzing {bulkCveList.length} CVEs...</p>
            </div>
          )}

          {bulkError && (
            <div className="bulk-error">
              <p>⚠️ {bulkError}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
