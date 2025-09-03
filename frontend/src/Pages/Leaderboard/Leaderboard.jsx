import { useEffect, useState } from "react";
import { FaCode, FaStar } from "react-icons/fa";

// GitHub repository to fetch pull requests and contributor info from
const GITHUB_REPO = "SandeepVashishtha/Eventra";

// Personal access token from .env file (optional, avoids GitHub rate limits)
const TOKEN = process.env.REACT_APP_GITHUB_TOKEN || "";

// Define points for each contribution level
const POINTS = {
  "level-1": 3, // Level 1 PRs give 3 points
  "level-2": 7, // Level 2 PRs give 7 points
  level3: 10,   // Level 3 PRs give 10 points
};


// 🔹 LeaderBoard functional component
export default function LeaderBoard() {
  // 🔹 State to store fetched contributors info
  const [contributors, setContributors] = useState([]);
  // 🔹 Loading state while data is being fetched
  const [loading, setLoading] = useState(true);
  // 🔹 Last updated timestamp
  const [lastUpdated, setLastUpdated] = useState('');

  // 🔹 Function to load data from cache or fetch fresh
  const loadLeaderboardData = async () => {
    setLoading(true);
    const cachedData = localStorage.getItem('leaderboardData');
    const now = Date.now();

    // Check if we have valid cached data (less than 1 hour old)
    if (cachedData) {
      try {
        const { data, timestamp } = JSON.parse(cachedData);
        const isDataFresh = (now - timestamp) < (60 * 60 * 1000);

        if (isDataFresh) {
          setContributors(data);
          setLastUpdated(`Last updated: ${new Date(timestamp).toLocaleString()} (cached)`);
          setLoading(false);
          return; // Use cached data
        }
      } catch (error) {
        console.error('Error parsing cached data:', error);
        // Continue to fetch fresh data if cache parsing fails
      }
    }

    // If we get here, either no cache or cache is stale
    await fetchContributors();
  };

  // 🔹 Function to fetch fresh contributors data from GitHub
  const fetchContributors = async () => {
    try {
      // 🔹 Map to store contributors keyed by username
      let contributorsMap = {};
      let page = 1; // Pagination: start with page 1
      let hasMore = true; // Flag to continue fetching

      // First, fetch all contributors to get their names
      const contributorsRes = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/contributors`,
        { headers: TOKEN ? { Authorization: `token ${TOKEN}` } : {} }
      );

      if (!contributorsRes.ok) {
        throw new Error('Failed to fetch contributors');
      }

      const contributorsData = await contributorsRes.json();
      const contributorsInfo = {};

      // Store contributor info for later use
      contributorsData.forEach(contributor => {
        contributorsInfo[contributor.login] = {
          name: contributor.name || contributor.login,
          avatar: contributor.avatar_url,
          profile: contributor.html_url
        };
      });

      // 🔹 Loop until all PRs pages are fetched
      while (hasMore) {
        // 🔹 Fetch closed PRs per page
        const res = await fetch(
          `https://api.github.com/repos/${GITHUB_REPO}/pulls?state=closed&per_page=100&page=${page}`,
          { headers: TOKEN ? { Authorization: `token ${TOKEN}` } : {} }
        );

        // 🔹 Convert response to JSON
        const prs = await res.json();

        // 🔹 If no more PRs, stop the loop
        if (prs.length === 0) {
          hasMore = false;
          break;
        }

        // 🔹 Process each PR
        prs.forEach((pr) => {
          // 🔹 Skip if PR is not merged
          if (!pr.merged_at) return;

          // 🔹 Normalize labels to lowercase for consistency
          const labels = pr.labels.map((l) => l.name.toLowerCase());

          // 🔹 Only consider PRs related to GSSoC (case insensitive check)
          const hasGsocLabel = labels.some(label =>
            label.toLowerCase().includes('gssoc') || label.toLowerCase().includes('gsoc')
          );

          if (!hasGsocLabel) return;

          const author = pr.user.login; // 🔹 PR author username
          let points = 0; // 🔹 Points for this PR

          // 🔹 Sum points based on level labels
          labels.forEach((label) => {
            const normalized = label.replace(/\s+/g, "").toLowerCase();
            if (POINTS[normalized]) points += POINTS[normalized];
          });

          // 🔹 Initialize contributor entry if not exists
          if (!contributorsMap[author]) {
            const contributorInfo = contributorsInfo[author] || {
              name: author,
              avatar: pr.user.avatar_url,
              profile: pr.user.html_url
            };

            contributorsMap[author] = {
              username: author,
              name: contributorInfo.name,
              avatar: contributorInfo.avatar,
              profile: contributorInfo.profile,
              points: 0,
              prs: 0,
            };
          }

          // 🔹 Update contributor's total points and PR count
          contributorsMap[author].points += points;
          contributorsMap[author].prs += 1;
        });

        // 🔹 Move to next page
        page++;
      }

      const sortedContributors = Object.values(contributorsMap).sort((a, b) => b.points - a.points);

      // 🔹 Save to state and localStorage
      setContributors(sortedContributors);
      const timestamp = Date.now();
      setLastUpdated(new Date(timestamp).toLocaleString());

      // 🔹 Cache the data with current timestamp
      const cacheData = {
        data: sortedContributors,
        timestamp: Date.now()
      };
      localStorage.setItem('leaderboardData', JSON.stringify(cacheData));
    } catch (err) {
      // 🔹 Log any errors during fetch or processing
      console.error("Error fetching contributors:", err);

      // Try to load from cache if available
      const cachedData = localStorage.getItem('leaderboardData');
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        setContributors(data);
        setLastUpdated(`Last updated: ${new Date(timestamp).toLocaleString()} (cached)`);
      }
    } finally {
      // 🔹 Stop loading after fetch attempt
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboardData();
  }, []);

  return (
    <div className="bg-white py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            <span className="block text-indigo-700">GSSoC'25</span>
            <span className="text-gray-800">
              Contributor Leaderboard
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Recognizing the amazing contributions from our open source community
          </p>
        </div>

        <div className="bg-gray-50 rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contributor
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Points
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PRs
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[...Array(20)].map((item) => (
                    <tr key={item} className="animate-pulse">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                          <div className="ml-4">
                            <div className="h-4 w-24 bg-gray-200 rounded"></div>
                            <div className="mt-1 h-3 w-16 bg-gray-100 rounded"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 w-8 bg-gray-200 rounded"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 w-8 bg-gray-200 rounded"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contributor
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Points
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PRs
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {contributors.map((c, index) => (
                    <tr key={c.username} className="hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-medium 
                              ${index === 0 ? 'bg-yellow-500 text-white' :
                                index === 1 ? 'bg-gray-300 text-gray-800' :
                                  index === 2 ? 'bg-amber-500 text-white' :
                                    'bg-indigo-50 text-indigo-700'}`}>
                              {index + 1}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full border-2 border-indigo-200"
                              src={c.avatar}
                              alt={c.username}
                            />
                          </div>
                          <div className="ml-4">
                            <a
                              href={c.profile}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors"
                            >
                              {c.username}
                            </a>
                            <div className="text-sm text-gray-500">
                              {c.name && c.name !== c.username ? c.name : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaStar className="text-yellow-400 mr-1" />
                          <span className="font-medium">{c.points}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaCode className="text-indigo-500 mr-1" />
                          <span className="font-medium">{c.prs}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="bg-gray-50 px-6 py-2 text-right border-t border-gray-200">
            {lastUpdated && (
              <span className="text-xs text-gray-500">{lastUpdated}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

