import React, { useState } from 'react';
import './ThreatOverview.css';
// import { searchCvesByKeyword, getFullCveData } from '../../Infrastructure/Cve';

// Cache utilities with TTL
const setCache = (key, value, ttlSec = 600) => {
  const payload = { value, exp: Date.now() + ttlSec * 1000 };
  try {
    sessionStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // Silently fail if sessionStorage is full or unavailable
  }
};

const getCache = (key) => {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { value, exp } = JSON.parse(raw);
    if (Date.now() > exp) {
      sessionStorage.removeItem(key);
      return null;
    }
    return value;
  } catch {
    return null;
  }
};

const getCacheKey = (kw, dur) => `threat:${kw}:${dur}`;

// ThreatOverview: queries NVD for CVEs matching a keyword+period,
// then aggregates CVSS/EPSS/KEV/CWE info for display.
export default function ThreatOverview() {
  const [keyword, setKeyword] = useState('');
  const [duration, setDuration] = useState('3m');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const _durationToStart = (dur) => {
    const end = new Date();
    let start = new Date(end);
    if (dur === '1m') start.setMonth(end.getMonth() - 1);
    else if (dur === '3m') start.setMonth(end.getMonth() - 3);
    else if (dur === '6m') start.setMonth(end.getMonth() - 6);
    else if (dur === '1y') start.setFullYear(end.getFullYear() - 1);
    return { start: start.toISOString(), end: end.toISOString() };
  };

  const handleRun = async () => {
    if (!keyword || keyword.trim().length === 0) {
      setError('Entrez un mot-clé.');
      return;
    }

    // Check cache first
    const cacheKey = getCacheKey(keyword, duration);
    const cached = getCache(cacheKey);
    if (cached) {
      setData(cached);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    const t = setTimeout(() => {
      // Generate demo summary data (replace with real API/logic later)
      const demo = {
        topCvss: Array.from({ length: 10 }, (_, i) => ({ id: `CVE-2025-00${i+1}`, score: (10 - i) - Math.random()*0.8 })),
        topEpss: Array.from({ length: 10 }, (_, i) => ({ id: `CVE-2024-0${i+1}`, epss: Math.random()*1.0 })),
        avgCvss: (5 + Math.random()*4).toFixed(2),
        avgEpss: (0.2 + Math.random()*0.7).toFixed(2),
        mostFreqCwe: 'CWE-79: Cross-site scripting',
        kevCount: Math.floor(Math.random()*12),
        trend: Array.from({ length: 6 }, () => (4 + Math.random()*5).toFixed(2)),
      };
      setData(demo);
      setLoading(false);
      // Cache the result for 10 minutes (600 seconds)
      setCache(cacheKey, demo, 600);
    }, 300);

    return () => clearTimeout(t);
  };

  return (
    <div className="threat-overview">
      <div className="threat-controls">
        <label>
          Mot-clé&nbsp;:
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Ex: Oracle, Microsoft..."
          />
        </label>
        <label>
          Période&nbsp;:
          <select value={duration} onChange={(e) => setDuration(e.target.value)}>
            <option value="1m">1 mois</option>
            <option value="3m">3 mois</option>
            <option value="6m">6 mois</option>
            <option value="1y">1 an</option>
          </select>
        </label>
        <button onClick={handleRun} disabled={loading} style={{ marginLeft: 8 }}>{loading ? 'Chargement...' : 'Analyser'}</button>
      </div>

      {error && <div className="threat-empty" style={{ background: '#ffecec' }}>{error}</div>}

      {!data && !error && (
        <div className="threat-empty">Entrez un mot-clé et cliquez sur <strong>Analyser</strong> pour afficher l'aperçu.</div>
      )}

      {data && (
        <div className="threat-grid">
          <section className="card">
            <h3>🔥 Top 10 CVEs (CVSS)</h3>
            <ol>
              {data.topCvss.map((c) => (
                <li key={c.id}>{c.id} — {Number(c.score).toFixed(1)}</li>
              ))}
            </ol>
          </section>

          <section className="card">
            <h3>💥 Top EPSS</h3>
            <ol>
              {data.topEpss.map((c) => (
                <li key={c.id}>{c.id} — {Number(c.epss).toFixed(2)}</li>
              ))}
            </ol>
          </section>

          <section className="card">
            <h3>📈 Sévérité moyenne</h3>
            <div className="big-value">{data.avgCvss ?? 'N/A'}</div>
          </section>

          <section className="card">
            <h3>🧩 CWE la plus fréquente</h3>
            <div className="big-value small">{data.mostFreqCwe}</div>
          </section>

          <section className="card">
            <h3>⚠️ CVE déjà exploitées (KEV)</h3>
            <div className="big-value">{data.kevCount}</div>
          </section>

          <section className="card wide">
            <h3>📊 Tendance CVSS sur la période</h3>
            <div className="sparkline">
              {data.trend.map((v, i) => (
                <div className="bar" key={i} style={{ height: v ? `${(v/10)*100}%` : '6px', opacity: v ? 1 : 0.25 }} title={v ?? 'N/A'}></div>
              ))}
            </div>
          </section>

          <section className="card">
            <h3>📐 Score CVSS moyen</h3>
            <div className="big-value">{data.avgCvss ?? 'N/A'}</div>
          </section>

          <section className="card">
            <h3>🎯 Score EPSS moyen</h3>
            <div className="big-value">{data.avgEpss ?? 'N/A'}</div>
          </section>
        </div>
      )}
    </div>
  );
}
