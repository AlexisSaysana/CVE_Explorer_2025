// src/UserInterface/HomeScreen.jsx

import React, { useState } from 'react';
import CveInput from './Components/cveInput';
import CveDisplay from './Components/cveDisplay';
import './HomeScreen.css';

export default function HomeScreen() {
  const [cveId, setCveId] = useState('');
  const [cveData, setCveData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!cveId) {
      setError('Please enter a CVE ID.');
      return;
    }

    setLoading(true);
    setError(null);
    setCveData(null);

    try {
      // TODO: Replace with real API calls
      // For now, simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock data - will be replaced with real NVD/EPSS/KEV data
      setCveData({
        id: cveId,
        published: '2024-01-15',
        description: 'This is a sample CVE description. Real data will come from NVD API.',
        cvssScore: {
          baseScore: 8.5,
          vector: 'CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H'
        },
        epssScore: 0.85,
        cwe: [
          { cweId: 'CWE-119', cweName: 'Improper Restriction of Operations within the Bounds of a Memory Buffer' },
          { cweId: 'CWE-787', cweName: 'Out-of-bounds Write' }
        ],
        kev: null, // Set to null if no active exploit, otherwise add data
        affectedProducts: [
          'Apache Tomcat 8.0 - 8.5.99',
          'Apache Tomcat 9.0 - 9.0.79',
          'Oracle Java SE 11.0.20 and earlier'
        ],
        references: [
          'https://nvd.nist.gov/vuln/detail/' + cveId,
          'https://www.cisa.gov/known-exploited-vulnerabilities-catalog'
        ]
      });
    } catch (err) {
      setError('Error fetching CVE data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-screen">
      <div className="hero-section">
        <h1>CVE Explorer</h1>
        <p>Analyze and visualize Common Vulnerabilities and Exposures</p>
      </div>

      <CveInput
        cveId={cveId}
        setCveId={setCveId}
        onAnalyze={handleAnalyze}
        loading={loading}
      />

      <CveDisplay
        data={cveData}
        loading={loading}
        error={error}
      />
    </div>
  );
}
      <Text style={styles.header}>CVE Explorer</Text>
      <Text style={styles.subheader}>Visual Threat Intelligence Challenge</Text>
      
      {/* Composant de Saisie (Input) */}
      <CveInput 
        cveId={cveId}
        setCveId={setCveId}
        onAnalyze={handleAnalyze}
        loading={loading}
      />
      
      {/* Messages d'Erreur */}
      {error && <Text style={styles.errorText}>⚠️ {error}</Text>}

      {/* Composant d'Affichage des Résultats */}
      <CveDisplay 
        data={cveData} 
        loading={loading} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  subheader: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    padding: 10,
    backgroundColor: '#ffe6e6',
    borderRadius: 5,
  }
});