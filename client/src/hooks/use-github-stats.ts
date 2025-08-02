import { useQuery } from "@tanstack/react-query";

interface GitHubUser {
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

interface GitHubRepo {
  name: string;
  description: string;
  html_url: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
}

export function useGitHubStats(username: string) {
  const userQuery = useQuery({
    queryKey: [`github-user-${username}`],
    queryFn: async () => {
      const response = await fetch(`https://api.github.com/users/${username}`);
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      return response.json();
    },
    enabled: !!username,
  });

  const reposQuery = useQuery({
    queryKey: [`github-repos-${username}`],
    queryFn: async () => {
      const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      return response.json();
    },
    enabled: !!username,
  });

  const userData = userQuery.data as GitHubUser | undefined;
  const reposData = reposQuery.data as GitHubRepo[] | undefined;

  const stats = {
    repos: userData?.public_repos || 0,
    stars: reposData?.reduce((acc, repo) => acc + repo.stargazers_count, 0) || 0,
    forks: reposData?.reduce((acc, repo) => acc + repo.forks_count, 0) || 0,
    followers: userData?.followers || 0,
  };

  const allProjects = reposData || [];

  return {
    stats,
    featuredProjects: allProjects,
    isLoading: userQuery.isLoading || reposQuery.isLoading,
    error: userQuery.error || reposQuery.error,
  };
}
