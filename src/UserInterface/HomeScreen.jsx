// src/UserInterface/HomeScreen.jsx

import React, { useState } from 'react';
import CveInput from './Components/cveInput';
import CveDisplay from './Components/cveDisplay';
import { analyzeCveUseCase } from '../Application/UseCases';
import ReadFile from './ReadFile/ReadFile'
import './HomeScreen.css';

export default function HomeScreen() {
  const [cveId, setCveId] = useState('');
  const [cveData, setCveData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedData, setUploadedData] = useState(null);

  const handleAnalyze = async () => {
    if (!cveId) {
      setError('Please enter a CVE ID.');
      return;
    }

    setLoading(true);
    setError(null);
    setCveData(null);

    try {
      // Use the AnalyzeCveUseCase to fetch and analyze CVE
      const data = await analyzeCveUseCase.execute(cveId);
      setCveData(data);
    } catch (err) {
      setError(err.message || 'Error fetching CVE data. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploaded = (rows) => {
    // rows is an array of arrays (parsed CSV). For now we store it and log it.
    setUploadedData(rows)
    console.log('Uploaded rows:', rows)
  }

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
          <CveDisplay
            data={cveData}
            loading={loading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}
