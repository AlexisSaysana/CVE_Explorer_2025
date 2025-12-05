import React, { useState } from 'react';
import './screenThreat.css';
import { executeThreatAnalysis } from '../../Application/UseCases/ThreatAnalysisUseCase.js';
import { getCache, setCache } from '../Services/serviceCache.js';
import CvssDistributionChart from '../Components/Charts/distributionChartCVSS.jsx';
import EpssRiskChart from '../Components/Charts/riskChartEPSS.jsx';
import TimelineChart from '../Components/Charts/chartTimeline.jsx';
import CvssTrendChart from '../Components/Charts/trendChartCVSS.jsx';

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
      const endDate = new Date();
      const startDate = getDurationFilter(duration);

      // Execute threat analysis use case
      const summary = await executeThreatAnalysis(keyword, startDate, endDate);

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
            {/* Charts Section */}
            <div className="charts-section">
              <div className="chart-row">
                <div className="chart-item">
                  <CvssDistributionChart data={data.allCves} />
                </div>
                <div className="chart-item">
                  <EpssRiskChart data={data.allCves} />
                </div>
              </div>
              <div className="chart-row">
                <div className="chart-item">
                  <TimelineChart data={data.allCves} />
                </div>
                <div className="chart-item">
                  <CvssTrendChart data={data.allCves} />
                </div>
              </div>
            </div>

            {/* Statistics Section */}
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

            <section className="card stat-card">
              <h3>📊 Average CVSS</h3>
              <div className="big-value">{data.avgCvss}</div>
              <div className="cvss-bar-container">
                <div 
                  className="cvss-bar" 
                  style={{ 
                    width: `${(data.avgCvss / 10) * 100}%`,
                    background: data.avgCvss < 4 ? '#10b981' : 
                               data.avgCvss < 7 ? '#f59e0b' : 
                               data.avgCvss < 9 ? '#f97316' : '#dc2626'
                  }}
                />
              </div>
              <div className="stat-description">
                {data.avgCvss < 4 ? '✅ Low severity' : 
                 data.avgCvss < 7 ? '⚠️ Medium severity' : 
                 data.avgCvss < 9 ? '🔶 High severity' : '🔴 Critical severity'}
              </div>
            </section>

            <section className="card stat-card">
              <h3>📊 Average EPSS</h3>
              <div className="big-value">{(Number(data.avgEpss) * 100).toFixed(1)}%</div>
              <div className="cvss-bar-container">
                <div 
                  className="cvss-bar" 
                  style={{ 
                    width: `${Number(data.avgEpss) * 100}%`,
                    background: data.avgEpss < 0.1 ? '#10b981' : 
                               data.avgEpss < 0.3 ? '#f59e0b' : 
                               data.avgEpss < 0.5 ? '#f97316' : '#dc2626'
                  }}
                />
              </div>
              <div className="stat-description">
                {data.avgEpss < 0.1 ? '✅ Low exploitation risk' : 
                 data.avgEpss < 0.3 ? '⚠️ Medium exploitation risk' : 
                 data.avgEpss < 0.5 ? '🔶 High exploitation risk' : '🔴 Critical exploitation risk'}
              </div>
            </section>

            <section className="card">
              <h3>🧩 Top 5 Common Weaknesses (CWE)</h3>
              {data.topCwes && data.topCwes.length > 0 ? (
                <ul className="cwe-list">
                  {data.topCwes.map((item, idx) => (
                    <li key={idx}>
                      <a 
                        href={`https://cwe.mitre.org/data/definitions/${item.cwe.match(/\d+/)?.[0]}.html`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cwe-link"
                      >
                        {item.cwe}
                      </a>
                      <span className="cwe-count">({item.count})</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="big-value small">No CWE data</div>
              )}
            </section>

            <section className="card">
              <h3>⚠️ Known Exploited CVEs (KEV)</h3>
              <div className="big-value">{data.kevCount}</div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
