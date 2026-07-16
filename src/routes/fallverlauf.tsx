import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { listCases, relativeTime, type CaseRecord } from "@/lib/casesStore";
import { riskLabel } from "@/lib/analyze";
import { ArrowRight, FileText, Plus, Search } from "lucide-react";

export const Route = createFileRoute("/fallverlauf")({
  component: Fallverlauf,
  head: () => ({ meta: [{ title: "Fallverlauf · steuerstoff" }] }),
});

function Fallverlauf() {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const update = () => setCases(listCases());
    update();
    window.addEventListener("steuerstoff:cases", update);
    return () => window.removeEventListener("steuerstoff:cases", update);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cases;
    return cases.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.topic.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q),
    );
  }, [cases, query]);

  const recent = cases.slice(0, 3);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Fallverlauf
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Alle bearbeiteten Sachverhalte mit Risikostufe, Rückfragen und Antwortmodi.
              </p>
            </div>
            <Button asChild>
              <Link to="/neueanfrage">
                <Plus className="h-4 w-4" /> Neue Anfrage
              </Link>
            </Button>
          </div>

          <div className="relative mt-6">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Fälle durchsuchen (Titel, Thema, Inhalt) …"
              className="pl-9"
            />
          </div>

          {recent.length > 0 && !query && (
            <section className="mt-8">
              <h2 className="text-sm font-semibold text-foreground">Zuletzt bearbeitet</h2>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {recent.map((c) => (
                  <Link
                    key={c.id}
                    to="/fall/$caseId"
                    params={{ caseId: c.id }}
                    className="rounded-xl border border-border bg-card p-3 shadow-card-soft transition-colors hover:border-foreground/30"
                  >
                    <span className="inline-block rounded border border-border bg-background px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                      {c.topic}
                    </span>
                    <p className="mt-2 line-clamp-2 text-sm font-medium text-foreground">{c.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{relativeTime(c.updatedAt)}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="mt-8">
            <h2 className="text-sm font-semibold text-foreground">
              {query ? `Treffer (${filtered.length})` : `Alle Fälle (${filtered.length})`}
            </h2>
            {filtered.length === 0 ? (
              <div className="mt-3 rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
                Keine Fälle gefunden.
              </div>
            ) : (
              <ul className="mt-3 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-card-soft">
                {filtered.map((c) => (
                  <li key={c.id}>
                    <Link
                      to="/fall/$caseId"
                      params={{ caseId: c.id }}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/60 sm:px-5"
                    >
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                        <FileText className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{c.title}</p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
                            {c.topic}
                          </span>
                          <span>· {riskLabel(c.analysis.risk)}</span>
                          <span>· {relativeTime(c.updatedAt)}</span>
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
