import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type TouchEvent,
} from "react";
import { createPortal } from "react-dom";

import { magazineArticles, type MagazineArticle } from "@/data/magazineArticles";

type MagazinePage =
  | { kind: "cover"; src: string; alt: string }
  | { kind: "article"; article: MagazineArticle };

const magazinePages: MagazinePage[] = [
  {
    kind: "cover",
    src: "/cover.png",
    alt: "Cover des steuerstoff Magazins – Ausgabe 01/2026",
  },
  ...magazineArticles.map<MagazinePage>((a) => ({ kind: "article", article: a })),
];

type FlipDirection = "next" | "previous";

function ArticleTeaser({ article }: { article: MagazineArticle }) {
  const leadFirst = article.lead.split(/\n\n+/)[0] ?? article.lead;
  return (
    <div className="flex h-full w-full flex-col justify-between gap-3 px-5 py-6 text-[#2b2117]">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a6b3a]">
          {article.issueLabel}
        </p>
        <h3 className="mt-2 text-[17px] font-semibold leading-snug tracking-tight">
          {article.title}
        </h3>
        <p className="mt-3 line-clamp-6 text-[12.5px] leading-relaxed text-[#4a3d2c]">
          {leadFirst}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {article.highlights.map((h) => (
          <div
            key={h.label}
            className="min-w-0 rounded-lg border border-[#d9c9ac] bg-white/60 px-2.5 py-2"
          >
            <div className="truncate text-[9px] font-semibold uppercase tracking-wider text-[#8a6b3a]">
              {h.label}
            </div>
            <div className="mt-0.5 truncate text-[13px] font-semibold text-[#2b2117]">
              {h.value}
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-[10.5px] font-medium uppercase tracking-[0.18em] text-[#8a6b3a]">
        Im Vollbild vollständig lesen
      </p>
    </div>
  );
}

const NOTICE_LABEL: Record<"wichtig" | "merke" | "praxistipp", string> = {
  wichtig: "Wichtig",
  merke: "Merke",
  praxistipp: "Praxistipp",
};

function renderPageContent(page: MagazinePage): ReactNode {
  if (page.kind === "cover") {
    return (
      <img
        src={page.src}
        alt={page.alt}
        className="absolute inset-0 h-full w-full object-contain"
        draggable={false}
      />
    );
  }
  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden">
      <ArticleTeaser article={page.article} />
    </div>
  );
}

function pageAltText(page: MagazinePage): string {
  return page.kind === "cover" ? page.alt : page.article.title;
}

function FullArticle({ article }: { article: MagazineArticle }) {
  return (
    <article
      className="mx-auto w-full max-w-[760px] rounded-xl bg-[#f6f0e7] px-5 py-8 text-[#241c12] shadow-[0_20px_60px_-24px_rgba(0,0,0,0.6)] ring-1 ring-white/10 sm:px-10 sm:py-12"
      style={{
        paddingLeft: "max(1.125rem, env(safe-area-inset-left))",
        paddingRight: "max(1.125rem, env(safe-area-inset-right))",
      }}
    >
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a6b3a]">
          steuerstoff Magazin · Ausgabe 01
        </p>
        <h1
          className="mt-3 font-semibold leading-tight tracking-tight"
          style={{ fontSize: "clamp(1.5rem, 1.15rem + 1.8vw, 2.25rem)" }}
        >
          {article.title}
        </h1>
        <p
          className="mt-5 font-medium leading-[1.65] text-[#3a2f20]"
          style={{
            fontSize: "clamp(1.075rem, 1rem + 0.45vw, 1.235rem)",
          }}
        >
          {article.lead}
        </p>
      </header>

      <div
        className="mt-8 space-y-5 leading-[1.7] text-[#241c12]"
        style={{
          fontSize: "clamp(1.0625rem, 0.98rem + 0.35vw, 1.2rem)",
        }}
      >
        {article.blocks.map((block, i) => {
          if (block.type === "heading") {
            return (
              <h2
                key={i}
                className="pt-3 font-semibold tracking-tight text-[#1c160e]"
                style={{ fontSize: "clamp(1.2rem, 1.05rem + 0.7vw, 1.5rem)" }}
              >
                {block.text}
              </h2>
            );
          }
          if (block.type === "notice") {
            return (
              <aside
                key={i}
                role="note"
                className="rounded-lg border-l-4 border-[#b98a3a] bg-[#efe4cf] px-4 py-3 text-[#2b2117]"
              >
                <span className="mr-2 font-semibold uppercase tracking-wider text-[#8a6b3a]">
                  Beachten Sie
                </span>
                <span>{block.text}</span>
              </aside>
            );
          }
          return <p key={i}>{block.text}</p>;
        })}
      </div>
    </article>
  );
}

export function MagazineFlipbook() {
  const [pageIndex, setPageIndex] = useState(0);
  const [targetIndex, setTargetIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [direction, setDirection] = useState<FlipDirection>("next");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isFullscreen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    const body = document.body;
    const html = document.documentElement;
    const prevBody = body.style.overflow;
    const prevHtml = html.style.overflow;
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      body.style.overflow = prevBody;
      html.style.overflow = prevHtml;
    };
  }, [isFullscreen]);

  useLayoutEffect(() => {
    if (!isFullscreen) return;
    scrollContainerRef.current?.scrollTo({ top: 0 });
    closeButtonRef.current?.focus();
  }, [isFullscreen]);

  const turnToPage = (nextIndex: number) => {
    if (
      isFlipping ||
      nextIndex < 0 ||
      nextIndex >= magazinePages.length ||
      nextIndex === pageIndex
    ) {
      return;
    }
    setDirection(nextIndex > pageIndex ? "next" : "previous");
    setTargetIndex(nextIndex);
    setIsFlipping(true);
  };

  const showPreviousPage = () => turnToPage(pageIndex - 1);
  const showNextPage = () => turnToPage(pageIndex + 1);

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const touchEndX = event.changedTouches[0]?.clientX;
    if (touchEndX === undefined) return;
    const distance = touchEndX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(distance) < 50) return;
    if (distance < 0) showNextPage();
    else showPreviousPage();
  };

  const handleFlipEnd = () => {
    if (!isFlipping) return;
    setPageIndex(targetIndex);
    setIsFlipping(false);
  };

  const canGoBack = pageIndex > 0;
  const canGoForward = pageIndex < magazinePages.length - 1;

  const pageTransform = isFlipping
    ? direction === "next"
      ? "rotateY(-180deg)"
      : "rotateY(180deg)"
    : "rotateY(0deg)";

  return (
    <div className="mx-auto w-full max-w-[420px]">
      <div
        className="relative touch-pan-y select-none"
        style={{ perspective: "1800px" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative aspect-[977/1610] overflow-hidden rounded-[1.4rem] border border-border/70 bg-[#f6f0e7] shadow-[0_24px_70px_-28px_rgba(15,23,42,0.48)]">
          {/* Nächste Seite darunter */}
          {renderPageContent(magazinePages[targetIndex])}

          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="absolute inset-0 z-10 cursor-zoom-in"
            aria-label={`Seite ${pageIndex + 1} im Vollbild öffnen`}
          >
            <div
              className="absolute inset-0 transition-transform duration-700 ease-in-out"
              style={{
                transform: pageTransform,
                transformOrigin:
                  direction === "next" ? "left center" : "right center",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                willChange: "transform",
              }}
              onTransitionEnd={handleFlipEnd}
              aria-label={pageAltText(magazinePages[pageIndex])}
            >
              <div className="absolute inset-0 bg-[#f6f0e7]">
                {renderPageContent(magazinePages[pageIndex])}
              </div>
            </div>

            <span className="pointer-events-none absolute bottom-4 right-4 rounded-full bg-background/90 px-3 py-1.5 text-[11px] font-medium text-foreground shadow-sm backdrop-blur">
              Vollbild
            </span>
          </button>

          <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-3 bg-gradient-to-r from-black/10 to-transparent" />

          {canGoBack && (
            <button
              type="button"
              onClick={showPreviousPage}
              disabled={isFlipping}
              aria-label="Vorherige Magazinseite"
              className="absolute left-2 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-background/85 text-foreground shadow-lg backdrop-blur transition hover:scale-105 disabled:opacity-40"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
          )}

          {canGoForward && (
            <button
              type="button"
              onClick={showNextPage}
              disabled={isFlipping}
              aria-label="Nächste Magazinseite"
              className="absolute right-2 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-background/85 text-foreground shadow-lg backdrop-blur transition hover:scale-105 disabled:opacity-40"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        {magazinePages.map((page, index) => (
          <button
            key={index}
            type="button"
            onClick={() => turnToPage(index)}
            disabled={isFlipping}
            aria-label={`Magazinseite ${index + 1} öffnen`}
            className={`h-2 rounded-full transition-all ${
              index === pageIndex
                ? "w-7 bg-foreground"
                : "w-2 bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>

      <p
        className="mt-2 text-center text-xs text-muted-foreground"
        aria-live="polite"
      >
        Seite {pageIndex + 1} von {magazinePages.length}
        <span className="ml-2">· Zum Umblättern wischen</span>
      </p>

      {isFullscreen && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[100] bg-neutral-900/95"
              role="dialog"
              aria-modal="true"
              aria-label="steuerstoff Magazin – Vollbild-Leseansicht"
            >
              <div
                ref={scrollContainerRef}
                className="h-full w-full overflow-y-auto overflow-x-hidden overscroll-contain"
                style={{
                  WebkitOverflowScrolling: "touch",
                  overscrollBehaviorY: "contain",
                }}
              >
                <div
                  className="sticky top-0 z-10 border-b border-white/10 bg-neutral-900/80 backdrop-blur"
                  style={{ paddingTop: "env(safe-area-inset-top)" }}
                >
                  <div className="mx-auto flex w-full max-w-[1100px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
                    <div className="flex items-baseline gap-2 text-white">
                      <span className="text-sm font-semibold tracking-tight">
                        steuerstoff Magazin
                      </span>
                      <span className="text-xs text-white/60">
                        Ausgabe 01
                      </span>
                    </div>
                    <button
                      ref={closeButtonRef}
                      type="button"
                      onClick={() => setIsFullscreen(false)}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur transition hover:bg-white/20"
                      aria-label="Vollbild schließen"
                    >
                      <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div
                  className="mx-auto flex w-full max-w-[1100px] flex-col gap-6 px-3 py-6 sm:px-6 sm:py-10"
                  style={{
                    paddingBottom:
                      "calc(env(safe-area-inset-bottom) + 2.5rem)",
                  }}
                >
                  <figure className="overflow-hidden rounded-xl bg-[#f6f0e7] shadow-[0_20px_60px_-24px_rgba(0,0,0,0.6)] ring-1 ring-white/10">
                    <img
                      src="/cover.png"
                      alt="Cover des steuerstoff Magazins – Ausgabe 01/2026"
                      loading="eager"
                      className="block h-auto w-full select-none"
                      draggable={false}
                    />
                  </figure>

                  <FullArticle article={article} />
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
