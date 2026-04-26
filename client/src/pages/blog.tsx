import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, ArrowLeft, ExternalLink, LogIn, LogOut } from "lucide-react";
import {
  clearStoredToken,
  getStoredToken,
  pollForToken,
  requestDeviceCode,
  setStoredToken,
  type DeviceCodeResponse,
} from "@/lib/githubDeviceAuth";

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

function normalizeText(s: string) {
  return s
    .toLowerCase()
    .replace(/[ıİ]/g, "i")
    .replace(/[şŞ]/g, "s")
    .replace(/[ğĞ]/g, "g")
    .replace(/[üÜ]/g, "u")
    .replace(/[öÖ]/g, "o")
    .replace(/[çÇ]/g, "c");
}

// Basit (ücretsiz) içerik filtresi: küfür/argo/+18 tespit edilirse sitede yayınlanmaz.
// Not: Bu bir güvenlik çözümü değil; sadece görünürlüğü engeller.
const bannedTokens = [
  "amk",
  "aq",
  "orospu",
  "sik",
  "siktir",
  "yarrak",
  "gavat",
  "ibne",
  "p1c",
  "porno",
  "seks",
  "+18",
  "xxx",
  "nsfw",
];

function isBlockedContent(issue: GitHubIssue) {
  const hay = normalizeText(`${issue.title}\n${issue.body || ""}`);
  return bannedTokens.some((t) => hay.includes(t));
}

function isBlockedText(title: string, body: string) {
  const hay = normalizeText(`${title}\n${body}`);
  return bannedTokens.some((t) => hay.includes(t));
}

async function createIssue(token: string, payload: { title: string; body: string; labels: string[] }) {
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/issues`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (json as any)?.message || `HTTP ${res.status}`;
    throw new Error(message);
  }
  return json as { html_url: string; number: number };
}

export default function Blog() {
  const env = (import.meta as any).env || {};
  const clientId =
    ((typeof window !== "undefined" && (window as any).__MM_CONFIG__?.githubClientId) as
      | string
      | undefined) ||
    (env.VITE_GITHUB_CLIENT_ID as string | undefined) ||
    "";

  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerName, setComposerName] = useState("");
  const [composerTitle, setComposerTitle] = useState("");
  const [composerBody, setComposerBody] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  const [deviceFlow, setDeviceFlow] = useState<DeviceCodeResponse | null>(null);
  const [isAuthing, setIsAuthing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

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

  const { posts, hiddenCount } = useMemo(() => {
    const all = postsQuery.data || [];
    const visible = all.filter((p) => !isBlockedContent(p));
    const hiddenCount = all.length - visible.length;
    const posts = visible.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    return { posts, hiddenCount };
  }, [postsQuery.data]);

  async function startLogin() {
    setAuthError(null);
    if (!clientId) {
      setAuthError("GitHub OAuth Client ID eksik. (VITE_GITHUB_CLIENT_ID)");
      return;
    }
    setIsAuthing(true);
    try {
      // public repo için yeterli: public_repo
      const dc = await requestDeviceCode(clientId, "public_repo");
      setDeviceFlow(dc);
      window.open(dc.verification_uri, "_blank", "noopener,noreferrer");

      const startedAt = Date.now();
      const expiresAt = startedAt + dc.expires_in * 1000;

      // polling
      while (Date.now() < expiresAt) {
        await new Promise((r) => setTimeout(r, Math.max(1000, dc.interval * 1000)));
        const resp = await pollForToken(clientId, dc.device_code);
        if ("access_token" in resp) {
          setStoredToken(resp.access_token);
          setToken(resp.access_token);
          setDeviceFlow(null);
          return;
        }
        if ("error" in resp) {
          if (resp.error === "authorization_pending") continue;
          if (resp.error === "slow_down") continue;
          if (resp.error === "access_denied") throw new Error("Erişim reddedildi.");
          if (resp.error === "expired_token") throw new Error("Kodun süresi doldu.");
          throw new Error(`Auth hata: ${resp.error}`);
        }
      }
      throw new Error("Kodun süresi doldu.");
    } catch (e) {
      const msg = (e as any)?.message || "Giriş başarısız.";
      // CORS/proxy ipucu
      const proxyHint =
        (env.VITE_GITHUB_OAUTH_PROXY ? "" : " (CORS olursa Cloudflare Worker proxy gerekir)");
      setAuthError(`${msg}${proxyHint}`);
    } finally {
      setIsAuthing(false);
    }
  }

  function logout() {
    clearStoredToken();
    setToken(null);
  }

  async function publish() {
    if (!token) {
      setAuthError("Önce GitHub ile giriş yapmalısın.");
      return;
    }
    const name = composerName.trim();
    const title = composerTitle.trim();
    const body = composerBody.trim();
    if (name.length < 3) return setAuthError("Ad Soyad en az 3 karakter olmalı.");
    if (title.length < 3) return setAuthError("Başlık en az 3 karakter olmalı.");
    if (body.length < 20) return setAuthError("İçerik en az 20 karakter olmalı.");
    if (isBlockedText(title, body)) return setAuthError("Uygunsuz içerik tespit edildi. Yayınlanmadı.");

    setIsPublishing(true);
    setAuthError(null);
    try {
      await createIssue(token, {
        title,
        body: `Ad Soyad: ${name}\n\n${body}`,
        labels: [BLOG_LABEL],
      });
      setIsComposerOpen(false);
      setComposerName("");
      setComposerTitle("");
      setComposerBody("");
      await postsQuery.refetch();
    } catch (e) {
      setAuthError((e as any)?.message || "Yayınlama başarısız.");
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Button asChild variant="ghost" className="gap-2">
            <a href={`${baseUrl()}#/`}>
              <ArrowLeft className="h-4 w-4" />
              Ana Sayfa
            </a>
          </Button>

          <div className="flex items-center gap-2">
            {token ? (
              <Button variant="outline" className="gap-2" onClick={logout}>
                <LogOut className="h-4 w-4" />
                Çıkış
              </Button>
            ) : (
              <Button variant="outline" className="gap-2" onClick={startLogin} disabled={isAuthing}>
                <LogIn className="h-4 w-4" />
                {isAuthing ? "Giriş..." : "GitHub ile Giriş"}
              </Button>
            )}
            <Button className="gap-2" onClick={() => setIsComposerOpen(true)}>
              <Plus className="h-4 w-4" />
              Makale Ekle
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold gradient-text">Makaleler</h1>
            <p className="text-muted-foreground mt-2">
              Makaleler GitHub Issues üzerinden yayınlanır ve anlık güncellenir.
            </p>
            {hiddenCount > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                {hiddenCount} içerik, uygunsuz içerik filtresi nedeniyle yayında gösterilmedi.
              </p>
            )}
          </div>
        </div>

        {postsQuery.isLoading ? (
          <p className="text-muted-foreground">Makaleler yükleniyor...</p>
        ) : postsQuery.isError ? (
          <p className="text-destructive">Makaleler yüklenemedi.</p>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Tüm Makaleler</h2>
              <Badge variant="secondary">GitHub Issues</Badge>
            </div>

            {posts.length === 0 ? (
              <p className="text-muted-foreground">Henüz makale yok.</p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((p) => {
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
          </div>
        )}
      </main>

      {(isComposerOpen || deviceFlow || authError) && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4" onClick={() => {
          setIsComposerOpen(false);
          setDeviceFlow(null);
          setAuthError(null);
        }}>
          <div
            className="w-full max-w-2xl rounded-2xl bg-background border shadow-2xl p-6 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl md:text-2xl font-bold">Makale Oluştur</h2>
              <Button variant="ghost" size="icon" onClick={() => {
                setIsComposerOpen(false);
                setDeviceFlow(null);
                setAuthError(null);
              }}>
                ✕
              </Button>
            </div>

            {!clientId && (
              <p className="text-sm text-destructive mt-4">
                `VITE_GITHUB_CLIENT_ID` ayarlı değil. GitHub OAuth App oluşturup client id eklemelisin.
              </p>
            )}

            {!token && (
              <div className="mt-5 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Yayınlamak için GitHub ile giriş gerekir. (Ücretsiz) 
                </p>
                <Button className="gap-2" onClick={startLogin} disabled={isAuthing || !clientId}>
                  <LogIn className="h-4 w-4" />
                  {isAuthing ? "Giriş başlatılıyor..." : "GitHub ile Giriş"}
                </Button>
              </div>
            )}

            {deviceFlow && (
              <div className="mt-6 rounded-xl border p-4 bg-muted/30">
                <p className="font-medium">GitHub doğrulama kodu</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <code className="px-3 py-2 rounded-lg bg-background border text-lg">{deviceFlow.user_code}</code>
                  <Button
                    variant="outline"
                    onClick={() => navigator.clipboard?.writeText(deviceFlow.user_code)}
                  >
                    Kopyala
                  </Button>
                  <Button asChild>
                    <a href={deviceFlow.verification_uri} target="_blank" rel="noopener noreferrer">
                      GitHub’da Aç
                    </a>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Bu kodu `github.com/login/device` sayfasına gir. Onaylayınca otomatik bağlanacak.
                </p>
                {(env.VITE_GITHUB_OAUTH_PROXY ? null : (
                  <p className="text-xs text-muted-foreground mt-2">
                    Not: Tarayıcı CORS engellerse `VITE_GITHUB_OAUTH_PROXY` ile ücretsiz proxy gerekir.
                  </p>
                ))}
              </div>
            )}

            {authError && (
              <p className="text-sm text-destructive mt-4">{authError}</p>
            )}

            <div className="mt-8 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ad Soyad</label>
                  <Input value={composerName} onChange={(e) => setComposerName(e.target.value)} placeholder="Ad Soyad" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Başlık</label>
                  <Input value={composerTitle} onChange={(e) => setComposerTitle(e.target.value)} placeholder="Makale başlığı" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">İçerik</label>
                <Textarea
                  value={composerBody}
                  onChange={(e) => setComposerBody(e.target.value)}
                  placeholder="Markdown desteklenir..."
                  rows={10}
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <Button variant="outline" onClick={() => setIsComposerOpen(false)}>
                  Vazgeç
                </Button>
                <Button onClick={publish} disabled={!token || isPublishing}>
                  {isPublishing ? "Yayınlanıyor..." : "Yayınla"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

