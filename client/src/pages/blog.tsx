import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, ArrowLeft, ExternalLink, Shield, User } from "lucide-react";

type GitHubIssue = {
  id: number;
  number: number;
  title: string;
  body: string | null;
  html_url: string;
  created_at: string;
  user: { login: string } | null;
  labels: Array<{ name: string }>;
};

const OWNER = "mehmet3323";
const REPO = "MysteryMentors";
const BLOG_LABEL = "blog";
const ADMIN_LABEL = "admin";
const USER_LABEL = "user";

function baseUrl() {
  // Vite base: "/" (local) veya "/MysteryMentors/" (Pages)
  return (import.meta as any).env?.BASE_URL || "/";
}

function issueHasLabel(issue: GitHubIssue, label: string) {
  return issue.labels?.some((l) => l.name === label);
}

function extractDisplayName(issue: GitHubIssue): string | null {
  const body = issue.body || "";
  const line =
    body
      .split("\n")
      .map((s) => s.trim())
      .find((s) => /^ad\s*soyad\s*:/i.test(s)) || null;
  if (!line) return null;
  return line.replace(/^ad\s*soyad\s*:/i, "").trim() || null;
}

export default function Blog() {
  const postsQuery = useQuery({
    queryKey: ["blog-issues", OWNER, REPO],
    queryFn: async () => {
      const url = `https://api.github.com/repos/${OWNER}/${REPO}/issues?state=open&per_page=50&labels=${encodeURIComponent(
        BLOG_LABEL,
      )}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
      const data = (await res.json()) as GitHubIssue[];
      // pull request'leri ele
      return data.filter((i) => !(i as any).pull_request);
    },
  });

  const { adminPosts, userPosts } = useMemo(() => {
    const all = postsQuery.data || [];
    const adminPosts = all
      .filter((p) => issueHasLabel(p, ADMIN_LABEL))
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    const userPosts = all
      .filter((p) => !issueHasLabel(p, ADMIN_LABEL))
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    return { adminPosts, userPosts };
  }, [postsQuery.data]);

  const adminNewIssueUrl = `https://github.com/${OWNER}/${REPO}/issues/new?labels=${encodeURIComponent(
    `${BLOG_LABEL},${ADMIN_LABEL}`,
  )}&title=${encodeURIComponent("[Admin] Başlık")}&body=${encodeURIComponent(
    "İçerik (Markdown desteklenir):\n\n---\n",
  )}`;

  const userNewIssueUrl = `https://github.com/${OWNER}/${REPO}/issues/new?labels=${encodeURIComponent(
    `${BLOG_LABEL},${USER_LABEL}`,
  )}&title=${encodeURIComponent("Başlık")}&body=${encodeURIComponent(
    "Ad Soyad: \n\nİçerik (Markdown desteklenir):\n\n---\n",
  )}`;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Button asChild variant="ghost" className="gap-2">
            <a href={baseUrl()}>
              <ArrowLeft className="h-4 w-4" />
              Ana Sayfa
            </a>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Makale Ekle
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <a href={adminNewIssueUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Admin makalesi
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href={userNewIssueUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Kullanıcı makalesi (Ad Soyad ister)
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold gradient-text">Makaleler</h1>
            <p className="text-muted-foreground mt-2">
              Makaleler GitHub Issues üzerinden yayınlanır ve anlık güncellenir.
            </p>
          </div>
        </div>

        {postsQuery.isLoading ? (
          <p className="text-muted-foreground">Makaleler yükleniyor...</p>
        ) : postsQuery.isError ? (
          <p className="text-destructive">Makaleler yüklenemedi.</p>
        ) : (
          <div className="space-y-12">
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-bold">Admin Makaleleri</h2>
                <Badge variant="secondary">Label: {ADMIN_LABEL}</Badge>
              </div>

              {adminPosts.length === 0 ? (
                <p className="text-muted-foreground">Henüz admin makalesi yok.</p>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {adminPosts.map((p) => (
                    <Card key={p.id} className="hover-lift">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold">{p.title.replace(/^\[Admin\]\s*/i, "")}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {new Date(p.created_at).toLocaleDateString("tr-TR")}
                            </p>
                          </div>
                          <Button asChild size="icon" variant="ghost">
                            <a href={p.html_url} target="_blank" rel="noopener noreferrer" aria-label="GitHub'da aç">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>

                        <p className="text-muted-foreground text-sm mt-4 line-clamp-3">
                          {(p.body || "").trim().slice(0, 200) || "İçerik yok."}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-bold">Kullanıcı Makaleleri</h2>
                <Badge variant="secondary">Label: {USER_LABEL}</Badge>
              </div>

              {userPosts.length === 0 ? (
                <p className="text-muted-foreground">Henüz kullanıcı makalesi yok.</p>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userPosts.map((p) => {
                    const displayName = extractDisplayName(p);
                    return (
                      <Card key={p.id} className="hover-lift">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-lg font-semibold">{p.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {new Date(p.created_at).toLocaleDateString("tr-TR")}
                                {displayName ? ` • ${displayName}` : p.user?.login ? ` • @${p.user.login}` : ""}
                              </p>
                            </div>
                            <Button asChild size="icon" variant="ghost">
                              <a href={p.html_url} target="_blank" rel="noopener noreferrer" aria-label="GitHub'da aç">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>

                          <p className="text-muted-foreground text-sm mt-4 line-clamp-3">
                            {(p.body || "").trim().slice(0, 200) || "İçerik yok."}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

