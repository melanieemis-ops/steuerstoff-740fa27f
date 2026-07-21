import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Star } from "lucide-react";
import { useEffect, useState } from "react";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { FavoriteButton } from "@/components/FavoriteButton";
import { useFavorites, type Favorite } from "@/hooks/useFavorites";

export const Route = createFileRoute("/lernen_/akademie_/favoriten")({
  component: FavoritesPage,
  head: () => ({
    meta: [
      { title: "Favoriten · steuerstoff" },
      {
        name: "description",
        content: "Deine gesammelten Lieblingsfragen und Klausurfälle.",
      },
    ],
  }),
});

function FavoritesPage() {
  const { favorites, removeFavorite } = useFavorites();
  const [sortedFavorites, setSortedFavorites] = useState<Favorite[]>([]);

  useEffect(() => {
    setSortedFavorites([...favorites].sort((a, b) => b.savedAt - a.savedAt));
  }, [favorites]);

  const handleRemove = (id: string) => {
    removeFavorite(id);
  };

  const navigateToSource = (source: string) => {
    // This will be handled by Link component
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b border-border/60 bg-card/40">
          <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
            <Link
              to="/lernen/akademie"
              className="inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Akademie
            </Link>

            <div className="mt-5 flex items-start gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-foreground text-background">
                <Star className="h-5 w-5" />
              </span>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  steuerstoff Akademie
                </p>

                <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
                  Favoriten
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {sortedFavorites.length === 0
                    ? "Noch keine Favoriten gespeichert. Tippe bei einer Frage auf den Stern, um sie hier zu speichern."
                    : `Du hast ${sortedFavorites.length} ${sortedFavorites.length === 1 ? "Favorit" : "Favoriten"} gespeichert.`}
                </p>
              </div>
            </div>
          </div>
        </section>

        {sortedFavorites.length === 0 ? (
          <section className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
            <div className="rounded-3xl border border-border/70 bg-card/40 p-8 text-center sm:p-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                <Star className="h-8 w-8 text-muted-foreground" />
              </div>

              <h2 className="mt-6 text-2xl font-semibold text-foreground">Noch keine Favoriten</h2>

              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                Tippe bei einer Frage auf den Stern, um sie hier zu speichern.
              </p>

              <Link
                to="/lerngebiete"
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-foreground px-5 py-3 text-sm font-semibold text-background transition-all hover:opacity-90"
              >
                Zum Lernen
              </Link>
            </div>
          </section>
        ) : (
          <section className="mx-auto w-full max-w-4xl space-y-3 px-4 py-6 sm:px-6 sm:py-8 pb-safe">
            {sortedFavorites.map((favorite) => (
              <FavoriteCard
                key={favorite.id}
                favorite={favorite}
                onRemove={handleRemove}
              />
            ))}
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

function FavoriteCard({
  favorite,
  onRemove,
}: {
  favorite: Favorite;
  onRemove: (id: string) => void;
}) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(favorite.id);
    }, 100);
  };

  return (
    <Link
      to={favorite.source as any}
      className={[
        "group block rounded-2xl border border-border bg-card/80 p-5 transition-all hover:bg-card hover:shadow-sm hover:border-border/80 sm:p-6",
        isRemoving && "opacity-0 pointer-events-none",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-foreground px-2.5 py-0.5 text-[11px] font-semibold text-background">
              {favorite.category}
            </span>

            {favorite.description && (
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                {favorite.description}
              </span>
            )}
          </div>

          <h3 className="mt-3 text-base font-semibold leading-snug text-foreground line-clamp-2">
            {favorite.title}
          </h3>

          <p className="mt-2 text-xs text-muted-foreground">
            Gespeichert am {new Date(favorite.savedAt).toLocaleDateString("de-DE", {
              weekday: "short",
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })}
          </p>
        </div>

        <div
          className="shrink-0 flex gap-2"
          onClick={(e) => e.preventDefault()}
        >
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleRemove();
            }}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-red-100/50"
            aria-label="Aus Favoriten entfernen"
          >
            <Star className="h-5 w-5 fill-amber-400 stroke-amber-500 text-amber-500" />
          </button>
        </div>
      </div>
    </Link>
  );
}
