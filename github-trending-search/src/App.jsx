import { useState } from 'react';
import SearchForm from './components/SearchForm';
import ResultsTable from './components/ResultsTable';
import { searchRepositories } from './services/githubApi';
import { useTheme } from './context/ThemeContext';
import './App.css';

function App() {
  const { theme, toggleTheme } = useTheme();
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  async function handleSearch(searchParams) {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setDateRange({
      startDate: searchParams.startDate,
      endDate: searchParams.endDate,
    });

    try {
      const repos = await searchRepositories(searchParams);
      setResults(repos);
    } catch (err) {
      setError(err.message || 'An error occurred while searching');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <button 
          className="theme-toggle" 
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          )}
        </button>
        <h1>GitHub Trending Search</h1>
        <p>Discover trending repositories on GitHub</p>
      </header>

      <main className="app-main">
        <SearchForm onSearch={handleSearch} isLoading={isLoading} />

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {isLoading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Searching repositories...</p>
          </div>
        )}

        {!isLoading && hasSearched && (
          <ResultsTable results={results} dateRange={dateRange} />
        )}
      </main>

      <footer className="app-footer">
        <p>
          Powered by{' '}
          <a
            href="https://docs.github.com/en/rest"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub API
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
