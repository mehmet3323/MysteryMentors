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
    queryKey: ['/api/github', username],
    enabled: !!username,
  });

  const reposQuery = useQuery({
    queryKey: ['/api/github', username, 'repos'],
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

  const featuredProjects = reposData
    ?.filter(repo => repo.stargazers_count > 0 || repo.forks_count > 0)
    ?.slice(0, 6) || [];

  return {
    stats,
    featuredProjects,
    isLoading: userQuery.isLoading || reposQuery.isLoading,
    error: userQuery.error || reposQuery.error,
  };
}
