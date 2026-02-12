import { useState, useEffect } from 'react';
import DatePicker from './DatePicker';

const PROGRAMMING_LANGUAGES = [
  '',
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'Go',
  'Rust',
  'C++',
  'C',
  'C#',
  'Ruby',
  'PHP',
  'Swift',
  'Kotlin',
  'Scala',
  'Shell',
  'HTML',
  'CSS',
  'Vue',
  'Dart',
];

// Calculate default dates (last 30 days)
function getDefaultDates() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return {
    startDate: thirtyDaysAgo.toISOString().split('T')[0],
    endDate: now.toISOString().split('T')[0],
  };
}

// Calculate 90 days ago for min date
function getMinDate() {
  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  return ninetyDaysAgo.toISOString().split('T')[0];
}

export default function SearchForm({ onSearch, isLoading }) {
  const [repoName, setRepoName] = useState('');
  const [language, setLanguage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minStars, setMinStars] = useState('');
  const [minIncreasedStars, setMinIncreasedStars] = useState('');

  // Set default dates on mount
  useEffect(() => {
    const defaults = getDefaultDates();
    setStartDate(defaults.startDate);
    setEndDate(defaults.endDate);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    onSearch({
      repoName,
      language,
      startDate,
      endDate,
      minStars: minStars ? parseInt(minStars, 10) : 0,
      minIncreasedStars: minIncreasedStars ? parseInt(minIncreasedStars, 10) : 0,
    });
  }

  function handleReset() {
    const defaults = getDefaultDates();
    setRepoName('');
    setLanguage('');
    setStartDate(defaults.startDate);
    setEndDate(defaults.endDate);
    setMinStars('');
    setMinIncreasedStars('');
  }

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <h2>Search GitHub Trending Repositories</h2>
      <p className="form-hint">
        Find repos with the most star growth. Date range limited to last 90 days for accurate data.
      </p>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="repoName">Repository Name</label>
          <input
            type="text"
            id="repoName"
            value={repoName}
            onChange={(e) => setRepoName(e.target.value)}
            placeholder="e.g., react, vue, tensorflow"
          />
        </div>

        <div className="form-group">
          <label htmlFor="language">Programming Language</label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="">All Languages</option>
            {PROGRAMMING_LANGUAGES.filter(Boolean).map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Start Date <span className="label-hint">(max 90 days ago)</span></label>
          <DatePicker
            value={startDate}
            onChange={setStartDate}
            placeholder="Select start date"
            id="startDate"
            minDate={getMinDate()}
          />
        </div>

        <div className="form-group">
          <label>End Date</label>
          <DatePicker
            value={endDate}
            onChange={setEndDate}
            placeholder="Select end date"
            id="endDate"
            minDate={getMinDate()}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="minStars">Minimum Total Stars</label>
          <input
            type="number"
            id="minStars"
            value={minStars}
            onChange={(e) => setMinStars(e.target.value)}
            placeholder="e.g., 1000"
            min="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="minIncreasedStars">Minimum Increased Stars</label>
          <input
            type="number"
            id="minIncreasedStars"
            value={minIncreasedStars}
            onChange={(e) => setMinIncreasedStars(e.target.value)}
            placeholder="e.g., 100"
            min="0"
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search'}
        </button>
        <button type="button" onClick={handleReset} disabled={isLoading}>
          Reset
        </button>
      </div>
    </form>
  );
}
