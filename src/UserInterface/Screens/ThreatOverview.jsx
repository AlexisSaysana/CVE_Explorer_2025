import React, { useState } from 'react';
import './ThreatOverview.css';
// import { searchCvesByKeyword, getFullCveData } from '../../Infrastructure/Cve';
import { searchCvesByKeyword, getFullCveData } from '../../Infrastructure/Cve';

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

  const handleRun = async () => {
    if (!keyword || keyword.trim().length === 0) {
      setError('Entrez un mot-clé.');
      return;
    }

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

    try {
      const end = new Date();
      let start = new Date(end);
      if (duration === '1m') start.setMonth(end.getMonth() - 1);
      else if (duration === '3m') start.setMonth(end.getMonth() - 3);
      else if (duration === '6m') start.setMonth(end.getMonth() - 6);
      else if (duration === '1y') start.setFullYear(end.getFullYear() - 1);

      const cveIds = await searchCvesByKeyword(keyword, {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      });

      if (!cveIds || cveIds.length === 0) {
        setError('Aucune CVE trouvée pour ce mot-clé.');
        setLoading(false);
        return;
      }

      const sampleCveIds = cveIds.slice(0, 50);
      const results = [];
      const concurrency = 5;
      for (let i = 0; i < sampleCveIds.length; i += concurrency) {
        const batch = sampleCveIds.slice(i, i + concurrency);
        const batchResults = await Promise.all(batch.map(id => getFullCveData(id)));
        results.push(...batchResults);
      }

      const validResults = results.filter(r => r !== null);
      if (validResults.length === 0) {
        setError('Impossible de récupérer les détails des CVEs.');
        setLoading(false);
        return;
      }

      const topCvss = validResults
        .filter(r => r.cvssScore !== undefined)
        .sort((a, b) => (b.cvssScore || 0) - (a.cvssScore || 0))
        .slice(0, 10)
        .map(r => ({ id: r.cveId, score: r.cvssScore }));

      const topEpss = validResults
        .filter(r => r.epssScore !== undefined)
        .sort((a, b) => (b.epssScore || 0) - (a.epssScore || 0))
        .slice(0, 10)
        .map(r => ({ id: r.cveId, epss: r.epssScore }));

      const avgCvss = (validResults.reduce((sum, r) => sum + (r.cvssScore || 0), 0) / validResults.length).toFixed(2);
      const avgEpss = (validResults.reduce((sum, r) => sum + (r.epssScore || 0), 0) / validResults.length).toFixed(2);

      const cweMap = {};
      validResults.forEach(r => {
        if (r.cweList && Array.isArray(r.cweList)) {
          r.cweList.forEach(cwe => {
            cweMap[cwe.cweId] = (cweMap[cwe.cweId] || 0) + 1;
          });
        }
      });
      const sorted = Object.entries(cweMap).sort((a, b) => b[1] - a[1]);
      const mostFreqCwe = sorted.length > 0 ? sorted[0][0] : 'N/A';

      const kevCount = validResults.filter(r => r.isKev).length;

      const monthMap = {};
      validResults.forEach(r => {
        if (r.published) {
          const month = r.published.substring(0, 7);
          if (!monthMap[month]) monthMap[month] = [];
          monthMap[month].push(r.cvssScore || 0);
        }
      });
      const trend = Object.keys(monthMap)
        .sort()
        .slice(-6)
        .map(m => (monthMap[m].reduce((a, b) => a + b, 0) / monthMap[m].length).toFixed(2));

      const aggregated = {
        topCvss,
        topEpss,
        avgCvss,
        avgEpss,
        mostFreqCwe,
        kevCount,
        trend: trend.length > 0 ? trend : [0, 0, 0, 0, 0, 0],
      };

      setData(aggregated);
      setCache(cacheKey, aggregated, 600);
    } catch (err) {
      console.error('❌ Threat Overview error:', err);
      setError(`Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
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
