export default function ResultsTable({ results, dateRange }) {
  if (!results || results.length === 0) {
    return (
      <div className="no-results">
        <p>No repositories found. Try adjusting your search criteria.</p>
      </div>
    );
  }

  return (
    <div className="results-container">
      <h2>Search Results ({results.length} repositories)</h2>
      <div className="table-wrapper">
        <table className="results-table">
          <thead>
            <tr>
              <th>Repository Name</th>
              <th>Description</th>
              <th>Language</th>
              <th>Total Stars</th>
              <th>Increased Stars</th>
              <th>Date Range</th>
            </tr>
          </thead>
          <tbody>
            {results.map((repo) => (
              <tr key={repo.id}>
                <td>
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="repo-link"
                  >
                    {repo.full_name}
                  </a>
                </td>
                <td className="description-cell" title={repo.description || 'No description available'}>
                  {repo.description || 'No description available'}
                </td>
                <td>
                  <span className={`language-badge ${repo.language?.toLowerCase() || 'unknown'}`}>
                    {repo.language || 'N/A'}
                  </span>
                </td>
                <td className="stars-cell">
                  <span className="star-icon">⭐</span>
                  {repo.stargazers_count.toLocaleString()}
                </td>
                <td className="increased-stars-cell">
                  <span className="increase-icon">📈</span>
                  +{(repo.increasedStars || 0).toLocaleString()}
                </td>
                <td className="date-range-cell">
                  {dateRange.startDate && dateRange.endDate
                    ? `${dateRange.startDate} to ${dateRange.endDate}`
                    : 'All time'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
