import React, { useState, useEffect, useCallback } from "react";
import {
  FaGithub,
  FaExternalLinkAlt,
  FaCodeBranch,
  FaExclamationCircle,
} from "react-icons/fa";

// Mock contributors data
const mockContributors = [
  {
    id: 1,
    login: "sandeepvashishtha",
    name: "Sandeep Vashishtha",
    avatar_url: "https://github.com/sandeepvashishtha.png",
    html_url: "https://github.com/sandeepvashishtha",
    contributions: 125,
    role: "Project Lead & Full Stack Developer",
    bio: "Passionate about building scalable web applications and event management systems.",
  },
];

// Helper function to assign roles based on GitHub activity and profile
const getRoleByGitHubActivity = (contributor) => {
  const {
    contributions,
    followers = 0,
    public_repos = 0,
    created_at,
    login,
  } = contributor;

  // Special role for project owner
  if (login === "sandeepvashishtha")
    return "Project Lead & Full Stack Developer";

  // Calculate account age in years
  const accountAge = created_at
    ? (new Date() - new Date(created_at)) / (1000 * 60 * 60 * 24 * 365)
    : 0;

  // Advanced role assignment based on multiple factors
  if (contributions > 100 && followers > 50 && public_repos > 20) {
    return "Core Maintainer";
  }

  if (contributions > 50 && (followers > 20 || public_repos > 10)) {
    return "Senior Open Source Developer";
  }

  if (public_repos > 20 && contributions > 30) {
    return "Open Source Advocate";
  }

  if (contributions > 50 && accountAge > 2) {
    return "Veteran Developer";
  }

  if (contributions > 30 && followers > 10) {
    return "Community Leader";
  }

  if (contributions > 20) {
    return "Active Developer";
  }

  if (contributions > 10) {
    return "Regular Contributor";
  }

  if (contributions > 5) {
    return "Contributing Member";
  }

  return "New Contributor";
};

// Local storage keys
const STORAGE_KEY = "github_contributors";
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

// Helper function to get data from local storage
const getCachedContributors = () => {
  try {
    const cachedData = localStorage.getItem(STORAGE_KEY);
    if (!cachedData) return null;

    const { data, timestamp } = JSON.parse(cachedData);
    const isExpired = Date.now() - timestamp > CACHE_DURATION;

    return isExpired ? null : data;
  } catch (error) {
    console.error("Error reading from local storage:", error);
    return null;
  }
};

// Helper function to save data to local storage
const cacheContributors = (data) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error("Error saving to local storage:", error);
  }
};

const Contributors = () => {
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch additional GitHub profile data with better error handling
  const fetchGitHubProfile = useCallback(async (username) => {
    try {
      const response = await fetch(`https://api.github.com/users/${username}`, {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (!response.ok) throw new Error("Profile not found");

      const profile = await response.json();
      return {
        followers: profile.followers || 0,
        public_repos: profile.public_repos || 0,
        created_at: profile.created_at,
        name: profile.name || username,
        bio: profile.bio || "Open source enthusiast and contributor.",
        company: profile.company || "Open Source",
        location: profile.location || "Remote",
      };
    } catch (error) {
      console.error(`Error fetching profile for ${username}:`, error);
      return {
        followers: 0,
        public_repos: 0,
        created_at: null,
        name: username,
        bio: "Open source enthusiast and contributor.",
        company: "Open Source",
        location: "Remote",
      };
    }
  }, []);

  // Function to fetch contributors with better error handling and loading states
  const fetchContributors = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Check for cached data first
    const cachedData = getCachedContributors();
    if (cachedData) {
      setContributors(cachedData);
      setLoading(false);
      return;
    }

    try {

      setLoading(true);
      
      // Try to fetch real contributors from GitHub API with pagination
      try {
        let allContributors = [];
        let page = 1;
        const perPage = 100;

        while (true) {
          const response = await fetch(`https://api.github.com/repos/sandeepvashishtha/Eventra/contributors?page=${page}&per_page=${perPage}`);
          if (!response.ok) {
            throw new Error('GitHub API request failed');
          }
          const contributorsPage = await response.json();
          if (contributorsPage.length === 0) {
            break;
          }
          allContributors = allContributors.concat(contributorsPage);
          page++;
          if (contributorsPage.length < perPage) {
            break;
          }
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Enhance GitHub data with additional profile info
        const enhancedContributors = await Promise.all(
          allContributors.map(async (contributor) => {
            const profileData = await fetchGitHubProfile(contributor.login);

            const enhancedContributor = {
              ...contributor,
              ...profileData,
              id: contributor.id,
              role: getRoleByGitHubActivity({
                ...contributor,
                ...profileData
              }),
              bio: contributor.login === 'sandeepvashishtha'
                ? 'Passionate about building scalable web applications and event management systems.'
                : profileData.bio
            };

            return enhancedContributor;
          })
        );

        setContributors(enhancedContributors);
      } catch (apiError) {
        console.log('GitHub API not available, using mock data');
        setContributors(mockContributors);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching contributors:', error);

      const response = await fetch(
        "https://api.github.com/repos/sandeepvashishtha/Eventra/contributors",
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch contributors");

      const githubContributors = await response.json();

      // Limit to first 12 contributors for better performance
      const topContributors = githubContributors.slice(0, 12);

      const enhancedContributors = await Promise.all(
        topContributors.map(async (contributor) => {
          const profileData = await fetchGitHubProfile(contributor.login);
          return {
            ...contributor,
            ...profileData,
            id: contributor.id,
            role: getRoleByGitHubActivity({
              ...contributor,
              ...profileData,
            }),
          };
        })
      );

      setContributors(enhancedContributors);
      cacheContributors(enhancedContributors);
    } catch (err) {
      console.error("Using mock data due to:", err);
      setError("GitHub API rate limit exceeded. Showing sample data.");

      setContributors(mockContributors);
    } finally {
      setLoading(false);
    }
  }, [fetchGitHubProfile]);

  // Initial fetch on component mount
  useEffect(() => {
    fetchContributors();
  }, [fetchContributors]);

  useEffect(()=>{
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  },[])

  // Skeleton loader component
  const SkeletonCard = () => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border-2 border-gray-100">
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full bg-gray-200 animate-pulse"></div>
            <div className="absolute -bottom-1 -right-1 bg-gray-200 h-6 w-6 rounded-full animate-pulse"></div>
          </div>
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse"></div>
          </div>
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-3 bg-gray-100 rounded w-full animate-pulse"></div>
          <div className="h-3 bg-gray-100 rounded w-5/6 animate-pulse"></div>
          <div className="h-3 bg-gray-100 rounded w-4/6 animate-pulse"></div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="h-4 bg-gray-100 rounded w-16 animate-pulse"></div>
          <div className="h-4 bg-gray-100 rounded w-16 animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  // Error state component
  const ErrorState = ({ message }) => (
    <div className="bg-red-50 p-4 rounded-md mb-8">
      <div className="flex">
        <div className="flex-shrink-0">
          <FaExclamationCircle
            className="h-5 w-5 text-red-400"
            aria-hidden="true"
          />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">{message}</h3>
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Amazing Contributors
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Eventra is built by an incredible community of developers,
            designers, and enthusiasts. We're grateful for every contribution,
            big or small!
          </p>
        </div>

        {error && <ErrorState message={error} />}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading
            ? [...Array(12)].map((_, index) => (
                <SkeletonCard key={`skeleton-${index}`} />
              ))
            : contributors.map((contributor, index) => (
                <div
                  key={contributor.id}
                  className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-indigo-100`}
                >
                  <div className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="relative">
                        <img
                          className="h-16 w-16 rounded-full border-2 border-white shadow-sm"
                          src={contributor.avatar_url}
                          alt={contributor.name || contributor.login}
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${
                              contributor.name || contributor.login
                            }&background=6366f1&color=ffffff&size=256`;
                          }}
                        />
                        <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                          {contributor.contributions}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {contributor.name || contributor.login}
                        </h3>
                        <p className="text-sm text-indigo-600 font-medium">
                          {contributor.role}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {contributor.bio}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <FaCodeBranch className="mr-1" />
                        <span>{contributor.public_repos} repos</span>
                      </div>
                      <a
                        href={contributor.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        <FaGithub className="mr-1" />
                        <span>Profile</span>
                        <FaExternalLinkAlt className="ml-1 text-xs" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
        </div>

        <div className="mt-16 bg-indigo-50 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Want to Contribute?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            We welcome contributions from developers of all skill levels! Check
            out our GitHub repository to get started.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="https://github.com/sandeepvashishtha/Eventra"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              <FaGithub className="mr-2" />
              View on GitHub
            </a>
            <a
              href="https://github.com/sandeepvashishtha/Eventra/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <FaExclamationCircle className="mr-2" />
              Browse Issues
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contributors;
