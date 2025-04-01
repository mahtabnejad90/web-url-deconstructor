import React, { useState } from 'react';
import './App.css';

interface ParsedURL {
  protocol: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  origin: string;
}

interface CrawlResult {
  parsedURL: ParsedURL;
  discoveredUrls: string[];
  isLoading: boolean;
  error: string | null;
}

const App: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [crawlResult, setCrawlResult] = useState<CrawlResult | null>(null);
  const [error, setError] = useState<string>('');

  const parseUrl = (inputUrl: string): ParsedURL | null => {
    try {
      const urlObj = new URL(inputUrl);
      
      return {
        protocol: urlObj.protocol,
        hostname: urlObj.hostname,
        port: urlObj.port || '(default)',
        pathname: urlObj.pathname,
        search: urlObj.search,
        hash: urlObj.hash,
        origin: urlObj.origin
      };
    } catch (err) {
      setError('Invalid URL format. Please enter a valid URL including protocol (e.g., https://example.com)');
      return null;
    }
  };

  const startCrawling = async (baseUrl: string) => {
    try {
      setError('');
      
      const parsedURL = parseUrl(baseUrl);
      if (!parsedURL) return;
  
      setCrawlResult({
        parsedURL,
        discoveredUrls: [],
        isLoading: true,
        error: null
      });
  
      const response = await fetch('/api/crawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: baseUrl }),
      });
      
      const contentType = response.headers.get('Content-Type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Server did not return JSON. Check if backend is running.');
      }
      
      const data = await response.json();
      
      console.log('Response from backend:', data);
  
      if (!response.ok || !data.discoveredUrls) {
        throw new Error(data.error || 'Failed to crawl website');
      }
  
      setCrawlResult(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          isLoading: false,
          discoveredUrls: data.discoveredUrls
        };
      });
    } catch (err) {
      console.error('Error in crawler:', err);
      setCrawlResult(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : 'An unknown error occurred'
        };
      });
    }
  };  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      setError('Please enter a URL');
      return;
    }
    
    startCrawling(url);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>URL Crawler & Deconstructor</h1>
        <p>Enter a URL to discover all its sub-URLs</p>
      </header>

      <main>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="url-input"
            />
            <button type="submit" className="submit-btn">
              {crawlResult?.isLoading ? 'Crawling...' : 'Crawl URL'}
            </button>
          </div>
          {error && <div className="error-message">{error}</div>}
        </form>

        {crawlResult && (
          <div className="results">
            <h2>URL Components</h2>
            <div className="url-components">
              <div className="component">
                <strong>Protocol:</strong> {crawlResult.parsedURL.protocol}
              </div>
              <div className="component">
                <strong>Hostname:</strong> {crawlResult.parsedURL.hostname}
              </div>
              <div className="component">
                <strong>Port:</strong> {crawlResult.parsedURL.port}
              </div>
              <div className="component">
                <strong>Pathname:</strong> {crawlResult.parsedURL.pathname || '(none)'}
              </div>
              <div className="component">
                <strong>Query Parameters:</strong> {crawlResult.parsedURL.search || '(none)'}
              </div>
              <div className="component">
                <strong>Hash Fragment:</strong> {crawlResult.parsedURL.hash || '(none)'}
              </div>
              <div className="component">
                <strong>Origin:</strong> {crawlResult.parsedURL.origin}
              </div>
            </div>

            <h2>Discovered Sub-URLs</h2>
            
            {crawlResult.isLoading ? (
              <div className="loading">
                <p>Crawling website to discover sub-URLs...</p>
                <div className="spinner"></div>
              </div>
            ) : crawlResult.error ? (
              <div className="crawl-error">
                <p>{crawlResult.error}</p>
              </div>
            ) : (
              <ul className="subpaths">
                {crawlResult.discoveredUrls.length === 0 ? (
                  <li className="no-results">No sub-URLs discovered. Try with a different URL.</li>
                ) : (
                  crawlResult.discoveredUrls.map((subUrl, index) => (
                    <li key={index} className="subpath">
                      <a href={subUrl} target="_blank" rel="noopener noreferrer">
                        {subUrl}
                      </a>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        )}
      </main>

      <footer>
        <p>Created with React and TypeScript</p>
      </footer>
    </div>
  );
};

export default App;