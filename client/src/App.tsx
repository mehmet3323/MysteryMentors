import { Switch, Route, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import Portfolio from "@/pages/portfolio";
import NotFound from "@/pages/not-found";
import { useCallback, useEffect, useState } from "react";

function useHashLocation(): [string, (to: string) => void] {
  const getHashPath = () => {
    const raw = window.location.hash || "#/";
    // Only treat "#/..." as a route. Plain "#section" should not change the SPA route.
    if (!raw.startsWith("#/")) return "/";
    const path = raw.replace(/^#/, "");
    return path.startsWith("/") ? path : `/${path}`;
  };

  const [loc, setLoc] = useState<string>(() => (typeof window === "undefined" ? "/" : getHashPath()));

  useEffect(() => {
    const onChange = () => setLoc(getHashPath());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const navigate = useCallback((to: string) => {
    const next = to.startsWith("/") ? to : `/${to}`;
    window.location.hash = next;
  }, []);

  return [loc, navigate];
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Portfolio} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="portfolio-theme">
        <TooltipProvider>
          <Toaster />
          {/* GitHub Pages SPA için hash routing */}
          <WouterRouter hook={useHashLocation}>
            <Router />
          </WouterRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
