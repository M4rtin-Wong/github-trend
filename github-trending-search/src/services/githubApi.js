const GITHUB_API_BASE = 'https://api.github.com';

// Cache for star counts to avoid repeated API calls
const starCountCache = new Map();

export async function searchRepositories(params) {
  const { repoName, language, startDate, endDate, minStars, minIncreasedStars } = params;

  // Validate date range is within 90 days
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  let effectiveStartDate = startDate ? new Date(startDate) : thirtyDaysAgo;
  let effectiveEndDate = endDate ? new Date(endDate) : now;
  
  // Clamp to 90 days max
  if (effectiveStartDate < thirtyDaysAgo) {
    effectiveStartDate = thirtyDaysAgo;
  }

  // Build the search query
  let query = '';

  if (repoName) {
    query += `${repoName} in:name `;
  }

  if (language) {
    query += `language:${language} `;
  }

  if (startDate) {
      query += `created:>=${startDate} `;
  }

  if (endDate) {
      query += `pushed:<=${endDate} `;
  }

  if (minStars > 0) {
    query += `stars:>=${minStars} `;
  } else {
    query += `stars:>=100 `;
  }

  if (!query.trim()) {
    query = 'stars:>=1000';
  }

  const searchUrl = new URL(`${GITHUB_API_BASE}/search/repositories`);
  searchUrl.searchParams.set('q', query.trim());
  searchUrl.searchParams.set('sort', 'stars');
  searchUrl.searchParams.set('order', 'desc');
  searchUrl.searchParams.set('per_page', '30');

  const response = await fetch(searchUrl.toString(), {
    headers: {
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch repositories');
  }

  const data = await response.json();

  // Calculate star increase using Events API (WatchEvents)
  const resultsWithStarIncrease = [];
  let rateLimited = false;
  
  for (const repo of data.items) {
    if (rateLimited) {
      // If rate limited, add remaining repos with 0 stars
      resultsWithStarIncrease.push({
        ...repo,
        increasedStars: 0,
        rateLimited: true,
      });
      continue;
    }

    try {
      const increasedStars = await getStarIncreaseFromEvents(
        repo,
        effectiveStartDate,
        effectiveEndDate
      );
      resultsWithStarIncrease.push({
        ...repo,
        increasedStars,
      });
    } catch (error) {
      if (error.message.includes('rate limit')) {
        rateLimited = true;
        resultsWithStarIncrease.push({
          ...repo,
          increasedStars: 0,
          rateLimited: true,
        });
      } else {
        resultsWithStarIncrease.push({
          ...repo,
          increasedStars: 0,
        });
      }
    }
  }

  // Sort by increased stars (descending)
  resultsWithStarIncrease.sort((a, b) => b.increasedStars - a.increasedStars);

  // Filter by minimum increased stars if specified
  let filteredResults = resultsWithStarIncrease;
  if (minIncreasedStars > 0) {
    filteredResults = resultsWithStarIncrease.filter(
      (repo) => repo.increasedStars >= minIncreasedStars
    );
  }

  return filteredResults;
}

/**
 * Get star increase using GitHub Events API
 * 
 * The Events API provides WatchEvents (stars) for the last ~90 days
 * Limited to 300 events per repo (3 pages of 100)
 * This is perfect for our 90-day window requirement
 */
async function getStarIncreaseFromEvents(repo, startDate, endDate) {
  const startKey = startDate.toISOString().split('T')[0];
  const endKey = endDate.toISOString().split('T')[0];
  const cacheKey = `${repo.full_name}-${startKey}-${endKey}`;
  
  if (starCountCache.has(cacheKey)) {
    return starCountCache.get(cacheKey);
  }

  const startDateTime = new Date(startDate);
  startDateTime.setHours(0, 0, 0, 0);
  
  const endDateTime = new Date(endDate);
  endDateTime.setHours(23, 59, 59, 999);

  let allEvents = [];
  
  // Fetch up to 3 pages of events (300 events max, which is GitHub's limit)
  for (let page = 1; page <= 3; page++) {
    const eventsUrl = `${GITHUB_API_BASE}/repos/${repo.full_name}/events?per_page=100&page=${page}`;
    
    const response = await fetch(eventsUrl, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      if (response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.message?.includes('rate limit')) {
          throw new Error('rate limit exceeded');
        }
      }
      break;
    }

    const events = await response.json();
    if (events.length === 0) break;
    
    allEvents = allEvents.concat(events);
    
    // If we got less than 100 events, no more pages
    if (events.length < 100) break;
  }

  // Count WatchEvents (star events) within the date range
  const starsInRange = allEvents.filter((event) => {
    if (event.type !== 'WatchEvent') return false;
    const eventDate = new Date(event.created_at);
    return eventDate >= startDateTime && eventDate <= endDateTime;
  }).length;

  starCountCache.set(cacheKey, starsInRange);
  return starsInRange;
}

export async function getPopularLanguages() {
  return [
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
  ];
}
