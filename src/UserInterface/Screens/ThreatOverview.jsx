import React, { useState } from 'react';
import './ThreatOverview.css';
import { NvdHttpCveGateway } from '../../Infrastructure/Gateways/gatewayNVD.js';
import { EpssHttpCveGateway } from '../../Infrastructure/Gateways/gatewayEPSS.js';
import { normalizeNvdData } from '../../Application/Normalizers/nvdNormalizer.js';

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

export default function ThreatOverview() {
  const [keyword, setKeyword] = useState('');
  const [duration, setDuration] = useState('3m');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getDurationFilter = (dur) => {
    const end = new Date();
    let start = new Date(end);
    if (dur === '1m') start.setMonth(end.getMonth() - 1);
    else if (dur === '3m') start.setMonth(end.getMonth() - 3);
    else if (dur === '6m') start.setMonth(end.getMonth() - 6);
    else if (dur === '1y') start.setFullYear(end.getFullYear() - 1);
    return start;
  };

  const handleRun = async () => {
    if (!keyword || keyword.trim().length === 0) {
      setError('Please enter a keyword.');
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
      // Calculate date range for API query
      const endDate = new Date();
      const startDate = getDurationFilter(duration);
      
      // Format dates for NVD API (ISO 8601 format: YYYY-MM-DDTHH:MM:SS.000)
      const pubStartDate = startDate.toISOString().split('.')[0] + '.000';
      const pubEndDate = endDate.toISOString().split('.')[0] + '.000';

      // Fetch CVEs by keyword from NVD with date filtering
      const nvdGateway = new NvdHttpCveGateway();
      const rawVulnerabilities = await nvdGateway.searchByKeyword(keyword, pubStartDate, pubEndDate, 200);

      if (!rawVulnerabilities || rawVulnerabilities.length === 0) {
        setError(`No CVE found for "${keyword}" in this period.`);
        setLoading(false);
        return;
      }

      const filteredByDate = rawVulnerabilities;

      // Normalize and enrich with CVSS scores
      const enrichedCves = filteredByDate.map(v => {
        const nvdData = normalizeNvdData(v.cve);
        return {
          id: v.cve.id,
          cvss: nvdData?.cvss?.baseScore || 0,
          description: nvdData?.description || '',
          published: v.cve.published,
          cwe: nvdData?.cwe?.[0]?.cweName || 'N/A',
        };
      });

      // Sort by CVSS score descending (highest first) and take top 10
      const topByCvss = enrichedCves.sort((a, b) => b.cvss - a.cvss).slice(0, 10);
      
      // Fetch EPSS scores in parallel for the top 10
      const epssGateway = new EpssHttpCveGateway();
      const epssPromises = topByCvss.map(c => epssGateway.getScore(c.id).catch(() => null));
      const epssScores = await Promise.all(epssPromises);

      // Attach EPSS scores
      const enrichedCvesWithEpss = topByCvss.map((c, idx) => ({
        ...c,
        epss: epssScores[idx]?.score || 0,
      }));

      // Calculate aggregates
      const avgCvss = (enrichedCvesWithEpss.reduce((sum, c) => sum + c.cvss, 0) / enrichedCvesWithEpss.length).toFixed(1);
      const avgEpss = (enrichedCvesWithEpss.reduce((sum, c) => sum + c.epss, 0) / enrichedCvesWithEpss.length).toFixed(3);
      const cweFreq = {};
      enrichedCvesWithEpss.forEach(c => {
        if (c.cwe !== 'N/A') {
          cweFreq[c.cwe] = (cweFreq[c.cwe] || 0) + 1;
        }
      });
      const mostFreqCwe = Object.keys(cweFreq).length > 0
        ? Object.entries(cweFreq).sort((a, b) => b[1] - a[1])[0][0]
        : 'N/A';

      const summary = {
        topCvss: enrichedCvesWithEpss,
        topEpss: enrichedCvesWithEpss.slice().sort((a, b) => b.epss - a.epss),
        avgCvss,
        avgEpss,
        mostFreqCwe,
        kevCount: 0,
        totalCves: filteredByDate.length,
      };

      setData(summary);
      setCache(cacheKey, summary, 600);
    } catch (err) {
      console.error('ThreatOverview error:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="threat-overview">
      <div className="threat-controls">
        <label>
          Keyword:
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Ex: Oracle, Microsoft, Apache..."
          />
        </label>
        <label>
          Period:
          <select value={duration} onChange={(e) => setDuration(e.target.value)}>
            <option value="1m">1 month</option>
            <option value="3m">3 months</option>
            <option value="6m">6 months</option>
            <option value="1y">1 year</option>
          </select>
        </label>
        <button onClick={handleRun} disabled={loading}>
          {loading ? 'Loading...' : 'Analyze'}
        </button>
      </div>

      <div className="threat-results">
        {error && <div className="threat-empty error">⚠️ {error}</div>}

        {!data && !error && (
          <div className="threat-empty">
            Enter a keyword and click <strong>Analyze</strong> to display threat overview.
          </div>
        )}

        {data && (
          <div className="threat-grid">
            <section className="card">
              <h3>🔥 Top 10 CVEs (by CVSS)</h3>
              <ol>
                {data.topCvss.map((c) => (
                  <li key={c.id}>
                    <strong>{c.id}</strong> — Score {Number(c.cvss).toFixed(1)}/10
                  </li>
                ))}
              </ol>
            </section>

            <section className="card">
              <h3>💥 Top 10 EPSS (Exploitation)</h3>
              <ol>
                {data.topEpss.map((c) => (
                  <li key={c.id}>
                    <strong>{c.id}</strong> — Prob. {(Number(c.epss) * 100).toFixed(1)}%
                  </li>
                ))}
              </ol>
            </section>

            <section className="card">
              <h3>📊 Average CVSS</h3>
              <div className="big-value">{data.avgCvss}</div>
            </section>

            <section className="card">
              <h3>📊 Average EPSS</h3>
              <div className="big-value">{(Number(data.avgEpss) * 100).toFixed(1)}%</div>
            </section>

            <section className="card">
              <h3>🧩 Most Common Weakness</h3>
              <div className="big-value small">{data.mostFreqCwe}</div>
            </section>

            <section className="card">
              <h3>⚠️ Known Exploited CVEs (KEV)</h3>
              <div className="big-value">{data.kevCount}</div>
            </section>

            <section className="card wide">
              <h3>📈 Total CVEs Found</h3>
              <div className="big-value">{data.totalCves}</div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
