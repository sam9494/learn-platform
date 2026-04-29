import { useState, useEffect } from 'react';

const API = 'http://localhost:3002/api';

export default function HomePage({ onSelectDomain }) {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/domains`)
      .then((r) => r.json())
      .then((data) => {
        setDomains(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="home-loading">LOADING...</div>;
  }

  return (
    <div className="home-page">
      <div className="home-header">
        <div className="home-ornament">{'\u2726'} {'\u2726'} {'\u2726'}</div>
        <h1 className="home-title">Research Tech Tree</h1>
        <p className="home-subtitle">Choose a Research Domain</p>
        <div className="home-ornament">{'\u2500\u2500\u2500'} {'\u2726'} {'\u2500\u2500\u2500'}</div>
      </div>

      <div className="home-grid">
        {domains.map((domain) => (
          <div
            key={domain.id}
            className="topic-card"
            onClick={() => onSelectDomain(domain.id)}
          >
            <div className="topic-card-body">
              <div className="topic-icon">{domain.icon}</div>
              <h2 className="topic-name">{domain.name}</h2>
              <p className="topic-name-en">{domain.nameEn}</p>
              <p className="topic-desc">{domain.description}</p>
              <div className="topic-meta">
                <span className="topic-count">
                  {domain.subdomainCount} subdomains · {domain.paperCount} papers
                </span>
                <span className="topic-enter">ENTER {'\u25B6'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="home-footer">
        <div className="home-ornament">{'\u2500\u2500\u2500'} {'\u2726'} {'\u2500\u2500\u2500'}</div>
      </div>
    </div>
  );
}
