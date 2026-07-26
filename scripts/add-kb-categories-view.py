from pathlib import Path

path = Path('src/routes/wissensdatenbank.tsx')
text = path.read_text(encoding='utf-8')

replacements = []

replacements.append((
'import { BookOpen, Search, X, Copy, Check, ClipboardList, FileText, Upload } from "lucide-react";',
'import { BookOpen, Search, X, Copy, Check, ClipboardList, FileText, Upload, LayoutGrid } from "lucide-react";'
))

replacements.append((
'  "Bilanzierung",\n] as const;',
'  "Bilanzierung",\n  "Abschreibung",\n] as const;'
))

replacements.append((
'  | "bilanzierung"\n  | "hilfe";',
'  | "bilanzierung"\n  | "abschreibung"\n  | "hilfe";'
))

replacements.append((
'  Bilanzierung: "bilanzierung",\n};',
'  Bilanzierung: "bilanzierung",\n  Abschreibung: "abschreibung",\n};'
))

replacements.append((
'  Bilanzsteuerrecht: "bilanzierung",\n};',
'  Bilanzsteuerrecht: "bilanzierung",\n  Abschreibung: "abschreibung",\n  AfA: "abschreibung",\n};'
))

replacements.append((
'  const [cat, setCat] = useState<Category>("Alle");\n  const [open, setOpen] = useState<Article | null>(null);',
'  const [cat, setCat] = useState<Category>("Alle");\n  const [viewMode, setViewMode] = useState<"articles" | "categories">("articles");\n  const [open, setOpen] = useState<Article | null>(null);'
))

replacements.append((
'  const counts = useMemo(() => {\n    const m: Record<string, number> = {};\n    for (const c of CATEGORIES) {\n      m[c] = ALL_ARTICLES.filter((a) => articleMatchesCategory(a, c)).length;\n    }\n    return m;\n  }, []);',
'''  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const c of CATEGORIES) {
      m[c] = ALL_ARTICLES.filter((a) => articleMatchesCategory(a, c)).length;
    }
    return m;
  }, []);

  const categoryOverview = useMemo(() => {
    return CATEGORIES.filter((category) => category !== "Alle")
      .map((category) => ({
        category,
        articles: ALL_ARTICLES.filter(
          (article) => articleMatchesCategory(article, category) && articleMatchesQuery(article, query),
        ),
      }))
      .filter((group) => group.articles.length > 0);
  }, [query]);'''
))

old_chips = '''          <div className="mt-4 -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
            {CATEGORIES.map((c) => (
              <button
                key={c}

                type="button"
                onClick={() => setCat(c)}
                className={
                  "shrink-0 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors " +
                  (cat === c
                    ? "border-foreground bg-foreground text-background ring-1 ring-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground")
                }
              >
                <span>{c}</span>
                <span
                  className={
                    "text-[10px] " + (cat === c ? "text-background/70" : "text-muted-foreground/70")
                  }
                >
                  {counts[c] ?? 0}
                </span>
              </button>
            ))}
          </div>'''

new_chips = '''          <div className="mt-4 -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
            <button
              type="button"
              onClick={() => {
                setViewMode("categories");
                setOpen(null);
                setInlineOpenId(null);
              }}
              className={
                "shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors " +
                (viewMode === "categories"
                  ? "border-foreground bg-foreground text-background ring-1 ring-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground")
              }
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Kategorien</span>
            </button>

            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setCat(c);
                  setViewMode("articles");
                }}
                className={
                  "shrink-0 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors " +
                  (viewMode === "articles" && cat === c
                    ? "border-foreground bg-foreground text-background ring-1 ring-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground")
                }
              >
                <span>{c}</span>
                <span
                  className={
                    "text-[10px] " +
                    (viewMode === "articles" && cat === c
                      ? "text-background/70"
                      : "text-muted-foreground/70")
                  }
                >
                  {counts[c] ?? 0}
                </span>
              </button>
            ))}
          </div>'''
replacements.append((old_chips, new_chips))

old_results = '''          {finalVisibleItems.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
              <p>Keine passenden Inhalte gefunden.</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {query.trim() && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground hover:border-foreground/40"
                  >
                    Suche zurücksetzen
                  </button>
                )}
                {cat !== "Alle" && (
                  <button
                    type="button"
                    onClick={() => setCat("Alle")}
                    className="rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground hover:border-foreground/40"
                  >
                    Alle Inhalte anzeigen
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {finalVisibleItems.map((a) => renderCard(a))}
            </div>
          )}'''

new_results = '''          {viewMode === "categories" ? (
            categoryOverview.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
                Keine passenden Kategorien oder Beiträge gefunden.
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {categoryOverview.map(({ category, articles }) => (
                  <section key={category} className="rounded-2xl border border-border bg-card p-4 shadow-card-soft">
                    <button
                      type="button"
                      onClick={() => {
                        setCat(category);
                        setViewMode("articles");
                      }}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-foreground/40"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>{category}</span>
                      <span className="text-xs text-muted-foreground">{articles.length}</span>
                    </button>

                    <div className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border bg-background/50">
                      {articles.map((article) => (
                        <button
                          key={article.id}
                          type="button"
                          onClick={() => openArticle(article)}
                          className="flex w-full items-start justify-between gap-3 px-3 py-3 text-left transition-colors hover:bg-accent/50"
                        >
                          <span>
                            <span className="block text-sm font-medium text-foreground">{article.title}</span>
                            <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">{article.short}</span>
                          </span>
                          <span className="shrink-0 text-xs text-muted-foreground">Öffnen</span>
                        </button>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )
          ) : finalVisibleItems.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
              <p>Keine passenden Inhalte gefunden.</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {query.trim() && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground hover:border-foreground/40"
                  >
                    Suche zurücksetzen
                  </button>
                )}
                {cat !== "Alle" && (
                  <button
                    type="button"
                    onClick={() => setCat("Alle")}
                    className="rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground hover:border-foreground/40"
                  >
                    Alle Inhalte anzeigen
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {finalVisibleItems.map((a) => renderCard(a))}
            </div>
          )}'''
replacements.append((old_results, new_results))

for old, new in replacements:
    if old not in text:
        raise SystemExit(f'Missing expected snippet:\n{old[:180]}')
    text = text.replace(old, new, 1)

path.write_text(text, encoding='utf-8')

# Remove one-time migration files so only the actual feature remains in the resulting commit.
Path('scripts/add-kb-categories-view.py').unlink(missing_ok=True)
Path('.github/workflows/add-kb-categories-view-once.yml').unlink(missing_ok=True)
